// Dashboard annonces — commercial / admin — KreAgency
import { useState, useEffect } from 'react';
import { fetchBiens, deleteBien, createBien, updateBien } from '../../services/api';
import type { Bien, TypeBien, TypeTransaction, StatutBien } from '../../types';
import styles from './DashboardLayout.module.css';

const TYPES_BIEN: TypeBien[]        = ['appartement', 'maison', 'bureau', 'commerce', 'terrain'];
const TYPES_TRANSACTION: TypeTransaction[] = ['vente', 'location'];
const STATUTS: StatutBien[]         = ['disponible', 'sous_compromis', 'vendu', 'loue'];

const LABEL_TYPE: Record<TypeBien, string> = {
  appartement: 'Appartement', maison: 'Maison', bureau: 'Bureau',
  commerce: 'Commerce', terrain: 'Terrain',
};
const LABEL_STATUT: Record<StatutBien, string> = {
  disponible: 'Disponible', sous_compromis: 'Sous compromis',
  vendu: 'Vendu', loue: 'Loué',
};

// Formulaire vierge pour un nouveau bien
const FORM_VIDE = {
  titre: '', description: '', type_bien: 'appartement' as TypeBien,
  type_transaction: 'vente' as TypeTransaction, prix: '', surface: '',
  nb_pieces: '', nb_chambres: '', adresse: '', ville: '', code_postal: '',
  statut: 'disponible' as StatutBien, agence_id: '',
};

export default function AnnoncesPage() {
  const [biens,   setBiens]   = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur,  setErreur]  = useState('');

  // Modal création / édition
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState(FORM_VIDE);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    setLoading(true);
    try {
      setBiens(await fetchBiens());
    } catch {
      setErreur('Impossible de charger les biens.');
    } finally {
      setLoading(false);
    }
  }

  function ouvrirCreation() {
    setEditId(null);
    setForm(FORM_VIDE);
    setShowModal(true);
  }

  function ouvrirEdition(bien: Bien) {
    setEditId(bien.id);
    setForm({
      titre: bien.titre, description: bien.description,
      type_bien: bien.type_bien, type_transaction: bien.type_transaction,
      prix: String(bien.prix), surface: String(bien.surface),
      nb_pieces: String(bien.nb_pieces), nb_chambres: String(bien.nb_chambres),
      adresse: bien.adresse, ville: bien.ville, code_postal: bien.code_postal,
      statut: bien.statut, agence_id: bien.agence_id ?? '',
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.titre || !form.prix || !form.surface || !form.ville) {
      setErreur('Titre, prix, surface et ville sont obligatoires.'); return;
    }
    setSaving(true); setErreur('');
    try {
      const payload = {
        ...form,
        prix:        Number(form.prix),
        surface:     Number(form.surface),
        nb_pieces:   Number(form.nb_pieces)   || 0,
        nb_chambres: Number(form.nb_chambres) || 0,
        agence_id:   form.agence_id || null,
        latitude:    null, longitude: null,
      };
      if (editId) {
        await updateBien(editId, payload);
      } else {
        await createBien(payload);
      }
      setShowModal(false);
      await charger();
    } catch {
      setErreur('Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce bien définitivement ?')) return;
    await deleteBien(id).catch(() => {});
    await charger();
  }

  function champ(key: keyof typeof form, label: string, type = 'text', opts?: string[]) {
    return (
      <div className={styles.field} key={key}>
        <label className={styles.label}>{label}</label>
        {opts ? (
          <select
            className={styles.select}
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          >
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            className={styles.input}
            value={form[key]}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          />
        )}
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestion des annonces</h1>
            <p className={styles.subtitle}>{biens.length} bien{biens.length > 1 ? 's' : ''} enregistré{biens.length > 1 ? 's' : ''}</p>
          </div>
          <button className={styles.btnPrimary} onClick={ouvrirCreation}>
            + Ajouter un bien
          </button>
        </div>

        {erreur && <p className={styles.error}>{erreur}</p>}

        {loading ? (
          <p className={styles.empty}>Chargement…</p>
        ) : biens.length === 0 ? (
          <p className={styles.empty}>Aucun bien enregistré.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Ville</th>
                  <th>Type</th>
                  <th>Prix</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {biens.map(bien => (
                  <tr key={bien.id}>
                    <td style={{ maxWidth: 240, fontWeight: 500 }}>
                      {bien.titre}
                    </td>
                    <td>{bien.ville}</td>
                    <td>{LABEL_TYPE[bien.type_bien]}</td>
                    <td>{bien.prix.toLocaleString('fr-FR')} €</td>
                    <td>
                      <span className={`badge badge-${bien.statut}`}>
                        {LABEL_STATUT[bien.statut]}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnOutline} onClick={() => ouvrirEdition(bien)}>
                          Modifier
                        </button>
                        <button className={styles.btnDanger} onClick={() => handleDelete(bien.id)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Modal formulaire ── */}
        {showModal && (
          <div className={styles.overlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h2 className={styles.modalTitle}>
                {editId ? 'Modifier le bien' : 'Ajouter un bien'}
              </h2>

              {erreur && <p className={styles.error}>{erreur}</p>}

              <div className={styles.modalForm}>
                {champ('titre',            'Titre')}
                <div className={styles.field}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    className={styles.textarea}
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  {champ('type_bien',        'Type de bien',    'text', TYPES_BIEN)}
                  {champ('type_transaction', 'Transaction',     'text', TYPES_TRANSACTION)}
                  {champ('statut',           'Statut',          'text', STATUTS)}
                  {champ('prix',             'Prix (€)',        'number')}
                  {champ('surface',          'Surface (m²)',    'number')}
                  {champ('nb_pieces',        'Pièces',          'number')}
                  {champ('nb_chambres',      'Chambres',        'number')}
                </div>

                {champ('adresse',      'Adresse')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  {champ('ville',       'Ville')}
                  {champ('code_postal', 'Code postal')}
                </div>
                {champ('agence_id', 'ID Agence (optionnel)')}

                <div className={styles.modalActions}>
                  <button className={styles.btnOutline} onClick={() => setShowModal(false)}>
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
