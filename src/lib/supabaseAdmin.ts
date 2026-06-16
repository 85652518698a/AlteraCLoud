import { createClient } from '@supabase/supabase-js';

// Only used in edge functions - never import in frontend code
export function createAdminClient() {
  return createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}
