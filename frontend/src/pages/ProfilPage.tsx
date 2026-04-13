// Page profil client — KreAgency
import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiUpdateMe, fetchFavoris, removeFavori } from '../services/api';
import type { Favori } from '../types';
import BienCard from '../components/BienCard';
import styles from './ProfilPage.module.css';

const LABEL_ROLE: Record<string, string> = {
  client:              'Client',
  commercial:          'Commercial',
  gestionnaire_ventes: 'Gestionnaire des ventes',
  directeur:           'Directeur',
  admin:               'Administrateur',
};

export default function ProfilPage() {
  const { user, refreshUser } = useAuth();

  const [nom,       setNom]       = useState(user?.nom       ?? '');
  const [prenom,    setPrenom]    = useState(user?.prenom    ?? '');
  const [telephone, setTelephone] = useState(user?.telephone ?? '');
  const [loading,   setLoading]   = useState(false);
  const [succes,    setSucces]    = useState('');
  const [erreur,    setErreur]    = useState('');

  const [favoris,         setFavoris]         = useState<Favori[]>([]);
  const [loadingFavoris,  setLoadingFavoris]  = useState(true);

  // Charge les favoris de l'utilisateur
  useEffect(() => {
    fetchFavoris()
      .then(setFavoris)
      .catch(() => {})
      .finally(() => setLoadingFavoris(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSucces(''); setErreur('');
    setLoading(true);
    try {
      await apiUpdateMe({ nom: nom.trim(), prenom: prenom.trim(), telephone: telephone.trim() });
      await refreshUser();
      setSucces('Profil mis à jour avec succès.');
    } catch {
      setErreur('Erreur lors de la mise à jour. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRetireFavori(bienId: string) {
    await removeFavori(bienId).catch(() => {});
    setFavoris(prev => prev.filter(f => f.bien_id !== bienId));
  }

  if (!user) return null;

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Mon profil</h1>
          <p className={styles.subtitle}>
            {user.prenom} {user.nom} ·{' '}
            <span className={styles.roleBadge}>{LABEL_ROLE[user.role] ?? user.role}</span>
          </p>
        </div>

        <div className={styles.layout}>
          {/* ── Infos personnelles ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Informations personnelles</h2>
            <form className={styles.form} onSubmit={handleSave}>
              {succes && <p className={styles.success}>{succes}</p>}
              {erreur && <p className={styles.error}>{erreur}</p>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', minWidth: 0 }}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="prenom">Prénom</label>
                  <input id="prenom" type="text" className={styles.input}
                    value={prenom} onChange={e => setPrenom(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="nom">Nom</label>
                  <input id="nom" type="text" className={styles.input}
                    value={nom} onChange={e => setNom(e.target.value)} />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input id="email" type="email" className={styles.input}
                  value={user.email} readOnly />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="telephone">Téléphone</label>
                <input id="telephone" type="tel" className={styles.input}
                  value={telephone} onChange={e => setTelephone(e.target.value)}
                  placeholder="06 00 00 00 00" />
              </div>

              <button type="submit" className={styles.saveBtn} disabled={loading}>
                {loading ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </form>
          </div>

          {/* ── Favoris ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              Mes favoris ({favoris.length})
            </h2>

            {loadingFavoris ? (
              <p className={styles.empty}>Chargement…</p>
            ) : favoris.length === 0 ? (
              <p className={styles.empty}>Aucun bien mis en favori pour l'instant.</p>
            ) : (
              <div className={styles.bienGrid}>
                {favoris.map(f =>
                  f.biens ? (
                    <div key={f.id} style={{ position: 'relative' }}>
                      <BienCard bien={f.biens} />
                      <button
                        onClick={() => handleRetireFavori(f.bien_id)}
                        style={{
                          position: 'absolute', top: '0.5rem', right: '0.5rem',
                          background: 'rgba(0,0,0,0.55)', color: '#fff',
                          border: 'none', borderRadius: '50%',
                          width: 28, height: 28, cursor: 'pointer', fontSize: '1rem',
                        }}
                        title="Retirer des favoris"
                      >
                        ×
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
