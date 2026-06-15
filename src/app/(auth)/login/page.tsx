'use brain'; // This is a client component
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('மின்னஞ்சல் தவறானது (Invalid email)'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // மேஜிக் லிங்க் மூலம் உள்நுழைய (Magic Link Login)
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setMessage(null);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setMessage('பிழை ஏற்பட்டது: ' + error.message);
    } else {
      setMessage('உங்களின் மின்னஞ்சலுக்கு உள்நுழைவு இணைப்பு அனுப்பப்பட்டுள்ளது.');
    }
    setIsLoading(false);
  };

  // கூகுள் மூலம் உள்நுழைய (Google OAuth)
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-[calc(100-16)] flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-3xl font-bold font-serif leading-9 tracking-tight text-foreground">
          உள்நுழைவு (Login)
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">
              மின்னஞ்சல் முகவரி (Email Address)
            </label>
            <div className="mt-2">
              <input
                {...register('email')}
                type="email"
                className="block w-full rounded-md border-0 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-input focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-background"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              உள்நுழைவு இணைப்பு அனுப்பு
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
            {message}
          </p>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-input" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">அல்லது</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-background px-3 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-input hover:bg-accent focus-visible:ring-transparent"
            >
              <span className="text-sm font-semibold leading-6">Google மூலம் உள்நுழைய</span>
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          கணக்கு இல்லையா?{' '}
          <Link href="/register" className="font-semibold leading-6 text-primary hover:text-primary/80">
            இப்போதே பதிவு செய்யுங்கள்
          </Link>
        </p>
      </div>
    </div>
  );
}
