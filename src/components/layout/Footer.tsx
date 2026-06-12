import Link from 'next/link';
import { Scale } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Scale className="h-6 w-6 text-primary" />
              <span className="font-serif text-2xl font-bold tracking-tight">சட்டவிளக்கு</span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-4">
              சட்டமும் சமூகமும் இணைந்த செய்தி, அரசியல் மற்றும் சட்ட விழிப்புணர்வுக்கான தமிழ் இணைய இதழ்.
            </p>
            <p className="font-bold text-primary">சந்தா: மாதம் வெறும் ₹30</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">தள இணைப்புகள்</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">எங்களைப் பற்றி</Link></li>
              <li><Link href="/issues" className="hover:text-primary transition-colors">இதழ் காப்பகம்</Link></li>
              <li><Link href="/search" className="hover:text-primary transition-colors">தேடல்</Link></li>
              <li><Link href="/subscribe" className="hover:text-primary transition-colors">சந்தா பெறுங்கள்</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">கொள்கைகள்</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">தனியுரிமை கொள்கை</Link></li>
              <li><Link href="/refund" className="hover:text-primary transition-colors">திரும்பப் பெறுதல் கொள்கை</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">தொடர்பு கொள்ள</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground text-center md:text-left">
          <p>© {new Date().getFullYear()} சட்டவிளக்கு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
          <p>நேர்த்தியான தமிழ் வாசிப்பிற்காக வடிவமைக்கப்பட்டது.</p>
        </div>
      </div>
    </footer>
  );
}
