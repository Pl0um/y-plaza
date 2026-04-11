-- =============================================================================
-- KreAgency — Seed SQL
-- Supprime les données existantes et insère les 12 agences, 20 biens,
-- 5 utilisateurs et toutes leurs photos.
-- À exécuter dans l'éditeur SQL de Supabase (ou via psql).
-- =============================================================================

-- ── 1. Nettoyage ─────────────────────────────────────────────────────────────
-- Suppression dans le bon ordre pour respecter les FK
DELETE FROM transactions;
DELETE FROM photos_biens;
DELETE FROM biens;
DELETE FROM utilisateurs;
DELETE FROM agences;


-- ── 2. Agences (12) ──────────────────────────────────────────────────────────
-- IDs déterministes : a0000000-0000-0000-0000-00000000000X

INSERT INTO agences (id, nom, adresse, ville, code_postal, telephone, email, latitude, longitude, est_siege) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'KreAgency Aix-en-Provence — Siège', '12 Cours Mirabeau',           'Aix-en-Provence', '13100', '04 42 00 00 01', 'siege@kreagency.fr',       43.5297,  5.4474, TRUE),
  ('a0000000-0000-0000-0000-000000000002', 'KreAgency Paris',                    '45 Avenue des Champs-Élysées', 'Paris',           '75008', '01 40 00 00 02', 'paris@kreagency.fr',       48.8738,  2.2954, FALSE),
  ('a0000000-0000-0000-0000-000000000003', 'KreAgency Lyon',                     '8 Place Bellecour',            'Lyon',            '69002', '04 72 00 00 03', 'lyon@kreagency.fr',        45.7579,  4.8320, FALSE),
  ('a0000000-0000-0000-0000-000000000004', 'KreAgency Marseille',                '3 La Canebière',               'Marseille',       '13001', '04 91 00 00 04', 'marseille@kreagency.fr',   43.2965,  5.3761, FALSE),
  ('a0000000-0000-0000-0000-000000000005', 'KreAgency Bordeaux',                 '20 Allées de Tourny',          'Bordeaux',        '33000', '05 56 00 00 05', 'bordeaux@kreagency.fr',    44.8431, -0.5757, FALSE),
  ('a0000000-0000-0000-0000-000000000006', 'KreAgency Toulouse',                 '14 Place du Capitole',         'Toulouse',        '31000', '05 61 00 00 06', 'toulouse@kreagency.fr',    43.6045,  1.4442, FALSE),
  ('a0000000-0000-0000-0000-000000000007', 'KreAgency Nice',                     '6 Promenade des Anglais',      'Nice',            '06000', '04 93 00 00 07', 'nice@kreagency.fr',        43.6953,  7.2655, FALSE),
  ('a0000000-0000-0000-0000-000000000008', 'KreAgency Nantes',                   '2 Place du Commerce',          'Nantes',          '44000', '02 40 00 00 08', 'nantes@kreagency.fr',      47.2120, -1.5615, FALSE),
  ('a0000000-0000-0000-0000-000000000009', 'KreAgency Strasbourg',               '11 Place Kléber',              'Strasbourg',      '67000', '03 88 00 00 09', 'strasbourg@kreagency.fr',  48.5842,  7.7507, FALSE),
  ('a0000000-0000-0000-0000-00000000000a', 'KreAgency Montpellier',              '5 Place de la Comédie',        'Montpellier',     '34000', '04 67 00 00 10', 'montpellier@kreagency.fr', 43.6077,  3.8790, FALSE),
  ('a0000000-0000-0000-0000-00000000000b', 'KreAgency Rennes',                   '9 Place de la Mairie',         'Rennes',          '35000', '02 99 00 00 11', 'rennes@kreagency.fr',      48.1113, -1.6800, FALSE),
  ('a0000000-0000-0000-0000-00000000000c', 'KreAgency Lille',                    '17 Grand Place',               'Lille',           '59000', '03 20 00 00 12', 'lille@kreagency.fr',       50.6370,  3.0630, FALSE);


-- ── 3. Utilisateurs (5) ──────────────────────────────────────────────────────
-- IDs déterministes : c0000000-0000-0000-0000-00000000000X
-- Rôle 'agent' (mockData) → 'commercial' (schéma Supabase)

