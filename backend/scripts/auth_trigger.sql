-- =============================================================================
-- KreAgency — Auth trigger + table favoris
-- À exécuter dans l'éditeur SQL de Supabase AVANT de lancer le backend.
-- =============================================================================

-- ── 1. Fonction déclenchée à chaque inscription Supabase Auth ─────────────────
-- Insère automatiquement une ligne dans public.utilisateurs avec le rôle 'client'
-- (ou le rôle passé dans les metadata, pour les invitations d'employés).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.utilisateurs (id, email, nom, prenom, role, actif)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom',    ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'role',   'client'),
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprime l'ancien trigger s'il existait déjà (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. Table favoris ──────────────────────────────────────────────────────────
-- Permet à un client de mettre des biens en favori.
-- La contrainte UNIQUE empêche les doublons.

CREATE TABLE IF NOT EXISTS public.favoris (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id UUID        NOT NULL REFERENCES public.utilisateurs(id) ON DELETE CASCADE,
  bien_id        UUID        NOT NULL REFERENCES public.biens(id)        ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (utilisateur_id, bien_id)
);

-- Index pour accélérer les requêtes "favoris d'un utilisateur"
CREATE INDEX IF NOT EXISTS idx_favoris_utilisateur ON public.favoris (utilisateur_id);
