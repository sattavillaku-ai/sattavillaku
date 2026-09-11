import { createClient } from './supabase/client';

export async function getCurrentAdminUser() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Check profile role: profiles.id = auth.uid() AND profiles.role = 'admin'
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    const isAuthorized = profile?.role === 'admin';

    return {
      user,
      id: user.id,
      email: user.email,
      name:
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        'நிர்வாக ஆசிரியர்',
      avatar:
        profile?.avatar_url ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null,
      role: profile?.role || null,
      isAuthorized,
    };
  } catch {
    return null;
  }
}
