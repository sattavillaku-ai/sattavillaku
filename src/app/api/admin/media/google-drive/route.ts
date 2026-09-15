import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadImageBufferToCloudinary } from '@/lib/cloudinary';

interface GoogleDriveImportBody {
  fileId: string;
  fileName: string;
  mimeType: string;
  accessToken: string;
  altText?: string;
  category?: 'article' | 'cover' | 'author' | 'site' | string;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated admin user (profiles.role = 'admin')
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'அங்கீகரிக்கப்படாத கோரிக்கை. தயவுசெய்து உள்நுழையவும்.' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'நிர்வாக அனுமதி இல்லை (Forbidden).' },
        { status: 403 }
      );
    }

    // 2. Parse payload
    const body: GoogleDriveImportBody = await request.json();
    const { fileId, fileName, mimeType, accessToken, altText, category = 'article' } = body;

    if (!fileId || !accessToken) {
      return NextResponse.json(
        { error: 'கூகுள் டிரைவ் கோப்பு ஐடி அல்லது அனுமதி டோக்கன் விடுபட்டுள்ளது.' },
        { status: 400 }
      );
    }

    // 3. Download the binary stream from Google Drive API securely on the server
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!driveRes.ok) {
      console.error('Google Drive download failed:', driveRes.status, await driveRes.text());
      return NextResponse.json(
        { error: 'கூகுள் டிரைவிலிருந்து கோப்பைப் பதிவிறக்குவதில் பிழை. மீண்டும் தேர்வு செய்யவும்.' },
        { status: 502 }
      );
    }

    const arrayBuffer = await driveRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Limit check (15MB for images)
    if (buffer.length > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'படத்தின் அளவு 15MB-க்கு மிகாமல் இருக்க வேண்டும்.' },
        { status: 400 }
      );
    }

    // 4. Upload to Cloudinary using official SDK
    let cldData;
    try {
      cldData = await uploadImageBufferToCloudinary(buffer, {
        folder: 'sattavilakku/images',
        tags: ['sattavilakku', 'drive-import', category],
      });
    } catch (cldErr: any) {
      console.error('Cloudinary upload from Google Drive error:', cldErr);
      return NextResponse.json(
        { error: `Cloudinary-ல் படத்தை சேமிக்க இயலவில்லை: ${cldErr.message || 'பிழை'}` },
        { status: 502 }
      );
    }

    const finalName = fileName ? fileName.replace(/\.[^/.]+$/, '') : `drive-media-${Date.now()}`;
    const finalAltText = altText?.trim() || finalName;

    // 5. Store record in Supabase public.media
    const { data: mediaRecord, error: dbError } = await supabase
      .from('media')
      .insert([
        {
          name: finalName,
          url: cldData.secure_url,
          public_id: cldData.public_id,
          category,
          mime_type: mimeType || 'image/jpeg',
          size_bytes: buffer.length,
          width: cldData.width || null,
          height: cldData.height || null,
          alt_text: finalAltText,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error after Google Drive import:', dbError);
      return NextResponse.json(
        { error: `மீடியா தரவுத்தளத்தில் சேமிக்க இயலவில்லை: ${dbError.message}` },
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
        altText: mediaRecord.alt_text || mediaRecord.name,
        created_at: mediaRecord.created_at,
        source: 'Google Drive',
        type: 'image',
      },
    });
  } catch (err: any) {
    console.error('Google Drive Image Import error:', err);
    return NextResponse.json(
      { error: err.message || 'கூகுள் டிரைவ் பதிவிறக்கத்தில் எதிர்பாராத பிழை ஏற்பட்டது.' },
      { status: 500 }
    );
  }
}
