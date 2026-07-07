import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient as createServerClientSSR } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url));
  }

  // Go to admin issues dashboard after successful login
  const response = NextResponse.redirect(new URL('/admin/issues', request.url));

  const supabase = createServerClientSSR<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (tokenHash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (verifyError) {
      console.error('Error verifying token hash:', verifyError);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(verifyError.message)}`, request.url));
    }

    return response;
  }

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url));
    }

    return response;
  }

  return NextResponse.redirect(new URL('/login?error=உள்நுழைவு கோட் கிடைக்கவில்லை', request.url));
}
