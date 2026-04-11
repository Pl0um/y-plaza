// Service API — toutes les fonctions fetch vers le backend Express
// Le proxy Vite redirige /api → http://localhost:3000

import axios from 'axios';
import type {
  Bien,
  Agence,
  Utilisateur,
  FiltresBiens,
  ApiListResponse,
  ApiDetailResponse,
} from '../types';

// Instance axios commune — base URL vide car le proxy Vite gère le préfixe /api
const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Biens ───────────────────────────────────────────────────────────────────

/** Récupère tous les biens avec filtres optionnels */
export async function fetchBiens(filtres: FiltresBiens = {}): Promise<Bien[]> {
  // Supprime les clés vides pour ne pas polluer les query params
  const params = Object.fromEntries(
    Object.entries(filtres).filter(([, v]) => v !== '' && v !== undefined)
  );

  const { data } = await http.get<ApiListResponse<Bien>>('/biens', { params });
  return data.data;
}

/** Récupère le détail d'un bien par son id */
export async function fetchBienById(id: string): Promise<Bien> {
  const { data } = await http.get<ApiDetailResponse<Bien>>(`/biens/${id}`);
  return data.data;
}

/** Crée un nouveau bien */
export async function createBien(payload: Omit<Bien, 'id' | 'created_at'>): Promise<Bien> {
  const { data } = await http.post<ApiDetailResponse<Bien>>('/biens', payload);
  return data.data;
}

/** Modifie un bien existant */
export async function updateBien(id: string, payload: Partial<Bien>): Promise<Bien> {
  const { data } = await http.put<ApiDetailResponse<Bien>>(`/biens/${id}`, payload);
  return data.data;
}

/** Supprime un bien */
export async function deleteBien(id: string): Promise<void> {
  await http.delete(`/biens/${id}`);
}

// ─── Agences ─────────────────────────────────────────────────────────────────

/** Récupère la liste des 12 agences */
export async function fetchAgences(): Promise<Agence[]> {
  const { data } = await http.get<ApiListResponse<Agence>>('/agences');
  return data.data;
}

/** Récupère le détail d'une agence par son id */
export async function fetchAgenceById(id: string): Promise<Agence> {
  const { data } = await http.get<ApiDetailResponse<Agence>>(`/agences/${id}`);
  return data.data;
}

/** Récupère les biens rattachés à une agence */
export async function fetchBiensByAgence(agenceId: string): Promise<Bien[]> {
  const { data } = await http.get<ApiListResponse<Bien>>(`/agences/${agenceId}/biens`);
  return data.data;
}

// ─── Utilisateurs ─────────────────────────────────────────────────────────────

/** Récupère la liste des agents */
export async function fetchUtilisateurs(): Promise<Utilisateur[]> {
  const { data } = await http.get<ApiListResponse<Utilisateur>>('/utilisateurs');
  return data.data;
}
