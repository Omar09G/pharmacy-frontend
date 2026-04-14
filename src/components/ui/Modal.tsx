import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const titleId = title ? 'modal-title' : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-10 w-full rounded-xl shadow-xl',
          'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
          'max-h-[90vh] flex flex-col',
          sizeClasses[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2
              id={titleId}
              className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
