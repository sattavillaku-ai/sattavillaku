import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
    if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const bucket = searchParams.get('bucket') || 'magazine-assets';

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'கோப்பு இல்லை' }, { status: 400 });

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const adminSupabase = createAdminClient();

    // Ensure bucket exists
    const isPublicBucket = bucket === 'magazine-assets';
    const { data: buckets, error: listError } = await adminSupabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
    }
    const bucketExists = buckets?.some((b) => b.id === bucket);
    if (!bucketExists) {
      const { error: createError } = await adminSupabase.storage.createBucket(bucket, {
        public: isPublicBucket,
        allowedMimeTypes: isPublicBucket ? ['image/*'] : ['application/pdf'],
      });
      if (createError) {
        console.error(`Failed to create bucket ${bucket}:`, createError);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminSupabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type || (isPublicBucket ? 'image/jpeg' : 'application/pdf'),
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = adminSupabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl, path: filePath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

