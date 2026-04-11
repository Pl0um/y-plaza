import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchBiens } from '../services/api';
import type { Bien, FiltresBiens } from '../types';
import BienCard from '../components/BienCard';
import BienFilters from '../components/BienFilters';
import styles from './BiensPage.module.css';

export default function BiensPage() {
  const [searchParams] = useSearchParams();

  // Initialisation des filtres depuis les paramètres URL (ex : ?ville=Lyon)
  const [filtres, setFiltres] = useState<FiltresBiens>({
    ville: searchParams.get('ville') ?? '',
    type_bien: '',
    type_transaction: '',
    prix_min: '',
    prix_max: '',
    statut: '',
  });

  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);

  // Relance la requête chaque fois que les filtres changent
  useEffect(() => {
    let annule = false;

    async function charger() {
      setLoading(true);
      const resultats = await fetchBiens(filtres);
      if (!annule) {
        setBiens(resultats);
        setLoading(false);
      }
    }

    charger();
    return () => { annule = true; };
  }, [filtres]);

  return (
    <main className={styles.page}>
      <div className="container">
        {/* En-tête */}
        <div className={styles.header}>
          <h1 className={styles.title}>Nos biens immobiliers</h1>
          {!loading && (
            <p className={styles.count}>
              {biens.length} bien{biens.length > 1 ? 's' : ''} trouvé{biens.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Filtres */}
        <div className={styles.filters}>
          <BienFilters filtres={filtres} onChange={setFiltres} />
        </div>

        {/* Grille de résultats */}
        {loading ? (
          <p className={styles.loading}>Chargement…</p>
        ) : (
          <div className={styles.grid}>
            {biens.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🏠</div>
                <p className={styles.emptyTitle}>Aucun bien ne correspond à vos critères</p>
                <p>Essayez de modifier ou réinitialiser les filtres.</p>
              </div>
            ) : (
              biens.map(bien => <BienCard key={bien.id} bien={bien} />)
            )}
          </div>
        )}
      </div>
    </main>
  );
}
