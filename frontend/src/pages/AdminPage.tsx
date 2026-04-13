// Page d'administration — admin uniquement — KreAgency
import { useState, useEffect } from 'react';
import {
  fetchUtilisateurs,
  updateUtilisateurRole,
  apiInvite,
  fetchAgences,
  createAgence,
} from '../services/api';
import type { Utilisateur, Agence, RoleUtilisateur, InvitePayload } from '../types';
import styles from './dashboard/DashboardLayout.module.css';

type Onglet = 'utilisateurs' | 'invitations' | 'agences';

const ROLES: RoleUtilisateur[] = ['client', 'commercial', 'gestionnaire_ventes', 'directeur', 'admin'];
const LABEL_ROLE: Record<RoleUtilisateur, string> = {
  client:              'Client',
  commercial:          'Commercial',
  gestionnaire_ventes: 'Gestionnaire des ventes',
  directeur:           'Directeur',
  admin:               'Admin',
};

export default function AdminPage() {
  const [onglet, setOnglet] = useState<Onglet>('utilisateurs');

  // ── Utilisateurs ──────────────────────────────────────────────────────────
  const [users,        setUsers]        = useState<Utilisateur[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUtilisateurs()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  async function handleRoleChange(id: string, role: RoleUtilisateur) {
    await updateUtilisateurRole(id, { role }).catch(() => {});
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  }

  async function handleToggleActif(u: Utilisateur) {
    const actif = !u.actif;
    await updateUtilisateurRole(u.id, { actif }).catch(() => {});
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, actif } : x));
  }

  // ── Invitations ───────────────────────────────────────────────────────────
  const [invite,        setInvite]        = useState<InvitePayload>({ email: '', role: 'commercial', nom: '', prenom: '' });
  const [inviteSucces,  setInviteSucces]  = useState('');
  const [inviteErreur,  setInviteErreur]  = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  async function handleInvite() {
    if (!invite.email || !invite.nom || !invite.prenom) {
      setInviteErreur('Email, nom et prénom sont obligatoires.'); return;
    }
    setInviteLoading(true); setInviteErreur(''); setInviteSucces('');
    try {
      const { message } = await apiInvite(invite);
      setInviteSucces(message);
      setInvite({ email: '', role: 'commercial', nom: '', prenom: '' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setInviteErreur(msg ?? 'Erreur lors de l\'invitation.');
    } finally {
      setInviteLoading(false);
    }
  }

  // ── Agences ───────────────────────────────────────────────────────────────
  const [agences,        setAgences]        = useState<Agence[]>([]);
  const [loadingAgences, setLoadingAgences] = useState(true);
  const [showAgenceForm, setShowAgenceForm] = useState(false);
  const [agenceForm,     setAgenceForm]     = useState({
    nom: '', adresse: '', ville: '', code_postal: '', telephone: '', email: '', est_siege: false,
  });
  const [agenceSaving, setAgenceSaving] = useState(false);
  const [agenceErreur, setAgenceErreur] = useState('');

  useEffect(() => {
    fetchAgences()
      .then(setAgences)
      .catch(() => {})
      .finally(() => setLoadingAgences(false));
  }, []);

  async function handleCreateAgence() {
    if (!agenceForm.nom || !agenceForm.ville) {
      setAgenceErreur('Nom et ville sont obligatoires.'); return;
    }
    setAgenceSaving(true); setAgenceErreur('');
    try {
      const nouvelle = await createAgence({
        ...agenceForm, latitude: null, longitude: null, est_siege: agenceForm.est_siege,
      });
      setAgences(prev => [...prev, nouvelle]);
      setShowAgenceForm(false);
      setAgenceForm({ nom: '', adresse: '', ville: '', code_postal: '', telephone: '', email: '', est_siege: false });
    } catch {
      setAgenceErreur('Erreur lors de la création de l\'agence.');
    } finally {
      setAgenceSaving(false);
    }
  }

  // ── Onglets ───────────────────────────────────────────────────────────────
  const tabStyle = (t: Onglet) => ({
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderBottom: `2px solid ${onglet === t ? 'var(--color-primary)' : 'transparent'}`,
    background: 'transparent',
    color: onglet === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
    fontWeight: onglet === t ? 700 : 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'color 0.2s',
  } as React.CSSProperties);

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Administration</h1>
            <p className={styles.subtitle}>Gestion complète de la plateforme</p>
          </div>
        </div>

        {/* Onglets */}
        <div style={{
          display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem',
        }}>
          <button style={tabStyle('utilisateurs')} onClick={() => setOnglet('utilisateurs')}>
            Utilisateurs ({users.length})
          </button>
          <button style={tabStyle('invitations')} onClick={() => setOnglet('invitations')}>
            Invitations
          </button>
          <button style={tabStyle('agences')} onClick={() => setOnglet('agences')}>
            Agences ({agences.length})
          </button>
        </div>

        {/* ── Onglet utilisateurs ── */}
        {onglet === 'utilisateurs' && (
          loadingUsers ? <p className={styles.empty}>Chargement…</p> : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.prenom} {u.nom}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value as RoleUtilisateur)}
                          style={{
                            border: '1px solid var(--color-border)', borderRadius: 6,
                            padding: '0.25rem 0.5rem', fontSize: '0.82rem',
                            background: 'var(--color-bg)', color: 'var(--color-text)',
                            fontFamily: 'inherit',
                          }}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{LABEL_ROLE[r]}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '0.15rem 0.5rem',
                          borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                          background: u.actif ? '#D1FAE5' : '#FEE2E2',
                          color:      u.actif ? '#065F46' : '#991B1B',
                        }}>
                          {u.actif ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={u.actif ? styles.btnDanger : styles.btnOutline}
                          onClick={() => handleToggleActif(u)}
                        >
                          {u.actif ? 'Désactiver' : 'Réactiver'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ── Onglet invitations ── */}
        {onglet === 'invitations' && (
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '1.25rem' }}>
              Inviter un employé
            </h2>

            {inviteErreur && <p className={styles.error}>{inviteErreur}</p>}
            {inviteSucces && (
              <p style={{ background: '#D1FAE5', color: '#065F46', padding: '0.7rem 0.875rem', borderRadius: 8, fontSize: '0.875rem', marginBottom: '1rem' }}>
                {inviteSucces}
              </p>
            )}

            <div className={styles.modalForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className={styles.field}>
                  <label className={styles.label}>Prénom</label>
                  <input type="text" className={styles.input}
                    value={invite.prenom}
                    onChange={e => setInvite(f => ({ ...f, prenom: e.target.value }))}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Nom</label>
                  <input type="text" className={styles.input}
                    value={invite.nom}
                    onChange={e => setInvite(f => ({ ...f, nom: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input type="email" className={styles.input}
                  value={invite.email}
                  onChange={e => setInvite(f => ({ ...f, email: e.target.value }))}
                  placeholder="employe@kreagency.fr"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Rôle</label>
                <select className={styles.select}
                  value={invite.role}
                  onChange={e => setInvite(f => ({ ...f, role: e.target.value as RoleUtilisateur }))}
                >
                  {(['commercial', 'gestionnaire_ventes', 'directeur', 'admin'] as RoleUtilisateur[]).map(r => (
                    <option key={r} value={r}>{LABEL_ROLE[r]}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>ID Agence (optionnel)</label>
                <input type="text" className={styles.input}
                  value={invite.agence_id ?? ''}
                  onChange={e => setInvite(f => ({ ...f, agence_id: e.target.value || undefined }))}
                  placeholder="UUID de l'agence"
                />
              </div>
              <button className={styles.btnPrimary} onClick={handleInvite} disabled={inviteLoading}>
                {inviteLoading ? 'Envoi…' : 'Envoyer l\'invitation'}
              </button>
            </div>
          </div>
        )}

        {/* ── Onglet agences ── */}
        {onglet === 'agences' && (
          <>
            <div style={{ marginBottom: '1.25rem' }}>
              <button className={styles.btnPrimary} onClick={() => setShowAgenceForm(f => !f)}>
                {showAgenceForm ? 'Annuler' : '+ Ajouter une agence'}
              </button>
            </div>

            {showAgenceForm && (
              <div style={{
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius)', padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem', maxWidth: 560,
              }}>
                {agenceErreur && <p className={styles.error}>{agenceErreur}</p>}
                <div className={styles.modalForm}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                    {(['nom', 'adresse', 'ville', 'code_postal', 'telephone', 'email'] as const).map(k => (
                      <div className={styles.field} key={k}>
                        <label className={styles.label}>{k}</label>
                        <input type="text" className={styles.input}
                          value={agenceForm[k]}
                          onChange={e => setAgenceForm(f => ({ ...f, [k]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--color-text)' }}>
                    <input type="checkbox" checked={agenceForm.est_siege}
                      onChange={e => setAgenceForm(f => ({ ...f, est_siege: e.target.checked }))} />
                    Siège social
                  </label>
                  <div className={styles.modalActions}>
                    <button className={styles.btnPrimary} onClick={handleCreateAgence} disabled={agenceSaving}>
                      {agenceSaving ? 'Création…' : 'Créer l\'agence'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loadingAgences ? <p className={styles.empty}>Chargement…</p> : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>Nom</th><th>Ville</th><th>Téléphone</th><th>Email</th><th>Siège</th></tr>
                  </thead>
                  <tbody>
                    {agences.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500 }}>{a.nom}</td>
                        <td>{a.ville}</td>
                        <td>{a.telephone}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{a.email}</td>
                        <td>{a.est_siege ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
