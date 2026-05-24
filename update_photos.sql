-- ============================================================
-- Script : remplacement des photos fictives par de vraies
-- photos immobilières Unsplash, classées par type_bien.
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- 1. Supprimer toutes les photos actuelles
DELETE FROM photos_biens;

-- 2. Réinsérer 3 photos par bien via LATERAL VALUES
INSERT INTO photos_biens (bien_id, url, ordre)
SELECT b.id, p.url, p.ordre
FROM biens b
CROSS JOIN LATERAL (
  VALUES
    (
      CASE b.type_bien
        WHEN 'appartement' THEN 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80'
        WHEN 'maison'      THEN 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'
        WHEN 'bureau'      THEN 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'
        WHEN 'commerce'    THEN 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80'
        WHEN 'terrain'     THEN 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80'
        ELSE                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80'
      END,
      0
    ),
    (
      CASE b.type_bien
        WHEN 'appartement' THEN 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80'
        WHEN 'maison'      THEN 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80'
        WHEN 'bureau'      THEN 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80'
        WHEN 'commerce'    THEN 'https://images.unsplash.com/photo-1604754742629-3e5728249d73?w=1200&q=80'
        WHEN 'terrain'     THEN 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80'
        ELSE                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80'
      END,
      1
    ),
    (
      CASE b.type_bien
        WHEN 'appartement' THEN 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'
        WHEN 'maison'      THEN 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80'
        WHEN 'bureau'      THEN 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80'
        WHEN 'commerce'    THEN 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80'
        WHEN 'terrain'     THEN 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'
        ELSE                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80'
      END,
      2
    )
) AS p(url, ordre);
