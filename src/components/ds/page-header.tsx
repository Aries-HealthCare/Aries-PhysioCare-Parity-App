import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6', className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="text-[11px] font-outfit font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground max-w-2xl">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
