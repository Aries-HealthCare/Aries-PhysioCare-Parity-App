import Link from 'next/link';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  loading?: boolean;
  className?: string;
}

export function KpiCard({ label, value, hint, href, loading, className }: KpiCardProps) {
  const inner = (
    <div
      className={cn(
        'rounded-3xl border border-border bg-card p-5 shadow-sm h-full',
        href && 'hover:border-primary/40 hover:shadow-md transition-all',
        className
      )}
    >
      <p className="text-[11px] font-outfit font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      {loading ? (
        <div className="h-9 w-20 mt-2 rounded-xl bg-muted animate-pulse" />
      ) : (
        <p className="font-outfit text-3xl font-black mt-1 tabular-nums">{value}</p>
      )}
      {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
    </div>
  );
  if (href) {
    return (
      <Link href={href} prefetch={false} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}
