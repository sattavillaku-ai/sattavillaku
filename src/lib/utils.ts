import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ஷாட்கன் பயன்பாட்டு செயல்பாடு (Shadcn utility function)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
