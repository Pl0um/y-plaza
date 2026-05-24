import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TypeTransaction, TypeBien, Bien } from '../types';
import { fetchBiens } from '../services/api';
import { getDeptCode, DEPT_TO_REGION } from '../utils/deptToRegion';
import FranceMap from '../components/FranceMap';
import BienListCard from '../components/BienListCard';
import styles from './FrancePage.module.css';

interface Props {
  typeTransaction: TypeTransaction;
  title: string;
  subtitle: string;
}

interface Filtres {
  typeBien: TypeBien | '';
  prixMax: string;
  surfaceMin: string;
}

const TYPE_LABELS: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison',
  bureau: 'Bureau', commerce: 'Commerce', terrain: 'Terrain',
};

export default function FrancePage({ typeTransaction, title, subtitle }: Props) {
  const [allBiens, setAllBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [filtres, setFiltres] = useState<Filtres>({ typeBien: '', prixMax: '', surfaceMin: '' });

  useEffect(() => {
    setLoading(true);
    fetchBiens({ type_transaction: typeTransaction, statut: 'disponible' })
      .then(setAllBiens)
      .catch(() => setAllBiens([]))
      .finally(() => setLoading(false));
  }, [typeTransaction]);

  const handleMapFilter = useCallback((region: string | null, dept: string | null) => {
    setSelectedRegion(region);
    setSelectedDept(dept);
  }, []);

  const filteredBiens = useMemo(() => {
    return allBiens.filter(b => {
      const dept = getDeptCode(b.code_postal);
      const region = DEPT_TO_REGION[dept];

      if (selectedDept && dept !== selectedDept) return false;
      if (!selectedDept && selectedRegion && region !== selectedRegion) return false;
      if (filtres.typeBien && b.type_bien !== filtres.typeBien) return false;
      if (filtres.prixMax && b.prix > Number(filtres.prixMax)) return false;
      if (filtres.surfaceMin && b.surface < Number(filtres.surfaceMin)) return false;
      return true;
    });
  }, [allBiens, selectedRegion, selectedDept, filtres]);

  const resetFiltres = () => {
    setFiltres({ typeBien: '', prixMax: '', surfaceMin: '' });
  };

  const locationLabel = selectedDept
    ? `Département ${selectedDept}`
    : selectedRegion ?? 'Toute la France';

  return (
    <div className={styles.page}>
      {/* ── Top bar ─────────────────────────────────────── */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topBarInner}>
            <div className={styles.topBarLeft}>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>

            {/* Filtres */}
            <div className={styles.filtres}>
              <div className={styles.filtreField}>
                <label className={styles.filtreLabel}>Type de bien</label>
                <select
                  className={styles.filtreSelect}
                  value={filtres.typeBien}
                  onChange={e => setFiltres(f => ({ ...f, typeBien: e.target.value as TypeBien | '' }))}
                >
                  <option value="">Tous</option>
                  {Object.entries(TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filtreField}>
                <label className={styles.filtreLabel}>Budget max (€)</label>
                <input
                  type="number"
                  className={styles.filtreInput}
                  placeholder="Illimité"
                  value={filtres.prixMax}
                  onChange={e => setFiltres(f => ({ ...f, prixMax: e.target.value }))}
                />
              </div>

              <div className={styles.filtreField}>
                <label className={styles.filtreLabel}>Surface min (m²)</label>
                <input
                  type="number"
                  className={styles.filtreInput}
                  placeholder="0"
                  value={filtres.surfaceMin}
                  onChange={e => setFiltres(f => ({ ...f, surfaceMin: e.target.value }))}
                />
              </div>

              <button className={styles.resetBtn} onClick={resetFiltres}>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Corps : carte + annonces ─────────────────── */}
      <div className={styles.body}>
        {/* Colonne carte */}
        <div className={styles.mapCol}>
          <FranceMap items={allBiens} onFilterChange={handleMapFilter} />
        </div>

        {/* Colonne annonces */}
        <div className={styles.listCol}>
          <div className={styles.listHeader}>
            <span className={styles.listLocation}>{locationLabel}</span>
            <span className={styles.listCount}>
              {loading ? 'Chargement…' : `${filteredBiens.length} bien${filteredBiens.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {!loading && filteredBiens.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Aucun bien trouvé</p>
              <p className={styles.emptyText}>Essayez d&apos;élargir vos critères ou de sélectionner une autre zone sur la carte.</p>
            </div>
          )}

          <div className={styles.list}>
            {filteredBiens.map((b, i) => (
              <BienListCard key={b.id} bien={b} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
