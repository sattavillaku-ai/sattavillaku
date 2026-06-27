import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'அனைத்து விவரங்களையும் நிரப்பவும் (All fields are required)' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined.');
      return NextResponse.json({ error: 'மின்னஞ்சல் சேவை தற்போது கிடைக்கவில்லை (Email service is currently unavailable)' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const toEmail = process.env.CONTACT_RECEIVER_EMAIL || 'sattavilakku@gmail.com';

    const { data, error } = await resend.emails.send({
      from: `சட்டவிளக்கு தொடர்பு <${fromEmail}>`,
      to: toEmail,
      subject: `புதிய தொடர்பு செய்தி: ${name}`,
      html: `
        <h3>புதிய தொடர்பு செய்தி (New Contact Message)</h3>
        <p><strong>பெயர் (Name):</strong> ${name}</p>
        <p><strong>மின்னஞ்சல் (Email):</strong> ${email}</p>
        <p><strong>செய்தி (Message):</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'செய்தி வெற்றிகரமாக அனுப்பப்பட்டது' });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'செய்தி அனுப்புவதில் பிழை' }, { status: 500 });
  }
}
