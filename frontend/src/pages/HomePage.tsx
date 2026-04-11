import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchBiens, fetchAgences } from '../services/api';
import type { Bien, Agence } from '../types';
import BienCard from '../components/BienCard';
import MapView, { type MapMarker } from '../components/MapView';
import styles from './HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [rechercheVille, setRechercheVille] = useState('');
  const [biensVedette, setBiensVedette] = useState<Bien[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function charger() {
      const [tousLesBiens, toutesLesAgences] = await Promise.all([
        fetchBiens({ statut: 'disponible' }),
        fetchAgences(),
      ]);
      // 6 biens en vedette — mélange aléatoire pour varier à chaque visite
      const melanges = [...tousLesBiens].sort(() => Math.random() - 0.5);
      setBiensVedette(melanges.slice(0, 6));
      setAgences(toutesLesAgences);
      setLoading(false);
    }
    charger();
  }, []);

  // Marqueurs pour la carte des agences — on filtre les agences sans coordonnées GPS
  const agenceMarkers: MapMarker[] = agences
    .filter(a => a.latitude !== null && a.longitude !== null)
    .map(a => ({
      id: a.id,
      latitude: a.latitude as number,
      longitude: a.longitude as number,
      titre: a.nom,
      sousTitre: `${a.adresse}, ${a.ville}`,
      lien: `/agences/${a.id}`,
    }));

  function handleRecherche(e: FormEvent) {
    e.preventDefault();
    const url = rechercheVille.trim()
      ? `/biens?ville=${encodeURIComponent(rechercheVille.trim())}`
      : '/biens';
    navigate(url);
  }

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>Groupe immobilier français</span>

            <h1 className={styles.heroTitle}>
              Trouvez le bien qui<br />
              <span>vous ressemble</span>
            </h1>

            <p className={styles.heroSub}>
              KreAgency vous accompagne dans tous vos projets immobiliers.
              Achat, vente, location — 12 agences en France, une seule ambition :
              votre satisfaction.
            </p>

            <form className={styles.heroSearch} onSubmit={handleRecherche}>
              <input
                type="text"
                placeholder="Rechercher par ville (Lyon, Paris…)"
                value={rechercheVille}
                onChange={e => setRechercheVille(e.target.value)}
                className={styles.heroInput}
              />
              <button type="submit" className={styles.heroBtn}>
                Rechercher
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      <div className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsInner}>
            <div className={styles.stat}>
              <span className={styles.statValue}>12</span>
              <span className={styles.statLabel}>Agences en France</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>20+</span>
              <span className={styles.statLabel}>Biens disponibles</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>500+</span>
              <span className={styles.statLabel}>Clients satisfaits</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>15</span>
              <span className={styles.statLabel}>Ans d'expérience</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Biens en vedette ───────────────────────────────────── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Nos biens <span>en vedette</span>
            </h2>
            <Link to="/biens" className={styles.seeAll}>
              Voir tous les biens →
            </Link>
          </div>

          {loading ? (
            <p className={styles.loading}>Chargement des biens…</p>
          ) : (
            <div className={styles.biensGrid}>
              {biensVedette.map(bien => (
                <BienCard key={bien.id} bien={bien} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Carte des agences ──────────────────────────────────── */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Nos <span>12 agences</span> en France
            </h2>
            <Link to="/agences" className={styles.seeAll}>
              Voir toutes les agences →
            </Link>
          </div>

          <p className={styles.mapDesc}>
            Présent dans les grandes métropoles françaises, KreAgency dispose d'un
            réseau de 12 agences et d'un siège à Aix-en-Provence. Chaque agence
            est portée par des experts locaux du marché immobilier.
          </p>

          {!loading && (
            <MapView
              markers={agenceMarkers}
              zoom={6}
              height="460px"
            />
          )}
        </div>
      </section>
    </>
  );
}
