// Dashboard transactions — gestionnaire_ventes / admin — KreAgency
import { useState, useEffect } from 'react';
import { fetchTransactions, createTransaction, updateTransaction, fetchBiens, fetchUtilisateurs } from '../../services/api';
import type { Transaction, StatutTransaction, Bien, Utilisateur } from '../../types';
import styles from './DashboardLayout.module.css';

const STATUTS: StatutTransaction[] = ['en_cours', 'finalisee', 'annulee'];

const LABEL_STATUT: Record<StatutTransaction, string> = {
  en_cours:  'En cours',
  finalisee: 'Finalisée',
  annulee:   'Annulée',
};

const CSS_STATUT: Record<StatutTransaction, string> = {
  en_cours:  styles.statutEnCours,
  finalisee: styles.statutFinalisee,
  annulee:   styles.statutAnnulee,
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [biens,        setBiens]        = useState<Bien[]>([]);
  const [clients,      setClients]      = useState<Utilisateur[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [erreur,       setErreur]       = useState('');

  // Modal édition statut
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [statut,   setStatut]   = useState<StatutTransaction>('en_cours');
  const [notes,    setNotes]    = useState('');
  const [saving,   setSaving]   = useState(false);

  // Modal création
  const [showCreate,   setShowCreate]   = useState(false);
  const [newBienId,    setNewBienId]    = useState('');
  const [newClientId,  setNewClientId]  = useState('');
  const [newType,      setNewType]      = useState<'vente' | 'location'>('vente');
  const [newPrix,      setNewPrix]      = useState('');
  const [newNotes,     setNewNotes]     = useState('');
  const [creating,     setCreating]     = useState(false);
  const [createErreur, setCreateErreur] = useState('');

  useEffect(() => { charger(); }, []);

  async function charger() {
    setLoading(true);
    try {
      const [tx, b, u] = await Promise.all([
        fetchTransactions(),
        fetchBiens({ statut: 'disponible' }),
        fetchUtilisateurs(),
      ]);
      setTransactions(tx);
      setBiens(b);
      setClients(u.filter(u => u.role === 'client'));
    } catch {
      setErreur('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  }

  // Pré-remplir le prix quand on change le bien
  function handleBienChange(id: string) {
    setNewBienId(id);
    const bien = biens.find(b => b.id === id);
    if (bien) setNewPrix(String(bien.prix));
  }

  function ouvrirCreation() {
    setNewBienId('');
    setNewClientId('');
    setNewType('vente');
    setNewPrix('');
    setNewNotes('');
    setCreateErreur('');
    setShowCreate(true);
  }

  async function handleCreate() {
    if (!newBienId || !newClientId || !newPrix) {
      setCreateErreur('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setCreating(true);
    setCreateErreur('');
    try {
      await createTransaction({
        bien_id:    newBienId,
        acheteur_id: newClientId,
        prix_final: Number(newPrix),
        type:       newType,
        notes:      newNotes || undefined,
      });
      setShowCreate(false);
      await charger();
    } catch {
      setCreateErreur('Erreur lors de la création de la transaction.');
    } finally {
      setCreating(false);
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
          <button className={styles.btnPrimary} onClick={ouvrirCreation}>
            + Nouvelle transaction
          </button>
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
                  <th>Acheteur / Locataire</th>
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

        {/* ── Modal création ── */}
        {showCreate && (
          <div className={styles.overlay} onClick={() => setShowCreate(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>Nouvelle transaction</h2>

              <div className={styles.modalForm}>
                {createErreur && <p className={styles.error}>{createErreur}</p>}

                <div className={styles.field}>
                  <label className={styles.label}>Bien *</label>
                  <select
                    className={styles.select}
                    value={newBienId}
                    onChange={e => handleBienChange(e.target.value)}
                  >
                    <option value="">— Sélectionner un bien disponible —</option>
                    {biens.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.titre} — {b.ville} ({b.prix.toLocaleString('fr-FR')} €)
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Client *</label>
                  <select
                    className={styles.select}
                    value={newClientId}
                    onChange={e => setNewClientId(e.target.value)}
                  >
                    <option value="">— Sélectionner un client —</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.prenom} {c.nom} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Type *</label>
                  <select
                    className={styles.select}
                    value={newType}
                    onChange={e => setNewType(e.target.value as 'vente' | 'location')}
                  >
                    <option value="vente">Vente</option>
                    <option value="location">Location</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Prix final (€) *</label>
                  <input
                    className={styles.input}
                    type="number"
                    min="0"
                    value={newPrix}
                    onChange={e => setNewPrix(e.target.value)}
                    placeholder="Ex : 250000"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Notes</label>
                  <textarea
                    className={styles.textarea}
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="Observations, conditions particulières…"
                  />
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.btnOutline} onClick={() => setShowCreate(false)}>
                    Annuler
                  </button>
                  <button className={styles.btnPrimary} onClick={handleCreate} disabled={creating}>
                    {creating ? 'Création…' : 'Créer la transaction'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal édition statut ── */}
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
