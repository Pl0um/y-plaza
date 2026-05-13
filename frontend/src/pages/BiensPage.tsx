import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchBiens } from '../services/api';
import type { Bien, FiltresBiens } from '../types';
import BienFilters from '../components/BienFilters';
import styles from './BiensPage.module.css';

const STATUT_LABELS: Record<string, string> = {
  sous_compromis: 'Sous compromis',
  vendu:          'Vendu',
  loue:           'Loué',
};

function formatPrix(prix: number) {
  return prix.toLocaleString('fr-FR') + ' €';
}

function BienRow({ bien, index }: { bien: Bien; index: number }) {
  const reversed = index % 2 === 1;
  const photo = bien.photos?.[0] ?? null;

  const slidePhoto = { hidden: { opacity: 0, x: reversed ? 60 : -60 }, visible: { opacity: 1, x: 0 } };
  const slideInfo  = { hidden: { opacity: 0, x: reversed ? -60 : 60 }, visible: { opacity: 1, x: 0 } };
  const transition = { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } as const;

  const photoEl = (
    <motion.div
      className={styles.photoWrap}
      variants={slidePhoto}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {photo
        ? <img src={photo} alt={bien.titre} className={styles.photo} />
        : <div className={styles.photoFallback} />
      }
      {STATUT_LABELS[bien.statut] && (
        <span className={styles.badge}>{STATUT_LABELS[bien.statut]}</span>
      )}
    </motion.div>
  );

  const infoEl = (
    <motion.div
      className={styles.info}
      variants={slideInfo}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
    >
      <p className={styles.location}>
        {bien.ville}&nbsp;({bien.code_postal})&ensp;·&ensp;
        <span className={styles.typeBadge}>{bien.type_bien}</span>
      </p>

      <h2 className={styles.titre}>{bien.titre}</h2>

      <p className={styles.prixSurface}>
        {bien.surface}&thinsp;m²&ensp;—&ensp;{formatPrix(bien.prix)}
      </p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{bien.nb_pieces}</span>
          <span className={styles.statLabel}>pièce(s)</span>
        </div>
        <div className={styles.statSep} />
        <div className={styles.stat}>
          <span className={styles.statVal}>{bien.surface}</span>
          <span className={styles.statLabel}>m²</span>
        </div>
        <div className={styles.statSep} />
        <div className={styles.stat}>
          <span className={styles.statVal}>{bien.nb_chambres}</span>
          <span className={styles.statLabel}>chambre(s)</span>
        </div>
      </div>

      {bien.description && (
        <p className={styles.desc}>
          {bien.description.length > 220
            ? bien.description.slice(0, 220) + '…'
            : bien.description}
        </p>
      )}

      <Link to={`/biens/${bien.id}`} className={styles.btnDetail}>
        Voir le bien
      </Link>
    </motion.div>
  );

  return (
    <div className={`${styles.row} ${reversed ? styles.rowReversed : ''}`}>
      {photoEl}
      {infoEl}
    </div>
  );
}

export default function BiensPage() {
  const [searchParams] = useSearchParams();

  const [filtres, setFiltres] = useState<FiltresBiens>({
    ville:            searchParams.get('ville') ?? '',
    type_bien:        '',
    type_transaction: '',
    prix_min:         '',
    prix_max:         '',
    statut:           '',
  });

  const [biens, setBiens]     = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let annule = false;
    async function charger() {
      setLoading(true);
      const resultats = await fetchBiens(filtres);
      if (!annule) { setBiens(resultats); setLoading(false); }
    }
    charger();
    return () => { annule = true; };
  }, [filtres]);

  return (
    <main className={styles.page}>
      {/* ── Header + filtres ── */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Nos biens immobiliers</h1>
              {!loading && (
                <p className={styles.count}>
                  {biens.length} bien{biens.length > 1 ? 's' : ''} trouvé{biens.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <BienFilters filtres={filtres} onChange={setFiltres} />
        </div>
      </div>

      {/* ── Liste en quinconce ── */}
      {loading ? (
        <p className={styles.loading}>Chargement…</p>
      ) : biens.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Aucun bien ne correspond à vos critères</p>
          <p>Essayez de modifier ou réinitialiser les filtres.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {biens.map((bien, i) => <BienRow key={bien.id} bien={bien} index={i} />)}
        </div>
      )}
    </main>
  );
}
