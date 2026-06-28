'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';

const registerSchema = z.object({
  displayName: z.string().min(2, 'பெயர் குறைந்தது 2 எழுத்துக்கள் இருக்க வேண்டும்'),
  email: z.string().email('மின்னஞ்சல் தவறானது'),
  password: z.string().min(6, 'கடவுச்சொல் குறைந்தது 6 எழுத்துக்கள் இருக்க வேண்டும்'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // கூகுள் மூலம் உள்நுழைய (Google OAuth)
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          display_name: values.displayName,
          role: 'reader',
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (signUpError) {
      setError('பதிவு செய்வதில் பிழை: ' + signUpError.message);
      setIsLoading(false);
    } else {
      // பதிவு வெற்றிகரமாக முடிந்ததும் சந்தா பக்கத்திற்கு அனுப்பவும்
      router.push('/subscribe?message=பதிவு வெற்றிகரமாக முடிந்தது! இப்போது உங்கள் திட்டத்தைத் தேர்வு செய்யவும்.');
    }
  };

  return (
    <div className="flex min-h-[calc(100-16)] flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-3xl font-bold font-serif leading-9 tracking-tight text-foreground">
          பதிவு செய்யுங்கள் (Register)
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium leading-6 text-foreground">
              உங்கள் பெயர் (Display Name)
            </label>
            <div className="mt-2">
              <input
                {...register('displayName')}
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-input focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-background"
                placeholder="எ.கா: தமிழன்"
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-destructive">{errors.displayName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-foreground">
              மின்னஞ்சல் முகவரி (Email)
            </label>
            <div className="mt-2">
              <input
                {...register('email')}
                type="email"
                className="block w-full rounded-md border-0 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-input focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-background"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-foreground">
              கடவுச்சொல் (Password)
            </label>
            <div className="mt-2">
              <input
                {...register('password')}
                type="password"
                className="block w-full rounded-md border-0 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-input focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-background"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              பதிவு செய்
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm font-medium text-destructive">
            {error}
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
              <span className="text-sm font-semibold leading-6">Google மூலம் உள்நுழைய / பதிவு செய்ய</span>
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          ஏற்கனவே கணக்கு உள்ளதா?{' '}
          <Link href="/login" className="font-semibold leading-6 text-primary hover:text-primary/80">
            உள்நுழையவும்
          </Link>
        </p>
      </div>
    </div>
  );
}
