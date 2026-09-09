import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTamil(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ta-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTimeTamil(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ta-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return '';
  }
}
