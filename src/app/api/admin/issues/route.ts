import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const issueSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  volume_number: z.number(),
  issue_number: z.number(),
  description: z.string().optional(),
  cover_image_url: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  is_free: z.boolean().default(false),
  pdf_url: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    
    // Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
    if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const validatedData = issueSchema.parse(body);

    const { data, error } = await supabase
      .from('issues')
      .insert({
        ...validatedData,
        created_by: session.user.id,
        published_at: validatedData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation for slug
        return NextResponse.json({ error: 'இந்த சுட்டி (Slug) ஏற்கனவே பயன்பாட்டில் உள்ளது' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Issue creation error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('issues')
    .select('*, issue_content(count)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
