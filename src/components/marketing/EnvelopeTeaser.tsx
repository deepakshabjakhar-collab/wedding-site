import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { TemplateArt } from '@/templates/art';

const EASE = [0.22, 0.61, 0.36, 1] as const;

const Flourish = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" className={className} aria-hidden="true">
    <path d="M2 46 C2 22 22 2 46 2" />
    <path d="M9 46 C9 26 26 9 46 9" strokeOpacity="0.55" />
    <circle cx="15" cy="15" r="1.7" fill="currentColor" stroke="none" />
    <path d="M21 21 c4 -2.5 8.5 -2 10.5 2" strokeOpacity="0.8" />
  </svg>
);

const RibbonBow = () => (
  <svg viewBox="0 0 120 92" className="h-[74px] w-[96px] drop-shadow-[0_12px_16px_rgba(90,66,32,0.35)]" aria-hidden="true">
    <defs>
      <linearGradient id="vellum-silk" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f2dfa6" />
        <stop offset="0.5" stopColor="#d5ae62" />
        <stop offset="1" stopColor="#a87e3f" />
      </linearGradient>
    </defs>
    <path d="M58 44 C46 60 38 70 26 82 L44 84 C52 68 58 56 63 46 Z" fill="url(#vellum-silk)" />
    <path d="M62 44 C74 60 82 70 94 82 L76 84 C68 68 62 56 57 46 Z" fill="url(#vellum-silk)" />
    <path d="M60 38 C30 6 4 16 13 38 C19 55 44 52 60 41 Z" fill="url(#vellum-silk)" />
    <path d="M60 38 C90 6 116 16 107 38 C101 55 76 52 60 41 Z" fill="url(#vellum-silk)" />
    <path d="M60 38 C30 6 4 16 13 38" fill="none" stroke="#8a6a3c" strokeOpacity="0.4" />
    <path d="M60 38 C90 6 116 16 107 38" fill="none" stroke="#8a6a3c" strokeOpacity="0.4" />
    <rect x="51" y="33" width="18" height="15" rx="5" fill="url(#vellum-silk)" />
    <rect x="51" y="33" width="18" height="15" rx="5" fill="none" stroke="#8a6a3c" strokeOpacity="0.4" />
  </svg>
);

