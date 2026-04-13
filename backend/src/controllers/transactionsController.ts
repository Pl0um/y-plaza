// Contrôleur des transactions — KreAgency
import { Request, Response } from 'express';
import { supabase } from '../supabase';

type StatutTransaction = 'en_cours' | 'finalisee' | 'annulee';

// ─── getAllTransactions ────────────────────────────────────────────────────────
// GET /api/transactions
// Retourne toutes les transactions avec les infos du bien et de l'acheteur.
// Un directeur ne voit que les transactions de son agence.
export async function getAllTransactions(req: Request, res: Response): Promise<void> {
  const user = req.user!;

  let query = supabase
    .from('transactions')
    .select(`
      *,
      biens (id, titre, ville, prix, agence_id),
      utilisateurs!acheteur_id (id, nom, prenom, email)
    `)
    .order('created_at', { ascending: false });

  // Un directeur est limité à son agence
  if (user.role === 'directeur' && user.agence_id) {
    query = query.eq('biens.agence_id', user.agence_id);
  }

  const { data, error } = await query;

  if (error) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }

  res.json({ success: true, count: data.length, data });
}

// ─── getTransactionById ───────────────────────────────────────────────────────
// GET /api/transactions/:id
export async function getTransactionById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      biens (id, titre, ville, prix, agence_id),
      utilisateurs!acheteur_id (id, nom, prenom, email)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, message: 'Transaction introuvable.' });
    return;
  }

  res.json({ success: true, data });
}

// ─── createTransaction ────────────────────────────────────────────────────────
// POST /api/transactions
export async function createTransaction(req: Request, res: Response): Promise<void> {
  const { bien_id, acheteur_id, prix_final, type, notes } = req.body as {
    bien_id:     string;
    acheteur_id: string;
    prix_final:  number;
    type:        'vente' | 'location';
    notes?:      string;
  };

  if (!bien_id || !acheteur_id || !prix_final || !type) {
    res.status(400).json({ success: false, message: 'bien_id, acheteur_id, prix_final et type sont obligatoires.' });
    return;
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      bien_id,
      acheteur_id,
      prix_final,
      type,
      notes:  notes ?? null,
      statut: 'en_cours' as StatutTransaction,
    })
    .select()
    .single();

  if (error || !data) {
    res.status(500).json({ success: false, message: error?.message ?? 'Erreur création transaction.' });
    return;
  }

  res.status(201).json({ success: true, data });
}

// ─── updateTransaction ────────────────────────────────────────────────────────
// PUT /api/transactions/:id
// Permet de mettre à jour le statut et les notes.
export async function updateTransaction(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { statut, notes, prix_final } = req.body as {
    statut?:     StatutTransaction;
    notes?:      string;
    prix_final?: number;
  };

  const statutsValides: StatutTransaction[] = ['en_cours', 'finalisee', 'annulee'];
  if (statut && !statutsValides.includes(statut)) {
    res.status(400).json({ success: false, message: `Statut invalide. Valeurs acceptées : ${statutsValides.join(', ')}.` });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (statut !== undefined)     updates.statut     = statut;
  if (notes !== undefined)      updates.notes      = notes;
  if (prix_final !== undefined) updates.prix_final = prix_final;

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour.' });
    return;
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, message: 'Transaction introuvable ou erreur mise à jour.' });
    return;
  }

  res.json({ success: true, data });
}
