-- =============================================================================
-- KreAgency — Création des comptes auth pour les utilisateurs du seed
-- Mot de passe par défaut : KreAgency2025!
-- À exécuter dans Supabase → SQL Editor
-- =============================================================================

-- ── 1. Supprime les entrées partielles si le script précédent a planté
DELETE FROM auth.identities WHERE user_id IN (
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000005'
);
DELETE FROM auth.users WHERE id IN (
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000005'
);

-- ── 2. Crée les utilisateurs auth (confirmed_at est généré automatiquement)
INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  is_super_admin, is_sso_user
) VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'sophie.marchand@kreagency.fr',
  crypt('KreAgency2025!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nom":"Marchand","prenom":"Sophie","role":"directeur"}',
  NOW(), NOW(), FALSE, FALSE
),
(
  'c0000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'thomas.lebrun@kreagency.fr',
  crypt('KreAgency2025!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nom":"Lebrun","prenom":"Thomas","role":"commercial"}',
  NOW(), NOW(), FALSE, FALSE
),
(
  'c0000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'camille.durand@kreagency.fr',
  crypt('KreAgency2025!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nom":"Durand","prenom":"Camille","role":"commercial"}',
  NOW(), NOW(), FALSE, FALSE
),
(
  'c0000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'nicolas.petit@kreagency.fr',
  crypt('KreAgency2025!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nom":"Petit","prenom":"Nicolas","role":"directeur"}',
  NOW(), NOW(), FALSE, FALSE
),
(
  'c0000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'lea.bernard@kreagency.fr',
  crypt('KreAgency2025!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nom":"Bernard","prenom":"Léa","role":"commercial"}',
  NOW(), NOW(), FALSE, FALSE
);

-- ── 3. Crée les identités email (requises pour la connexion)
-- provider_id = email (requis depuis Supabase Auth v2.x)
INSERT INTO auth.identities (
  id, user_id, provider, provider_id,
  identity_data,
  last_sign_in_at, created_at, updated_at
) VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'email',
  'sophie.marchand@kreagency.fr',
  '{"sub":"c0000000-0000-0000-0000-000000000001","email":"sophie.marchand@kreagency.fr","email_verified":true}',
  NOW(), NOW(), NOW()
),
(
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000002',
  'email',
  'thomas.lebrun@kreagency.fr',
  '{"sub":"c0000000-0000-0000-0000-000000000002","email":"thomas.lebrun@kreagency.fr","email_verified":true}',
  NOW(), NOW(), NOW()
),
(
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000003',
  'email',
  'camille.durand@kreagency.fr',
  '{"sub":"c0000000-0000-0000-0000-000000000003","email":"camille.durand@kreagency.fr","email_verified":true}',
  NOW(), NOW(), NOW()
),
(
  'c0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000004',
  'email',
  'nicolas.petit@kreagency.fr',
  '{"sub":"c0000000-0000-0000-0000-000000000004","email":"nicolas.petit@kreagency.fr","email_verified":true}',
  NOW(), NOW(), NOW()
),
(
  'c0000000-0000-0000-0000-000000000005',
  'c0000000-0000-0000-0000-000000000005',
  'email',
  'lea.bernard@kreagency.fr',
  '{"sub":"c0000000-0000-0000-0000-000000000005","email":"lea.bernard@kreagency.fr","email_verified":true}',
  NOW(), NOW(), NOW()
);
