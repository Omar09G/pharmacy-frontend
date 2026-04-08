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
  <div className="flex flex-col items-center justify-center py-12 text-neutral-400 dark:text-neutral-500">
    {icon || <Inbox size={48} strokeWidth={1.5} />}
    <p className="mt-3 text-sm">{message}</p>
  </div>
);

export default EmptyState;
