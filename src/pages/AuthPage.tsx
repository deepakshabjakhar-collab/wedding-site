import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Loader2, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError, api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Logo } from '@/components/ui/Misc';
import { TemplateArt, TemplateMark } from '@/templates/art';

const DEMO = { email: 'demo@vellum.studio', password: 'vellum1234' };

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/dashboard';
  const design = params.get('design');
  const reduce = useReducedMotion();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = mode === 'login' ? 'Sign in · Vellum' : 'Create your studio · Vellum';
  }, [mode]);

  if (!loading && user) return <Navigate to={next} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (mode === 'signup' && name.trim().length < 2) {
      setError('Please tell us your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Your password needs at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup(name.trim(), email.trim(), password);
        if (design) {
          const { invitation } = await api.invitations.create(design);
          navigate(`/studio/${invitation.id}`);
          return;
        }
      } else {
        await login(email.trim(), password);
      }
      navigate(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = async () => {
    setEmail(DEMO.email);
    setPassword(DEMO.password);
    setError(null);
    setBusy(true);
    try {
      await login(DEMO.email, DEMO.password);
      navigate(next === '/dashboard' ? '/dashboard' : next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'The demo account is unavailable.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mkt-scope grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#241d17] lg:block">
        <TemplateArt templateId="noir" className="absolute inset-0 h-full w-full text-[#c2a67d] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#150f0a] via-[#241d17]/70 to-[#241d17]/40" />
        <div className="relative flex h-full flex-col justify-between p-10 text-[#f6edde] xl:p-14">
          <Logo tone="light" />
          <div>
            <TemplateMark templateId="aurelia" className="h-9 w-32 text-[#d9bb8c]" />
            <p className="mt-6 max-w-md font-display text-[2.4rem] italic leading-tight">
              “An invitation should feel like the first five minutes of the wedding.”
            </p>
            <p className="mt-4 text-[0.7rem] uppercase tracking-[0.22em] text-[#c2a67d]">
              The Vellum studio
            </p>
          </div>
          <ul className="space-y-3 text-[0.82rem] text-[#e0d3c0]">
            {[
              'Design the whole invitation free',
              'See it exactly as your guests will',
              'Pay once, only when you publish',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <Check size={14} className="text-[#d9bb8c]" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center bg-ivory px-5 py-14 sm:px-10">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden">
            <Logo />
          </div>
          <p className="eyebrow mt-8 lg:mt-0">
            {mode === 'login' ? 'Welcome back' : 'The Vellum studio'}
          </p>
          <h1 className="display mt-3 text-[2.4rem] leading-tight text-ink">
            {mode === 'login' ? 'Sign in to your invitations' : 'Create your studio'}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {mode === 'login'
              ? 'Continue editing, check your replies, or download the album.'
              : 'Designing is free. You only pay when you are ready to send your invitation.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            {mode === 'signup' && (
              <Field label="Your name" htmlFor="auth-name">
                <div className="relative">
                  <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input
                    id="auth-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Clara Laurent"
                    autoComplete="name"
                    className="pl-9"
                  />
                </div>
              </Field>
            )}

            <Field label="Email address" htmlFor="auth-email">
              <div className="relative">
                <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field
              label="Password"
              htmlFor="auth-password"
              hint={mode === 'signup' ? 'At least 8 characters. Use something memorable.' : undefined}
            >
              <div className="relative">
                <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="pl-9"
                />
              </div>
            </Field>

            {error && (
              <p className="rounded-lg border border-[#b4553f]/30 bg-[#b4553f]/8 px-3 py-2 text-sm text-[#8f3c2b]" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={busy}>
              {mode === 'login' ? 'Sign in' : 'Create my studio'}
              <ArrowRight size={14} />
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-line bg-paper/70 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Just looking?
            </p>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-soft">
              Open the demo studio, with two real weddings, guests, replies and a shared album.
            </p>
            <button
              type="button"
              onClick={() => void fillDemo()}
              className="btn btn-outline btn-sm mt-3"
              disabled={busy}
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : null}
              Enter the demo studio
            </button>
          </div>

          <p className="mt-7 text-sm text-muted">
            {mode === 'login' ? (
              <>
                New to Vellum?{' '}
                <Link to={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="border-b border-gold/50 text-ink hover:text-gold">
                  Create your studio
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="border-b border-gold/50 text-ink hover:text-gold">
                  Sign in
                </Link>
              </>
            )}
          </p>
          <p className="mt-3 text-[0.68rem] leading-relaxed text-muted">
            By continuing you agree to be kind to your guests and to keep your account details to
            yourself. This demonstration studio stores data locally on this machine.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
