import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';
import { logSecurityEvent } from '../utils/securityLogger';

// ── Type retourné par Supabase (photos dans une table séparée) ────────────────
interface SupabaseBien {
  id: string;
  titre: string;
  description: string | null;
  type_bien: string;
  type_transaction: string;
  prix: number;
  surface: number | null;
  nb_pieces: number | null;
  nb_chambres: number | null;
  adresse: string;
  ville: string;
  code_postal: string;
  latitude: number | null;
  longitude: number | null;
  statut: string;
  agence_id: string | null;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
  photos_biens: { url: string; ordre: number }[];
}

// Aplatit les photos_biens en tableau photos: string[]
function transformBien(b: SupabaseBien) {
  const { photos_biens, ...reste } = b;
  return {
    ...reste,
    photos: [...(photos_biens ?? [])]
      .sort((a, c) => a.ordre - c.ordre)
      .map(p => p.url),
  };
}

// Sélection avec jointure photos
const SELECT = '*, photos_biens(url, ordre)';

// GET /api/biens — liste avec filtres optionnels
export async function getAllBiens(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ville, type_bien, type_transaction, prix_min, prix_max, statut } = req.query;

    let query = supabase.from('biens').select(SELECT);

    if (ville && typeof ville === 'string') {
      query = query.ilike('ville', `%${ville}%`);
    }
    if (type_bien && typeof type_bien === 'string') {
      query = query.eq('type_bien', type_bien);
    }
    if (type_transaction && typeof type_transaction === 'string') {
      query = query.eq('type_transaction', type_transaction);
    }
    if (prix_min && typeof prix_min === 'string') {
      // parseFloat protégé contre les valeurs non numériques (NaN ignoré)
      const min = parseFloat(prix_min);
      if (!isNaN(min)) query = query.gte('prix', min);
    }
    if (prix_max && typeof prix_max === 'string') {
      const max = parseFloat(prix_max);
      if (!isNaN(max)) query = query.lte('prix', max);
    }
    if (statut && typeof statut === 'string') {
      query = query.eq('statut', statut);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const biens = (data as SupabaseBien[]).map(transformBien);
    res.json({ success: true, count: biens.length, data: biens });
  } catch (err) {
    next(err);
  }
}

// GET /api/biens/:id — détail d'un bien
export async function getBienById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('biens')
      .select(SELECT)
      .eq('id', req.params.id)
      .single();

    if (error) {
      res.status(404).json({ success: false, error: 'Bien introuvable' });
      return;
    }

    res.json({ success: true, data: transformBien(data as SupabaseBien) });
  } catch (err) {
    next(err);
  }
}

// POST /api/biens — créer un bien (photos envoyées séparément dans req.body.photos)
export async function createBien(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Extraction explicite des champs autorisés — évite d'insérer des champs inattendus
    // même si le body a déjà été validé par Zod en amont
    const {
      photos, titre, description, type_bien, type_transaction,
      prix, surface, nb_pieces, nb_chambres,
      adresse, ville, code_postal, latitude, longitude, statut, agence_id,
    } = req.body as {
      photos?:           string[];
      titre:             string;
      description?:      string;
      type_bien:         string;
      type_transaction:  string;
      prix:              number;
      surface?:          number;
      nb_pieces?:        number;
      nb_chambres?:      number;
      adresse:           string;
      ville:             string;
      code_postal:       string;
      latitude?:         number;
      longitude?:        number;
      statut?:           string;
      agence_id?:        string;
    };

    const bienData = {
      titre, description, type_bien, type_transaction,
      prix, surface, nb_pieces, nb_chambres,
      adresse, ville, code_postal, latitude, longitude, statut, agence_id,
    };

    const { data: bien, error: bienError } = await supabase
      .from('biens')
      .insert(bienData)
      .select('id')
      .single();

    if (bienError) throw bienError;

    // Insertion des photos si fournies
    if (photos && photos.length > 0) {
      const photosRows = photos.map((url, ordre) => ({ bien_id: bien.id, url, ordre }));
      const { error: photosError } = await supabase.from('photos_biens').insert(photosRows);
      if (photosError) throw photosError;
    }

    // Retourner le bien complet avec photos
    const { data: bienComplet, error: fetchError } = await supabase
      .from('biens')
      .select(SELECT)
      .eq('id', bien.id)
      .single();

    if (fetchError) throw fetchError;

    res.status(201).json({ success: true, data: transformBien(bienComplet as SupabaseBien) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/biens/:id — modifier un bien
export async function updateBien(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Whitelist des champs modifiables — on ne propage jamais req.body directement
    const CHAMPS_MODIFIABLES = [
      'titre', 'description', 'type_bien', 'type_transaction',
      'prix', 'surface', 'nb_pieces', 'nb_chambres',
      'adresse', 'ville', 'code_postal', 'latitude', 'longitude',
      'statut', 'agence_id',
    ] as const;

    const bienData: Record<string, unknown> = {};
    for (const champ of CHAMPS_MODIFIABLES) {
      if (req.body[champ] !== undefined) bienData[champ] = req.body[champ];
    }

    const { error } = await supabase
      .from('biens')
      .update(bienData)
      .eq('id', req.params.id);

    if (error) throw error;

    const { data, error: fetchError } = await supabase
      .from('biens')
      .select(SELECT)
      .eq('id', req.params.id)
      .single();

    if (fetchError) {
      res.status(404).json({ success: false, error: 'Bien introuvable' });
      return;
    }

    res.json({ success: true, data: transformBien(data as SupabaseBien) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/biens/:id — supprimer un bien (cascade supprime aussi photos_biens)
export async function deleteBien(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { error } = await supabase
      .from('biens')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    logSecurityEvent('BIEN_DELETED', req.ip ?? 'unknown', { bienId: req.params.id, deletedBy: req.user?.id });

    res.json({ success: true, message: 'Bien supprimé avec succès' });
  } catch (err) {
    next(err);
  }
}
