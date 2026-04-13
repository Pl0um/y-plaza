// Dashboard statistiques — directeur / admin — KreAgency
import { useState, useEffect } from 'react';
import { fetchBiens, fetchTransactions } from '../../services/api';
import type { Bien, Transaction } from '../../types';
import styles from './DashboardLayout.module.css';

export default function StatsPage() {
  const [biens,        setBiens]        = useState<Bien[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([fetchBiens(), fetchTransactions()])
      .then(([b, t]) => { setBiens(b); setTransactions(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Calculs
  const disponibles   = biens.filter(b => b.statut === 'disponible').length;
  const vendus        = biens.filter(b => b.statut === 'vendu').length;
  const compromis     = biens.filter(b => b.statut === 'sous_compromis').length;
  const loues         = biens.filter(b => b.statut === 'loue').length;

  const caTotal = transactions
    .filter(t => t.statut === 'finalisee')
    .reduce((s, t) => s + t.prix_final, 0);

  // Biens par ville
  const parVille: Record<string, number> = {};
  for (const b of biens) {
    parVille[b.ville] = (parVille[b.ville] ?? 0) + 1;
  }
  const villesTriees = Object.entries(parVille).sort((a, b) => b[1] - a[1]);

  // Transactions finalisées par mois (12 derniers mois)
  const maintenant   = new Date();
  const parMois: { label: string; count: number; ca: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d    = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
    const cle  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });

    const moisTx = transactions.filter(t => {
      return t.statut === 'finalisee' && t.created_at.startsWith(cle);
    });

    parMois.push({
      label,
      count: moisTx.length,
      ca:    moisTx.reduce((s, t) => s + t.prix_final, 0),
    });
  }

  const maxCa = Math.max(...parMois.map(m => m.ca), 1);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className="container">
          <p className={styles.empty}>Chargement des statistiques…</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Statistiques</h1>
            <p className={styles.subtitle}>Vue globale de l'activité</p>
          </div>
        </div>

        {/* ── KPIs biens ── */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statCardValue}>{biens.length}</p>
            <p className={styles.statCardLabel}>Biens total</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statCardValue}>{disponibles}</p>
            <p className={styles.statCardLabel}>Disponibles</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statCardValue}>{compromis}</p>
            <p className={styles.statCardLabel}>Sous compromis</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statCardValue}>{vendus}</p>
            <p className={styles.statCardLabel}>Vendus</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statCardValue}>{loues}</p>
            <p className={styles.statCardLabel}>Loués</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statCardValue}>{caTotal.toLocaleString('fr-FR')} €</p>
            <p className={styles.statCardLabel}>CA finalisé</p>
          </div>
        </div>

        {/* ── Graphique CA par mois (barres CSS) ── */}
        <div style={{
          background: 'var(--color-bg)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius)', padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)', marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1.5rem' }}>
            CA finalisé par mois (12 derniers mois)
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 160 }}>
            {parMois.map(m => (
              <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                  {m.ca > 0 ? `${Math.round(m.ca / 1000)}k` : ''}
                </span>
                <div style={{
                  width: '100%',
                  height: `${(m.ca / maxCa) * 120}px`,
                  minHeight: m.ca > 0 ? 4 : 0,
                  background: 'var(--color-primary)',
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.85,
                }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Biens par ville ── */}
        <div style={{
          background: 'var(--color-bg)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius)', padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1.25rem' }}>
            Biens par ville
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {villesTriees.map(([ville, count]) => (
              <div key={ville} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ minWidth: 130, fontSize: '0.875rem', color: 'var(--color-text)' }}>
                  {ville}
                </span>
                <div style={{ flex: 1, background: 'var(--color-bg-light)', borderRadius: 4, height: 10 }}>
                  <div style={{
                    width: `${(count / biens.length) * 100}%`,
                    background: 'var(--color-primary)', borderRadius: 4, height: '100%',
                  }} />
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', minWidth: 24, textAlign: 'right' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
