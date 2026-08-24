import React from 'react';
import { cn } from '../../utils/cn';

export type StatTone = 'brand' | 'success' | 'warning' | 'danger';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone?: StatTone;
  delayIndex?: number;
}

const toneClasses: Record<StatTone, string> = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  tone = 'brand',
  delayIndex = 0,
}) => (
  <div
    className="rounded-xl border border-line bg-surface shadow-xs p-5 animate-rise hover:-translate-y-0.5 hover:shadow-md transition-all"
    style={{ animationDelay: `${delayIndex * 70}ms` }}
  >
    <div className="flex items-center gap-4">
      <div
        className={cn('p-3 rounded-xl shrink-0', toneClasses[tone])}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted truncate">{label}</p>
        <p className="text-2xl font-display font-semibold tabular-nums tracking-tight text-ink">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default StatCard;
