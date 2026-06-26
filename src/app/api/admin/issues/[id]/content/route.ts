import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('issue_content')
    .select('*')
    .eq('issue_id', resolvedParams.id)
    .order('position', { ascending: true });
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = createServerClient();
  const body = await req.json();
  
  // Auto-assign next position
  const { count } = await supabase.from('issue_content').select('*', { count: 'exact', head: true }).eq('issue_id', resolvedParams.id);
  const nextPosition = (count || 0) + 1;

  const { data, error } = await supabase
    .from('issue_content')
    .insert({ ...body, issue_id: resolvedParams.id, position: nextPosition })
    .select()
    .single();
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = createServerClient();
  const body = await req.json();
  
  const { data, error } = await supabase
    .from('issue_content')
    .update(body)
    .eq('id', resolvedParams.id)
    .select()
    .single();
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = createServerClient();
  const { error } = await supabase.from('issue_content').delete().eq('id', resolvedParams.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

