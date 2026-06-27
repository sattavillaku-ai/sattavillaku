import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const supabase = createServerClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
    if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase.from('issues').select('*').eq('id', resolvedParams.id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const supabase = createServerClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
    if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    
    // Status change logic
    const { data: currentIssue } = await supabase.from('issues').select('status, published_at').eq('id', resolvedParams.id).single();
    if (body.status === 'published' && currentIssue?.status !== 'published' && !currentIssue?.published_at) {
      body.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase.from('issues').update(body).eq('id', resolvedParams.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const supabase = createServerClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
    if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { error } = await supabase.from('issues').delete().eq('id', resolvedParams.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

