import React from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DateRangeInputProps {
  dateInit: string;
  dateEnd: string;
  onDateInitChange: (value: string) => void;
  onDateEndChange: (value: string) => void;
  labelInit?: string;
  labelEnd?: string;
  className?: string;
}

const DateRangeInput: React.FC<DateRangeInputProps> = ({
  dateInit,
  dateEnd,
  onDateInitChange,
  onDateEndChange,
  labelInit = 'Desde',
  labelEnd = 'Hasta',
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {labelInit}
        </label>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            type="date"
            value={dateInit}
            max={dateEnd || undefined}
            onChange={(e) => onDateInitChange(e.target.value)}
            className="w-44 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 pl-9 pr-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {labelEnd}
        </label>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            type="date"
            value={dateEnd}
            min={dateInit || undefined}
            onChange={(e) => onDateEndChange(e.target.value)}
            className="w-44 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 pl-9 pr-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeInput;
