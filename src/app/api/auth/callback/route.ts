import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url));
  }

  if (code) {
    const supabase = createServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url));
    }
  } else {
    return NextResponse.redirect(new URL('/login?error=உள்நுழைவு கோட் கிடைக்கவில்லை', request.url));
  }

  // Go to profile after login
  return NextResponse.redirect(new URL('/profile', request.url));
}
