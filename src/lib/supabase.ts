import { createClient as createBrowserSupabaseClient } from './supabase/client';

export const createClient = createBrowserSupabaseClient;
export const supabase = createBrowserSupabaseClient();
