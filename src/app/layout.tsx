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
  metadataBase: new URL('https://sattavillaku.com'),
  title: {
    default: 'சட்டவிளக்கு — சட்டமும் சமூகமும்',
    template: '%s | சட்டவிளக்கு'
  },
  description: 'செய்தி, அரசியல் மற்றும் சட்ட விழிப்புணர்வுக்கான தமிழ் இணைய இதழ்.',
  keywords: ['தமிழ் சட்டம்', 'தமிழ் அரசியல்', 'சட்டவிளக்கு இதழ்', 'நீதிமன்ற செய்திகள்'],
  authors: [{ name: 'சட்டவிளக்கு குழு' }],
  openGraph: {
    type: 'website',
    locale: 'ta_IN',
    url: 'https://sattavillaku.com',
    siteName: 'சட்டவிளக்கு',
    title: 'சட்டவிளக்கு — சட்டமும் சமூகமும்',
    description: 'செய்தி, அரசியல் மற்றும் சட்ட விழிப்புணர்வுக்கான தமிழ் இணைய இதழ்.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'சட்டவிளக்கு' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'சட்டவிளக்கு — சட்டமும் சமூகமும்',
    description: 'செய்தி, அரசியல் மற்றும் சட்ட விழிப்புணர்வுக்கான தமிழ் இணைய இதழ்.',
    images: ['/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
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
