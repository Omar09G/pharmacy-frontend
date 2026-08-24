import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Sin datos disponibles',
  icon,
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-muted">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
      {icon || <Inbox size={32} strokeWidth={1.5} />}
    </div>
    <p className="mt-3 text-sm">{message}</p>
  </div>
);

export default EmptyState;
