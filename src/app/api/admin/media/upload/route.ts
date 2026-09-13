import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

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
      mimeType = file.type || 'image/jpeg';
      sizeBytes = file.size;

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (cloudName && apiKey && apiSecret) {
        // Prepare Cloudinary signed upload
        const timestamp = Math.floor(Date.now() / 1000);
        const folder = 'sattavilakku';
        const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        const cldBody = new FormData();
        cldBody.append('file', file);
        cldBody.append('api_key', apiKey);
        cldBody.append('timestamp', timestamp.toString());
        cldBody.append('signature', signature);
        cldBody.append('folder', folder);

        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cldBody,
        });

        const cldData = await cldRes.json();

        if (!cldRes.ok || !cldData.secure_url) {
          console.error('Cloudinary upload error:', cldData);
          return NextResponse.json(
            { error: cldData.error?.message || 'Cloudinary பதிவேற்றத்தில் பிழை ஏற்பட்டது.' },
            { status: 502 }
          );
        }

        resultUrl = cldData.secure_url;
        publicId = cldData.public_id;
        width = cldData.width || null;
        height = cldData.height || null;
        if (cldData.bytes) sizeBytes = cldData.bytes;
      } else {
        return NextResponse.json(
          {
            error:
              'Cloudinary சர்வர் விவரங்கள் (.env) கட்டமைக்கப்படவில்லை. தயவுசெய்து CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, மற்றும் CLOUDINARY_API_SECRET அமைக்கவும், அல்லது படத்தின் நேரடி இணைய முகவரியை (URL) உள்ளிடவும்.',
          },
          { status: 400 }
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
