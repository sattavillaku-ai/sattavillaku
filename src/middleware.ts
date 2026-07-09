import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// எளிய Rate Limiter (நினைவகத்தில் - Vercel KV சிறந்தது)
// Simple Map-based rate limiter (Note: state might reset per edge isolate, but works as basic protection)
const rateLimit = new Map<string, { count: number, timestamp: number }>();
const authAttempts = new Map<string, { count: number, timestamp: number }>();

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: req,
  });
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({
            request: req,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // சுபாபேஸ் அமர்வை புதுப்பிக்கவும் (Refresh Supabase session)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  const session = user;

  const url = req.nextUrl.clone();
  const ip = (req as any).ip || req.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Rate Limiting (60 req/min for /api/*)
  if (url.pathname.startsWith('/api/')) {
    const now = Date.now();
    const record = rateLimit.get(ip) || { count: 0, timestamp: now };
    
    if (now - record.timestamp > 60000) {
      // Reset after 1 minute
      record.count = 1;
      record.timestamp = now;
    } else {
      record.count++;
      if (record.count > 60) {
        console.warn(`[Rate Limit] Blocked IP: ${ip} for exceeding 60 req/min`);
        return new NextResponse('Too Many Requests. Please try again later.', { status: 429 });
      }
    }
    rateLimit.set(ip, record);
  }

  // 2. Auth Attempts Tracking (>10 failed attempts)
  if (url.pathname.startsWith('/api/auth') || url.pathname.includes('login')) {
    const now = Date.now();
    const attempt = authAttempts.get(ip) || { count: 0, timestamp: now };
    
    if (now - attempt.timestamp > 300000) {
      // Reset after 5 minutes
      attempt.count = 1;
      attempt.timestamp = now;
    } else {
      attempt.count++;
      if (attempt.count > 10) {
        console.warn(`[Security] Blocked IP: ${ip} for >10 auth attempts in 5 mins`);
        return new NextResponse('Too many authentication attempts. Please wait 5 minutes.', { status: 429 });
      }
    }
    authAttempts.set(ip, attempt);
  }

  // 3. Redirect obsolete user-facing auth/payment/dashboard routes to homepage
  const isRemovedRoute = 
    url.pathname.startsWith('/register') || 
    url.pathname.startsWith('/subscribe') || 
    url.pathname.startsWith('/billing') || 
    url.pathname.startsWith('/profile') || 
    url.pathname.startsWith('/dashboard') || 
    url.pathname.startsWith('/api/dashboard') ||
    url.pathname.startsWith('/api/subscription');

  if (isRemovedRoute) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  
  // 4. Admin Route Protection
  const isAdminRoute = url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin');
  if (isAdminRoute) {
    if (!session) {
      if (url.pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized', message: 'உள்நுழைய வேண்டும்' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Middleware enforces session presence for /admin and /api/admin.
    // The specific 'admin' role check is performed securely by the layouts and API route handlers themselves to avoid redundant DB roundtrips.
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)',
  ],
};
