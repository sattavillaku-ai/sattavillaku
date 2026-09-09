import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'சட்டவிளக்கு | SATTAVILAKKU — சட்டம், அரசியல் & சமூகம்',
    template: '%s | சட்டவிளக்கு (Sattavilakku)',
  },
  description:
    'சட்டவிளக்கு — சட்டம், நீதிமன்றத் தீர்ப்புகள், அரசியல், தமிழ்நாடு மற்றும் இந்திய நடப்புகள் குறித்த நம்பகமான தமிழ் டிஜிட்டல் மாத இதழ் & நாளிதழ் செய்திகள்.',
  keywords: [
    'சட்டவிளக்கு',
    'Sattavilakku',
    'Tamil Law Magazine',
    'Madras High Court News',
    'Supreme Court Judgments Tamil',
    'Tamil Nadu Politics News',
    'Legal Awareness Tamil',
  ],
  authors: [{ name: 'வழக்கறிஞர் கே. எஸ். இளங்கோவன்', url: 'https://sattavilakku.com' }],
  creator: 'சட்டவிளக்கு ஆசிரியர் குழு',
  openGraph: {
    type: 'website',
    locale: 'ta_IN',
    url: 'https://sattavilakku.com',
    siteName: 'சட்டவிளக்கு (Sattavilakku)',
    title: 'சட்டவிளக்கு — சட்டம் & அரசியல் ஆய்விதழ்',
    description: 'நடுநிலையான, நம்பகமான தமிழ்ச் சட்ட இதழ் மற்றும் அன்றாடச் செய்திகள்.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ta" suppressHydrationWarning className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@300;400;500;600;700;800&family=Noto+Serif+Tamil:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
