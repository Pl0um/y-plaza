// Interfaces TypeScript partagées — KreAgency frontend

// ─── Rôles ────────────────────────────────────────────────────────────────────

export type RoleUtilisateur =
  | 'client'
  | 'commercial'
  | 'gestionnaire_ventes'
  | 'directeur'
  | 'admin';

// ─── Agence ───────────────────────────────────────────────────────────────────

export interface Agence {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  code_postal: string;
  telephone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
  est_siege: boolean | null;
}

// ─── Bien immobilier ──────────────────────────────────────────────────────────

export type TypeBien = 'appartement' | 'maison' | 'bureau' | 'commerce' | 'terrain';
export type TypeTransaction = 'vente' | 'location';
export type StatutBien = 'disponible' | 'sous_compromis' | 'vendu' | 'loue';

export interface Bien {
  id: string;
  titre: string;
  description: string;
  type_bien: TypeBien;
  type_transaction: TypeTransaction;
  prix: number;
  surface: number;
  nb_pieces: number;
  nb_chambres: number;
  adresse: string;
  ville: string;
  code_postal: string;
  latitude: number | null;
  longitude: number | null;
  statut: StatutBien;
  agence_id: string | null;
  agent_id?: string | null;
  photos: string[];
  created_at: string;
  updated_at?: string;
}

// ─── Utilisateur ──────────────────────────────────────────────────────────────

export interface Utilisateur {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: RoleUtilisateur;
  agence_id: string | null;
  telephone: string | null;
  actif?: boolean;
}

// ─── Authentification ─────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nom: string;
  prenom: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: Utilisateur;
}

export interface InvitePayload {
  email: string;
  role: RoleUtilisateur;
  agence_id?: string;
  nom: string;
  prenom: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export type StatutTransaction = 'en_cours' | 'finalisee' | 'annulee';

export interface Transaction {
  id: string;
  bien_id: string;
  acheteur_id: string;
  prix_final: number;
  type: TypeTransaction;
  statut: StatutTransaction;
  notes: string | null;
  created_at: string;
  // Champs joints (optionnels selon la requête)
  biens?: Pick<Bien, 'id' | 'titre' | 'ville' | 'prix' | 'agence_id'>;
  utilisateurs?: Pick<Utilisateur, 'id' | 'nom' | 'prenom' | 'email'>;
}

// ─── Favori ───────────────────────────────────────────────────────────────────

export interface Favori {
  id: string;
  utilisateur_id: string;
  bien_id: string;
  created_at: string;
  biens?: Bien;
}

// ─── Paramètres de filtrage des biens ─────────────────────────────────────────

export interface FiltresBiens {
  ville?: string;
  type_bien?: TypeBien | '';
  type_transaction?: TypeTransaction | '';
  prix_min?: number | '';
  prix_max?: number | '';
  statut?: StatutBien | '';
}

// ─── Réponses génériques de l'API ─────────────────────────────────────────────

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export interface ApiDetailResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}
