// Middlewares d'authentification et de contrôle des rôles — KreAgency
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';

// Rôles disponibles dans l'application
export type Role =
  | 'client'
  | 'commercial'
  | 'gestionnaire_ventes'
  | 'directeur'
  | 'admin';

// Extension du type Request pour y attacher l'utilisateur authentifié
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        agence_id: string | null;
        nom: string;
        prenom: string;
      };
    }
  }
}

// ─── authenticate ─────────────────────────────────────────────────────────────
// Vérifie le token JWT dans le header Authorization : Bearer <token>
// Attache req.user si valide, renvoie 401 sinon.
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token manquant ou mal formé.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Vérifie le JWT auprès de Supabase et récupère l'utilisateur Auth
  const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

  if (error || !authUser) {
    res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
    return;
  }

  // Récupère le profil complet depuis la table utilisateurs (rôle, agence…)
  const { data: profil, error: profilError } = await supabase
    .from('utilisateurs')
    .select('id, email, nom, prenom, role, agence_id, actif')
    .eq('id', authUser.id)
    .single();

  if (profilError || !profil) {
    res.status(401).json({ success: false, message: 'Profil utilisateur introuvable.' });
    return;
  }

  if (!profil.actif) {
    res.status(403).json({ success: false, message: 'Compte désactivé. Contactez un administrateur.' });
    return;
  }

  req.user = {
    id:        profil.id,
    email:     profil.email,
    role:      profil.role as Role,
    agence_id: profil.agence_id,
    nom:       profil.nom,
    prenom:    profil.prenom,
  };

  next();
}

// ─── requireRole ──────────────────────────────────────────────────────────────
// Fabrique un middleware qui vérifie que req.user.role est dans la liste.
// À utiliser après authenticate.
// Exemple : router.post('/biens', authenticate, requireRole('commercial', 'admin'), ...)
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Non authentifié.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}.`,
      });
      return;
    }

    next();
  };
}
