'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isBefore, startOfToday } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-day-picker/dist/style.css';

type Props = {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | undefined;
};

export default function AppointmentCalendar({ onDateSelect, selectedDate }: Props) {
  const [selected, setSelected] = useState<Date | undefined>(selectedDate);

  const today = startOfToday();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelected(date);
    onDateSelect(date);
  };
  
  const formattedDate = selected ? format(selected, 'EEE, MMM d, yyyy') : 'Select a date';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] text-card-foreground shadow-lg overflow-hidden w-full max-w-sm mx-auto backdrop-blur-md">
      <div className="bg-primary/10 border-b border-primary/20 p-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Selected Date</p>
          <p className="text-base font-bold font-headline mt-0.5 text-foreground">{formattedDate}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
          <CalendarIcon className="w-4 h-4" />
        </div>
      </div>
      <div className="p-3 flex justify-center">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={handleDateSelect}
          disabled={(date) => isBefore(date, today)}
          showOutsideDays
          className="w-full"
          classNames={{
            months: 'flex justify-center',
            month: 'w-full space-y-3',
            caption: 'flex justify-center pt-1 pb-2 relative items-center',
            caption_label: 'text-sm font-bold font-headline text-foreground',
            nav: 'space-x-1 flex items-center',
            nav_button: 'h-7 w-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-primary/20 transition-all',
            nav_button_previous: 'absolute left-1',
            nav_button_next: 'absolute right-1',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex justify-between',
            head_cell: 'text-muted-foreground w-8 font-semibold text-[0.75rem] text-center',
            row: 'flex w-full justify-between mt-1.5',
            cell: 'h-8 w-8 text-center text-xs p-0 relative focus-within:relative focus-within:z-20',
            day: 'h-8 w-8 p-0 font-medium text-foreground rounded-lg hover:bg-primary/20 transition-all flex items-center justify-center',
            day_selected: 'bg-primary text-primary-foreground font-bold shadow-md shadow-primary/30 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            day_today: 'border border-primary/50 text-primary font-bold',
            day_disabled: 'text-muted-foreground/30 opacity-30 cursor-not-allowed hover:bg-transparent',
            day_outside: 'text-muted-foreground/30 opacity-20',
            day_hidden: 'invisible',
          }}
        />
      </div>
    </div>
  );
}
