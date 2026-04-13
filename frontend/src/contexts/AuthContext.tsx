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

  // Au montage : restaure la session depuis localStorage si un token existe
  useEffect(() => {
    const token = localStorage.getItem('krea_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Vérifie que le token est encore valide en récupérant le profil
    apiMe()
      .then(profil => setUser(profil))
      .catch(() => {
        localStorage.removeItem('krea_token');
        localStorage.removeItem('krea_user');
      })
      .finally(() => setLoading(false));
  }, []);

  // Connexion : appelle le backend, stocke token + user
  const login = useCallback(async (payload: LoginPayload) => {
    const authData = await apiLogin(payload);
    localStorage.setItem('krea_token', authData.token);
    localStorage.setItem('krea_user',  JSON.stringify(authData.user));
    setUser(authData.user);
  }, []);

  // Déconnexion : efface le localStorage et réinitialise l'état
  const logout = useCallback(async () => {
    await apiLogout().catch(() => {}); // ne bloque pas si le backend échoue
    localStorage.removeItem('krea_token');
    localStorage.removeItem('krea_user');
    setUser(null);
  }, []);

  // Recharge le profil depuis le backend (après une mise à jour par exemple)
  const refreshUser = useCallback(async () => {
    const profil = await apiMe();
    setUser(profil);
    localStorage.setItem('krea_user', JSON.stringify(profil));
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
