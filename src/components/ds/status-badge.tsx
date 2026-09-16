import { cn } from '@/lib/utils';

const TONES: Record<string, string> = {
  scheduled: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  in_progress: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
  completed: 'bg-primary/10 text-primary border-primary/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  missed: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-muted text-muted-foreground border-border',
  paid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function StatusBadge({ value, className }: { value?: string | null; className?: string }) {
  const key = (value || 'pending').toString().trim().toLowerCase().replace(/\s+/g, '_');
  const label = (value || 'Pending').toString().replace(/_/g, ' ');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-outfit font-bold uppercase tracking-wide',
        TONES[key] || TONES.pending,
        className
      )}
    >
      {label}
    </span>
  );
}
