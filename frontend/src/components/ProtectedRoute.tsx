// Guard de routes protégées — KreAgency
// Redirige vers /login si non connecté.
// Affiche une page 403 si le rôle est insuffisant.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RoleUtilisateur } from '../types';

interface Props {
  children:      React.ReactNode;
  // Liste des rôles autorisés — si vide, tout utilisateur connecté est accepté
  roles?:        RoleUtilisateur[];
}

export default function ProtectedRoute({ children, roles = [] }: Props) {
  const { isAuthenticated, role, loading } = useAuth();

  // Pendant la restauration de session, ne rien afficher
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--color-text-muted)',
        fontFamily: 'Inter, sans-serif',
      }}>
        Chargement…
      </div>
    );
  }

  // Non connecté → redirection vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rôle insuffisant → page 403
  if (roles.length > 0 && role && !roles.includes(role)) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '6rem 1.5rem',
        fontFamily: 'Inter, sans-serif',
      }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--color-danger)', marginBottom: '1rem' }}>
          403
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <a href="/" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
