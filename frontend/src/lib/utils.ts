import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 55) return 'text-amber-500';
  if (score >= 30) return 'text-orange-500';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 55) return 'bg-amber-50';
  if (score >= 30) return 'bg-orange-50';
  return 'bg-red-50';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 55) return 'Moderate';
  if (score >= 30) return 'Weak';
  if (score > 0) return 'Very Weak';
  return 'None';
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
