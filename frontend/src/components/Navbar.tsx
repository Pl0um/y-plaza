import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import type { RoleUtilisateur } from '../types';
import styles from './Navbar.module.css';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, role, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  const dash = role && role !== 'client' ? dashboardLien(role) : null;

  return (
    <motion.nav
      className={`${styles.nav} ${(scrolled || !isHome) ? styles.scrolled : ''}`}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.logoLink}>
          <img
            src="/images/logo_KRE-removebg-preview.png"
            alt="KRE"
            className={styles.logo}
          />
        </NavLink>

        <ul className={styles.links}>
          <li>
            <NavLink
              to="/" end
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
            >
              Accueil
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/biens"
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
            >
              Biens
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/agences"
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
            >
              Agences
            </NavLink>
          </li>
        </ul>

        <div className={styles.authZone}>
          {isAuthenticated && user ? (
            <>
              <NavLink
                to={dash ? dash.href : '/profil'}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
              >
                {dash ? dash.label : 'Mon profil'}
              </NavLink>
              <span className={styles.userName}>{user.prenom}</span>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.loginLink}>Connexion</Link>
              <Link to="/register" className={styles.registerBtn}>S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
