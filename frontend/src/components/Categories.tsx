import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './Categories.module.css';

const CATS = [
  { type: 'appartement', label: 'Appartements', count: 48 },
  { type: 'maison',      label: 'Maisons',      count: 32 },
  { type: 'villa',       label: 'Villas',        count: 14 },
  { type: 'studio',      label: 'Studios',       count: 27 },
  { type: 'terrain',     label: 'Terrains',      count: 9  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function Categories() {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.eyebrow}>Parcourir</span>
          <h2 className={styles.title}>
            Nos catégories de biens
          </h2>
        </motion.div>

        <motion.div
          className={styles.grid}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {CATS.map(cat => (
            <motion.button
              key={cat.type}
              className={styles.card}
              variants={item}
              onClick={() => navigate(`/biens?type=${cat.type}`)}
            >
              <span className={styles.count}>{cat.count}</span>
              <span className={styles.label}>{cat.label}</span>
              <span className={styles.cta}>Explorer &rarr;</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
