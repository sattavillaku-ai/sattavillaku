import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchNewsDraftById, updateNewsDraft, deleteNewsDraft } from '@/lib/cms-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const draft = await fetchNewsDraftById(id, supabase);
    if (!draft) {
      return NextResponse.json({ error: 'வரைவு கிடைக்கவில்லை (Draft not found).' }, { status: 404 });
    }

    return NextResponse.json({ draft });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // If status is being set to approved or rejected, record reviewer info
    const now = new Date().toISOString();
    const updates: any = { ...body };

    if (body.review_status && body.review_status !== 'pending') {
      updates.reviewed_by = user.id;
      updates.reviewed_at = now;
    }

    const updated = await updateNewsDraft(id, updates, supabase);

    // If rejected, also update news_item status to rejected
    if (body.review_status === 'rejected' && updated.news_item_id) {
      await supabase
        .from('news_items')
        .update({ status: 'rejected', updated_at: now })
        .eq('id', updated.news_item_id);
    }

    return NextResponse.json({ success: true, draft: updated });
  } catch (err: any) {
    console.error('Update news draft error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteNewsDraft(id, supabase);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
