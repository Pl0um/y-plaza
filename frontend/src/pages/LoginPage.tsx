// Page de connexion — KreAgency
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RoleUtilisateur } from '../types';
import styles from './LoginPage.module.css';

// Redirige vers le dashboard selon le rôle
function dashboardParRole(role: RoleUtilisateur): string {
  switch (role) {
    case 'commercial':         return '/dashboard/annonces';
    case 'gestionnaire_ventes': return '/dashboard/transactions';
    case 'directeur':          return '/dashboard/stats';
    case 'admin':              return '/admin';
    default:                   return '/';
  }
}

export default function LoginPage() {
  const navigate        = useNavigate();
  const { login }       = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [erreur,   setErreur]   = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      // login() stocke l'utilisateur, on récupère son rôle depuis le contexte
      // mais on doit le lire depuis localStorage car le state n'est pas encore à jour
      const stored = localStorage.getItem('krea_user');
      const user   = stored ? JSON.parse(stored) : null;
      navigate(dashboardParRole(user?.role ?? 'client'), { replace: true });
    } catch {
      setErreur('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Connexion</h1>
        <p className={styles.subtitle}>Bienvenue sur KreAgency</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {erreur && <p className={styles.error}>{erreur}</p>}

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
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className={styles.links}>
          <Link to="/reset-password" className={styles.link}>
            Mot de passe oublié ?
          </Link>
          <span>
            Pas encore de compte ?{' '}
            <Link to="/register" className={styles.link}>S'inscrire</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
