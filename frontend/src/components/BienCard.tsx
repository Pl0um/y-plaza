import { Link } from 'react-router-dom';
import type { Bien } from '../types';
import styles from './BienCard.module.css';

interface Props {
  bien: Bien;
}

// Formate un prix en euros (français)
function formatPrix(prix: number, type: Bien['type_transaction']): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(prix);
  return type === 'location' ? `${formatted} / mois` : formatted;
}

// Libellés lisibles pour les statuts
const LABEL_STATUT: Record<Bien['statut'], string> = {
  disponible: 'Disponible',
  sous_compromis: 'Sous compromis',
  vendu: 'Vendu',
  loue: 'Loué',
};

export default function BienCard({ bien }: Props) {
  const photo = bien.photos[0] ?? `https://picsum.photos/seed/${bien.id}/800/600`;

  return (
    <article className={styles.card}>
      {/* ── Image ────────────────────────────────────────────── */}
      <div className={styles.imageWrapper}>
        <img
          src={photo}
          alt={bien.titre}
          className={styles.image}
          loading="lazy"
        />

        {/* Badge statut (disponible / sous compromis / vendu) */}
        <span className={`badge badge-${bien.statut} ${styles.badgeStatut}`}>
          {LABEL_STATUT[bien.statut]}
        </span>

        {/* Badge type de transaction */}
        <span
          className={`${styles.badgeTransaction} ${
            bien.type_transaction === 'vente'
              ? styles.transactionVente
              : styles.transactionLocation
          }`}
        >
          {bien.type_transaction === 'vente' ? 'Vente' : 'Location'}
        </span>
      </div>

      {/* ── Contenu ──────────────────────────────────────────── */}
      <div className={styles.content}>
        <h3 className={styles.titre}>{bien.titre}</h3>

        <p className={styles.ville}>
          ⊙ {bien.ville} ({bien.code_postal})
        </p>

        <p className={styles.prix}>
          {formatPrix(bien.prix, bien.type_transaction)}
        </p>

        {/* Statistiques */}
        <div className={styles.stats}>
          <span className={styles.stat}>□ {bien.surface} m²</span>

          {bien.nb_pieces > 0 && (
            <span className={styles.stat}>◻ {bien.nb_pieces} pièce{bien.nb_pieces > 1 ? 's' : ''}</span>
          )}

          {bien.nb_chambres > 0 && (
            <span className={styles.stat}>⊟ {bien.nb_chambres} ch.</span>
          )}
        </div>

        <Link to={`/biens/${bien.id}`} className={styles.cta}>
          Voir le bien →
        </Link>
      </div>
    </article>
  );
}
