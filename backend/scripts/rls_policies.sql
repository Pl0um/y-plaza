-- =============================================================================
-- KreAgency — Row Level Security (RLS)
-- À exécuter dans Supabase → SQL Editor
-- Ces policies contrôlent qui peut lire/écrire quoi directement en base,
-- indépendamment du backend (protection supplémentaire si l'API est contournée).
-- =============================================================================

-- ── 1. Activation du RLS sur toutes les tables ────────────────────────────────
-- Sans activation, les tables sont accessibles sans restriction via l'API Supabase.

ALTER TABLE biens          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE utilisateurs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos_biens   ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris        ENABLE ROW LEVEL SECURITY;

-- ── 2. Suppression des anciennes policies (idempotent) ────────────────────────
-- Permet de relancer le script sans conflit si des policies existent déjà.

DROP POLICY IF EXISTS "biens_select_public"           ON biens;
DROP POLICY IF EXISTS "biens_write_staff"             ON biens;
DROP POLICY IF EXISTS "agences_select_public"         ON agences;
DROP POLICY IF EXISTS "agences_write_admin"           ON agences;
DROP POLICY IF EXISTS "utilisateurs_select_own"       ON utilisateurs;
DROP POLICY IF EXISTS "utilisateurs_update_own"       ON utilisateurs;
DROP POLICY IF EXISTS "transactions_select_staff"     ON transactions;
DROP POLICY IF EXISTS "transactions_write_staff"      ON transactions;
DROP POLICY IF EXISTS "photos_select_public"          ON photos_biens;
DROP POLICY IF EXISTS "photos_write_staff"            ON photos_biens;
DROP POLICY IF EXISTS "favoris_all_own"               ON favoris;

-- ── 3. BIENS ──────────────────────────────────────────────────────────────────

-- Lecture publique : n'importe qui peut consulter les annonces (même non connecté)
CREATE POLICY "biens_select_public" ON biens
  FOR SELECT USING (true);

-- Écriture réservée aux commerciaux et admins actifs
CREATE POLICY "biens_write_staff" ON biens
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM utilisateurs
      WHERE role IN ('commercial', 'admin') AND actif = true
    )
  );

-- ── 4. AGENCES ────────────────────────────────────────────────────────────────

-- Lecture publique
CREATE POLICY "agences_select_public" ON agences
  FOR SELECT USING (true);

-- Écriture admin uniquement
CREATE POLICY "agences_write_admin" ON agences
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM utilisateurs
      WHERE role = 'admin' AND actif = true
    )
  );

-- ── 5. UTILISATEURS ───────────────────────────────────────────────────────────

-- Chaque utilisateur voit uniquement son propre profil.
-- Les directeurs et admins peuvent voir tous les profils.
CREATE POLICY "utilisateurs_select_own" ON utilisateurs
  FOR SELECT USING (
    auth.uid() = id
    OR
    auth.uid() IN (
      SELECT id FROM utilisateurs
      WHERE role IN ('directeur', 'admin') AND actif = true
    )
  );

-- Chaque utilisateur ne peut modifier que son propre profil
CREATE POLICY "utilisateurs_update_own" ON utilisateurs
  FOR UPDATE USING (auth.uid() = id);

-- ── 6. TRANSACTIONS ───────────────────────────────────────────────────────────

-- Lecture et écriture réservées aux rôles internes (gestionnaire, directeur, admin)
CREATE POLICY "transactions_select_staff" ON transactions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM utilisateurs
      WHERE role IN ('gestionnaire_ventes', 'directeur', 'admin') AND actif = true
    )
  );

CREATE POLICY "transactions_write_staff" ON transactions
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM utilisateurs
      WHERE role IN ('gestionnaire_ventes', 'admin') AND actif = true
    )
  );

-- ── 7. PHOTOS_BIENS ───────────────────────────────────────────────────────────

-- Lecture publique (les photos accompagnent les annonces publiques)
CREATE POLICY "photos_select_public" ON photos_biens
  FOR SELECT USING (true);

-- Écriture réservée aux commerciaux et admins
CREATE POLICY "photos_write_staff" ON photos_biens
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM utilisateurs
      WHERE role IN ('commercial', 'admin') AND actif = true
    )
  );

-- ── 8. FAVORIS ────────────────────────────────────────────────────────────────

-- Chaque utilisateur ne voit et ne gère que ses propres favoris
CREATE POLICY "favoris_all_own" ON favoris
  FOR ALL USING (auth.uid() = utilisateur_id);

-- =============================================================================
-- Vérification : liste les policies actives après exécution
-- =============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