export function EnvelopeTeaser() {
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>('closed');
  const [ribbonLoose, setRibbonLoose] = useState(false);
  const reduce = useReducedMotion();
  const timers = useRef<number[]>([]);

  const clearTimers = () => timers.current.forEach((timer) => window.clearTimeout(timer));
  const open = () => {
    if (stage !== 'closed') return;
    if (reduce) return setStage('open');
    setStage('opening');
    timers.current.push(window.setTimeout(() => setRibbonLoose(true), 900));
    timers.current.push(window.setTimeout(() => setStage('open'), 2200));
  };
  const reset = () => {
    clearTimers();
    setStage('closed');
    setRibbonLoose(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-[440px] select-none">
      <div className="absolute -inset-5 rounded-full bg-[#a67d3f]/10 blur-3xl" />
      <div className="relative aspect-[0.84/1]">
        <AnimatePresence mode="wait">
          {stage === 'open' ? (
            <motion.div key="opened" initial={{ opacity: 0, y: 26, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, ease: EASE }} className="absolute inset-0 z-30 overflow-hidden rounded-[3px] border border-[#c8b088] bg-[#f4eddb] shadow-[0_45px_90px_-35px_rgba(90,66,32,.6)]">
              <TemplateArt templateId="aurelia" className="absolute inset-0 h-full w-full text-[#a8865a] opacity-20" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,252,242,0.85),transparent_62%)]" />
              <div className="absolute inset-4 border border-[#a8865a]/40" />
              <div className="absolute inset-[18px] border border-[#a8865a]/20" />
              <Flourish className="absolute left-5 top-5 h-9 w-9 text-[#a8865a]/70" />
              <Flourish className="absolute right-5 top-5 h-9 w-9 -scale-x-100 text-[#a8865a]/70" />
              <Flourish className="absolute bottom-5 left-5 h-9 w-9 -scale-y-100 text-[#a8865a]/70" />
              <Flourish className="absolute bottom-5 right-5 h-9 w-9 -scale-100 text-[#a8865a]/70" />
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#8a6a3c]/25" />
              <div className="absolute inset-x-0 top-1/2 z-10 h-[6.5%] -translate-y-1/2 bg-[linear-gradient(180deg,#b3854a,#e8cf90_46%,#9c7438)] opacity-90 shadow-[0_6px_14px_-6px_rgba(90,66,32,.5)]" />
              <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"><RibbonBow /></div>
              <div className="absolute left-1/2 top-[11%] z-20 -translate-x-1/2 rounded-[2px] bg-[#fdfaf1] px-7 py-2.5 shadow-[0_12px_26px_-12px_rgba(90,66,32,.5)]">
                <span className="font-script text-[1.55rem] leading-none text-[#7c5a33]">C &amp; J</span>
              </div>
              <div className="relative z-20 flex h-full flex-col items-center justify-between px-8 py-10 text-center">
                <p className="mt-12 text-[0.52rem] font-semibold uppercase tracking-[0.36em] text-[#8a6a3c]">Together with our families</p>
                <div className="rounded-[2px] bg-[#fdfaf1]/85 px-5 py-4 shadow-[0_14px_30px_-16px_rgba(90,66,32,.55)] backdrop-blur-[1px]">
                  <p className="font-editorial text-[2.1rem] leading-none text-[#4c3a22]">Clara <span className="font-script text-[1.5rem] text-[#a8865a]">&amp;</span> Julien</p>
                  <p className="mt-3 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-[#8a6a3c]">12 June 2027 · Lake Como</p>
                </div>
                <div className="w-full">
                  <Link to="/i/clara-julien" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#33291a] px-5 py-3 text-[0.58rem] font-bold uppercase tracking-[0.24em] text-[#f6edda] shadow-[0_16px_30px_-14px_rgba(51,41,26,.8)] transition hover:bg-[#4a3a24]">Step inside <ArrowRight size={13} /></Link>
                  <button type="button" onClick={reset} className="mx-auto mt-4 flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.22em] text-[#8a6a3c] transition hover:text-[#4c3a22]"><RotateCcw size={11} /> Seal it again</button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="card" className="absolute inset-0 z-10" animate={{ opacity: stage === 'opening' ? 0.96 : 1 }}>
              <div className="relative mx-auto h-full w-[88%] overflow-hidden rounded-[4px] border border-[#bd9658]/55 bg-[#17211b] shadow-[0_40px_80px_-30px_rgba(37,25,12,.72)]">
                <TemplateArt templateId="celeste" className="absolute inset-0 h-full w-full text-[#c8aa70] opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#18251e]/20 via-transparent to-[#09100c]/75" />
                <div className="absolute inset-5 border border-[#d5b879]/20" />
                <div className="relative flex h-full flex-col items-center justify-between px-6 py-9 text-center text-[#f6eddb]">
                  <div><span className="font-script text-[2rem] text-[#d8b477]">C&amp;J</span><span className="mx-auto mt-5 block h-px w-12 bg-[#d8b477]/60" /><p className="mt-5 text-[0.5rem] font-semibold uppercase tracking-[0.34em] text-[#e8d7b8]/75">A wedding invitation</p></div>
                  <div><p className="font-editorial text-[2.2rem] leading-none">Clara <span className="font-script text-[#d8b477]">&amp;</span> Julien</p><p className="mt-4 text-[0.53rem] font-semibold uppercase tracking-[0.28em] text-[#e8d7b8]/75">22 January · Villa Serena</p></div>
                  <p className="font-display text-[0.95rem] italic text-[#e1c694]/80">An evening to remember</p>
                </div>
                <motion.div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-[16%] -translate-x-1/2 bg-[linear-gradient(90deg,#79552c,#d3ad6e_48%,#79552c)] shadow-[0_0_22px_rgba(0,0,0,.25)]" animate={{ x: ribbonLoose ? '-160%' : '-50%', rotate: ribbonLoose ? -8 : 0, opacity: ribbonLoose ? 0 : 1 }} transition={{ duration: 1.2, ease: EASE }} />
                <motion.div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-[13%] -translate-y-1/2 bg-[linear-gradient(180deg,#79552c,#d3ad6e_48%,#79552c)] shadow-[0_0_22px_rgba(0,0,0,.25)]" animate={{ x: ribbonLoose ? '160%' : 0, rotate: ribbonLoose ? 8 : 0, opacity: ribbonLoose ? 0 : 1 }} transition={{ duration: 1.2, ease: EASE }} />
                <motion.button type="button" onClick={open} aria-label="Open the invitation" className="absolute left-1/2 top-1/2 z-30 grid size-[76px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#edcf96]/60 text-[#2d1c0e] shadow-[0_18px_32px_-10px_rgba(0,0,0,.7)]" style={{ background: 'radial-gradient(circle at 35% 28%,#dfbd7e,#b28148 58%,#80572d 100%)' }} animate={{ scale: ribbonLoose ? 0.7 : 1, opacity: ribbonLoose ? 0 : 1, rotate: ribbonLoose ? -20 : 0 }} transition={{ duration: 0.55 }}><span className="absolute inset-1.5 rounded-full border border-[#39240f]/45" /><span className="font-script text-[1.65rem]">C&amp;J</span></motion.button>
              </div>
              <div className="mt-6 text-center"><button type="button" onClick={open} className="group inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-ink-soft"><span className="grid size-7 place-items-center rounded-full border border-ink/20"><span className="size-1.5 rounded-full bg-gold" /></span>{stage === 'opening' ? 'The ribbon is loosening' : 'Draw the ribbon'}</button><p className="mt-2 text-[0.62rem] text-muted">A royal entrance, before the vows.</p></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
