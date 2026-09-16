import { cn } from '@/lib/utils';

export function PageSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-4 animate-pulse', className)} aria-hidden>
      <div className="h-8 w-48 rounded-xl bg-muted" />
      <div className="h-4 w-80 max-w-full rounded-lg bg-muted" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-24 rounded-3xl bg-muted/70" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-3xl border border-border overflow-hidden" aria-hidden>
      <div className="h-12 bg-muted/80" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 border-t border-border bg-card animate-pulse" />
      ))}
    </div>
  );
}
