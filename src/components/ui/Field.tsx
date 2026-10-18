import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, optional, action, children, className }: FieldProps) {
  return (
    <div className={clsx('min-w-0', className)}>
      <div className="label">
        <label htmlFor={htmlFor} className="cursor-pointer">
          {label}
          {optional && <span className="ml-1.5 font-normal tracking-normal normal-case opacity-70">optional</span>}
        </label>
        {action}
      </div>
      {children}
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx('input', className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx('textarea', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx('select', className)} {...props}>
      {children}
    </select>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={clsx(
        'flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line/70 bg-paper/60 px-3.5 py-3 transition hover:border-gold/40',
        disabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span className="min-w-0">
        <span className="block text-[0.82rem] font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{description}</span>}
      </span>
      <span className="relative mt-0.5 flex-none">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
        />
        <span className="block h-[22px] w-[38px] rounded-full border border-line bg-[#e8dfd1] transition peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold" />
        <span className="pointer-events-none absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-paper shadow-sm transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
