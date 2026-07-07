'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Share2, MessageCircle, Globe, Send } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'சட்டவிளக்கு (Sattavilakku)',
        text: 'சமூக விழிப்புணர்வு மற்றும் நீதிக்கான உன்னத தமிழ் இதழ்.',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://sattavilakku.com',
      }).catch(console.error);
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.origin : 'https://sattavilakku.com');
      alert('இணைப்பு நகலெடுக்கப்பட்டது! (Link copied to clipboard)');
    }
  };

  return (
    <footer className="bg-secondary text-white mt-auto relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-[60px] md:blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6 md:space-y-8 text-center md:text-left flex flex-col items-center md:items-start">
            <Link href="/" className="inline-block">
              <Image
                src="/images/sattavillaku-logo.jpeg"
                alt="சட்டவிளக்கு - Satta Vilakku"
                width={240}
                height={60}
                className="h-14 md:h-16 w-auto object-contain brightness-110"
              />
            </Link>
            
            <p className="text-white/70 max-w-sm leading-relaxed text-base md:text-lg italic">
              &quot;சட்ட அறிவே அதிகாரம்&quot; — சமூக விழிப்புணர்வு மற்றும் நீதிக்கான உன்னத தமிழ் இதழ்.
            </p>

            <div className="flex justify-center md:justify-start gap-4">
              <Link 
                href="/" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                aria-label="Home"
              >
                <Globe className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link 
                href="https://wa.me/917904267437?text=வணக்கம்,%20சட்டவிளக்கு%20இதழ்%20பற்றி%20மேலும்%20அறிய%20விரும்புகிறேன்." 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <Link 
                href="https://t.me/share/url?url=https://sattavilakku.com&text=சமூக%20விழிப்புணர்வு%20மற்றும்%20நீதிக்கான%20உன்னத%20தமிழ்%20இதழ்%20-%20சட்டவிளக்கு" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                aria-label="Forward via Telegram"
              >
                <Send className="h-4 w-4 md:h-5 md:w-5" />
              </Link>
              <button 
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl cursor-pointer"
                aria-label="Share Website"
              >
                <Share2 className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>
          </div>
          
          {/* Links Column */}
          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <h4 className="text-white/60 font-black uppercase tracking-widest text-[10px] md:text-xs">தள இணைப்புகள்</h4>
            <nav className="flex flex-col gap-3 md:gap-4 text-sm font-medium">
              <Link href="/about" className="hover:text-primary transition-colors">எங்களைப் பற்றி</Link>
              <Link href="/issues" className="hover:text-primary transition-colors">இதழ் காப்பகம்</Link>
              <Link href="/subscribe" className="text-primary font-bold hover:underline">இப்போதே சந்தா பெறுங்கள்</Link>
            </nav>
          </div>
          
          {/* Contact Column */}
          <div className="space-y-4 md:space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="text-white/60 font-black uppercase tracking-widest text-[10px] md:text-xs">தொடர்புக்கு</h4>
            <ul className="space-y-3 md:space-y-4 text-sm font-medium opacity-80 flex flex-col items-center md:items-start">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>sattavilakku@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 79042 67437</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>சென்னை, தமிழ்நாடு.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 md:mt-20 pt-8 md:pt-10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] opacity-50 text-center md:text-left">
          <p className="leading-relaxed">© {new Date().getFullYear()} SATTAVILAKKU MAGAZINE. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/refund" className="hover:text-white">Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
