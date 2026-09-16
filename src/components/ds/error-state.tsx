import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/services/api-transport';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function describeError(error: unknown): { title: string; message: string; offline: boolean } {
  if (error instanceof ApiError) {
    if (error.isOffline) {
      return {
        title: 'You are offline',
        message: error.message || 'Check your connection and try again.',
        offline: true,
      };
    }
    if (error.isUnauthorized) {
      return {
        title: 'Session expired',
        message: 'Please sign in again to continue.',
        offline: false,
      };
    }
    return { title: 'Request failed', message: error.message, offline: false };
  }
  if (error instanceof Error) {
    return { title: 'Something went wrong', message: error.message, offline: false };
  }
  return { title: 'Something went wrong', message: 'The server could not complete this request.', offline: false };
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const { title, message, offline } = describeError(error);
  const Icon = offline ? WifiOff : AlertTriangle;
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-12',
        className
      )}
    >
      <Icon className="w-8 h-8 text-destructive mb-3" />
      <h2 className="font-outfit font-extrabold text-lg">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{message}</p>
      {onRetry ? (
        <Button variant="outline" className="mt-5 rounded-2xl" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
