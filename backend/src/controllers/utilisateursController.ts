import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';
import type { Role } from '../middlewares/auth';

// GET /api/utilisateurs — liste tous les utilisateurs (directeur/admin)
export async function getAllUtilisateurs(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('utilisateurs')
      .select('id, nom, prenom, email, role, agence_id, telephone, actif')
      .order('nom');

    if (error) throw error;

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

// PUT /api/utilisateurs/:id/role — changer le rôle d'un utilisateur (admin uniquement)
export async function updateUtilisateurRole(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { role, actif, agence_id } = req.body as {
    role?:      Role;
    actif?:     boolean;
    agence_id?: string | null;
  };

  const rolesValides: Role[] = ['client', 'commercial', 'gestionnaire_ventes', 'directeur', 'admin'];
  if (role && !rolesValides.includes(role)) {
    res.status(400).json({ success: false, message: `Rôle invalide. Valeurs : ${rolesValides.join(', ')}.` });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (role      !== undefined) updates.role      = role;
  if (actif     !== undefined) updates.actif     = actif;
  if (agence_id !== undefined) updates.agence_id = agence_id;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour.' });
    return;
  }

  const { data, error } = await supabase
    .from('utilisateurs')
    .update(updates)
    .eq('id', id)
    .select('id, nom, prenom, email, role, agence_id, actif')
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    return;
  }

  res.json({ success: true, data });
}
