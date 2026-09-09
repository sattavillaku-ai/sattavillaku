import { supabase } from './supabase';

// ONLY these two email addresses are permitted to access the admin portal
export const EXCLUSIVE_ADMIN_EMAILS = [
  'cfilayaraja@gmail.com',
  'sattavilakku@gmail.com',
];

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;

  const envConfigured = process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  const allowed = envConfigured
    ? envConfigured.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : EXCLUSIVE_ADMIN_EMAILS;

  const normalized = email.trim().toLowerCase();
  return allowed.includes(normalized);
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
      name:
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        (email === 'cfilayaraja@gmail.com' ? 'இளையராஜா' : 'சட்டவிளக்கு முதன்மை ஆசிரியர்'),
      avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
      isAuthorized,
    };
  } catch {
    return null;
  }
}
