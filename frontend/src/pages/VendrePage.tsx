import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './VendrePage.module.css';

interface SimForm {
  ville: string;
  typeBien: string;
  surface: string;
  nbPieces: string;
  etat: string;
}

interface Estimation {
  min: number;
  max: number;
  perM2: number;
}

// Prix au m² indicatifs par ville (source: baromètre FNAIM simplifié)
const PRIX_PAR_VILLE: Record<string, number> = {
  paris: 10200, neuilly: 11500, boulogne: 9000, vincennes: 8500,
  lyon: 5100, bordeaux: 4800, marseille: 3700,
  nantes: 4000, toulouse: 3600, nice: 5500, rennes: 3500,
  montpellier: 3400, strasbourg: 3300, lille: 3100,
  grenoble: 3200, toulon: 3000, angers: 3100, rouen: 3000,
  aix: 4600, 'aix-en-provence': 4600,
  antibes: 4400, cannes: 5800, metz: 2700, reims: 2600,
};

function normalize(v: string) {
  return v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

function getPrixM2(ville: string): number {
  const key = normalize(ville);
  for (const [k, v] of Object.entries(PRIX_PAR_VILLE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return 2800; // moyenne nationale
}

function computeEstimation(form: SimForm): Estimation | null {
  const surface = parseFloat(form.surface);
  if (!form.ville || !surface || surface <= 0) return null;

  const baseM2 = getPrixM2(form.ville);
  const typeCoef = form.typeBien === 'maison' ? 1.05 : form.typeBien === 'terrain' ? 0.35 : 1.0;
  const etatCoef = form.etat === 'neuf' ? 1.20 : form.etat === 'renover' ? 0.78 : 1.0;

  const perM2 = Math.round(baseM2 * typeCoef * etatCoef);
  const base = surface * perM2;

  return {
    min: Math.round((base * 0.92) / 5000) * 5000,
    max: Math.round((base * 1.08) / 5000) * 5000,
    perM2,
  };
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n);
}

const WHY_ITEMS = [
  {
    num: '01',
    titre: 'Estimation gratuite & sans engagement',
    text: 'Nos experts vous fournissent une évaluation précise de votre bien, basée sur les transactions réelles du marché local.',
  },
  {
    num: '02',
    titre: 'Réseau de 12 agences en France',
    text: 'Avec une présence dans les principales métropoles, nous maximisons la visibilité de votre bien auprès d\'acheteurs qualifiés.',
  },
  {
    num: '03',
    titre: 'Accompagnement jusqu\'à la signature',
    text: 'De la mise en valeur photographique jusqu\'à la signature chez le notaire, nous gérons chaque étape de votre vente.',
  },
  {
    num: '04',
    titre: 'Commission transparente',
    text: 'Nos honoraires sont clairs dès le départ. Pas de surprise, pas de frais cachés — uniquement des résultats.',
  },
];

export default function VendrePage() {
  const [form, setForm] = useState<SimForm>({
    ville: '', typeBien: 'appartement', surface: '', nbPieces: '', etat: 'bon',
  });
  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setSubmitted(false);
    setEstimation(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = computeEstimation(form);
    setEstimation(result);
    setSubmitted(true);
  }

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <motion.span
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Vendre avec KreAgency
          </motion.span>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Estimez votre bien<br />
            <em>en quelques secondes</em>
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Obtenez une première estimation gratuite basée sur les données du marché.
            Nos experts affineront ensuite l&apos;évaluation lors d&apos;une visite.
          </motion.p>
        </div>
      </section>

      {/* ── Simulateur ───────────────────────────────── */}
      <section className={styles.simSection}>
        <div className="container">
          <div className={styles.simGrid}>
            {/* Formulaire */}
            <motion.div
              className={styles.formBox}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65 }}
            >
              <h2 className={styles.formTitle}>Votre bien</h2>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label className={styles.label}>Ville *</label>
                  <input
                    type="text"
                    name="ville"
                    className={styles.input}
                    placeholder="Ex : Paris, Lyon, Bordeaux…"
                    value={form.ville}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Type de bien</label>
                    <select name="typeBien" className={styles.select} value={form.typeBien} onChange={handleChange}>
                      <option value="appartement">Appartement</option>
                      <option value="maison">Maison</option>
                      <option value="bureau">Bureau</option>
                      <option value="commerce">Commerce</option>
                      <option value="terrain">Terrain</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Surface (m²) *</label>
                    <input
                      type="number"
                      name="surface"
                      className={styles.input}
                      placeholder="Ex : 75"
                      min="1"
                      value={form.surface}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Nombre de pièces</label>
                    <select name="nbPieces" className={styles.select} value={form.nbPieces} onChange={handleChange}>
                      <option value="">—</option>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} pièce{n > 1 ? 's' : ''}</option>)}
                      <option value="9">9 pièces et +</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>État général</label>
                    <select name="etat" className={styles.select} value={form.etat} onChange={handleChange}>
                      <option value="neuf">Neuf / récent</option>
                      <option value="bon">Bon état</option>
                      <option value="renover">À rénover</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Estimer mon bien →
                </button>
              </form>
            </motion.div>

            {/* Résultat */}
            <motion.div
              className={styles.resultBox}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65, delay: 0.1 }}
            >
              {!submitted ? (
                <div className={styles.resultPlaceholder}>
                  <div className={styles.placeholderIcon}>€</div>
                  <p className={styles.placeholderText}>
                    Renseignez les informations de votre bien pour obtenir une estimation instantanée.
                  </p>
                </div>
              ) : estimation ? (
                <div className={styles.result}>
                  <span className={styles.resultEyebrow}>Estimation indicative</span>
                  <div className={styles.resultRange}>
                    <span className={styles.resultMin}>{fmt(estimation.min)} €</span>
                    <span className={styles.resultSep}>—</span>
                    <span className={styles.resultMax}>{fmt(estimation.max)} €</span>
                  </div>
                  <p className={styles.resultPerM2}>
                    soit ~&nbsp;<strong>{fmt(estimation.perM2)} €/m²</strong> dans ce secteur
                  </p>
                  <p className={styles.resultDisclaimer}>
                    Cette estimation est fournie à titre indicatif et ne constitue pas une offre d&apos;achat.
                    Pour une évaluation précise, nos experts vous contacteront sous 24h.
                  </p>
                  <Link to="/agences" className={styles.resultCta}>
                    Contacter un expert →
                  </Link>
                </div>
              ) : (
                <div className={styles.resultError}>
                  <p>Veuillez indiquer une ville et une surface valide.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pourquoi nous ────────────────────────────── */}
      <section className={styles.whySection}>
        <div className="container">
          <motion.div
            className={styles.whyHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.whyEyebrow}>Pourquoi nous choisir</span>
            <h2 className={styles.whyTitle}>Un accompagnement d&apos;exception</h2>
          </motion.div>

          <div className={styles.whyGrid}>
            {WHY_ITEMS.map((item, i) => (
              <motion.div
                key={item.num}
                className={styles.whyCard}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
              >
                <span className={styles.whyNum}>{item.num}</span>
                <h3 className={styles.whyCardTitle}>{item.titre}</h3>
                <p className={styles.whyCardText}>{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
