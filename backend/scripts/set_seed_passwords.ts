// =============================================================================
// KreAgency — Recrée / met à jour les 5 comptes auth des seed users
// Usage : npx ts-node scripts/set_seed_passwords.ts
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl    = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌  SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquants dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = 'KreAgency2025!';

const SEED_USERS = [
  { email: 'sophie.marchand@kreagency.fr', prenom: 'Sophie',  nom: 'Marchand', role: 'directeur',  agence_id: 'a0000000-0000-0000-0000-000000000001', telephone: '06 10 00 00 01' },
  { email: 'thomas.lebrun@kreagency.fr',   prenom: 'Thomas',  nom: 'Lebrun',   role: 'commercial', agence_id: 'a0000000-0000-0000-0000-000000000002', telephone: '06 10 00 00 02' },
  { email: 'camille.durand@kreagency.fr',  prenom: 'Camille', nom: 'Durand',   role: 'commercial', agence_id: 'a0000000-0000-0000-0000-000000000003', telephone: '06 10 00 00 03' },
  { email: 'nicolas.petit@kreagency.fr',   prenom: 'Nicolas', nom: 'Petit',    role: 'directeur',  agence_id: 'a0000000-0000-0000-0000-000000000007', telephone: '06 10 00 00 04' },
  { email: 'lea.bernard@kreagency.fr',     prenom: 'Léa',     nom: 'Bernard',  role: 'commercial', agence_id: 'a0000000-0000-0000-0000-00000000000b', telephone: '06 10 00 00 05' },
];

async function main() {
  // ── 1. Récupère tous les utilisateurs auth existants ──────────────────────
  console.log('\n── Étape 1 : Récupération des comptes auth existants ────────────────');
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    console.error('❌  Impossible de lister les utilisateurs auth :', listError.message);
    process.exit(1);
  }

  const authByEmail = new Map(listData.users.map(u => [u.email!, u.id]));
  console.log(`  ${listData.users.length} compte(s) auth trouvé(s) au total`);

  // ── 2. Pour chaque seed user : met à jour s'il existe, crée sinon ─────────
  console.log('\n── Étape 2 : Création / mise à jour des comptes ────────────────────');

  const emailToNewId = new Map<string, string>();

  for (const u of SEED_USERS) {
    const existingId = authByEmail.get(u.email);

    if (existingId) {
      // Utilisateur déjà dans auth.users → on met juste à jour le mot de passe
      const { data, error } = await supabase.auth.admin.updateUserById(existingId, {
        password:      PASSWORD,
        email_confirm: true,
        user_metadata: { prenom: u.prenom, nom: u.nom, role: u.role },
      });
      if (error) {
        console.error(`  ❌  ${u.email} (update) → ${error.message}`);
      } else {
        console.log(`  ✅  ${u.email} → mot de passe mis à jour (id: ${data.user.id})`);
        emailToNewId.set(u.email, data.user.id);
      }
    } else {
      // Utilisateur absent → on le crée
      const { data, error } = await supabase.auth.admin.createUser({
        email:         u.email,
        password:      PASSWORD,
        email_confirm: true,
        user_metadata: { prenom: u.prenom, nom: u.nom, role: u.role },
      });
      if (error) {
        console.error(`  ❌  ${u.email} (create) → ${error.message}`);
      } else {
        console.log(`  ✅  ${u.email} → créé (id: ${data.user.id})`);
        emailToNewId.set(u.email, data.user.id);
      }
    }
  }

  // ── 3. Synchronise public.utilisateurs ───────────────────────────────────
  console.log('\n── Étape 3 : Synchronisation de public.utilisateurs ────────────────');

  for (const u of SEED_USERS) {
    const authId = emailToNewId.get(u.email);
    if (!authId) continue;

    // Vérifie si une ligne existe déjà pour cet auth id
    const { data: existing } = await supabase
      .from('utilisateurs')
      .select('id')
      .eq('id', authId)
      .maybeSingle();

    if (existing) {
      // Met à jour les champs manquants
      await supabase.from('utilisateurs').update({
        nom: u.nom, prenom: u.prenom, role: u.role,
        agence_id: u.agence_id, telephone: u.telephone, actif: true,
      }).eq('id', authId);
      console.log(`  ✅  ${u.email} → utilisateurs mis à jour`);
    } else {
      // Insère manuellement (trigger peut-être absent ou déjà passé)
      const { error } = await supabase.from('utilisateurs').insert({
        id: authId, email: u.email,
        nom: u.nom, prenom: u.prenom, role: u.role,
        agence_id: u.agence_id, telephone: u.telephone, actif: true,
      });
      if (error) {
        console.error(`  ❌  ${u.email} → INSERT utilisateurs : ${error.message}`);
      } else {
        console.log(`  ✅  ${u.email} → utilisateurs inséré`);
      }
    }
  }

  console.log('\n── Terminé ──────────────────────────────────────────────────────────');
  console.log(`Mot de passe : ${PASSWORD}`);
  console.log('Tu peux maintenant te connecter sur /login\n');
}

main();
