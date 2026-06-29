import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const isAdminEmail = email === 'sattavilakku@gmail.com' || email === 'sattavillaku@gmail.com';
    if (isAdminEmail) {
      return NextResponse.json({ registered: true });
    }

    const adminSupabase = createAdminClient();
    const { data: user, error } = await adminSupabase
      .from('users')
      .select('id, role')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ registered: false, error: 'மின்னஞ்சல் முகவரி பதிவு செய்யப்படவில்லை. (Email address not registered.)' });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ registered: false, error: 'நிர்வாகிகளுக்கு மட்டுமே அனுமதி. (Only admins are allowed to log in.)' });
    }

    return NextResponse.json({ registered: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
