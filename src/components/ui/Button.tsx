import type { ComponentPropsWithRef, ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra?: string) {
  return clsx(
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'gold' && 'btn-gold',
    variant === 'outline' && 'btn-outline',
    variant === 'ghost' && 'btn-ghost',
    variant === 'dark' && 'btn-primary',
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    extra,
  );
}

interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="spin h-3.5 w-3.5 rounded-full border border-current border-t-transparent" aria-hidden />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
