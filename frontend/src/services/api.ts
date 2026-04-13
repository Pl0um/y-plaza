// Service API — toutes les fonctions fetch vers le backend Express
// Le proxy Vite redirige /api → http://localhost:3000
// Le token JWT est lu depuis localStorage et injecté automatiquement.

import axios from 'axios';
import type {
  Bien,
  Agence,
  Utilisateur,
  FiltresBiens,
  ApiListResponse,
  ApiDetailResponse,
  ApiMessageResponse,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  InvitePayload,
  Transaction,
  Favori,
} from '../types';

// ─── Instance axios ───────────────────────────────────────────────────────────

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur de requête : ajoute le token JWT si présent
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('krea_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse : si 401, efface le token (session expirée)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('krea_token');
      localStorage.removeItem('krea_user');
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiRegister(payload: RegisterPayload): Promise<{ message: string }> {
  const { data } = await http.post<ApiMessageResponse>('/auth/register', payload);
  return { message: data.message };
}

export async function apiLogin(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await http.post<ApiDetailResponse<AuthResponse>>('/auth/login', payload);
  return data.data;
}

export async function apiLogout(): Promise<void> {
  await http.post('/auth/logout');
}

export async function apiMe(): Promise<Utilisateur> {
  const { data } = await http.get<ApiDetailResponse<Utilisateur>>('/auth/me');
  return data.data;
}

export async function apiUpdateMe(payload: Partial<Pick<Utilisateur, 'nom' | 'prenom' | 'telephone'>>): Promise<Utilisateur> {
  const { data } = await http.patch<ApiDetailResponse<Utilisateur>>('/auth/me', payload);
  return data.data;
}

export async function apiInvite(payload: InvitePayload): Promise<{ message: string }> {
  const { data } = await http.post<ApiMessageResponse>('/auth/invite', payload);
  return { message: data.message };
}

// ─── Biens ───────────────────────────────────────────────────────────────────

export async function fetchBiens(filtres: FiltresBiens = {}): Promise<Bien[]> {
  const params = Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== '' && v !== undefined)
  );
  const { data } = await http.get<ApiListResponse<Bien>>('/biens', { params });
  return data.data;
}

export async function fetchBienById(id: string): Promise<Bien> {
  const { data } = await http.get<ApiDetailResponse<Bien>>(`/biens/${id}`);
  return data.data;
}

export async function createBien(payload: Omit<Bien, 'id' | 'created_at' | 'photos'> & { photos?: string[] }): Promise<Bien> {
  const { data } = await http.post<ApiDetailResponse<Bien>>('/biens', payload);
  return data.data;
}

export async function updateBien(id: string, payload: Partial<Bien>): Promise<Bien> {
  const { data } = await http.put<ApiDetailResponse<Bien>>(`/biens/${id}`, payload);
  return data.data;
}

export async function deleteBien(id: string): Promise<void> {
  await http.delete(`/biens/${id}`);
}

// ─── Agences ─────────────────────────────────────────────────────────────────

export async function fetchAgences(): Promise<Agence[]> {
  const { data } = await http.get<ApiListResponse<Agence>>('/agences');
  return data.data;
}

export async function fetchAgenceById(id: string): Promise<Agence> {
  const { data } = await http.get<ApiDetailResponse<Agence>>(`/agences/${id}`);
  return data.data;
}

export async function fetchBiensByAgence(agenceId: string): Promise<Bien[]> {
  const { data } = await http.get<ApiListResponse<Bien>>(`/agences/${agenceId}/biens`);
  return data.data;
}

export async function createAgence(payload: Omit<Agence, 'id'>): Promise<Agence> {
  const { data } = await http.post<ApiDetailResponse<Agence>>('/agences', payload);
  return data.data;
}

export async function updateAgence(id: string, payload: Partial<Agence>): Promise<Agence> {
  const { data } = await http.put<ApiDetailResponse<Agence>>(`/agences/${id}`, payload);
  return data.data;
}

// ─── Utilisateurs ─────────────────────────────────────────────────────────────

export async function fetchUtilisateurs(): Promise<Utilisateur[]> {
  const { data } = await http.get<ApiListResponse<Utilisateur>>('/utilisateurs');
  return data.data;
}

export async function updateUtilisateurRole(
  id: string,
  payload: { role?: string; actif?: boolean; agence_id?: string | null }
): Promise<Utilisateur> {
  const { data } = await http.put<ApiDetailResponse<Utilisateur>>(`/utilisateurs/${id}/role`, payload);
  return data.data;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data } = await http.get<ApiListResponse<Transaction>>('/transactions');
  return data.data;
}

export async function createTransaction(payload: {
  bien_id: string;
  acheteur_id: string;
  prix_final: number;
  type: 'vente' | 'location';
  notes?: string;
}): Promise<Transaction> {
  const { data } = await http.post<ApiDetailResponse<Transaction>>('/transactions', payload);
  return data.data;
}

export async function updateTransaction(
  id: string,
  payload: { statut?: string; notes?: string; prix_final?: number }
): Promise<Transaction> {
  const { data } = await http.put<ApiDetailResponse<Transaction>>(`/transactions/${id}`, payload);
  return data.data;
}

// ─── Favoris ─────────────────────────────────────────────────────────────────

export async function fetchFavoris(): Promise<Favori[]> {
  const { data } = await http.get<ApiListResponse<Favori>>('/favoris');
  return data.data;
}

export async function addFavori(bienId: string): Promise<Favori> {
  const { data } = await http.post<ApiDetailResponse<Favori>>('/favoris', { bien_id: bienId });
  return data.data;
}

export async function removeFavori(bienId: string): Promise<void> {
  await http.delete(`/favoris/${bienId}`);
}
