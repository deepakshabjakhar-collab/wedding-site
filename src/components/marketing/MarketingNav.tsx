import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Misc';
import { buttonClass } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

const LINKS = [
  { label: 'Templates', href: '/templates', anchor: false },
  { label: 'The arrival', href: '#arrival', anchor: true },
  { label: 'The studio', href: '#studio', anchor: true },
  { label: 'Music', href: '#music', anchor: true },
  { label: 'Pricing', href: '#pricing', anchor: true },
];

export function MarketingNav({ tone = 'ink' }: { tone?: 'ink' | 'light' }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const reduce = useReducedMotion();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const hrefFor = (link: (typeof LINKS)[number]) => {
    if (!link.anchor) return link.href;
    return isHome ? link.href : `/${link.href}`;
  };

  return (
    <>
      <header className="nav-shell" data-scrolled={scrolled || tone === 'light' ? 'true' : 'false'}>
        <div className="shell flex h-[74px] items-center justify-between gap-6">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={hrefFor(link)}
                className="nav-link"
                onClick={() => setScrolled(true)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link to="/dashboard" className={buttonClass('ghost', 'sm')}>
                  Dashboard
                </Link>
                <Link to="/templates" className={buttonClass('primary', 'sm')}>
                  Create an invitation
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonClass('ghost', 'sm')}>
                  Sign in
                </Link>
                <Link to="/signup?next=/templates" className={buttonClass('primary', 'sm')}>
                  Create an invitation
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="icon-btn md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col bg-[#f6f1e7]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="shell flex h-[74px] flex-none items-center justify-between">
              <Logo />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="shell flex flex-1 flex-col justify-center gap-1 pb-16" aria-label="Mobile">
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={hrefFor(link)}
                  onClick={() => setOpen(false)}
                  className="display border-b border-line/70 py-4 text-3xl text-ink"
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-8 flex flex-col gap-3">
                <Link to="/templates" onClick={() => setOpen(false)} className={buttonClass('primary', 'lg', 'w-full')}>
                  {user ? 'Create an invitation' : 'Begin your invitation'}
                </Link>
                <Link
                  to={user ? '/dashboard' : '/login'}
                  onClick={() => setOpen(false)}
                  className={buttonClass('outline', 'lg', 'w-full')}
                >
                  {user ? 'Your dashboard' : 'Sign in'}
                </Link>
              </div>
              <p className="mt-10 font-display text-lg italic text-muted">
                Invitations, remembered.
              </p>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
