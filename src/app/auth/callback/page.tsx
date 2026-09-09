'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { isAuthorizedAdminEmail } from '@/lib/auth-service';
import { ShieldAlert, Loader2, LogOut, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function processSession(sessionUserEmail: string | undefined | null) {
      if (!sessionUserEmail) {
        setErrorMessage('கூகிள் கணக்கிலிருந்து மின்னஞ்சல் விவரம் கிடைக்கவில்லை.');
        setRedirecting(false);
        return;
      }

      // 1. Check if email is in the authorized admin list
      const authorized = isAuthorizedAdminEmail(sessionUserEmail);

      if (authorized) {
        // Immediate redirect to the admin panel
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        } else {
          router.replace('/admin');
        }
      } else {
        // Sign out unauthorized user immediately
        await supabase.auth.signOut();
        if (isMounted) {
          setUnauthorizedEmail(sessionUserEmail);
          setRedirecting(false);
        }
      }
    }

    async function checkAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setErrorMessage(error.message);
          setRedirecting(false);
          return;
        }

        if (session?.user) {
          await processSession(session.user.email);
        } else {
          // Listen for session from URL hash if processed asynchronously by Supabase client
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (session?.user) {
                await processSession(session.user.email);
              }
            }
          );

          // Fallback timeout in case no session is provided
          const timeout = setTimeout(() => {
            if (isMounted && redirecting) {
              setErrorMessage('உள்நுழைவு நேரம் கடந்துவிட்டது. தயவுசெய்து மீண்டும் உள்நுழையவும்.');
              setRedirecting(false);
            }
          }, 6000);

          return () => {
            authListener.subscription.unsubscribe();
            clearTimeout(timeout);
          };
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'உள்நுழைவில் பிழை ஏற்பட்டது');
          setRedirecting(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/40 font-tamil text-foreground">
      <div className="max-w-md w-full p-6 sm:p-8 text-center space-y-6 bg-card border border-border rounded-xl shadow-lg">
        <div className="flex justify-center">
          <BrandLogo size="md" isLink={false} />
        </div>

        {/* Access Denied for Unauthorized Google Account */}
        {unauthorizedEmail && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-destructive">
                அனுமதி மறுக்கப்பட்டது (Access Denied)
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                நீங்கள் உள்நுழைந்த கூகிள் கணக்கு:
              </p>
              <div className="p-2 bg-muted rounded-md text-xs font-mono font-bold text-foreground break-all">
                {unauthorizedEmail}
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              இந்தக் கூகிள் கணக்கு சட்டவிளக்கு ஆசிரியர் நிர்வாக அமைப்பிற்கு <strong>அங்கீகரிக்கப்படவில்லை</strong>. அங்கீகரிக்கப்பட்ட முதன்மை ஆசிரியர் கூகிள் கணக்கு மூலம் மட்டுமே உள்நுழைய முடியும்.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/admin/login"
                className="w-full py-2.5 px-4 rounded-md bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors"
              >
                அங்கீகரிக்கப்பட்ட கணக்கு மூலம் உள்நுழைக
              </Link>
              <Link
                href="/"
                className="w-full py-2 px-4 rounded-md border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors"
              >
                பொது வலைதளத்திற்குத் திரும்புக
              </Link>
            </div>
          </div>
        )}

        {/* Generic Error */}
        {errorMessage && !unauthorizedEmail && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-destructive font-bold text-sm">உள்நுழைவு தோல்வி</div>
            <p className="text-xs text-muted-foreground">{errorMessage}</p>
            <Link
              href="/admin/login"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-bold"
            >
              மீண்டும் முயற்சிக்கவும்
            </Link>
          </div>
        )}

        {/* Loading / Redirecting */}
        {redirecting && !unauthorizedEmail && !errorMessage && (
          <div className="space-y-3 py-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <div className="text-sm font-bold text-foreground">
              கூகிள் அங்கீகாரம் சரிபார்க்கப்படுகிறது...
            </div>
            <p className="text-xs text-muted-foreground">
              ஆசிரியர் கட்டுப்பாட்டகத்திற்கு (Admin Panel) அழைத்துச் செல்லப்படுகிறீர்கள்.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
