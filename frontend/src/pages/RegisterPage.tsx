// Page d'inscription — KreAgency (clients uniquement)
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiRegister } from '../services/api';
import styles from './LoginPage.module.css'; // réutilise le même CSS

// ─── Indicateur de force du mot de passe ─────────────────────────────────────

const CRITERES = [
  { label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
  { label: 'Une majuscule',         test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un chiffre',            test: (p: string) => /[0-9]/.test(p) },
  { label: 'Un caractère spécial',  test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(p) },
];

const NIVEAUX = [
  { label: 'Très faible', color: '#EF4444' },
  { label: 'Faible',      color: '#F97316' },
  { label: 'Moyen',       color: '#EAB308' },
  { label: 'Fort',        color: '#22C55E' },
  { label: 'Très fort',   color: '#16A34A' },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const score = CRITERES.filter(c => c.test(password)).length;
  const niveau = NIVEAUX[score];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
      {/* Barres */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {CRITERES.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              backgroundColor: i < score ? niveau.color : 'var(--color-border)',
              transition: 'background-color 0.2s',
            }}
          />
        ))}
      </div>
      {/* Label + critères non remplis */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.75rem', color: niveau.color, fontWeight: 600 }}>
          {niveau.label}
        </span>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', textAlign: 'right' }}>
          {CRITERES.filter(c => !c.test(password)).map(c => (
            <li key={c.label} style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              {c.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [prenom,   setPrenom]   = useState('');
  const [nom,      setNom]      = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [erreur,   setErreur]   = useState('');
  const [succes,   setSucces]   = useState('');
  const [loading,  setLoading]  = useState(false);

  // Validation côté client
  function valider(): string | null {
    if (!prenom.trim() || !nom.trim()) return 'Prénom et nom sont obligatoires.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email invalide.';
    if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
    if (password !== confirm) return 'Les mots de passe ne correspondent pas.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');
    setSucces('');

    const validationError = valider();
    if (validationError) { setErreur(validationError); return; }

    setLoading(true);
    try {
      const { message } = await apiRegister({
        email:    email.trim(),
        password,
        nom:      nom.trim(),
        prenom:   prenom.trim(),
      });
      setSucces(message);
      // Réinitialise le formulaire
      setPrenom(''); setNom(''); setEmail(''); setPassword(''); setConfirm('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setErreur(msg ?? 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Créer un compte</h1>
        <p className={styles.subtitle}>Inscription client — KreAgency</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {erreur  && <p className={styles.error}>{erreur}</p>}
          {succes  && <p className={styles.success}>{succes}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', minWidth: 0 }}>
            <div className={styles.field} style={{ minWidth: 0 }}>
              <label className={styles.label} htmlFor="prenom">Prénom</label>
              <input
                id="prenom"
                type="text"
                className={styles.input}
                value={prenom}
                onChange={e => setPrenom(e.target.value)}
                placeholder="Marie"
                required
                autoComplete="given-name"
              />
            </div>
            <div className={styles.field} style={{ minWidth: 0 }}>
              <label className={styles.label} htmlFor="nom">Nom</label>
              <input
                id="nom"
                type="text"
                className={styles.input}
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Dupont"
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
              required
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm">Confirmer le mot de passe</label>
            <input
              id="confirm"
              type="password"
              className={`${styles.input} ${confirm && confirm !== password ? styles.inputError : ''}`}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
            {confirm && confirm !== password && (
              <span className={styles.fieldError}>Les mots de passe ne correspondent pas.</span>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Inscription…' : 'Créer mon compte'}
          </button>
        </form>

        <div className={styles.links}>
          <span>
            Déjà inscrit ?{' '}
            <Link to="/login" className={styles.link}>Se connecter</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
