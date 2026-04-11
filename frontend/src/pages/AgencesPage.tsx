import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAgences } from '../services/api';
import type { Agence } from '../types';
import MapView, { type MapMarker } from '../components/MapView';
import styles from './AgencesPage.module.css';

export default function AgencesPage() {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgences().then(data => {
      setAgences(data);
      setLoading(false);
    });
  }, []);

  // Filtre les agences sans coordonnées GPS pour éviter un crash Leaflet
  const markers: MapMarker[] = agences
    .filter(a => a.latitude !== null && a.longitude !== null)
    .map(a => ({
      id: a.id,
      latitude: a.latitude as number,
      longitude: a.longitude as number,
      titre: a.nom,
      sousTitre: `${a.adresse} — ${a.ville}`,
      lien: `/agences/${a.id}`,
    }));

  if (loading) {
    return <p className={styles.loading}>Chargement…</p>;
  }

  return (
    <main className={styles.page}>
      <div className="container">
        {/* En-tête */}
        <div className={styles.header}>
          <h1 className={styles.title}>Nos agences en France</h1>
          <p className={styles.subtitle}>
            {agences.length} agences, un siège à Aix-en-Provence et des experts
            locaux dans chaque région.
          </p>
        </div>

        {/* Carte Leaflet — toutes les agences */}
        <div className={styles.mapWrapper}>
          <MapView markers={markers} zoom={6} height="460px" />
        </div>

        {/* Grille des agences */}
        <div className={styles.grid}>
          {agences.map(agence => (
            <div key={agence.id} className={styles.card}>
              <div className={styles.cardTop}>
                <p className={styles.cardNom}>{agence.nom}</p>
                {agence.est_siege && (
                  <span className={styles.siegeBadge}>Siège</span>
                )}
              </div>

              <p className={styles.cardInfo}>
                {agence.adresse}<br />
                {agence.code_postal} {agence.ville}<br />
                <a href={`tel:${agence.telephone}`}>{agence.telephone}</a><br />
                <a href={`mailto:${agence.email}`}>{agence.email}</a>
              </p>

              <Link to={`/agences/${agence.id}`} className={styles.cardLink}>
                Voir l'agence →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
