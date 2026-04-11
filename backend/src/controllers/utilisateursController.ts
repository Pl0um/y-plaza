import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';

// GET /api/utilisateurs — liste tous les utilisateurs (agents, directeurs…)
export async function getAllUtilisateurs(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('utilisateurs')
      .select('*')
      .order('nom');

    if (error) throw error;

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}
