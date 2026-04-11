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
