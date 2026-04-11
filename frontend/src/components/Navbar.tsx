import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  // Génère les classes CSS selon l'état actif du lien
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <NavLink to="/" className={styles.logo}>
          Kre<span>Agency</span>
        </NavLink>

        {/* Navigation principale */}
        <ul className={styles.links}>
          <li>
            <NavLink to="/" end className={linkClass}>
              Accueil
            </NavLink>
          </li>
          <li>
            <NavLink to="/biens" className={linkClass}>
              Biens
            </NavLink>
          </li>
          <li>
            <NavLink to="/agences" className={linkClass}>
              Agences
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