INSERT INTO utilisateurs (id, prenom, nom, email, role, agence_id, telephone) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Sophie',  'Marchand', 'sophie.marchand@kreagency.fr', 'directeur',  'a0000000-0000-0000-0000-000000000001', '06 10 00 00 01'),
  ('c0000000-0000-0000-0000-000000000002', 'Thomas',  'Lebrun',   'thomas.lebrun@kreagency.fr',   'commercial', 'a0000000-0000-0000-0000-000000000002', '06 10 00 00 02'),
  ('c0000000-0000-0000-0000-000000000003', 'Camille', 'Durand',   'camille.durand@kreagency.fr',  'commercial', 'a0000000-0000-0000-0000-000000000003', '06 10 00 00 03'),
  ('c0000000-0000-0000-0000-000000000004', 'Nicolas', 'Petit',    'nicolas.petit@kreagency.fr',   'directeur',  'a0000000-0000-0000-0000-000000000007', '06 10 00 00 04'),
  ('c0000000-0000-0000-0000-000000000005', 'Léa',     'Bernard',  'lea.bernard@kreagency.fr',     'commercial', 'a0000000-0000-0000-0000-00000000000b', '06 10 00 00 05');


-- ── 4. Biens (20) ────────────────────────────────────────────────────────────
-- IDs déterministes : b0000000-0000-0000-0000-00000000000X (hex)

