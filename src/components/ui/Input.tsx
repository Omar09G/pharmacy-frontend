import React, { useId } from 'react';
import { TriangleAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    const errorId = `${autoId}-error`;
    const helperId = `${autoId}-helper`;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            cn(error && errorId, helper && !error && helperId) || undefined
          }
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm transition-colors bg-surface text-ink',
            'placeholder:text-muted/70',
            error
              ? 'border-danger focus:border-danger'
              : 'border-line hover:border-muted/50 focus:border-brand',
            className,
          )}
          {...rest}
        />
        {error && (
          <p
            id={errorId}
            className="mt-1 flex items-center gap-1 text-xs font-medium text-danger"
          >
            <TriangleAlert size={12} aria-hidden="true" />
            {error}
          </p>
        )}
        {helper && !error && (
          <p id={helperId} className="mt-1 text-xs text-muted">
            {helper}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
