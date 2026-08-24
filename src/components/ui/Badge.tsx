import React from 'react';
import { cn } from '../../utils/cn';

export type BadgeTone = 'brand' | 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  neutral: 'bg-raised text-muted border border-line',
};

const Badge: React.FC<BadgeProps> = ({
  children,
  tone = 'brand',
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      toneClasses[tone],
      className,
    )}
  >
    {children}
  </span>
);

export default Badge;
