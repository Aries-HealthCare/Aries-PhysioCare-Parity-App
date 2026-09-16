import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="font-outfit font-extrabold text-lg">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5 rounded-2xl font-outfit font-bold" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
