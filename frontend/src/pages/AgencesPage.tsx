import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchAgences } from '../services/api';
import type { Agence } from '../types';
import FranceMap from '../components/FranceMap';
import { getDeptCode, DEPT_TO_REGION } from '../utils/deptToRegion';
import styles from './AgencesPage.module.css';

export default function AgencesPage() {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  useEffect(() => {
    fetchAgences()
      .then(data => { setAgences(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleMapFilter = useCallback((region: string | null, dept: string | null) => {
    setSelectedRegion(region);
    setSelectedDept(dept);
  }, []);

  const filteredAgences = useMemo(() => {
    return agences.filter(a => {
      const dept = getDeptCode(a.code_postal);
      const region = DEPT_TO_REGION[dept];
      if (selectedDept && dept !== selectedDept) return false;
      if (!selectedDept && selectedRegion && region !== selectedRegion) return false;
      return true;
    });
  }, [agences, selectedRegion, selectedDept]);

  const locationLabel = selectedDept
    ? `Département ${selectedDept}`
    : selectedRegion ?? 'Toute la France';

  return (
    <div className={styles.page}>
      {/* ── Top bar ─────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className="container">
          <h1 className={styles.title}>Nos agences en France</h1>
          <p className={styles.subtitle}>
            Cliquez sur une région pour trouver nos agences près de chez vous
          </p>
        </div>
      </div>

      {/* ── Corps : carte + agences ──────────────────── */}
      <div className={styles.body}>
        {/* Colonne carte */}
        <div className={styles.mapCol}>
          <FranceMap items={agences} itemLabel="agence" onFilterChange={handleMapFilter} />
        </div>

        {/* Colonne agences */}
        <div className={styles.listCol}>
          <div className={styles.listHeader}>
            <span className={styles.listLocation}>{locationLabel}</span>
            <span className={styles.listCount}>
              {loading ? 'Chargement…' : `${filteredAgences.length} agence${filteredAgences.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {!loading && filteredAgences.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Aucune agence dans ce secteur</p>
              <p className={styles.emptyText}>Sélectionnez une autre région sur la carte.</p>
            </div>
          )}

          <div className={styles.list}>
            {filteredAgences.map(agence => (
              <AgenceCard key={agence.id} agence={agence} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgenceCard({ agence }: { agence: Agence }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <p className={styles.cardNom}>{agence.nom}</p>
        {agence.est_siege && <span className={styles.siegeBadge}>Siège</span>}
      </div>
      <p className={styles.cardInfo}>
        {agence.adresse}<br />
        {agence.code_postal} {agence.ville}<br />
        <a href={`tel:${agence.telephone}`}>{agence.telephone}</a><br />
        <a href={`mailto:${agence.email}`}>{agence.email}</a>
      </p>
      <Link to={`/agences/${agence.id}`} className={styles.cardLink}>
        Voir l&apos;agence →
      </Link>
    </div>
  );
}
