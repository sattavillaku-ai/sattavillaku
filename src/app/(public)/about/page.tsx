'use client';

import { useState } from 'react';
import { Scale, Mail, Phone, MapPin } from 'lucide-react';

export default function AboutPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <section className="text-center mb-16">
        <Scale className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">எங்களைப் பற்றி (About Us)</h1>
        <p className="text-xl text-muted-foreground font-serif italic">சட்டமும் சமூகமும் — நீதிக்கான ஒரு தமிழ் குரல்</p>
      </section>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 font-serif">
        <p className="leading-relaxed">
          <strong>சட்டவிளக்கு</strong> (Sattavilakku) என்பது தமிழ்ச் சூழலில் சட்டம், அரசியல் மற்றும் சமூக நீதி குறித்த ஆழமான புரிதலை ஏற்படுத்தும் நோக்கில் தொடங்கப்பட்ட ஒரு இணைய இதழ். சாமானிய மக்களும் சட்டத்தின் நுணுக்கங்களை எளிதாகப் புரிந்து கொள்ள வேண்டும் என்பதே எங்களின் முதன்மை நோக்கம்.
        </p>

        <h2 className="text-2xl font-bold font-serif border-b pb-2">எங்களின் பணிகள்</h2>
        <ul className="list-disc pl-6 space-y-4">
          <li>உயர் நீதிமன்ற மற்றும் உச்ச நீதிமன்ற முக்கியத் தீர்ப்புகளைத் தமிழில் விளக்குதல்.</li>
          <li>சமகால அரசியல் நிகழ்வுகளின் சட்டப்பூர்வமான பின்னணிகளை ஆய்வு செய்தல்.</li>
          <li>அரசு கொண்டு வரும் புதிய சட்டங்கள் மற்றும் மசோதாக்கள் குறித்த விழிப்புணர்வு.</li>
          <li>சமூக நீதி மற்றும் மனித உரிமைகள் சார்ந்த ஆழமான கட்டுரைகள்.</li>
        </ul>

        <h2 className="text-2xl font-bold font-serif border-b pb-2">ஆசிரியர் குழு</h2>
        <p>
          சட்ட வல்லுநர்கள், மூத்த ஊடகவியலாளர்கள் மற்றும் சமூக ஆர்வலர்களைக் கொண்ட ஒரு சிறிய ஆனால் அர்ப்பணிப்புள்ள குழுவால் இந்த இதழ் நடத்தப்படுகிறது.
        </p>
      </div>

      <section className="mt-20 p-8 bg-card border rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold font-serif mb-8 text-center">தொடர்பு கொள்ள (Contact)</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">மின்னஞ்சல்</p>
                <p className="font-bold font-sans">sattavilakku@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">தொலைபேசி</p>
                <p className="font-bold font-sans">+91 79042 67437</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              placeholder="உங்கள் பெயர்" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 rounded-lg border bg-background"
            />
            <input 
              type="email" 
              placeholder="உங்கள் மின்னஞ்சல்" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg border bg-background"
            />
            <textarea 
              placeholder="உங்கள் செய்தி" 
              rows={4} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full p-3 rounded-lg border bg-background"
            ></textarea>

            {status === 'success' && (
              <p className="text-green-600 text-sm font-bold">செய்தி வெற்றிகரமாக அனுப்பப்பட்டது! (Message sent successfully!)</p>
            )}
            {status === 'error' && (
              <p className="text-red-600 text-sm font-bold">செய்தி அனுப்புவதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும். (Error sending message. Please try again.)</p>
            )}

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'அனுப்பப்படுகிறது...' : 'அனுப்புக'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
