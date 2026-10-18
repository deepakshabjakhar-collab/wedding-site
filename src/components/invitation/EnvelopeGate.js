import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2, Volume2 } from 'lucide-react';
import { TemplateArt } from '@/templates/art';
import { formatDateShort } from '@/lib/format';
import { playOpeningSound } from '@/lib/openingSound';
const EASE_SILK = [0.22, 0.61, 0.36, 1];
const EASE_SEAL = [0.16, 0.84, 0.24, 1];
/** An arch — nothing in this sequence is allowed to be a plain rectangle. */
const ARCH_TOP = '52% 52% 14px 14px / 34% 34% 14px 14px';
export function EnvelopeGate({ data, templateId, guestName, onOpen, onIntent, embedded, }) {
    const reduce = useReducedMotion();
    const [opening, setOpening] = useState(false);
    const [phase, setPhase] = useState(0);
    const buttonRef = useRef(null);
    const timers = useRef([]);
    const sound = useRef(null);
    const started = useRef(false);
    useEffect(() => {
        const timer = window.setTimeout(() => buttonRef.current?.focus({ preventScroll: true }), 250);
        return () => {
            window.clearTimeout(timer);
            timers.current.forEach((id) => window.clearTimeout(id));
            sound.current?.release(400);
        };
    }, []);
    const open = () => {
        if (started.current)
            return;
        started.current = true;
        // Both of these must happen inside the original gesture.
        onIntent?.();
        if (!reduce)
            sound.current = playOpeningSound();
        if (reduce) {
            onOpen();
            return;
        }
        setOpening(true);
        const schedule = [
            [110, 1], // the seal cracks in two
            [420, 2], // the flap lifts
            [900, 3], // the card rises clear of the envelope
            [1500, 4], // and opens out into the invitation
        ];
        schedule.forEach(([delay, next]) => {
            timers.current.push(window.setTimeout(() => setPhase(next), delay));
        });
        timers.current.push(window.setTimeout(onOpen, 2350));
    };
    const envelope = data.settings.envelopeAnimation;
    const isCurtain = envelope === 'curtain';
    const isRibbon = envelope === 'ribbon';
    const opening2 = phase >= 2;
    const rising = phase >= 3;
    const blooming = phase >= 4;
    return (_jsxs("div", { className: `inv-gate inv-gate-${templateId} ${embedded ? 'inv-gate-embedded' : ''}`, children: [_jsxs(motion.div, { className: "pointer-events-none absolute inset-0", initial: false, animate: reduce
                    ? { opacity: 1 }
                    : { scale: blooming ? 1.08 : 1, opacity: blooming ? 0.15 : 1, filter: blooming ? 'blur(6px)' : 'blur(0px)' }, transition: { duration: 1.1, ease: EASE_SILK }, children: [_jsx("div", { className: "absolute inset-0", style: { background: 'var(--inv-deep)' } }), _jsx("div", { className: "absolute inset-0 opacity-30", children: _jsx(TemplateArt, { templateId: templateId, className: "h-full w-full text-[var(--inv-accent)]" }) }), _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_50%_34%,rgba(255,236,201,0.14),transparent_64%)]" }), _jsx("div", { className: "absolute inset-0 grain opacity-60" })] }), _jsx(motion.div, { className: "pointer-events-none absolute inset-0", "aria-hidden": "true", initial: { opacity: 0 }, animate: { opacity: blooming && !reduce ? 1 : 0 }, transition: { duration: 0.7, ease: EASE_SILK }, style: {
                    background: 'radial-gradient(52% 42% at 50% 46%, rgba(255,246,224,0.95), rgba(255,236,201,0.35) 42%, rgba(255,236,201,0) 74%)',
                } }), !reduce && (_jsx("div", { className: "pointer-events-none absolute inset-0 overflow-hidden", "aria-hidden": "true", children: Array.from({ length: 22 }).map((_, i) => {
                    const left = (i * 37) % 100;
                    const delay = (i % 7) * 0.42;
                    const size = 1.4 + (i % 4) * 0.9;
                    return (_jsx(motion.span, { className: "absolute rounded-full", style: {
                            left: `${left}%`,
                            width: size,
                            height: size,
                            background: 'var(--inv-accent)',
                        }, initial: { y: '102vh', opacity: 0 }, animate: { y: '-8vh', opacity: [0, 0.75, 0] }, transition: { duration: 9 + (i % 5) * 1.6, delay, repeat: Infinity, ease: 'linear' } }, i));
                }) })), !embedded && (_jsx("button", { type: "button", onClick: open, className: "absolute right-4 top-4 z-30 rounded-full border border-[var(--inv-deep-ink)]/20 px-4 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[var(--inv-deep-ink)]/65 transition hover:border-[var(--inv-accent)] hover:text-[var(--inv-deep-ink)] sm:right-6 sm:top-6", children: "Skip the theatre" })), _jsxs("div", { className: "relative z-10 flex w-full max-w-[34rem] flex-col items-center px-6 py-16 text-center", children: [_jsx(motion.p, { className: "inv-label !text-[var(--inv-deep-ink)]/55", initial: reduce ? false : { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay: 0.15, ease: EASE_SILK }, children: "You are warmly invited" }), _jsx("span", { className: "mt-3 block overflow-hidden", children: _jsx(motion.span, { className: "block text-[clamp(2.8rem,9vw,4rem)] leading-[1.05] text-[var(--inv-accent)]", style: { fontFamily: 'var(--inv-script)' }, initial: reduce ? false : { y: '108%' }, animate: { y: '0%' }, transition: { duration: 1.15, delay: 0.24, ease: EASE_SILK }, children: guestName && data.settings.showGuestName ? guestName : `${data.coupleA} & ${data.coupleB}` }) }), _jsxs(motion.div, { className: "relative mt-9 w-full", animate: reduce
                            ? {}
                            : {
                                y: blooming ? -26 : rising ? -12 : 0,
                                scale: blooming ? 1.16 : 1,
                                opacity: blooming ? 0 : 1,
                            }, transition: { duration: 0.9, ease: EASE_SILK }, children: [isCurtain ? (_jsx("div", { className: "relative mx-auto w-[78%] max-w-[19rem]", children: _jsxs("div", { className: "relative aspect-[3/4.2] overflow-hidden border border-[var(--inv-line)]/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.65)]", style: { borderRadius: ARCH_TOP }, children: [_jsx("div", { className: "absolute inset-0 bg-[var(--inv-deep)]", children: _jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-3 px-6 text-center", children: [_jsx("span", { className: "text-[2.4rem] text-[var(--inv-accent)]", style: { fontFamily: 'var(--inv-script)' }, children: data.monogram }), _jsx("span", { className: "inv-label !text-[var(--inv-deep-ink)]/60", children: formatDateShort(data.weddingDate) }), _jsx("span", { className: "text-lg text-[var(--inv-deep-ink)]", style: { fontFamily: 'var(--inv-display)' }, children: data.location })] }) }), [
                                            { side: 'left', from: 0, to: '-108%', radius: '52% 0 0 40% / 34% 0 0 30%' },
                                            { side: 'right', from: 1, to: '108%', radius: '0 52% 40% 0 / 0 34% 30% 0' },
                                        ].map((panel) => (_jsx(motion.div, { className: "absolute inset-y-0 w-1/2", style: {
                                                [panel.side]: 0,
                                                borderRadius: panel.radius,
                                                background: 'linear-gradient(180deg, color-mix(in srgb, var(--inv-surface) 96%, #fff), color-mix(in srgb, var(--inv-surface) 88%, var(--inv-line)))',
                                            }, animate: { x: opening2 ? panel.to : '0%', rotate: opening2 ? (panel.from ? 6 : -6) : 0 }, transition: { duration: 1.15, ease: EASE_SILK, delay: opening2 ? 0.05 : 0 }, children: _jsx("div", { className: "absolute inset-0 opacity-25", children: _jsx(TemplateArt, { templateId: templateId, className: "h-full w-full text-[var(--inv-accent)]" }) }) }, panel.side)))] }) })) : (_jsx("div", { className: "mx-auto w-[86%] max-w-[24rem]", style: { perspective: '1200px' }, children: _jsxs("div", { className: "relative aspect-[1.52/1]", children: [_jsx("div", { className: "absolute inset-0 shadow-[0_44px_90px_-36px_rgba(0,0,0,0.75)]", style: {
                                                borderRadius: '26% 26% 16px 16px / 20% 20% 16px 16px',
                                                background: 'var(--inv-surface)',
                                            } }), _jsxs(motion.div, { className: "absolute left-[6%] right-[6%] z-[3] flex flex-col items-center justify-center gap-2 border border-[var(--inv-line)]/60 bg-[var(--inv-bg)] px-4 text-center", style: {
                                                bottom: '8%',
                                                height: '84%',
                                                borderRadius: '46% 46% 12px 12px / 40% 40% 12px 12px',
                                                boxShadow: '0 26px 60px -30px rgba(0,0,0,0.6)',
                                            }, animate: blooming
                                                ? { y: -190, scale: 1.06, opacity: 0 }
                                                : rising
                                                    ? { y: -104, scale: 1, opacity: 1, rotate: -1.2 }
                                                    : { y: 0, scale: 0.98, opacity: 1 }, transition: {
                                                duration: blooming ? 0.9 : 1.05,
                                                ease: blooming ? EASE_SILK : EASE_SEAL,
                                            }, children: [_jsx("span", { className: "text-[2.5rem] leading-none text-[var(--inv-accent)]", style: { fontFamily: 'var(--inv-script)' }, children: data.monogram }), _jsx("span", { className: "inv-label !text-[0.5rem]", children: "The wedding of" }), _jsxs("span", { className: "text-[1.3rem] leading-tight text-[var(--inv-ink)]", style: { fontFamily: 'var(--inv-display)' }, children: [data.coupleA, " & ", data.coupleB] }), _jsx("span", { className: "h-px w-12 bg-[var(--inv-accent)]/50" }), _jsxs("span", { className: "inv-label !text-[0.46rem]", children: [formatDateShort(data.weddingDate), " \u00B7 ", data.location.split(',')[0]] })] }), isRibbon && (_jsx(motion.div, { className: "absolute inset-y-[-6%] left-1/2 z-[5] w-16 -translate-x-1/2", style: {
                                                borderRadius: '999px',
                                                background: 'linear-gradient(90deg, color-mix(in srgb, var(--inv-accent) 76%, #000), var(--inv-accent), color-mix(in srgb, var(--inv-accent) 76%, #000))',
                                                opacity: 0.92,
                                            }, animate: opening2
                                                ? { opacity: 0, scaleY: 0.6, y: -40, rotate: 8 }
                                                : { opacity: 0.92, scaleY: 1, y: 0, rotate: 0 }, transition: { duration: 0.85, ease: EASE_SILK } })), _jsx("div", { className: "absolute inset-0 z-[4] border border-[var(--inv-line)]/45", style: {
                                                clipPath: 'polygon(0 100%, 0 22%, 50% 66%, 100% 22%, 100% 100%)',
                                                background: 'linear-gradient(150deg, color-mix(in srgb, var(--inv-surface) 94%, #fff), color-mix(in srgb, var(--inv-surface) 86%, var(--inv-line)))',
                                            } }), _jsx(motion.div, { className: "absolute inset-0 z-[6] border border-[var(--inv-line)]/35", style: {
                                                clipPath: 'polygon(0 0, 100% 0, 50% 66%)',
                                                background: 'linear-gradient(180deg, color-mix(in srgb, var(--inv-surface) 92%, #fff), color-mix(in srgb, var(--inv-surface) 82%, var(--inv-line)))',
                                                transformOrigin: 'top center',
                                                backfaceVisibility: 'hidden',
                                            }, animate: { rotateX: opening2 ? -172 : 0 }, transition: { duration: 1.05, ease: EASE_SILK } })] }) })), _jsxs(motion.button, { ref: buttonRef, type: "button", onClick: open, "aria-label": "Break the seal and open the invitation", className: "absolute left-1/2 top-[52%] z-[8] grid h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 place-items-center", animate: opening ? { scale: 1.24, opacity: 0, filter: 'blur(6px)' } : { scale: 1, opacity: 1 }, transition: { duration: 0.7, ease: EASE_SEAL }, children: [[
                                        { dx: -26, dy: -18, rotate: -34, clip: 'polygon(0 0, 58% 0, 46% 100%, 0 100%)' },
                                        { dx: 26, dy: -18, rotate: 34, clip: 'polygon(42% 0, 100% 0, 100% 100%, 54% 100%)' },
                                    ].map((half, i) => (_jsx(motion.span, { className: "absolute inset-0 grid place-items-center rounded-full text-[#2b1c0e]", style: {
                                            clipPath: half.clip,
                                            background: 'radial-gradient(circle at 36% 28%, #e0c294, #b5895a 55%, #8f6539 100%)',
                                            boxShadow: '0 20px 40px -14px rgba(0,0,0,0.7)',
                                        }, animate: opening
                                            ? { x: half.dx * 2.4, y: half.dy * 2.2, rotate: half.rotate * 1.6, opacity: 0 }
                                            : { x: 0, y: 0, rotate: 0, opacity: 1 }, transition: { duration: 0.85, ease: EASE_SEAL }, children: _jsx("span", { className: "text-[1.7rem] leading-none", style: { fontFamily: 'var(--inv-script)' }, children: data.monogram }) }, i))), _jsx("span", { className: "absolute inset-[7px] rounded-full border border-[#3a2410]/35", "aria-hidden": "true" })] }), opening && !reduce && (_jsx("div", { className: "pointer-events-none absolute left-1/2 top-[52%] z-[9] -translate-x-1/2 -translate-y-1/2", "aria-hidden": "true", children: Array.from({ length: 14 }).map((_, i) => {
                                    const angle = (i / 14) * Math.PI * 2;
                                    return (_jsx(motion.span, { className: "absolute h-1.5 w-1.5 rounded-full", style: { background: 'var(--inv-accent)' }, initial: { x: 0, y: 0, opacity: 0.9, scale: 1 }, animate: {
                                            x: Math.cos(angle) * (46 + (i % 4) * 12),
                                            y: Math.sin(angle) * (40 + (i % 3) * 10),
                                            opacity: 0,
                                            scale: 0.3,
                                        }, transition: { duration: 1, ease: [0.3, 0.7, 0.4, 1] } }, i));
                                }) }))] }), _jsxs(motion.div, { className: "mt-9", animate: { opacity: opening ? 0 : 1, y: opening ? 10 : 0 }, transition: { duration: 0.4 }, children: [_jsx("button", { type: "button", onClick: open, className: "inv-btn min-w-[16rem] !rounded-full", style: {
                                    background: 'var(--inv-accent)',
                                    color: 'var(--inv-deep)',
                                    borderColor: 'var(--inv-accent)',
                                }, children: isCurtain ? 'Part the curtains' : isRibbon ? 'Draw the ribbon' : 'Break the seal' }), _jsx("p", { className: "mt-3 flex items-center justify-center gap-2 text-[0.6rem] uppercase tracking-[0.18em] text-[var(--inv-deep-ink)]/45", children: data.music.enabled ? (_jsxs(_Fragment, { children: [_jsx(Music2, { size: 12 }), " The soundtrack begins as it opens"] })) : (_jsxs(_Fragment, { children: [_jsx(Volume2, { size: 12 }), " Take your time"] })) })] }), _jsx("p", { className: "mt-10 max-w-xs text-[0.72rem] leading-relaxed text-[var(--inv-deep-ink)]/40", style: { fontFamily: 'var(--inv-body)' }, children: data.tagline })] })] }));
}
