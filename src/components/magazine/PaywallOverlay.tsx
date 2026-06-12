'use client';

import Link from 'next/link';

interface PaywallOverlayProps {
  price?: string;
}

export function PaywallOverlay({ price = '₹99/மாதம்' }: PaywallOverlayProps) {
  return (
    <div className="relative mt-8">
      {/* மங்கலான விளைவு (Blur Effect) */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10 h-64 -top-64 pointer-events-none" />
      
      <div className="bg-card border-2 border-primary/20 rounded-xl p-8 text-center shadow-xl relative z-20 overflow-hidden">
        {/* பின்னணி அலங்காரம் */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        
        <h3 className="text-2xl font-bold font-serif mb-4">
          இந்த இதழை முழுமையாக படிக்க சந்தா எடுங்கள்
        </h3>
        
        <p className="text-muted-foreground mb-6">
          சிறந்த தமிழ் படைப்புகளைத் தொடர்ந்து வாசிக்க எங்களோடு இணையுங்கள்.
        </p>
        
        <div className="text-3xl font-bold text-primary mb-8">
          {price} <span className="text-sm font-normal text-muted-foreground">மட்டுமே</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/subscribe"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg"
          >
            சந்தா எடு (Subscribe)
          </Link>
          <Link
            href="/login"
            className="bg-background border px-8 py-3 rounded-lg font-bold hover:bg-accent transition-colors"
          >
            உள்நுழைவு (Login)
          </Link>
        </div>
        
        <p className="mt-6 text-xs text-muted-foreground">
          ஏற்கனவே சந்தா உள்ளதா? <Link href="/login" className="text-primary hover:underline">உள்நுழையவும்</Link>
        </p>
      </div>
    </div>
  );
}
