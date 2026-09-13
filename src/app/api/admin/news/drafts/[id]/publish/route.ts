import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { publishNewsDraft } from '@/lib/cms-service';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Verify admin authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'அங்கீகரிக்கப்படாத கோரிக்கை (Unauthorized)' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'நிர்வாக அனுமதி இல்லை (Forbidden)' }, { status: 403 });
    }

    // 2. Publish draft explicitly
    const result = await publishNewsDraft(id, supabase);

    return NextResponse.json({
      success: true,
      message: 'செய்தி ஆசிரியரால் சரிபார்க்கப்பட்டு வெற்றிகரமாக நேரலையில் பிரசுரிக்கப்பட்டது!',
      articleId: result.articleId,
      slug: result.slug,
    });
  } catch (err: any) {
    console.error('Publish news draft error:', err);
    return NextResponse.json(
      { error: err.message || 'செய்தியைப் பிரசுரிப்பதில் பிழை ஏற்பட்டது.' },
      { status: 500 }
    );
  }
}
