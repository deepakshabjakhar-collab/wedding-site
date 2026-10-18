import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
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
export function AuthPage({ mode }) {
    const { user, loading, login, signup } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const next = params.get('next') ?? '/dashboard';
    const design = params.get('design');
    const reduce = useReducedMotion();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        document.title = mode === 'login' ? 'Sign in · Vellum' : 'Create your studio · Vellum';
    }, [mode]);
    if (!loading && user)
        return _jsx(Navigate, { to: next, replace: true });
    const submit = async (event) => {
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
            }
            else {
                await login(email.trim(), password);
            }
            navigate(next);
        }
        catch (err) {
            setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
        }
        finally {
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
        }
        catch (err) {
            setError(err instanceof ApiError ? err.message : 'The demo account is unavailable.');
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsxs("div", { className: "grid min-h-svh lg:grid-cols-[1.05fr_1fr]", children: [_jsxs("div", { className: "relative hidden overflow-hidden bg-[#241d17] lg:block", children: [_jsx(TemplateArt, { templateId: "noir", className: "absolute inset-0 h-full w-full text-[#c2a67d] opacity-40" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#150f0a] via-[#241d17]/70 to-[#241d17]/40" }), _jsxs("div", { className: "relative flex h-full flex-col justify-between p-10 text-[#f6edde] xl:p-14", children: [_jsx(Logo, { tone: "light" }), _jsxs("div", { children: [_jsx(TemplateMark, { templateId: "aurelia", className: "h-9 w-32 text-[#d9bb8c]" }), _jsx("p", { className: "mt-6 max-w-md font-display text-[2.4rem] italic leading-tight", children: "\u201CAn invitation should feel like the first five minutes of the wedding.\u201D" }), _jsx("p", { className: "mt-4 text-[0.7rem] uppercase tracking-[0.22em] text-[#c2a67d]", children: "The Vellum studio" })] }), _jsx("ul", { className: "space-y-3 text-[0.82rem] text-[#e0d3c0]", children: [
                                    'Design the whole invitation free',
                                    'See it exactly as your guests will',
                                    'Pay once, only when you publish',
                                ].map((item) => (_jsxs("li", { className: "flex items-center gap-2.5", children: [_jsx(Check, { size: 14, className: "text-[#d9bb8c]" }), " ", item] }, item))) })] })] }), _jsx("div", { className: "flex items-center justify-center bg-ivory px-5 py-14 sm:px-10", children: _jsxs(motion.div, { initial: reduce ? false : { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }, className: "w-full max-w-md", children: [_jsx("div", { className: "lg:hidden", children: _jsx(Logo, {}) }), _jsx("p", { className: "eyebrow mt-8 lg:mt-0", children: mode === 'login' ? 'Welcome back' : 'The Vellum studio' }), _jsx("h1", { className: "display mt-3 text-[2.4rem] leading-tight text-ink", children: mode === 'login' ? 'Sign in to your invitations' : 'Create your studio' }), _jsx("p", { className: "mt-3 text-sm leading-relaxed text-muted", children: mode === 'login'
                                ? 'Continue editing, check your replies, or download the album.'
                                : 'Designing is free. You only pay when you are ready to send your invitation.' }), _jsxs("form", { onSubmit: submit, className: "mt-8 space-y-4", noValidate: true, children: [mode === 'signup' && (_jsx(Field, { label: "Your name", htmlFor: "auth-name", children: _jsxs("div", { className: "relative", children: [_jsx(User, { size: 14, className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" }), _jsx(Input, { id: "auth-name", value: name, onChange: (event) => setName(event.target.value), placeholder: "Clara Laurent", autoComplete: "name", className: "pl-9" })] }) })), _jsx(Field, { label: "Email address", htmlFor: "auth-email", children: _jsxs("div", { className: "relative", children: [_jsx(Mail, { size: 14, className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" }), _jsx(Input, { id: "auth-email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), placeholder: "you@example.com", autoComplete: "email", className: "pl-9" })] }) }), _jsx(Field, { label: "Password", htmlFor: "auth-password", hint: mode === 'signup' ? 'At least 8 characters. Use something memorable.' : undefined, children: _jsxs("div", { className: "relative", children: [_jsx(Lock, { size: 14, className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" }), _jsx(Input, { id: "auth-password", type: "password", value: password, onChange: (event) => setPassword(event.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: mode === 'signup' ? 'new-password' : 'current-password', className: "pl-9" })] }) }), error && (_jsx("p", { className: "rounded-lg border border-[#b4553f]/30 bg-[#b4553f]/8 px-3 py-2 text-sm text-[#8f3c2b]", role: "alert", children: error })), _jsxs(Button, { type: "submit", size: "lg", className: "w-full", loading: busy, children: [mode === 'login' ? 'Sign in' : 'Create my studio', _jsx(ArrowRight, { size: 14 })] })] }), _jsxs("div", { className: "mt-6 rounded-xl border border-line bg-paper/70 p-4", children: [_jsx("p", { className: "text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted", children: "Just looking?" }), _jsx("p", { className: "mt-1.5 text-[0.82rem] leading-relaxed text-ink-soft", children: "Open the demo studio, with two real weddings, guests, replies and a shared album." }), _jsxs("button", { type: "button", onClick: () => void fillDemo(), className: "btn btn-outline btn-sm mt-3", disabled: busy, children: [busy ? _jsx(Loader2, { size: 13, className: "animate-spin" }) : null, "Enter the demo studio"] })] }), _jsx("p", { className: "mt-7 text-sm text-muted", children: mode === 'login' ? (_jsxs(_Fragment, { children: ["New to Vellum?", ' ', _jsx(Link, { to: `/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`, className: "border-b border-gold/50 text-ink hover:text-gold", children: "Create your studio" })] })) : (_jsxs(_Fragment, { children: ["Already have an account?", ' ', _jsx(Link, { to: `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`, className: "border-b border-gold/50 text-ink hover:text-gold", children: "Sign in" })] })) }), _jsx("p", { className: "mt-3 text-[0.68rem] leading-relaxed text-muted", children: "By continuing you agree to be kind to your guests and to keep your account details to yourself. This demonstration studio stores data locally on this machine." })] }) })] }));
}
