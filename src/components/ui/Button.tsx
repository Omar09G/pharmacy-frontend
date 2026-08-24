import React from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-strong shadow-sm',
  secondary: 'bg-raised text-ink hover:bg-line border border-line shadow-xs',
  danger: 'bg-danger text-on-danger hover:brightness-90 shadow-sm',
  ghost: 'bg-transparent text-muted hover:bg-raised hover:text-ink',
  success: 'bg-success text-on-success hover:brightness-90 shadow-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-7 px-2.5 py-1 text-xs gap-1.5',
  md: 'min-h-9 px-4 py-2 text-sm',
  lg: 'min-h-11 px-6 py-3 text-base',
  icon: 'h-11 w-11 p-0',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...rest
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
      className,
    )}
    disabled={disabled || loading}
    {...rest}
  >
    {loading && (
      <svg
        className="animate-spin h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    )}
    {children}
  </button>
);

export default Button;
