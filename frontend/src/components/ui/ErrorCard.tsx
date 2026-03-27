'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorCard({ title, message, onRetry, retryLabel = 'Try again' }: ErrorCardProps) {
  return (
    <Card className="border-red-200 bg-red-50/50">
      <CardContent className="py-6 flex flex-col items-center text-center gap-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        {title && <h3 className="text-sm font-semibold text-red-800">{title}</h3>}
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
