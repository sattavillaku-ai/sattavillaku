import { supabase } from './supabase';

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const configured =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
    'fun2trade089@gmail.com,editor@sattavilakku.com,admin@sattavilakku.com';
  const allowed = configured.split(',').map((e) => e.trim().toLowerCase());
  const normalized = email.toLowerCase();

  // Allowed if exact match in whitelist or official publication domain
  return (
    allowed.includes(normalized) ||
    normalized.endsWith('@sattavilakku.com') ||
    allowed.length === 0
  );
}

export async function getCurrentAdminUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    const email = session.user.email;
    const isAuthorized = isAuthorizedAdminEmail(email);

    return {
      user: session.user,
      email,
      name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || email?.split('@')[0] || 'ஆசிரியர்',
      avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
      isAuthorized,
    };
  } catch {
    return null;
  }
}
