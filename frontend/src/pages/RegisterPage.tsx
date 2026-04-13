// Page d'inscription — KreAgency (clients uniquement)
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiRegister } from '../services/api';
import styles from './LoginPage.module.css'; // réutilise le même CSS

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
