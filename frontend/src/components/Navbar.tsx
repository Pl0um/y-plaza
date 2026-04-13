// Navbar — contextuelle selon l'état d'authentification et le rôle — KreAgency
import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RoleUtilisateur } from '../types';
import styles from './Navbar.module.css';

// Lien vers le dashboard selon le rôle
function dashboardLien(role: RoleUtilisateur): { href: string; label: string } {
  switch (role) {
    case 'commercial':          return { href: '/dashboard/annonces',     label: 'Mes annonces' };
    case 'gestionnaire_ventes': return { href: '/dashboard/transactions', label: 'Transactions' };
    case 'directeur':           return { href: '/dashboard/stats',        label: 'Statistiques' };
    case 'admin':               return { href: '/admin',                  label: 'Administration' };
    default:                    return { href: '/profil',                 label: 'Mon profil' };
  }
}

export default function Navbar() {
  const navigate               = useNavigate();
  const { isAuthenticated, user, role, logout } = useAuth();

  // ── Mode nuit ──────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // ── Déconnexion ────────────────────────────────────────────────────────────
  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  const dash = role && role !== 'client' ? dashboardLien(role) : null;

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo}>
          Kre<span>Agency</span>
        </NavLink>

        {/* Navigation principale */}
        <ul className={styles.links}>
          <li><NavLink to="/" end className={linkClass}>Accueil</NavLink></li>
          <li><NavLink to="/biens" className={linkClass}>Biens</NavLink></li>
          <li><NavLink to="/agences" className={linkClass}>Agences</NavLink></li>
        </ul>

        {/* Zone auth à droite */}
        <div className={styles.authZone}>
          {isAuthenticated && user ? (
            <>
              {/* Lien dashboard ou profil selon le rôle */}
              {dash ? (
                <NavLink to={dash.href} className={linkClass}>
                  {dash.label}
                </NavLink>
              ) : (
                <NavLink to="/profil" className={linkClass}>
                  Mon profil
                </NavLink>
              )}

              {/* Nom + déconnexion */}
              <span className={styles.userName}>
                {user.prenom}
              </span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>
                Connexion
              </Link>
              <Link to="/register" className={styles.registerBtn}>
                S'inscrire
              </Link>
            </>
          )}

          {/* Bouton mode nuit */}
          <button
            className={styles.darkToggle}
            onClick={() => setDarkMode(d => !d)}
            aria-label={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={darkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
