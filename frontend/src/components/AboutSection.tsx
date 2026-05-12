import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './AboutSection.module.css';

export default function AboutSection() {
  return (
    <section className={styles.section}>
      {/* Image de fond légèrement floutée */}
      <img
        src="/images/pexels-salmansaqib-28456460.jpg"
        alt=""
        aria-hidden="true"
        className={styles.bgImg}
      />
      {/* Voile sombre pour lisibilité */}
      <div className={styles.overlay} />

      {/* Boîte transparente — texte seul, sans contour */}
      <div className="container">
        <motion.div
          className={styles.box}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <span className={styles.eyebrow}>Fondée en 2001 · Aix-en-Provence</span>

          <h2 className={styles.title}>
            Vingt ans d&apos;expertise<br />
            <em>à votre service</em>
          </h2>

          <p className={styles.text}>
            KreAgency est née d&apos;une conviction simple : l&apos;immobilier est avant tout
            une affaire de confiance. Depuis nos débuts dans le Cours Mirabeau, nous avons
            accompagné des milliers de familles, d&apos;investisseurs et d&apos;entrepreneurs
            dans leurs projets de vie — une promesse renouvelée chaque jour à travers
            nos 12 agences réparties sur tout le territoire français.
          </p>

          <p className={styles.text}>
            Chaque bien que nous proposons est sélectionné avec soin. Chaque client
            est reçu comme un partenaire. Notre réseau d&apos;experts locaux conjugue
            connaissance du terrain et exigence du détail pour vous offrir une
            expérience immobilière sans compromis.
          </p>

          <div className={styles.actions}>
            <Link to="/agences" className={styles.btnPrimary}>
              Découvrir nos agences
            </Link>
            <Link to="/biens" className={styles.btnGhost}>
              Voir nos biens
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
