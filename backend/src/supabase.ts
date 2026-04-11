import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('[KreAgency] Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes dans .env');
}

// Le service_role bypasse le RLS — à utiliser uniquement côté backend, jamais exposé au client
export const supabase = createClient(supabaseUrl, supabaseKey);
