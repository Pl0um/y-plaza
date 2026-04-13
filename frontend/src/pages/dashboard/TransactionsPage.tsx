// Dashboard transactions — gestionnaire_ventes / admin — KreAgency
import { useState, useEffect } from 'react';
import { fetchTransactions, updateTransaction } from '../../services/api';
import type { Transaction, StatutTransaction } from '../../types';
import styles from './DashboardLayout.module.css';

const STATUTS: StatutTransaction[] = ['en_cours', 'finalisee', 'annulee'];

const LABEL_STATUT: Record<StatutTransaction, string> = {
  en_cours:   'En cours',
  finalisee:  'Finalisée',
  annulee:    'Annulée',
};

const CSS_STATUT: Record<StatutTransaction, string> = {
  en_cours:  styles.statutEnCours,
  finalisee: styles.statutFinalisee,
  annulee:   styles.statutAnnulee,
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [erreur,  setErreur]            = useState('');

  // Modal édition statut
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [statut,   setStatut]   = useState<StatutTransaction>('en_cours');
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { charger(); }, []);

  async function charger() {
    setLoading(true);
    try {
      setTransactions(await fetchTransactions());
    } catch {
      setErreur('Impossible de charger les transactions.');
    } finally {
      setLoading(false);
    }
  }

  function ouvrirEdition(t: Transaction) {
    setSelected(t);
    setStatut(t.statut);
    setNotes(t.notes ?? '');
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await updateTransaction(selected.id, { statut, notes });
      setSelected(null);
      await charger();
    } catch {
      setErreur('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  }

  const totalFinalise = transactions
    .filter(t => t.statut === 'finalisee')
    .reduce((s, t) => s + t.prix_final, 0);

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Transactions</h1>
            <p className={styles.subtitle}>
              {transactions.length} transaction{transactions.length > 1 ? 's' : ''} · CA finalisé :{' '}
              {totalFinalise.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>

        {erreur && <p className={styles.error}>{erreur}</p>}

        {/* ── Stat cards ── */}
        <div className={styles.statsGrid}>
          {STATUTS.map(s => {
            const count = transactions.filter(t => t.statut === s).length;
            return (
              <div className={styles.statCard} key={s}>
                <p className={styles.statCardValue}>{count}</p>
                <p className={styles.statCardLabel}>{LABEL_STATUT[s]}</p>
              </div>
            );
          })}
        </div>

        {loading ? (
          <p className={styles.empty}>Chargement…</p>
        ) : transactions.length === 0 ? (
          <p className={styles.empty}>Aucune transaction enregistrée.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Bien</th>
                  <th>Acheteur</th>
                  <th>Prix final</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>
                      {t.biens?.titre ?? t.bien_id}
                    </td>
                    <td>
                      {t.utilisateurs
                        ? `${t.utilisateurs.prenom} ${t.utilisateurs.nom}`
                        : '—'}
                    </td>
                    <td>{t.prix_final.toLocaleString('fr-FR')} €</td>
                    <td>{t.type === 'vente' ? 'Vente' : 'Location'}</td>
                    <td>
                      <span className={`${styles.statut} ${CSS_STATUT[t.statut]}`}>
                        {LABEL_STATUT[t.statut]}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(t.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <button className={styles.btnOutline} onClick={() => ouvrirEdition(t)}>
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Modal édition ── */}
        {selected && (
          <div className={styles.overlay} onClick={() => setSelected(null)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Modifier la transaction</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                {selected.biens?.titre ?? selected.bien_id}
              </p>

              <div className={styles.modalForm}>
                <div className={styles.field}>
                  <label className={styles.label}>Statut</label>
                  <select
                    className={styles.select}
                    value={statut}
                    onChange={e => setStatut(e.target.value as StatutTransaction)}
                  >
                    {STATUTS.map(s => (
                      <option key={s} value={s}>{LABEL_STATUT[s]}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Notes</label>
                  <textarea
                    className={styles.textarea}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Observations, remarques…"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.btnOutline} onClick={() => setSelected(null)}>
                    Annuler
                  </button>
                  <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
