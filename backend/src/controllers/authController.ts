// Contrôleur d'authentification — KreAgency
import { Request, Response } from 'express';
import { supabase, supabaseAuth } from '../supabase';
import type { Role } from '../middlewares/auth';
import { logSecurityEvent } from '../utils/securityLogger';

// ─── register ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Inscription publique (rôle client uniquement).
// Supabase envoie un email de confirmation ; le trigger crée la ligne utilisateurs.
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, nom, prenom } = req.body as {
    email: string;
    password: string;
    nom: string;
    prenom: string;
  };

  if (!email || !password || !nom || !prenom) {
    res.status(400).json({ success: false, message: 'Tous les champs sont obligatoires.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' });
    return;
  }

  const { error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: {
      data: { nom, prenom, role: 'client' },
    },
  });

  if (error) {
    // L'email existe déjà → message neutre pour ne pas révéler les comptes
    res.status(400).json({ success: false, message: error.message });
    return;
  }

  logSecurityEvent('REGISTER_SUCCESS', req.ip ?? 'unknown', { email });

  res.status(201).json({
    success: true,
    message: 'Inscription réussie. Vérifiez votre email pour confirmer votre compte.',
  });
}

// ─── login ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Retourne le JWT + le profil complet avec le rôle.
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    return;
  }

  const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.session) {
    logSecurityEvent('LOGIN_FAILED', req.ip ?? 'unknown', { email });
    res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    return;
  }

  // Récupère le profil depuis la table utilisateurs (rôle, agence…)
  const { data: profil, error: profilError } = await supabase
    .from('utilisateurs')
    .select('id, email, nom, prenom, role, agence_id, actif, telephone')
    .eq('id', authData.user.id)
    .single();

  if (profilError || !profil) {
    res.status(500).json({ success: false, message: 'Profil utilisateur introuvable.' });
    return;
  }

  if (!profil.actif) {
    logSecurityEvent('LOGIN_COMPTE_DESACTIVE', req.ip ?? 'unknown', { email, userId: profil.id });
    res.status(403).json({ success: false, message: 'Compte désactivé. Contactez un administrateur.' });
    return;
  }

  const cookieOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  // Access token : durée de vie courte (1 h côté Supabase) — renouvelé automatiquement via /refresh
  res.cookie('sb-token', authData.session.access_token, {
    ...cookieOpts,
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie 7 j, JWT interne expire en 1 h
  });

  // Refresh token : stocké httpOnly, permet de renouveler le JWT sans redemander le mot de passe
  res.cookie('sb-refresh-token', authData.session.refresh_token, {
    ...cookieOpts,
    maxAge: 7 * 24 * 60 * 60 * 1000, // aligné sur la durée de vie Supabase par défaut
  });

  logSecurityEvent('LOGIN_SUCCESS', req.ip ?? 'unknown', { email, role: profil.role });

  // Ne retourne plus le token dans le body — il est dans le cookie
  res.json({ success: true, data: { user: profil } });
}

// ─── logout ───────────────────────────────────────────────────────────────────
// POST /api/auth/logout
export async function logout(req: Request, res: Response): Promise<void> {
  logSecurityEvent('LOGOUT', req.ip ?? 'unknown', { userId: req.user?.id });

  const cookieOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  res.clearCookie('sb-token',         cookieOpts);
  res.clearCookie('sb-refresh-token', cookieOpts);
  res.json({ success: true, message: 'Déconnexion réussie.' });
}

// ─── refresh ──────────────────────────────────────────────────────────────────
// POST /api/auth/refresh  (public)
// Renouvelle le JWT grâce au refresh token stocké en cookie httpOnly.
// Appelé automatiquement par le client lors d'une réponse 401.
export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.['sb-refresh-token'] as string | undefined;

  if (!refreshToken) {
    res.status(401).json({ success: false, message: 'Session expirée.' });
    return;
  }

  const { data, error } = await supabaseAuth.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    const cookieOpts = {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };
    res.clearCookie('sb-token',         cookieOpts);
    res.clearCookie('sb-refresh-token', cookieOpts);
    res.status(401).json({ success: false, message: 'Session expirée. Veuillez vous reconnecter.' });
    return;
  }

  const cookieOpts = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge:   7 * 24 * 60 * 60 * 1000,
  };

  res.cookie('sb-token',         data.session.access_token,  cookieOpts);
  res.cookie('sb-refresh-token', data.session.refresh_token, cookieOpts);
  res.json({ success: true, message: 'Session renouvelée.' });
}

// ─── me ───────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (authentifié)
// Retourne le profil complet de l'utilisateur connecté.
export async function me(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('utilisateurs')
    .select('id, email, nom, prenom, role, agence_id, telephone, actif')
    .eq('id', userId)
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, message: 'Profil introuvable.' });
    return;
  }

  res.json({ success: true, data });
}

// ─── updateMe ─────────────────────────────────────────────────────────────────
// PATCH /api/auth/me  (authentifié)
// Mise à jour des champs modifiables par l'utilisateur lui-même.
export async function updateMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { nom, prenom, telephone } = req.body as {
    nom?: string;
    prenom?: string;
    telephone?: string;
  };

  const updates: Record<string, string> = {};
  if (nom)       updates.nom       = nom.trim();
  if (prenom)    updates.prenom    = prenom.trim();
  if (telephone) updates.telephone = telephone.trim();

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour.' });
    return;
  }

  const { data, error } = await supabase
    .from('utilisateurs')
    .update(updates)
    .eq('id', userId)
    .select('id, email, nom, prenom, role, agence_id, telephone')
    .single();

  if (error || !data) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du profil.' });
    return;
  }

  res.json({ success: true, data });
}

// ─── resetPassword ────────────────────────────────────────────────────────────
// POST /api/auth/reset-password  (public)
// Envoie un email de réinitialisation via Supabase.
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string };

  if (!email) {
    res.status(400).json({ success: false, message: 'Email requis.' });
    return;
  }

  // Réponse toujours identique pour ne pas révéler si l'email existe
  await supabaseAuth.auth.resetPasswordForEmail(email);
  res.json({ success: true, message: 'Si un compte existe, un email a été envoyé.' });
}

// ─── invite ───────────────────────────────────────────────────────────────────
// POST /api/auth/invite  (admin uniquement)
// Invite un employé par email — Supabase envoie un lien de setup de mot de passe.
// Le trigger handle_new_user lira le rôle depuis les metadata.
export async function invite(req: Request, res: Response): Promise<void> {
  const { email, role, agence_id, nom, prenom } = req.body as {
    email: string;
    role: Role;
    agence_id?: string;
    nom: string;
    prenom: string;
  };

  if (!email || !role || !nom || !prenom) {
    res.status(400).json({ success: false, message: 'email, role, nom et prenom sont obligatoires.' });
    return;
  }

  const rolesEmployes: Role[] = ['commercial', 'gestionnaire_ventes', 'directeur', 'admin'];
  if (!rolesEmployes.includes(role)) {
    res.status(400).json({ success: false, message: `Rôle invalide. Valeurs acceptées : ${rolesEmployes.join(', ')}.` });
    return;
  }

  const { error } = await supabaseAuth.auth.admin.inviteUserByEmail(email, {
    data: { nom, prenom, role, agence_id: agence_id ?? null },
  });

  if (error) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }

  logSecurityEvent('INVITE_SENT', req.ip ?? 'unknown', { email, role, invitedBy: req.user?.id });

  res.status(201).json({
    success: true,
    message: `Invitation envoyée à ${email} avec le rôle « ${role} ».`,
  });
}
