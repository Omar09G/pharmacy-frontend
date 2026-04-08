import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none',
            'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500'
              : 'border-neutral-300 dark:border-neutral-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            className,
          )}
          {...rest}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helper && !error && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {helper}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
