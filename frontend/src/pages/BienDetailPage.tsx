import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBienById, fetchAgenceById, fetchFavoris, addFavori, removeFavori } from '../services/api';
import type { Bien, Agence } from '../types';
import MapView, { type MapMarker } from '../components/MapView';
import { useAuth } from '../contexts/AuthContext';
import styles from './BienDetailPage.module.css';

// Formate le prix en euros avec le suffixe de location si besoin
function formatPrix(prix: number, type: Bien['type_transaction']): string {
  const f = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(prix);
  return type === 'location' ? `${f} / mois` : f;
}

const LABEL_STATUT: Record<Bien['statut'], string> = {
  disponible: 'Disponible',
  sous_compromis: 'Sous compromis',
  vendu: 'Vendu',
  loue: 'Loué',
};

const LABEL_TYPE: Record<Bien['type_bien'], string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  bureau: 'Bureau',
  commerce: 'Commerce',
  terrain: 'Terrain',
};

export default function BienDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [bien, setBien]           = useState<Bien | null>(null);
  const [agence, setAgence]       = useState<Agence | null>(null);
  const [photoActive, setPhotoActive] = useState(0);
  const [erreur, setErreur]       = useState(false);
  const [isFavori, setIsFavori]   = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setPhotoActive(0);

    async function charger() {
      try {
        const b = await fetchBienById(id!);
        const a = b.agence_id ? await fetchAgenceById(b.agence_id) : null;
        setBien(b);
        setAgence(a);

        if (isAuthenticated) {
          const favs = await fetchFavoris();
          setIsFavori(favs.some(f => f.bien_id === id));
        }
      } catch {
        setErreur(true);
      }
    }

    charger();
  }, [id, isAuthenticated]);

  async function toggleFavori() {
    if (!id || favLoading) return;
    setFavLoading(true);
    try {
      if (isFavori) {
        await removeFavori(id);
        setIsFavori(false);
      } else {
        await addFavori(id);
        setIsFavori(true);
      }
    } finally {
      setFavLoading(false);
    }
  }

  if (erreur) {
    return (
      <div className={styles.error}>
        <p>Bien introuvable.</p>
        <Link to="/biens">← Retour aux biens</Link>
      </div>
    );
  }

  if (!bien) {
    return <p className={styles.loading}>Chargement…</p>;
  }

  // La carte n'est affichée que si les coordonnées GPS sont renseignées
  const marker: MapMarker | null =
    bien.latitude !== null && bien.longitude !== null
      ? {
          id: bien.id,
          latitude: bien.latitude,
          longitude: bien.longitude,
          titre: bien.titre,
          sousTitre: `${bien.adresse}, ${bien.ville}`,
        }
      : null;

  return (
    <main className={styles.page}>
      <div className="container">
        {/* Retour */}
        <Link to="/biens" className={styles.back}>
          ← Retour aux biens
        </Link>

        {/* ── Galerie photos ──────────────────────────────────── */}
        <div className={styles.gallery}>
          <img
            src={bien.photos[photoActive] ?? `https://picsum.photos/seed/${bien.id}/1200/600`}
            alt={`${bien.titre} — photo ${photoActive + 1}`}
            className={styles.mainPhoto}
          />
          {bien.photos.length > 1 && (
            <div className={styles.thumbs}>
              {bien.photos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Miniature ${i + 1}`}
                  className={`${styles.thumb} ${i === photoActive ? styles.thumbActive : ''}`}
                  onClick={() => setPhotoActive(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Layout deux colonnes ────────────────────────────── */}
        <div className={styles.layout}>

          {/* Colonne gauche — détails */}
          <div>
            <div className={styles.detailHeader}>
              <h1 className={styles.titre}>{bien.titre}</h1>
              <div className={styles.prixRow}>
                <span className={styles.prix}>
                  {formatPrix(bien.prix, bien.type_transaction)}
                </span>
                {isAuthenticated && (
                  <button
                    className={`${styles.favBtn} ${isFavori ? styles.favBtnActive : ''}`}
                    onClick={toggleFavori}
                    disabled={favLoading}
                    title={isFavori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavori ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {isFavori ? 'Sauvegardé' : 'Sauvegarder'}
                  </button>
                )}
              </div>
            </div>

            <div className={styles.badges}>
              <span className={`badge badge-${bien.statut}`}>
                {LABEL_STATUT[bien.statut]}
              </span>
              <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                {LABEL_TYPE[bien.type_bien]}
              </span>
              <span className="badge" style={{ background: '#F5F3FF', color: '#6D28D9' }}>
                {bien.type_transaction === 'vente' ? 'Vente' : 'Location'}
              </span>
            </div>

            <p className={styles.adresse}>
              ⊙ {bien.adresse}, {bien.code_postal} {bien.ville}
            </p>

            {/* Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <p className={styles.statCardValue}>{bien.surface} m²</p>
                <p className={styles.statCardLabel}>Surface</p>
              </div>
              {bien.nb_pieces > 0 && (
                <div className={styles.statCard}>
                  <p className={styles.statCardValue}>{bien.nb_pieces}</p>
                  <p className={styles.statCardLabel}>Pièces</p>
                </div>
              )}
              {bien.nb_chambres > 0 && (
                <div className={styles.statCard}>
                  <p className={styles.statCardValue}>{bien.nb_chambres}</p>
                  <p className={styles.statCardLabel}>Chambres</p>
                </div>
              )}
              <div className={styles.statCard}>
                <p className={styles.statCardValue}>
                  {Math.round(bien.prix / bien.surface).toLocaleString('fr-FR')} €
                </p>
                <p className={styles.statCardLabel}>Prix / m²</p>
              </div>
            </div>

            {/* Description */}
            <h2 className={styles.descTitle}>Description</h2>
            <p className={styles.description}>{bien.description}</p>
          </div>

          {/* Colonne droite — agence + carte */}
          <div>
            {/* Carte de l'agence */}
            {agence && (
              <div className={styles.sideCard}>
                <p className={styles.sideCardTitle}>Agence en charge</p>
                <p className={styles.agenceName}>{agence.nom}</p>
                <div className={styles.agenceInfo}>
                  <p>{agence.adresse}</p>
                  <p>{agence.code_postal} {agence.ville}</p>
                  <p><a href={`tel:${agence.telephone}`}>{agence.telephone}</a></p>
                  <p><a href={`mailto:${agence.email}`}>{agence.email}</a></p>
                </div>
                <Link to={`/agences/${agence.id}`} className={styles.agenceLink}>
                  Voir l'agence →
                </Link>
              </div>
            )}

            {/* Carte Leaflet centrée sur le bien */}
            <div className={styles.sideCard}>
              <p className={styles.sideCardTitle}>Localisation</p>
              {marker ? (
                <MapView markers={[marker]} height="260px" zoom={14} />
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  Coordonnées GPS non renseignées.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
