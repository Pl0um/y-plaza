import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <Link to="/" className={styles.logoLink}>
              <img
                src="/images/logo_KRE-removebg-preview.png"
                alt="KRE"
                className={styles.logo}
              />
            </Link>
            <p className={styles.desc}>
              Groupe immobilier français présent dans 12 villes. Nous accompagnons
              acheteurs, vendeurs et locataires depuis notre siège
              d&apos;Aix-en-Provence.
            </p>
          </div>

          <div>
            <p className={styles.colTitle}>Navigation</p>
            <ul className={styles.colLinks}>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/biens">Nos biens</Link></li>
              <li><Link to="/agences">Nos agences</Link></li>
            </ul>
          </div>

          <div>
            <p className={styles.colTitle}>Siège social</p>
            <div className={styles.contact}>
              <p>
                12 Cours Mirabeau<br />
                13100 Aix-en-Provence<br />
                <a href="tel:+33442000001">04 42 00 00 01</a><br />
                <a href="mailto:siege@y-plaza.fr">siege@y-plaza.fr</a>
              </p>
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.bottom}>
          <span>© {annee} Y-Plaza — Tous droits réservés</span>
          <span className={styles.badge}>Données fictives — Usage démo</span>
        </div>
      </div>
    </footer>
  );
}
