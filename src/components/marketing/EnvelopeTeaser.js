import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { TemplateArt } from '@/templates/art';
const EASE = [0.22, 0.61, 0.36, 1];
export function EnvelopeTeaser() {
    const [stage, setStage] = useState('closed');
    const [flapOpen, setFlapOpen] = useState(false);
    const [letterOut, setLetterOut] = useState(false);
    const reduce = useReducedMotion();
    const timers = useRef([]);
    const clearTimers = () => {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
    };
    const open = () => {
        if (stage !== 'closed')
            return;
        if (reduce) {
            setStage('open');
            return;
        }
        setStage('opening');
        setFlapOpen(true);
        timers.current.push(window.setTimeout(() => setLetterOut(true), 420));
        timers.current.push(window.setTimeout(() => setStage('open'), 1150));
    };
    const reset = () => {
        clearTimers();
        setStage('closed');
        setFlapOpen(false);
        setLetterOut(false);
    };
    return (_jsxs("div", { className: "relative mx-auto w-full max-w-[440px] select-none", children: [_jsx("div", { className: "absolute inset-x-6 top-6 bottom-10 rotate-[-3.2deg] rounded-[2px] border border-[#d8c9b4] bg-[#fbf6ec] shadow-[0_30px_60px_-40px_rgba(50,35,20,0.5)]" }), _jsx("div", { className: "absolute inset-x-3 top-3 bottom-12 rotate-[1.6deg] rounded-[2px] border border-[#e0d3c0] bg-[#fdf9f1] shadow-[0_18px_40px_-30px_rgba(50,35,20,0.4)]" }), _jsxs("div", { className: "relative aspect-[4/5]", children: [_jsxs("div", { className: `absolute inset-x-8 bottom-[16%] top-[4%] overflow-hidden rounded-t-[999px] border border-[#d9cbb7] bg-[#221c15] transition-all duration-700 ${stage === 'open' ? 'opacity-0' : 'opacity-100'}`, style: { transform: stage === 'open' ? 'scale(1.04)' : 'scale(1)' }, children: [_jsx(TemplateArt, { templateId: "aurelia", className: "absolute inset-0 h-full w-full text-[#c9a877] opacity-50" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-[#20160f]/75 via-transparent to-[#20160f]/35" }), _jsxs("div", { className: "absolute inset-x-0 bottom-10 px-6 text-center text-[#fbf4e8]", children: [_jsx("p", { className: "text-[0.55rem] font-semibold uppercase tracking-[0.32em] text-[#f1e3cd]/80", children: "Villa Serena \u00B7 Lake Como" }), _jsx("p", { className: "mt-2 font-editorial text-[1.5rem] tracking-tight", children: "Clara & Julien" })] })] }), _jsx(motion.div, { className: "absolute right-0 top-2 z-20 rotate-[7deg] bg-[#fbf6ec] px-3 py-2 shadow-[0_10px_24px_-14px_rgba(40,28,16,0.6)]", initial: false, animate: { opacity: stage === 'open' ? 0 : 1, y: stage === 'open' ? -8 : 0 }, transition: { duration: 0.4 }, children: _jsx("p", { className: "font-script text-[1.15rem] leading-none text-[#6b5540]", children: "For you" }) }), _jsx(AnimatePresence, { mode: "wait", children: stage === 'open' ? (_jsx(motion.div, { initial: reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0 }, transition: { duration: 0.7, ease: EASE }, className: "absolute inset-0 z-30 overflow-hidden rounded-[3px] border border-[#d9c9b3] bg-[#fbf6ec] shadow-[0_40px_80px_-40px_rgba(40,28,16,0.6)]", children: _jsxs("div", { className: "relative h-full bg-[#221c15]", children: [_jsx(TemplateArt, { templateId: "aurelia", className: "absolute inset-0 h-full w-full text-[#c9a877] opacity-55" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[#1b120b]/55 via-[#1b120b]/25 to-[#1b120b]/85" }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-between px-7 py-8 text-center text-[#fdf7eb]", children: [_jsxs("div", { children: [_jsx("div", { className: "mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#f0dfc4]/45", children: _jsx("span", { className: "font-script text-[1.4rem] leading-none", children: "C&J" }) }), _jsx("p", { className: "mt-4 text-[0.55rem] font-semibold uppercase tracking-[0.34em] text-[#f1e3cd]/75", children: "Together with our families" })] }), _jsxs("div", { children: [_jsxs("p", { className: "font-editorial text-[2.15rem] leading-[1.05] tracking-tight", children: ["Clara", _jsx("span", { className: "mx-1.5 font-display text-[1.7rem] italic text-[#e5cba5]", children: "&" }), "Julien"] }), _jsx("p", { className: "mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#f1e3cd]/85", children: "12 June 2027 \u00B7 Lake Como" }), _jsx("p", { className: "mx-auto mt-3 max-w-[15rem] font-display text-[0.98rem] italic leading-snug text-[#f3e7d4]/80", children: "\u201CA garden, a lake, and everyone we love.\u201D" })] }), _jsxs("div", { className: "w-full", children: [_jsxs(Link, { to: "/i/clara-julien", className: "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f3e4cc] px-5 py-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#2a1f15] transition hover:bg-[#fff8ec]", children: ["Step inside the invitation", _jsx(ArrowRight, { size: 13 })] }), _jsxs("button", { type: "button", onClick: reset, className: "mx-auto mt-3 flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#f3e7d4]/60 transition hover:text-[#f3e7d4]", children: [_jsx(RotateCcw, { size: 11 }), " Seal it again"] })] })] })] }) }, "opened")) : (_jsxs(motion.div, { className: "absolute inset-x-0 bottom-[9%] z-10", initial: false, animate: { opacity: stage === 'opening' && letterOut ? 0.3 : 1 }, exit: { opacity: 0 }, transition: { duration: 0.5 }, children: [_jsx("div", { className: "relative mx-auto w-[88%]", style: { perspective: '1100px' }, children: _jsxs("div", { className: "relative aspect-[1.48/1]", children: [_jsx("div", { className: "absolute inset-0 rounded-[3px] bg-[#efe6d6] shadow-[0_35px_60px_-30px_rgba(50,34,18,0.65)]" }), _jsxs(motion.div, { className: "absolute bottom-[8%] left-[5%] right-[5%] z-[2] flex flex-col items-center justify-center gap-2 rounded-[2px] border border-[#ddceb8] bg-[#fdf8ef] px-4 pt-6 text-center shadow-[0_-8px_24px_-16px_rgba(50,34,18,0.5)]", style: { height: '86%' }, animate: {
                                                    y: letterOut ? -(reduce ? 0 : 96) : 0,
                                                    scale: letterOut ? 1.02 : 1,
                                                }, transition: { duration: 0.75, ease: EASE }, children: [_jsx("span", { className: "font-script text-[2rem] leading-none text-[#a9835b]", children: "C&J" }), _jsx("span", { className: "text-[0.48rem] font-semibold uppercase tracking-[0.3em] text-[#8a7865]", children: "The wedding of" }), _jsx("span", { className: "font-editorial text-[1.25rem] leading-tight text-[#2b231b]", children: "Clara & Julien" }), _jsx("span", { className: "h-px w-8 bg-[#c9b18d]" }), _jsx("span", { className: "text-[0.5rem] font-semibold uppercase tracking-[0.24em] text-[#8a7865]", children: "Lake Como \u00B7 MMXXVII" })] }), _jsx("div", { className: "absolute inset-0 z-[3]", style: {
                                                    clipPath: 'polygon(0 100%, 0 18%, 50% 63%, 100% 18%, 100% 100%)',
                                                    background: 'linear-gradient(155deg, #fbf4e8 10%, #f2e8d8 80%)',
                                                    border: '1px solid #dcccb6',
                                                } }), _jsx(motion.div, { className: "absolute inset-0 z-[4]", style: {
                                                    clipPath: 'polygon(0 0, 100% 0, 50% 62%)',
                                                    background: 'linear-gradient(180deg, #fdf9f1, #f0e5d4)',
                                                    transformOrigin: 'top center',
                                                    backfaceVisibility: 'hidden',
                                                    border: '1px solid #dcccb6',
                                                }, animate: { rotateX: flapOpen ? -168 : 0 }, transition: { duration: 0.8, ease: EASE } }), _jsxs(motion.button, { type: "button", onClick: open, "aria-label": "Open the invitation", className: "absolute left-1/2 top-[52%] z-[6] grid h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[#2d1c0e] shadow-[0_16px_30px_-12px_rgba(40,20,5,0.6),inset_0_1px_2px_rgba(255,255,255,0.35)]", style: {
                                                    background: 'radial-gradient(circle at 35% 28%, #d9ba8a, #b5895a 55%, #946b41 100%)',
                                                }, animate: {
                                                    opacity: flapOpen ? 0 : 1,
                                                    scale: flapOpen ? 0.5 : stage === 'closed' ? 1 : 0.96,
                                                    rotate: flapOpen ? -22 : 0,
                                                }, whileHover: reduce ? undefined : { scale: 1.07, rotate: -3 }, whileTap: { scale: 0.95 }, transition: { duration: 0.35 }, children: [_jsx("span", { className: "absolute inset-[6px] rounded-full border border-[#3a2410]/35" }), _jsx("span", { className: "font-script text-[1.65rem] leading-none", children: "C&J" })] })] }) }), _jsxs("div", { className: "mt-7 text-center", children: [_jsxs("button", { type: "button", onClick: open, className: "group inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-ink-soft transition hover:text-ink", tabIndex: 0, children: [_jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full border border-ink/20 transition group-hover:border-gold", children: _jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-gold" }) }), "Tap the seal"] }), _jsx("p", { className: "mt-2 text-[0.65rem] text-muted", children: "A little theatre, before the vows." })] })] }, "envelope")) })] })] }));
}
