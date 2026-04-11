// Interfaces TypeScript partagées — KreAgency frontend

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

export type RoleUtilisateur = 'admin' | 'directeur' | 'commercial' | 'client';

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
