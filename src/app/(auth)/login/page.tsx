'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('மின்னஞ்சல் தவறானது (Invalid email)'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam) {
      setMessage(`அங்கீகாரப் பிழை (Auth Error): ${decodeURIComponent(errorParam)}`);
    }
  }, [errorParam]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // மேஜிக் லிங்க் மூலம் உள்நுழைய (Magic Link Login)
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setMessage(data.error || 'பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும். (An error occurred. Please try again.)');
      } else {
        setMessage('உங்களின் மின்னஞ்சலுக்கு உள்நுழைவு இணைப்பு அனுப்பப்பட்டுள்ளது.');
      }
    } catch (err: any) {
      setMessage('உள்நுழைவதில் பிழை ஏற்பட்டது: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100-16)] flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-3xl font-bold font-serif leading-9 tracking-tight text-foreground">
          நிர்வாகி உள்நுழைவு (Admin Login)
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">
              நிர்வாகி மின்னஞ்சல் (Admin Email)
            </label>
            <div className="mt-2">
              <input
                {...register('email')}
                type="email"
                className="block w-full rounded-md border-0 py-1.5 text-foreground shadow-sm ring-1 ring-inset ring-input focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-background"
                placeholder="admin@example.com"
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
          <p className="mt-4 text-center text-sm font-medium text-destructive dark:text-red-400 bg-destructive/10 p-3 rounded border border-destructive/20 whitespace-pre-wrap">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 font-medium">ஏற்றுகிறது...</span>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
