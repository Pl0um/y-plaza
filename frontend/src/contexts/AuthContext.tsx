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
  // Si le cookie est absent ou expiré, apiMe() échoue silencieusement → user = null.
  useEffect(() => {
    apiMe()
      .then(profil => setUser(profil))
      .catch(() => {}) // cookie absent ou expiré — état non connecté
      .finally(() => setLoading(false));
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
