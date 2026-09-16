import { cn } from '@/lib/utils';

interface SplitPaneProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  listWidthClass?: string;
  className?: string;
}

/** Desktop: list | detail. Mobile: stacked. */
export function SplitPane({ list, detail, listWidthClass = 'lg:w-[380px] xl:w-[420px]', className }: SplitPaneProps) {
  return (
    <div className={cn('flex flex-col lg:flex-row gap-4 lg:gap-6 lg:min-h-[calc(100vh-11rem)]', className)}>
      <div className={cn('w-full shrink-0', listWidthClass)}>{list}</div>
      <div className="flex-1 min-w-0">{detail}</div>
    </div>
  );
}
