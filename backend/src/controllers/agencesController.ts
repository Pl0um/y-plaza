import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';

// GET /api/agences — liste toutes les agences
export async function getAllAgences(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('agences')
      .select('*')
      .order('nom');

    if (error) throw error;

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

// GET /api/agences/:id — détail d'une agence
export async function getAgenceById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('agences')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      res.status(404).json({ success: false, error: 'Agence introuvable' });
      return;
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// POST /api/agences — créer une agence (admin)
export async function createAgence(req: Request, res: Response): Promise<void> {
  const { nom, adresse, ville, code_postal, telephone, email, latitude, longitude, est_siege } = req.body as {
    nom: string; adresse: string; ville: string; code_postal: string;
    telephone: string; email: string;
    latitude?: number; longitude?: number; est_siege?: boolean;
  };

  if (!nom || !adresse || !ville || !code_postal || !telephone || !email) {
    res.status(400).json({ success: false, message: 'Tous les champs obligatoires doivent être renseignés.' });
    return;
  }

  const { data, error } = await supabase
    .from('agences')
    .insert({ nom, adresse, ville, code_postal, telephone, email, latitude: latitude ?? null, longitude: longitude ?? null, est_siege: est_siege ?? false })
    .select()
    .single();

  if (error || !data) {
    res.status(500).json({ success: false, message: error?.message ?? 'Erreur création agence.' });
    return;
  }

  res.status(201).json({ success: true, data });
}

// PUT /api/agences/:id — modifier une agence (admin)
export async function updateAgence(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const champs = ['nom', 'adresse', 'ville', 'code_postal', 'telephone', 'email', 'latitude', 'longitude', 'est_siege'];
  const updates: Record<string, unknown> = {};

  for (const champ of champs) {
    if (req.body[champ] !== undefined) updates[champ] = req.body[champ];
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour.' });
    return;
  }

  const { data, error } = await supabase
    .from('agences')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, message: 'Agence introuvable.' });
    return;
  }

  res.json({ success: true, data });
}

// GET /api/agences/:id/biens — biens rattachés à une agence (avec photos)
export async function getBiensByAgence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Vérifie que l'agence existe
    const { error: agenceError } = await supabase
      .from('agences')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (agenceError) {
      res.status(404).json({ success: false, error: 'Agence introuvable' });
      return;
    }

    const { data, error } = await supabase
      .from('biens')
      .select('*, photos_biens(url, ordre)')
      .eq('agence_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Aplatit les photos pour chaque bien
    const biens = data.map(b => {
      const { photos_biens, ...reste } = b as typeof b & { photos_biens: { url: string; ordre: number }[] };
      return {
        ...reste,
        photos: [...(photos_biens ?? [])]
          .sort((a, c) => a.ordre - c.ordre)
          .map(p => p.url),
      };
    });

    res.json({ success: true, count: biens.length, data: biens });
  } catch (err) {
    next(err);
  }
}
