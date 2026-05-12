import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const navigate = useNavigate();
  const [ville, setVille] = useState('');
  const [type, setType] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (ville.trim()) params.set('ville', ville.trim());
    if (type) params.set('type', type);
    navigate(`/biens${params.toString() ? `?${params}` : ''}`);
  }

  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Ville</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Lyon, Paris, Marseille…"
            value={ville}
            onChange={e => setVille(e.target.value)}
          />
        </div>

        <div className={styles.sep} />

        <div className={styles.field}>
          <label className={styles.label}>Type de bien</label>
          <select
            className={styles.select}
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="appartement">Appartement</option>
            <option value="maison">Maison</option>
            <option value="villa">Villa</option>
            <option value="studio">Studio</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>

        <button type="submit" className={styles.searchBtn}>
          Rechercher
        </button>
      </form>
    </motion.div>
  );
}
