// Schémas de validation Zod — KreAgency
// Chaque schéma définit la forme exacte attendue pour un endpoint.
// Zod parse ET nettoie les données (trim, coercion) avant qu'elles atteignent le controller.
import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email:    z.string().email('Email invalide').max(150),
  password: z.string()
    .min(8,  'Minimum 8 caractères')
    .max(72, 'Mot de passe trop long') // limite bcrypt
    .regex(/[A-Z]/,                    'Au moins une majuscule requise')
    .regex(/[0-9]/,                    'Au moins un chiffre requis')
    .regex(/[!@#$%^&*()\-_=+,.?":{}|<>]/, 'Au moins un caractère spécial requis'),
  nom:    z.string().trim().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Nom invalide'),
  prenom: z.string().trim().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Prénom invalide'),
});

export const loginSchema = z.object({
  email:    z.string().email('Email invalide'),
  // On ne valide pas la complexité ici : juste présent et taille raisonnable
  password: z.string().min(1).max(72),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide').max(150),
});

export const updateProfilSchema = z.object({
  nom:       z.string().trim().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Nom invalide').optional(),
  prenom:    z.string().trim().min(2).max(100).regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Prénom invalide').optional(),
  // Accepte formats : 06 00 00 00 00 / +33612345678 / 0612345678
  telephone: z.string()
    .regex(/^(\+33\s?|0)[1-9](\s?\d{2}){4}$/, 'Numéro de téléphone invalide')
    .optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Au moins un champ est requis',
});

export const inviteSchema = z.object({
  email:     z.string().email('Email invalide').max(150),
  role:      z.enum(['commercial', 'gestionnaire_ventes', 'directeur', 'admin']),
  agence_id: z.string().uuid('ID agence invalide').optional(),
  nom:       z.string().trim().min(2).max(100),
  prenom:    z.string().trim().min(2).max(100),
});

// ─── Biens ────────────────────────────────────────────────────────────────────

export const bienSchema = z.object({
  titre:            z.string().trim().min(5, 'Titre trop court').max(200),
  description:      z.string().trim().max(2000).optional(),
  type_bien:        z.enum(['appartement', 'maison', 'bureau', 'commerce', 'terrain']),
  type_transaction: z.enum(['vente', 'location']),
  prix:             z.number().positive('Le prix doit être positif').max(100_000_000),
  surface:          z.number().positive().max(100_000).optional(),
  nb_pieces:        z.number().int().min(0).max(50).optional(),
  nb_chambres:      z.number().int().min(0).max(30).optional(),
  adresse:          z.string().trim().min(5).max(200),
  ville:            z.string().trim().min(2).max(100),
  code_postal:      z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)'),
  latitude:         z.number().min(-90).max(90).optional(),
  longitude:        z.number().min(-180).max(180).optional(),
  statut:           z.enum(['disponible', 'sous_compromis', 'vendu', 'loue']).optional(),
  agence_id:        z.string().uuid('ID agence invalide').optional(),
  // URLs photos : tableau optionnel, chaque URL doit commencer par https
  photos:           z.array(z.string().url().startsWith('https://', 'URL photo doit être HTTPS'))
                      .max(20, 'Maximum 20 photos')
                      .optional(),
});

// Pour PUT /:id, tous les champs sont optionnels sauf les enums qui restent contraints
export const bienUpdateSchema = bienSchema.partial();

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionSchema = z.object({
  bien_id:          z.string().uuid('ID bien invalide'),
  acheteur_id:      z.string().uuid('ID acheteur invalide'),
  type_transaction: z.enum(['vente', 'location']),
  prix_final:       z.number().positive('Prix final invalide').max(100_000_000),
  date_transaction: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (YYYY-MM-DD)'),
  statut:           z.enum(['en_cours', 'finalisee', 'annulee']).optional(),
  notes:            z.string().max(1000).optional(),
});

export const transactionUpdateSchema = transactionSchema.partial();
