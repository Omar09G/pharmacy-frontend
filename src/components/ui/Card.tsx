import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, title, actions }) => (
  <div
    className={cn(
      'rounded-xl border border-line bg-surface shadow-xs',
      className,
    )}
  >
    {(title || actions) && (
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-line">
        {title && (
          <h3 className="font-display text-base font-semibold tracking-tight text-ink">
            {title}
          </h3>
        )}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="px-6 py-4">{children}</div>
  </div>
);

export default Card;
