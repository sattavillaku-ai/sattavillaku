import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=auth`);
  }

  try {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(`${origin}/admin/login?error=auth`);
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(`${origin}/admin/login?error=auth`);
    }

    // Query public.profiles using .eq("id", user.id)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role === 'admin') {
      return NextResponse.redirect(`${origin}/admin`);
    }

    // Non-admin user: sign out and redirect to /admin/unauthorized
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/unauthorized`);
  } catch {
    return NextResponse.redirect(`${origin}/admin/login?error=auth`);
  }
}
