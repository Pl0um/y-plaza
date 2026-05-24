import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Bien } from '../types';
import styles from './BienListCard.module.css';

interface Props {
  bien: Bien;
  index?: number;
}

function formatPrix(prix: number, type: string): string {
  const formatted = new Intl.NumberFormat('fr-FR').format(prix);
  return type === 'location' ? `${formatted} €/mois` : `${formatted} €`;
}

export default function BienListCard({ bien, index = 0 }: Props) {
  const photo = bien.photos?.[0] ?? null;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Link to={`/biens/${bien.id}`} className={styles.inner}>
        <div className={styles.imgWrap}>
          {photo ? (
            <img src={photo} alt={bien.titre} className={styles.img} loading="lazy" />
          ) : (
            <div className={styles.imgFallback} />
          )}
          <span className={styles.typeBadge}>{bien.type_bien}</span>
        </div>

        <div className={styles.info}>
          <span className={styles.location}>{bien.ville} · {bien.code_postal}</span>
          <h3 className={styles.title}>{bien.titre}</h3>
          <p className={styles.prix}>{formatPrix(bien.prix, bien.type_transaction)}</p>
          <div className={styles.specs}>
            <span>{bien.surface} m²</span>
            <span className={styles.dot} />
            <span>{bien.nb_pieces} pièce{bien.nb_pieces > 1 ? 's' : ''}</span>
            {bien.nb_chambres > 0 && (
              <>
                <span className={styles.dot} />
                <span>{bien.nb_chambres} ch.</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.arrow}>→</div>
      </Link>
    </motion.div>
  );
}
