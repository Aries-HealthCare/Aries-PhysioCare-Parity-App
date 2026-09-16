import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperItem {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: StepperItem[];
  current: number;
  onSelect?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
}

export function Stepper({ steps, current, onSelect, orientation = 'vertical' }: StepperProps) {
  const vertical = orientation === 'vertical';
  return (
    <ol className={cn(vertical ? 'space-y-2' : 'flex flex-wrap gap-2')}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.id}>
            <button
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(index)}
              className={cn(
                'w-full text-left rounded-2xl border px-3 py-2.5 transition-colors',
                active && 'border-primary bg-primary/10 text-foreground',
                done && !active && 'border-emerald-500/30 bg-emerald-500/5',
                !done && !active && 'border-border bg-card text-muted-foreground'
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
                    active && 'bg-primary text-white',
                    done && !active && 'bg-emerald-500 text-white',
                    !done && !active && 'bg-muted'
                  )}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-outfit font-extrabold truncate">{step.label}</p>
                  {step.description ? (
                    <p className="text-[10px] text-muted-foreground truncate">{step.description}</p>
                  ) : null}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
