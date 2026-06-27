import { createServerClient as createServerClientSSR } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// சர்வர் கிளையண்ட் (Server Client with Cookies - strictly for API routes and Server Actions)
export const createServerClient = () => {
  return createServerClientSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignored
          }
        },
        async remove(name: string, options: any) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignored
          }
        },
      },
    }
  );
};

// Admin Client (No Cookies - safe for build time like generateStaticParams)
export const createAdminClient = () => {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    }
  );
};

