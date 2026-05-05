import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('[KreAgency] Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes dans .env');
}

const clientOpts = {
  auth: { persistSession: false, autoRefreshToken: false },
};

// Client principal — toutes les requêtes DB. Ne jamais appeler signInWithPassword dessus :
// Supabase JS v2 garde la session utilisateur en mémoire et l'utiliserait pour les requêtes
// suivantes, perdant ainsi le bypass RLS du service role.
export const supabase = createClient(supabaseUrl, supabaseKey, clientOpts);

// Client dédié aux opérations d'authentification (signIn, signUp, refreshSession).
// Isolé du client DB pour éviter toute contamination de session.
export const supabaseAuth = createClient(supabaseUrl, supabaseKey, clientOpts);
