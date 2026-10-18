import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowRight, Loader2 } from 'lucide-react';

export function Logo({ tone = 'ink', compact }: { tone?: 'ink' | 'light'; compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Vellum home">
      <span
        className={clsx(
          'grid h-8 w-8 place-items-center rounded-full border transition group-hover:border-gold',
          tone === 'light' ? 'border-white/35 text-[#f5ebdc]' : 'border-ink/25 text-ink',
        )}
      >
        <span className="font-display text-[1.05rem] leading-none">V</span>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={clsx(
            'font-editorial text-[0.95rem] tracking-[0.28em] uppercase',
            tone === 'light' ? 'text-[#f7f0e5]' : 'text-ink',
          )}
        >
          Vellum
        </span>
        {!compact && (
          <span
            className={clsx(
              'mt-1 text-[0.47rem] font-semibold tracking-[0.34em] uppercase',
              tone === 'light' ? 'text-white/55' : 'text-muted',
            )}
          >
            Invitations
          </span>
        )}
      </span>
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 size={16} className={clsx('animate-spin', className)} aria-hidden />;
}

export function PageLoader({ label = 'Setting the table' }: { label?: string }) {
  return (
    <div className="dash-shell grid min-h-svh place-items-center px-6">
      <div className="flex flex-col items-center gap-5">
        <span className="spin h-8 w-8 rounded-full border border-line border-t-gold" />
        <p className="eyebrow">{label}</p>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton', className)} aria-hidden />;
}

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  icon,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-col items-center px-6 py-14 text-center', className)}>
      {icon && (
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-line bg-ivory text-gold">
          {icon}
        </div>
      )}
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h3 className="display text-[1.8rem] text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: 'draft' | 'published' }) {
  return (
    <span className={status === 'published' ? 'pill pill-green' : 'pill pill-neutral'}>
      <span
        className={clsx(
          'h-1.5 w-1.5 rounded-full',
          status === 'published' ? 'bg-[#5c7a4f]' : 'bg-[#9a8a78]',
        )}
      />
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
}

export function RsvpPill({ attending }: { attending: boolean | undefined | null }) {
  if (attending === true) return <span className="pill pill-green">Attending</span>;
  if (attending === false) return <span className="pill pill-rose">Declined</span>;
  return <span className="pill pill-neutral">Awaiting reply</span>;
}

export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  color = '#e5dccd',
  priority,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  color?: string;
  priority?: boolean;
  onClick?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={clsx('relative overflow-hidden', className)} style={{ backgroundColor: color }}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        className={clsx(
          'h-full w-full object-cover transition-opacity duration-700',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        )}
      />
      {!loaded && <div className="absolute inset-0 skeleton opacity-40" aria-hidden />}
    </div>
  );
}

export function InlineLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={clsx(
        'inline-flex items-center gap-1.5 text-[0.72rem] font-semibold tracking-[0.1em] uppercase text-gold transition hover:text-ink',
        className,
      )}
    >
      {children}
      <ArrowRight size={12} />
    </Link>
  );
}

export function Monogram({
  monogram,
  className,
  style,
}: {
  monogram: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={clsx('font-script text-2xl text-gold', className)} style={style} aria-hidden>
      {monogram}
    </span>
  );
}