INSERT INTO biens (id, titre, description, type_bien, type_transaction, prix, surface, nb_pieces, nb_chambres, adresse, ville, code_postal, latitude, longitude, statut, agence_id, created_at) VALUES

  -- bien-01 → b…01 / agence Lyon
  ('b0000000-0000-0000-0000-000000000001',
   'Appartement lumineux 3 pièces — Presqu''île',
   'Superbe appartement de 68 m² en plein cœur de la Presqu''île lyonnaise. Séjour spacieux, cuisine équipée ouverte, deux chambres, parquet chêne, double vitrage. Immeuble haussmannien avec gardien. Cave et parking inclus.',
   'appartement', 'vente', 345000, 68, 3, 2,
   '14 Rue de la République', 'Lyon', '69001',
   45.7676, 4.8344, 'disponible',
   'a0000000-0000-0000-0000-000000000003',
   '2025-11-03T09:15:00Z'),

  -- bien-02 → b…02 / agence Bordeaux
  ('b0000000-0000-0000-0000-000000000002',
   'Maison avec piscine et jardin — Mérignac',
   'Belle maison contemporaine de 145 m² sur un terrain de 800 m². 4 chambres, salon-séjour de 40 m², cuisine américaine, piscine chauffée 10x4m, garage double. Proche des commodités et des vignobles bordelais.',
   'maison', 'vente', 589000, 145, 6, 4,
   '3 Allée des Vignes', 'Bordeaux', '33700',
   44.8384, -0.6463, 'disponible',
   'a0000000-0000-0000-0000-000000000005',
   '2025-11-10T14:30:00Z'),

  -- bien-03 → b…03 / agence Paris
  ('b0000000-0000-0000-0000-000000000003',
   'Studio moderne — Marais',
   'Studio entièrement rénové de 32 m² dans le quartier du Marais. Kitchenette équipée, salle de douche italienne, parquet vieilli, fibre optique. Immeuble sécurisé avec digicode et interphone vidéo. Idéal investisseur.',
   'appartement', 'location', 1450, 32, 1, 0,
   '7 Rue des Rosiers', 'Paris', '75004',
   48.8571, 2.3566, 'disponible',
   'a0000000-0000-0000-0000-000000000002',
   '2025-11-15T11:00:00Z'),

  -- bien-04 → b…04 / agence Aix-en-Provence
  ('b0000000-0000-0000-0000-000000000004',
   'Villa provençale 5 pièces — Jas de Bouffan',
   'Authentique villa provençale de 160 m² dans un quartier résidentiel calme. 4 chambres, grand salon avec cheminée, cuisine provençale, terrasse en pierre, jardin arboré de 1 200 m². Vue sur la Sainte-Victoire.',
   'maison', 'vente', 740000, 160, 5, 4,
   '18 Chemin des Amandiers', 'Aix-en-Provence', '13090',
   43.5423, 5.4098, 'disponible',
   'a0000000-0000-0000-0000-000000000001',
   '2025-11-18T10:00:00Z'),

  -- bien-05 → b…05 / agence Toulouse
  ('b0000000-0000-0000-0000-000000000005',
   'Plateau de bureaux — Compans-Caffarelli',
   'Plateau de 210 m² cloisonnable dans un immeuble tertiaire récent BBC. Open space, 2 salles de réunion, kitchenette, 10 places de parking. Fibre 1 Gbps, climatisation réversible. Disponible immédiatement.',
   'bureau', 'location', 3500, 210, 5, 0,
   '2 Boulevard Lascrosses', 'Toulouse', '31000',
   43.6137, 1.4298, 'disponible',
   'a0000000-0000-0000-0000-000000000006',
   '2025-11-20T09:00:00Z'),

  -- bien-06 → b…06 / agence Nice
  ('b0000000-0000-0000-0000-000000000006',
   'Appartement vue mer — Promenade des Anglais',
   'Exceptionnel appartement de 95 m² avec vue panoramique sur la Méditerranée. Salon de 35 m², 3 chambres, terrasse de 20 m², cuisine entièrement équipée. Résidence de standing avec gardien, piscine et parking.',
   'appartement', 'vente', 895000, 95, 4, 3,
   '22 Promenade des Anglais', 'Nice', '06000',
   43.6960, 7.2557, 'disponible',
   'a0000000-0000-0000-0000-000000000007',
   '2025-11-22T15:00:00Z'),

  -- bien-07 → b…07 / agence Nantes
  ('b0000000-0000-0000-0000-000000000007',
   'Maison familiale avec grand jardin — Nantes Nord',
   'Grande maison de 195 m² idéale pour une famille. 5 chambres, double salon, bureau, sous-sol aménagé, garage. Jardin paysager de 1 500 m² avec abri de jardin. Quartier calme, proche écoles et transport.',
   'maison', 'vente', 480000, 195, 7, 5,
   '5 Rue des Lilas', 'Nantes', '44300',
   47.2501, -1.5591, 'disponible',
   'a0000000-0000-0000-0000-000000000008',
   '2025-11-25T08:30:00Z'),

  -- bien-08 → b…08 / agence Marseille
  ('b0000000-0000-0000-0000-000000000008',
   'T2 rénové — Vieux-Port',
   'Appartement 2 pièces de 48 m² entièrement rénové à deux pas du Vieux-Port. Séjour lumineux, chambre avec placard intégré, salle de bain moderne. Immeuble ancien avec cachet, proche de tous commerces.',
   'appartement', 'location', 920, 48, 2, 1,
   '10 Quai de Rive Neuve', 'Marseille', '13007',
   43.2930, 5.3720, 'disponible',
   'a0000000-0000-0000-0000-000000000004',
   '2025-12-01T10:00:00Z'),

  -- bien-09 → b…09 / agence Rennes
  ('b0000000-0000-0000-0000-000000000009',
   'Terrain constructible — Cesson-Sévigné',
   'Terrain plat de 650 m² en zone U, viabilisé (eau, gaz, électricité, tout-à-l''égout). CU positif, permis de construire accordé pour une maison de 130 m². Quartier résidentiel en développement, proche rocade.',
   'terrain', 'vente', 142000, 650, 0, 0,
   '42 Rue du Bois Greffier', 'Rennes', '35510',
   48.1214, -1.6073, 'disponible',
   'a0000000-0000-0000-0000-00000000000b',
   '2025-12-03T09:00:00Z'),

  -- bien-10 → b…0a / agence Strasbourg
  ('b0000000-0000-0000-0000-00000000000a',
   'T3 meublé — Neustadt',
   'Appartement 3 pièces de 72 m² meublé dans le quartier historique de la Neustadt, classé UNESCO. Hauts plafonds, moulures d''époque, parquet massif, double vitrage. Cave incluse. Idéal pour expatriés ou investissement locatif.',
   'appartement', 'location', 1100, 72, 3, 2,
   '6 Avenue de la Paix', 'Strasbourg', '67000',
   48.5871, 7.7556, 'disponible',
   'a0000000-0000-0000-0000-000000000009',
   '2025-12-05T11:30:00Z'),

  -- bien-11 → b…0b / agence Montpellier
  ('b0000000-0000-0000-0000-00000000000b',
   'Mas provençal rénové — Pézenas',
   'Authentique mas du XVIIIe siècle entièrement rénové, 230 m² sur 5 000 m² de terrain arboré. 5 chambres, piscine à débordement, pool house, dépendances. Matériaux nobles : pierre de taille, tomettes, poutres apparentes.',
   'maison', 'vente', 1250000, 230, 8, 5,
   '8 Route de Béziers', 'Montpellier', '34120',
   43.4618, 3.4239, 'disponible',
   'a0000000-0000-0000-0000-00000000000a',
   '2025-12-08T14:00:00Z'),

  -- bien-12 → b…0c / agence Lille
  ('b0000000-0000-0000-0000-00000000000c',
   'Bureaux centre-ville — Euralille',
   'Bureaux modernes de 185 m² au cœur du quartier d''affaires Euralille. Plateaux modulables, faux plancher technique, 8 parkings. Accès direct au métro et au TGV. Idéal pour cabinet conseil ou siège social PME.',
   'bureau', 'location', 2900, 185, 6, 0,
   '1 Place du Général de Gaulle', 'Lille', '59000',
   50.6360, 3.0700, 'disponible',
   'a0000000-0000-0000-0000-00000000000c',
   '2025-12-10T09:00:00Z'),

  -- bien-13 → b…0d / agence Lyon
  ('b0000000-0000-0000-0000-00000000000d',
   'T2 neuf — Confluence',
   'Appartement neuf de 45 m² dans la résidence Le Confluent, livraison immédiate. Séjour-cuisine de 22 m², chambre, salle de bain, balcon de 8 m². Normes RE2020, DPE A. Frais de notaire réduits.',
   'appartement', 'location', 980, 45, 2, 1,
   '11 Cours Charlemagne', 'Lyon', '69002',
   45.7448, 4.8155, 'disponible',
   'a0000000-0000-0000-0000-000000000003',
   '2025-12-12T10:00:00Z'),

  -- bien-14 → b…0e / agence Nice
  ('b0000000-0000-0000-0000-00000000000e',
   'Villa d''architecte — Cimiez',
   'Remarquable villa d''architecte de 280 m² dans le quartier résidentiel de Cimiez. 5 chambres en suite, piscine miroir, home cinéma, domotique Somfy. Vue panoramique sur Nice et la mer. Terrain de 2 000 m² entièrement clos.',
   'maison', 'vente', 2800000, 280, 8, 5,
   '25 Bd de Cimiez', 'Nice', '06000',
   43.7190, 7.2757, 'sous_compromis',
   'a0000000-0000-0000-0000-000000000007',
   '2025-12-15T09:30:00Z'),

  -- bien-15 → b…0f / agence Paris
  ('b0000000-0000-0000-0000-00000000000f',
   'Grand appartement haussmannien — 16ème',
   'Exceptionnel 5 pièces haussmannien de 135 m² au 3ème étage avec ascenseur. Entrée, double salon, salle à manger, 3 chambres, 2 salles de bain. Moulures, parquet, cheminée d''époque. Cave et parking en sous-sol.',
   'appartement', 'vente', 1690000, 135, 5, 3,
   '8 Avenue Victor Hugo', 'Paris', '75016',
   48.8666, 2.2924, 'disponible',
   'a0000000-0000-0000-0000-000000000002',
   '2025-12-18T11:00:00Z'),

  -- bien-16 → b…10 / agence Aix-en-Provence
  ('b0000000-0000-0000-0000-000000000010',
   'Maison de village à louer — Puyricard',
   'Charmante maison de village de 110 m² à Puyricard, village provençal au nord d''Aix. 3 chambres, salon avec cheminée, cuisine provençale, terrasse avec pergola, jardin de 350 m². Calme absolu, vue dégagée.',
   'maison', 'location', 1800, 110, 4, 3,
   '7 Chemin de la Galice', 'Aix-en-Provence', '13540',
   43.5832, 5.4406, 'disponible',
   'a0000000-0000-0000-0000-000000000001',
   '2025-12-20T10:00:00Z'),

  -- bien-17 → b…11 / agence Bordeaux
  ('b0000000-0000-0000-0000-000000000011',
   'Bureaux lumineux — Lac',
   'Bureaux de 120 m² dans un parc d''activités moderne en bordure du lac de Bordeaux. Open space de 80 m², 2 bureaux fermés, salle de réunion, terrasse privative. 6 parkings. Fibre, climatisation, badges d''accès sécurisés.',
   'bureau', 'location', 2100, 120, 4, 0,
   '14 Rue du Golf', 'Bordeaux', '33300',
   44.8854, -0.5893, 'disponible',
   'a0000000-0000-0000-0000-000000000005',
   '2025-12-22T09:00:00Z'),

  -- bien-18 → b…12 / agence Toulouse
  ('b0000000-0000-0000-0000-000000000012',
   'T3 avec terrasse — Saint-Aubin',
   'Bel appartement 3 pièces de 65 m² au dernier étage avec terrasse de 25 m². Vue dégagée sur la Garonne. Cuisine ouverte aménagée, 2 chambres, baignoire et douche séparées. Garage en sous-sol.',
   'appartement', 'vente', 225000, 65, 3, 2,
   '33 Rue du Taur', 'Toulouse', '31000',
   43.6085, 1.4440, 'disponible',
   'a0000000-0000-0000-0000-000000000006',
   '2025-12-26T14:00:00Z'),

  -- bien-19 → b…13 / agence Rennes
  ('b0000000-0000-0000-0000-000000000013',
   'Maison néo-bretonne — Cesson-Sévigné',
   'Maison néo-bretonne de 168 m² construite en 2018. 4 chambres, bureau, salon de 45 m², cuisine équipée, sous-sol total aménagé. Jardin de 900 m² avec terrasse bois. DPE B, pompe à chaleur, panneaux solaires.',
   'maison', 'vente', 520000, 168, 6, 4,
   '12 Rue des Chênes', 'Rennes', '35510',
   48.1237, -1.6031, 'vendu',
   'a0000000-0000-0000-0000-00000000000b',
   '2026-01-05T10:00:00Z'),

  -- bien-20 → b…14 / agence Lille
  ('b0000000-0000-0000-0000-000000000014',
   'T2 investisseur — Vieux-Lille',
   'Appartement 2 pièces de 38 m² en plein Vieux-Lille, quartier très prisé. Séjour, chambre, cuisine américaine, salle de douche. Immeuble du XIXème entièrement rénové. Rentabilité locative brute estimée à 6,2 %. Idéal pour investissement LMNP.',
   'appartement', 'vente', 175000, 38, 2, 1,
   '4 Rue de la Monnaie', 'Lille', '59800',
   50.6428, 3.0618, 'disponible',
   'a0000000-0000-0000-0000-00000000000c',
   '2026-01-08T09:00:00Z');


