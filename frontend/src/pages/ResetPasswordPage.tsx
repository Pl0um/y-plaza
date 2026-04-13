// Page de réinitialisation du mot de passe — KreAgency
// Envoie un lien de reset via le backend → Supabase auth.resetPasswordForEmail
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './LoginPage.module.css';

export default function ResetPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [succes,  setSucces]  = useState('');
  const [erreur,  setErreur]  = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');
    setSucces('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErreur('Adresse email invalide.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { email: email.trim() });
      setSucces('Si un compte existe pour cet email, un lien de réinitialisation vous a été envoyé.');
      setEmail('');
    } catch {
      // Message neutre : ne pas révéler si l'email existe ou non
      setSucces('Si un compte existe pour cet email, un lien de réinitialisation vous a été envoyé.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Mot de passe oublié</h1>
        <p className={styles.subtitle}>
          Entrez votre email pour recevoir un lien de réinitialisation.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {erreur && <p className={styles.error}>{erreur}</p>}
          {succes && <p className={styles.success}>{succes}</p>}

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

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Envoi…' : 'Envoyer le lien'}
          </button>
        </form>

        <div className={styles.links}>
          <Link to="/login" className={styles.link}>← Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}
