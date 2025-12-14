import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create Supabase client for frontend/anon usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client for backend/service role usage
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export default supabase;