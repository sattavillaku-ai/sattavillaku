import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

// சர்வர் கிளையண்ட் (Server Client)
export const createServerClient = () => {
  return createServerComponentClient<Database>({ 
    cookies 
  });
};
