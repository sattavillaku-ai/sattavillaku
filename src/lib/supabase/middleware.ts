import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

// அமர்வைப் புதுப்பிக்கவும் (Update Session Middleware)
export async function updateSession(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  
  // இது அமர்வை புதுப்பிக்கும் (This refreshes the session)
  await supabase.auth.getSession();
  
  return res;
}
