// Contrôleur des favoris — KreAgency
import { Request, Response } from 'express';
import { supabase } from '../supabase';

// GET /api/favoris — favoris de l'utilisateur connecté (avec détail du bien)
export async function getFavoris(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('favoris')
    .select('*, biens(*, photos_biens(url, ordre))')
    .eq('utilisateur_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }

  // Aplatit les photos pour chaque bien joint
  const favoris = (data ?? []).map((f: Record<string, unknown>) => {
    const bien = f.biens as (Record<string, unknown> & { photos_biens?: { url: string; ordre: number }[] }) | null;
    if (!bien) return f;
    const { photos_biens, ...resteBien } = bien;
    return {
      ...f,
      biens: {
        ...resteBien,
        photos: [...(photos_biens ?? [])]
          .sort((a, b) => a.ordre - b.ordre)
          .map(p => p.url),
      },
    };
  });

  res.json({ success: true, count: favoris.length, data: favoris });
}

// POST /api/favoris — ajoute un bien aux favoris
export async function addFavori(req: Request, res: Response): Promise<void> {
  const userId  = req.user!.id;
  const { bien_id } = req.body as { bien_id: string };

  if (!bien_id) {
    res.status(400).json({ success: false, message: 'bien_id est obligatoire.' });
    return;
  }

  const { data, error } = await supabase
    .from('favoris')
    .insert({ utilisateur_id: userId, bien_id })
    .select()
    .single();

  if (error) {
    // Doublon → la contrainte UNIQUE renvoie une erreur 23505
    res.status(409).json({ success: false, message: 'Ce bien est déjà dans vos favoris.' });
    return;
  }

  res.status(201).json({ success: true, data });
}

// DELETE /api/favoris/:bienId — retire un bien des favoris
export async function removeFavori(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { bienId } = req.params;

  const { error } = await supabase
    .from('favoris')
    .delete()
    .eq('utilisateur_id', userId)
    .eq('bien_id', bienId);

  if (error) {
    res.status(404).json({ success: false, message: 'Favori introuvable.' });
    return;
  }

  res.json({ success: true, message: 'Bien retiré des favoris.' });
}
