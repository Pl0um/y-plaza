import { useRef, useState, useEffect, type FormEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';

const STATS = [
  { value: 12,   suffix: '',     label: 'Agences en France' },
  { value: 350,  suffix: '+',    label: 'Biens disponibles' },
  { value: 1200, suffix: '+',    label: 'Clients satisfaits' },
  { value: 15,   suffix: ' ans', label: "D'expérience" },
];

function CountUp({ to, suffix, duration = 1600 }: { to: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    function tick(ts: number) {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isInView, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Hero() {
  const navigate = useNavigate();
  const [ville, setVille] = useState('');
  const [type, setType] = useState('');

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (ville.trim()) params.set('ville', ville.trim());
    if (type) params.set('type', type);
    navigate(`/biens${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />

      <div className={`container ${styles.content}`}>
        <motion.span
          className={styles.eyebrow}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Groupe immobilier français
        </motion.span>

        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Trouvez le bien<br />
          <em>qui vous ressemble</em>
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          KreAgency vous accompagne dans tous vos projets immobiliers.
          Achat, vente, location — 12 agences en France, une seule ambition.
        </motion.p>

        {/* Barre de recherche intégrée */}
        <motion.form
          className={styles.searchBar}
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <div className={styles.searchField}>
            <label className={styles.searchLabel}>Ville</label>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Lyon, Paris, Marseille…"
              value={ville}
              onChange={e => setVille(e.target.value)}
            />
          </div>
          <div className={styles.searchSep} />
          <div className={styles.searchField}>
            <label className={styles.searchLabel}>Type de bien</label>
            <select
              className={styles.searchSelect}
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="appartement">Appartement</option>
              <option value="maison">Maison</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
          <button type="submit" className={styles.searchBtn}>
            Rechercher
          </button>
        </motion.form>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Link to="/agences" className={styles.btnOutline}>
            Voir nos agences
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className={styles.statsRow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
        >
          <hr className={styles.statsDivider} />
          <div className={styles.statsGrid}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statValue}>
                  <CountUp to={s.value} suffix={s.suffix} />
                </span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
