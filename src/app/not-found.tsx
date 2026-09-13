import React from 'react';
import Link from 'next/link';
import { BookOpen, Newspaper, Home, ArrowLeft } from 'lucide-react';

export default function RootNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-tamil">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <span className="text-6xl sm:text-7xl font-extrabold font-mono text-primary">404</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            பக்கம் கிடைக்கவில்லை (Page Not Found)
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            நீங்கள் தேடிய பக்கம் நீக்கப்பட்டிருக்கலாம் அல்லது அதன் இணைய முகவரி மாற்றப்பட்டிருக்கலாம்.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>முகப்பிற்குத் திரும்பு</span>
          </Link>

          <Link
            href="/articles"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-foreground text-xs sm:text-sm font-bold hover:bg-muted transition-colors"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>கட்டுரைகள்</span>
          </Link>

          <Link
            href="/news"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-border bg-card text-foreground text-xs sm:text-sm font-bold hover:bg-muted transition-colors"
          >
            <Newspaper className="w-4 h-4 text-primary" />
            <span>செய்திகள்</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
