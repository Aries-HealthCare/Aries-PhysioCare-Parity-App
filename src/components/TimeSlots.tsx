'use client';

import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

type Props = {
  slots: string[];
  selected: string | null;
  onSelect: (time: string) => void;
};

export function TimeSlots({ slots, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-2">
      {slots.map((time) => {
        const isSelected = selected === time;
        return (
          <button
            key={time}
            type="button"
            onClick={() => onSelect(time)}
            className={cn(
              "flex items-center justify-center gap-2 py-3 px-3.5 rounded-xl text-xs font-bold transition-all duration-300 border",
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 ring-1 ring-primary"
                : "border-white/10 bg-white/5 dark:bg-white/[0.03] text-foreground hover:bg-primary/10 hover:border-primary/30"
            )}
          >
            <Clock className={cn("w-3.5 h-3.5", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
            <span>{time}</span>
          </button>
        );
      })}
    </div>
  );
}
