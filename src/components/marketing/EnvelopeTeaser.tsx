import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { TemplateArt } from '@/templates/art';

const EASE = [0.22, 0.61, 0.36, 1] as const;

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
            <motion.div key="opened" initial={{ opacity: 0, y: 26, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, ease: EASE }} className="absolute inset-0 z-30 overflow-hidden rounded-[4px] border border-[#c09b63]/50 bg-[#17221d] shadow-[0_40px_90px_-35px_rgba(35,23,10,.7)]">
              <TemplateArt templateId="celeste" className="absolute inset-0 h-full w-full text-[#d3b579] opacity-45" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#18251e]/40 via-[#17221d]/20 to-[#0a100d]/90" />
              <div className="absolute inset-5 border border-[#d5b879]/20" />
              <div className="relative flex h-full flex-col items-center justify-between px-8 py-10 text-center text-[#f8f0df]">
                <div><span className="font-script text-[2rem] text-[#d9b477]">C&amp;J</span><p className="mt-5 text-[0.52rem] font-semibold uppercase tracking-[0.36em] text-[#ead9ba]/75">Together with our families</p></div>
                <div><p className="font-editorial text-[2.35rem] leading-none">Clara <span className="font-script text-[#d9b477]">&amp;</span> Julien</p><p className="mt-4 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-[#ead9ba]/75">22 January · Lake Como</p></div>
                <div className="w-full"><Link to="/i/clara-julien" className="inline-flex w-full items-center justify-center gap-2 border border-[#d9b477]/60 bg-[#d9b477] px-5 py-3 text-[0.58rem] font-bold uppercase tracking-[0.22em] text-[#182019]">Step inside the invitation <ArrowRight size={13} /></Link><button type="button" onClick={reset} className="mx-auto mt-4 flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.2em] text-[#ead9ba]/60"><RotateCcw size={11} /> Seal it again</button></div>
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
