import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchAgenceById, fetchBiensByAgence } from '../services/api';
import type { Agence, Bien } from '../types';
import BienCard from '../components/BienCard';
import MapView, { type MapMarker } from '../components/MapView';
import styles from './AgenceDetailPage.module.css';

export default function AgenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [agence, setAgence] = useState<Agence | null>(null);
  const [biens, setBiens] = useState<Bien[]>([]);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function charger() {
      try {
        const [a, b] = await Promise.all([
          fetchAgenceById(id!),
          fetchBiensByAgence(id!),
        ]);
        setAgence(a);
        setBiens(b);
      } catch {
        setErreur(true);
      }
    }

    charger();
  }, [id]);

  if (erreur) {
    return (
      <div className={styles.error}>
        <p>Agence introuvable.</p>
        <Link to="/agences">← Retour aux agences</Link>
      </div>
    );
  }

  if (!agence) {
    return <p className={styles.loading}>Chargement…</p>;
  }

  // La carte n'est affichée que si les coordonnées GPS sont renseignées
  const marker: MapMarker | null =
    agence.latitude !== null && agence.longitude !== null
      ? {
          id: agence.id,
          latitude: agence.latitude,
          longitude: agence.longitude,
          titre: agence.nom,
          sousTitre: `${agence.adresse}, ${agence.ville}`,
        }
      : null;

  return (
    <main className={styles.page}>
      <div className="container">
        {/* Retour */}
        <Link to="/agences" className={styles.back}>
          ← Retour aux agences
        </Link>

        {/* ── Layout : infos + carte ──────────────────────────── */}
        <div className={styles.layout}>

          {/* Infos agence */}
          <div>
            <div className={styles.agenceHeader}>
              <h1 className={styles.agenceNom}>{agence.nom}</h1>
              {agence.est_siege && (
                <span className={styles.siegeBadge}>Siège social</span>
              )}
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>Adresse</p>
                <p className={styles.infoValue}>
                  {agence.adresse}<br />{agence.code_postal} {agence.ville}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>Téléphone</p>
                <p className={styles.infoValue}>
                  <a href={`tel:${agence.telephone}`}>{agence.telephone}</a>
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>Email</p>
                <p className={styles.infoValue}>
                  <a href={`mailto:${agence.email}`}>{agence.email}</a>
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>Biens en portefeuille</p>
                <p className={styles.infoValue}>
                  {biens.length} bien{biens.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Carte Leaflet de l'agence */}
          <div>
            <p className={styles.mapTitle}>Localisation</p>
            {marker ? (
              <MapView markers={[marker]} height="280px" zoom={14} />
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Coordonnées GPS non renseignées.
              </p>
            )}
          </div>
        </div>

        {/* ── Biens de l'agence ───────────────────────────────── */}
        <section className={styles.biensSection}>
          <h2 className={styles.biensTitle}>
            Biens gérés par <span>{agence.ville}</span>
          </h2>

          {biens.length === 0 ? (
            <div className={styles.empty}>
              Aucun bien enregistré pour cette agence.
            </div>
          ) : (
            <div className={styles.biensGrid}>
              {biens.map(bien => (
                <BienCard key={bien.id} bien={bien} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
