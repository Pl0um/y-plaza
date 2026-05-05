// Contexte d'authentification global — KreAgency
// Fournit l'état de connexion à toute l'application.
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { apiLogin, apiLogout, apiMe } from '../services/api';
import type { Utilisateur, LoginPayload, RoleUtilisateur } from '../types';

// ─── Types du contexte ────────────────────────────────────────────────────────

interface AuthContextValue {
  user:            Utilisateur | null;
  role:            RoleUtilisateur | null;
  isAuthenticated: boolean;
  loading:         boolean;
  login:           (payload: LoginPayload) => Promise<void>;
  logout:          () => Promise<void>;
  refreshUser:     () => Promise<void>;
}

// ─── Création du contexte ─────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<Utilisateur | null>(null);
  const [loading, setLoading] = useState(true);

  // Au montage : tente de récupérer le profil via le cookie httpOnly existant.
  // L'intercepteur axios tentera un refresh automatique si le JWT est expiré.
  // Si le refresh échoue aussi, apiMe() rejette → user = null.
  useEffect(() => {
    apiMe()
      .then(profil => setUser(profil))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Session expirée (refresh token invalide) : l'intercepteur axios dispatch cet événement.
  // On force la déconnexion côté UI sans appeler le backend (le cookie est déjà effacé).
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('auth:session-expired', handler);
    return () => window.removeEventListener('auth:session-expired', handler);
  }, []);

  // Connexion : le backend pose le cookie httpOnly, on reçoit uniquement le profil
  const login = useCallback(async (payload: LoginPayload) => {
    const profil = await apiLogin(payload);
    setUser(profil);
  }, []);

  // Déconnexion : demande au backend d'effacer le cookie httpOnly côté serveur
  const logout = useCallback(async () => {
    await apiLogout().catch(() => {}); // ne bloque pas si le backend est inaccessible
    setUser(null);
  }, []);

  // Recharge le profil depuis le backend (après une mise à jour par exemple)
  const refreshUser = useCallback(async () => {
    const profil = await apiMe();
    setUser(profil);
  }, []);

  const value: AuthContextValue = {
    user,
    role:            user?.role ?? null,
    isAuthenticated: user !== null,
    loading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>.');
  }
  return ctx;
}
