import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data: user, error } = await adminSupabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ registered: false });
    }

    return NextResponse.json({ registered: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
