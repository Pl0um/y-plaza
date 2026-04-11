import type { FiltresBiens, TypeBien, TypeTransaction, StatutBien } from '../types';
import styles from './BienFilters.module.css';

interface Props {
  filtres: FiltresBiens;
  onChange: (filtres: FiltresBiens) => void;
}

// Filtres vides — utilisés pour le reset
const FILTRES_VIDES: FiltresBiens = {
  ville: '',
  type_bien: '',
  type_transaction: '',
  prix_min: '',
  prix_max: '',
  statut: '',
};

export default function BienFilters({ filtres, onChange }: Props) {
  // Met à jour un champ individuel du filtre
  function set<K extends keyof FiltresBiens>(key: K, value: FiltresBiens[K]) {
    onChange({ ...filtres, [key]: value });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.form}>

        {/* Ville */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="filtre-ville">Ville</label>
          <input
            id="filtre-ville"
            type="text"
            placeholder="Paris, Lyon…"
            value={filtres.ville ?? ''}
            onChange={e => set('ville', e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Type de bien */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="filtre-type-bien">Type de bien</label>
          <select
            id="filtre-type-bien"
            value={filtres.type_bien ?? ''}
            onChange={e => set('type_bien', e.target.value as TypeBien | '')}
            className={styles.select}
          >
            <option value="">Tous les types</option>
            <option value="appartement">Appartement</option>
            <option value="maison">Maison</option>
            <option value="bureau">Bureau</option>
            <option value="commerce">Commerce</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>

        {/* Type de transaction */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="filtre-transaction">Transaction</label>
          <select
            id="filtre-transaction"
            value={filtres.type_transaction ?? ''}
            onChange={e => set('type_transaction', e.target.value as TypeTransaction | '')}
            className={styles.select}
          >
            <option value="">Vente & Location</option>
            <option value="vente">Vente</option>
            <option value="location">Location</option>
          </select>
        </div>

        {/* Statut */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="filtre-statut">Statut</label>
          <select
            id="filtre-statut"
            value={filtres.statut ?? ''}
            onChange={e => set('statut', e.target.value as StatutBien | '')}
            className={styles.select}
          >
            <option value="">Tous les statuts</option>
            <option value="disponible">Disponible</option>
            <option value="sous_compromis">Sous compromis</option>
            <option value="vendu">Vendu</option>
            <option value="loue">Loué</option>
          </select>
        </div>

        {/* Budget */}
        <div className={styles.field}>
          <label className={styles.label}>Budget (€)</label>
          <div className={styles.prixRow}>
            <input
              type="number"
              placeholder="Min"
              value={filtres.prix_min ?? ''}
              onChange={e => set('prix_min', e.target.value === '' ? '' : Number(e.target.value))}
              className={styles.input}
              min={0}
            />
            <span className={styles.sep}>—</span>
            <input
              type="number"
              placeholder="Max"
              value={filtres.prix_max ?? ''}
              onChange={e => set('prix_max', e.target.value === '' ? '' : Number(e.target.value))}
              className={styles.input}
              min={0}
            />
          </div>
        </div>

        {/* Reset */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnReset}
            onClick={() => onChange(FILTRES_VIDES)}
          >
            ✕ Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}