-- ── 5. Photos des biens ───────────────────────────────────────────────────────
-- URLs picsum.photos/seed/<seed>/800/600 — ordre commence à 1

INSERT INTO photos_biens (bien_id, url, ordre) VALUES
  -- bien-01 (3 photos)
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/bien01a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/bien01b/800/600', 2),
  ('b0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/bien01c/800/600', 3),

  -- bien-02 (3 photos)
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/bien02a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/bien02b/800/600', 2),
  ('b0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/bien02c/800/600', 3),

  -- bien-03 (2 photos)
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/bien03a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/bien03b/800/600', 2),

  -- bien-04 (4 photos)
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bien04a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bien04b/800/600', 2),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bien04c/800/600', 3),
  ('b0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bien04d/800/600', 4),

  -- bien-05 (2 photos)
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/bien05a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/bien05b/800/600', 2),

  -- bien-06 (3 photos)
  ('b0000000-0000-0000-0000-000000000006', 'https://picsum.photos/seed/bien06a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000006', 'https://picsum.photos/seed/bien06b/800/600', 2),
  ('b0000000-0000-0000-0000-000000000006', 'https://picsum.photos/seed/bien06c/800/600', 3),

  -- bien-07 (3 photos)
  ('b0000000-0000-0000-0000-000000000007', 'https://picsum.photos/seed/bien07a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000007', 'https://picsum.photos/seed/bien07b/800/600', 2),
  ('b0000000-0000-0000-0000-000000000007', 'https://picsum.photos/seed/bien07c/800/600', 3),

  -- bien-08 (2 photos)
  ('b0000000-0000-0000-0000-000000000008', 'https://picsum.photos/seed/bien08a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000008', 'https://picsum.photos/seed/bien08b/800/600', 2),

  -- bien-09 (1 photo)
  ('b0000000-0000-0000-0000-000000000009', 'https://picsum.photos/seed/bien09a/800/600', 1),

  -- bien-10 (2 photos)
  ('b0000000-0000-0000-0000-00000000000a', 'https://picsum.photos/seed/bien10a/800/600', 1),
  ('b0000000-0000-0000-0000-00000000000a', 'https://picsum.photos/seed/bien10b/800/600', 2),

  -- bien-11 (4 photos)
  ('b0000000-0000-0000-0000-00000000000b', 'https://picsum.photos/seed/bien11a/800/600', 1),
  ('b0000000-0000-0000-0000-00000000000b', 'https://picsum.photos/seed/bien11b/800/600', 2),
  ('b0000000-0000-0000-0000-00000000000b', 'https://picsum.photos/seed/bien11c/800/600', 3),
  ('b0000000-0000-0000-0000-00000000000b', 'https://picsum.photos/seed/bien11d/800/600', 4),

  -- bien-12 (2 photos)
  ('b0000000-0000-0000-0000-00000000000c', 'https://picsum.photos/seed/bien12a/800/600', 1),
  ('b0000000-0000-0000-0000-00000000000c', 'https://picsum.photos/seed/bien12b/800/600', 2),

  -- bien-13 (2 photos)
  ('b0000000-0000-0000-0000-00000000000d', 'https://picsum.photos/seed/bien13a/800/600', 1),
  ('b0000000-0000-0000-0000-00000000000d', 'https://picsum.photos/seed/bien13b/800/600', 2),

  -- bien-14 (3 photos)
  ('b0000000-0000-0000-0000-00000000000e', 'https://picsum.photos/seed/bien14a/800/600', 1),
  ('b0000000-0000-0000-0000-00000000000e', 'https://picsum.photos/seed/bien14b/800/600', 2),
  ('b0000000-0000-0000-0000-00000000000e', 'https://picsum.photos/seed/bien14c/800/600', 3),

  -- bien-15 (4 photos)
  ('b0000000-0000-0000-0000-00000000000f', 'https://picsum.photos/seed/bien15a/800/600', 1),
  ('b0000000-0000-0000-0000-00000000000f', 'https://picsum.photos/seed/bien15b/800/600', 2),
  ('b0000000-0000-0000-0000-00000000000f', 'https://picsum.photos/seed/bien15c/800/600', 3),
  ('b0000000-0000-0000-0000-00000000000f', 'https://picsum.photos/seed/bien15d/800/600', 4),

  -- bien-16 (2 photos)
  ('b0000000-0000-0000-0000-000000000010', 'https://picsum.photos/seed/bien16a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000010', 'https://picsum.photos/seed/bien16b/800/600', 2),

  -- bien-17 (2 photos)
  ('b0000000-0000-0000-0000-000000000011', 'https://picsum.photos/seed/bien17a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000011', 'https://picsum.photos/seed/bien17b/800/600', 2),

  -- bien-18 (2 photos)
  ('b0000000-0000-0000-0000-000000000012', 'https://picsum.photos/seed/bien18a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000012', 'https://picsum.photos/seed/bien18b/800/600', 2),

  -- bien-19 (3 photos)
  ('b0000000-0000-0000-0000-000000000013', 'https://picsum.photos/seed/bien19a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000013', 'https://picsum.photos/seed/bien19b/800/600', 2),
  ('b0000000-0000-0000-0000-000000000013', 'https://picsum.photos/seed/bien19c/800/600', 3),

  -- bien-20 (2 photos)
  ('b0000000-0000-0000-0000-000000000014', 'https://picsum.photos/seed/bien20a/800/600', 1),
  ('b0000000-0000-0000-0000-000000000014', 'https://picsum.photos/seed/bien20b/800/600', 2);
