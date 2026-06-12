import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

let client: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// பிரவுசர் கிளையண்ட் (Browser Client Singleton)
export const createClient = () => {
  if (client) return client;
  
  client = createClientComponentClient<Database>();
  return client;
};
