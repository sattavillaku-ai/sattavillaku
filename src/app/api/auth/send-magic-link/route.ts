import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Verify if user exists and is an admin (same logic as check-user)
    const isAdminEmail = trimmedEmail === 'sattavilakku@gmail.com' || trimmedEmail === 'sattavillaku@gmail.com';
    const adminSupabase = createAdminClient();

    if (!isAdminEmail) {
      const { data: user, error: userError } = await adminSupabase
        .from('users')
        .select('id, role')
        .eq('email', trimmedEmail)
        .single();

      if (userError || !user) {
        return NextResponse.json({ 
          error: 'மின்னஞ்சல் முகவரி பதிவு செய்யப்படவில்லை. (Email address not registered.)' 
        }, { status: 404 });
      }

      if (user.role !== 'admin') {
        return NextResponse.json({ 
          error: 'நிர்வாகிகளுக்கு மட்டுமே அனுமதி. (Only admins are allowed to log in.)' 
        }, { status: 403 });
      }
    }

    // 2. Generate magic link using Supabase Admin API
    const requestUrl = new URL(req.url);
    const origin = requestUrl.origin;
    const redirectTo = `${origin}/api/auth/callback`;

    console.log(`Generating magic link for ${trimmedEmail} with redirect to ${redirectTo}`);

    const { data, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: trimmedEmail,
      options: {
        redirectTo,
      },
    });

    if (linkError || !data?.properties?.action_link) {
      console.error('Supabase generateLink Error:', linkError);
      return NextResponse.json({ 
        error: 'உள்நுழைவு இணைப்பை உருவாக்குவதில் பிழை ஏற்பட்டது. (Failed to generate login link.)' 
      }, { status: 500 });
    }

    const actionLink = data.properties.action_link;

    // 3. Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not defined.');
      return NextResponse.json({ 
        error: 'மின்னஞ்சல் சேவை தற்போது கிடைக்கவில்லை (Email service is currently unavailable)' 
      }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@sattavilakku.com';

    console.log(`Sending magic link email from ${fromEmail} to ${trimmedEmail}`);

    const { error: emailError } = await resend.emails.send({
      from: `சட்டவிளக்கு <${fromEmail}>`,
      to: trimmedEmail,
      subject: 'சட்டவிளக்கு — நிர்வாகி உள்நுழைவு இணைப்பு (Admin Login Link)',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #0f766e; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">சட்டவிளக்கு</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Sattavilakku Magazine</p>
          </div>
          
          <div style="line-height: 1.6; color: #334155; font-size: 16px;">
            <p>வணக்கம்,</p>
            <p>சட்டவிளக்கு நிர்வாகி பக்கத்தில் உள்நுழைவதற்கான உங்களின் மேஜிக் இணைப்பு கீழே உள்ளது. இந்த இணைப்பை கிளிக் செய்வதன் மூலம் நீங்கள் நேரடியாக உள்நுழையலாம்:</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${actionLink}" style="background-color: #0f766e; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 10px rgba(15, 118, 110, 0.3); transition: background-color 0.2s;">
                உள்நுழையவும் (Login Now)
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              மேலே உள்ள பொத்தான் வேலை செய்யவில்லை என்றால், இந்த இணைப்பை நகலெடுத்து உங்கள் உலாவியில் ஒட்டவும்:
            </p>
            <p style="word-break: break-all; font-size: 14px; background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px dashed #cbd5e1; color: #0284c7;">
              <a href="${actionLink}" style="color: #0284c7; text-decoration: none;">${actionLink}</a>
            </p>
            
            <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
                இந்த உள்நுழைவு கோரிக்கையை நீங்கள் செய்யவில்லை எனில், இந்த மின்னஞ்சலை புறக்கணிக்கவும்.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend Error:', emailError);
      return NextResponse.json({ 
        error: 'மின்னஞ்சல் அனுப்புவதில் பிழை ஏற்பட்டது. (Failed to send login email.)' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'உங்களின் மின்னஞ்சலுக்கு உள்நுழைவு இணைப்பு வெற்றிகரமாக அனுப்பப்பட்டுள்ளது.' 
    });
  } catch (err: any) {
    console.error('Send Magic Link API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
