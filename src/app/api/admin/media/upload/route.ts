import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadImageBufferToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated admin user
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

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const directUrl = formData.get('url') as string | null;
    const nameInput = formData.get('name') as string | null;
    const category = (formData.get('category') as string) || 'article';
    const altText = (formData.get('alt_text') as string) || '';

    let resultUrl = '';
    let publicId: string | null = null;
    let mimeType = 'image/jpeg';
    let sizeBytes: number | null = null;
    let width: number | null = null;
    let height: number | null = null;
    const mediaName = nameInput || file?.name || `media-${Date.now()}`;

    // 3. Handle File Upload (Cloudinary)
    if (file && file.size > 0) {
      // Validate allowed image MIME types
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
      mimeType = file.type || 'image/jpeg';
      sizeBytes = file.size;

      if (!allowedMimes.includes(mimeType.toLowerCase())) {
        return NextResponse.json(
          { error: 'செல்லுபடியற்ற கோப்பு வகை. JPG, PNG, WEBP அல்லது SVG வடிவங்கள் மட்டுமே அனுமதிக்கப்படும்.' },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      const maxSizeBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          { error: 'படத்தின் அளவு 10MB-க்கு மிகாமல் இருக்க வேண்டும்.' },
          { status: 400 }
        );
      }

      try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const cldResult = await uploadImageBufferToCloudinary(fileBuffer, {
          folder: 'sattavilakku/images',
          tags: ['sattavilakku', category],
        });

        resultUrl = cldResult.secure_url;
        publicId = cldResult.public_id;
        width = cldResult.width || null;
        height = cldResult.height || null;
        if (cldResult.bytes) sizeBytes = cldResult.bytes;
      } catch (cldErr: any) {
        console.error('Cloudinary upload error:', cldErr);
        return NextResponse.json(
          { error: `Cloudinary பதிவேற்றத்தில் பிழை: ${cldErr.message || 'தெரியாத பிழை'}` },
          { status: 502 }
        );
      }
    } else if (directUrl && directUrl.trim()) {
      resultUrl = directUrl.trim();
    } else {
      return NextResponse.json(
        { error: 'பதிவேற்ற ஒரு கோப்பு அல்லது படத்தின் URL கட்டாயமாகும்.' },
        { status: 400 }
      );
    }

    // 4. Save metadata in public.media
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert([
        {
          name: mediaName.trim(),
          url: resultUrl,
          public_id: publicId,
          category,
          mime_type: mimeType,
          size_bytes: sizeBytes,
          width,
          height,
          alt_text: altText.trim() || mediaName.trim(),
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Error inserting media to Supabase:', dbError.message);
      return NextResponse.json(
        { error: `மீடியா தரவுத்தளத்தில் சேமிக்க முடியவில்லை: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: {
        id: mediaRecord.id,
        name: mediaRecord.name,
        url: mediaRecord.url,
        public_id: mediaRecord.public_id,
        category: mediaRecord.category,
        mime_type: mediaRecord.mime_type,
        size_bytes: mediaRecord.size_bytes,
        width: mediaRecord.width,
        height: mediaRecord.height,
        alt_text: mediaRecord.alt_text,
        created_by: mediaRecord.created_by,
        created_at: mediaRecord.created_at,
        altText: mediaRecord.alt_text || mediaRecord.name,
        type: mediaRecord.mime_type?.includes('pdf') ? 'pdf' : 'image',
      },
    });
  } catch (err: any) {
    console.error('Media upload handler error:', err);
    return NextResponse.json(
      { error: err.message || 'மீடியா பதிவேற்றத்தில் எதிர்பாராத பிழை ஏற்பட்டது.' },
      { status: 500 }
    );
  }
}
