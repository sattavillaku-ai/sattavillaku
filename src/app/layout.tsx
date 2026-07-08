import type { Metadata, Viewport } from 'next';
import { Noto_Serif_Tamil, Noto_Sans_Tamil } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const notoSerifTamil = Noto_Serif_Tamil({
  subsets: ['tamil'],
  weight: ['400', '700'],
  variable: '--font-noto-serif-tamil',
  display: 'swap',
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-tamil',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sattavilakku.com'),
  title: {
    default: 'சட்டவிளக்கு — சட்டம், அரசியல் & சமூக விழிப்புணர்வு இணைய இதழ் | Sattavilakku',
    template: '%s | சட்டவிளக்கு - Sattavilakku'
  },
  description: 'சட்டவிளக்கு (Sattavilakku) - சட்டம், சட்ட செய்திகள், சமகால அரசியல் மற்றும் சமூக விழிப்புணர்வுக்கான தமிழ் மாதாந்திர இணைய இதழ். நீதியின் குரலாக ஒலிக்கிறோம்.',
  keywords: [
    'சட்டவிளக்கு', 
    'Sattavilakku', 
    'sattavilakku.com', 
    'தமிழ் சட்டம்', 
    'தமிழ் அரசியல்', 
    'சட்டவிளக்கு இதழ்', 
    'நீதிமன்ற செய்திகள்', 
    'சட்ட செய்திகள்', 
    'Law magazine Tamil', 
    'Tamil Law News', 
    'Satta Vilakku', 
    'சட்ட விழிப்புணர்வு'
  ],
  authors: [{ name: 'சட்டவிளக்கு குழு' }],
  alternates: {
    canonical: 'https://sattavilakku.com',
  },
  openGraph: {
    type: 'website',
    locale: 'ta_IN',
    url: 'https://sattavilakku.com',
    siteName: 'சட்டவிளக்கு (Sattavilakku)',
    title: 'சட்டவிளக்கு — சட்டம், அரசியல் & சமூக விழிப்புணர்வு இணைய இதழ்',
    description: 'சட்டவிளக்கு (Sattavilakku) - சட்டம், சட்ட செய்திகள், சமகால அரசியல் மற்றும் சமூக விழிப்புணர்வுக்கான தமிழ் மாதாந்திர இணைய இதழ்.',
    images: [{ url: '/images/photo.jpeg', width: 1200, height: 630, alt: 'சட்டவிளக்கு' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'சட்டவிளக்கு — சட்டம், அரசியல் & சமூக விழிப்புணர்வு இணைய இதழ்',
    description: 'சட்டவிளக்கு (Sattavilakku) - சட்டம், சட்ட செய்திகள், சமகால அரசியல் மற்றும் சமூக விழிப்புணர்வுக்கான தமிழ் மாதாந்திர இணைய இதழ்.',
    images: ['/images/photo.jpeg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#DC2626',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta" suppressHydrationWarning className={`${notoSerifTamil.variable} ${notoSansTamil.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
