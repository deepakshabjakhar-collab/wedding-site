import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { TemplateArt } from '@/templates/art';

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function EnvelopeTeaser() {
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>('closed');
  const [flapOpen, setFlapOpen] = useState(false);
  const reduce = useReducedMotion();
  const timers = useRef<number[]>([]);

  const clearTimers = () => timers.current.forEach((timer) => window.clearTimeout(timer));
  const open = () => {
    if (stage !== 'closed') return;
    if (reduce) return setStage('open');
    setStage('opening');
    setFlapOpen(true);
    timers.current.push(window.setTimeout(() => setStage('open'), 900));
  };
  const reset = () => {
    clearTimers();
    setStage('closed');
    setFlapOpen(false);
  };

  return (
    <div className="relative mx-auto w-full max-w-[440px] select-none">
      <div className="absolute inset-x-6 top-6 bottom-10 rotate-[-3.2deg] rounded-[2px] border border-[#d8c9b4] bg-[#fbf6ec] shadow-[0_30px_60px_-40px_rgba(50,35,20,0.5)]" />
      <div className="absolute inset-x-3 top-3 bottom-12 rotate-[1.6deg] rounded-[2px] border border-[#e0d3c0] bg-[#fdf9f1]" />
      <div className="relative aspect-[4/5]">
        <AnimatePresence mode="wait">
          {stage === 'open' ? (
            <motion.div key="opened" initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: EASE }} className="absolute inset-0 z-30 overflow-hidden rounded-[3px] border border-[#d9c9b3] bg-[#221c15] shadow-[0_40px_80px_-40px_rgba(40,28,16,0.6)]">
              <TemplateArt templateId="aurelia" className="absolute inset-0 h-full w-full text-[#c9a877] opacity-55" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1b120b]/55 via-[#1b120b]/25 to-[#1b120b]/85" />
              <div className="absolute inset-0 flex flex-col items-center justify-between px-7 py-8 text-center text-[#fdf7eb]">
                <div><div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#f0dfc4]/45"><span className="font-script text-[1.4rem]">C&amp;J</span></div><p className="mt-4 text-[0.55rem] font-semibold uppercase tracking-[0.34em] text-[#f1e3cd]/75">Together with our families</p></div>
                <div><p className="font-editorial text-[2.15rem] leading-[1.05]">Clara <span className="font-display text-[#e5cba5]">&amp;</span> Julien</p><p className="mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.28em]">12 June 2027 · Lake Como</p></div>
                <div className="w-full"><Link to="/i/clara-julien" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f3e4cc] px-5 py-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#2a1f15]">Step inside the invitation <ArrowRight size={13} /></Link><button type="button" onClick={reset} className="mx-auto mt-3 flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#f3e7d4]/60"><RotateCcw size={11} /> Seal it again</button></div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="envelope" className="absolute inset-x-0 bottom-[9%] z-10" animate={{ opacity: stage === 'opening' ? 0.78 : 1 }} transition={{ duration: 0.45 }}>
              <div className="relative mx-auto w-[72%]" style={{ perspective: '1100px' }}><div className="relative aspect-[0.72/1] overflow-hidden rounded-[3px] border border-[#dac8ac] bg-[#f8f0e2] shadow-[0_35px_60px_-30px_rgba(50,34,18,0.65)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,#fffaf1_0%,#f1e5d3_72%)]" />
                <div className="absolute inset-[10%] border border-[#c9a777]/40" />
                <div className="absolute inset-y-0 left-1/2 z-[3] w-[18%] -translate-x-1/2 bg-[linear-gradient(90deg,#a87843,#d5ad73_48%,#a87843)] shadow-[0_0_16px_rgba(117,75,34,0.22)]" />
                <div className="absolute inset-x-0 top-[13%] z-[3] h-[11%] bg-[linear-gradient(180deg,#b88850,#d9b47a_48%,#a87642)] shadow-[0_0_14px_rgba(117,75,34,0.18)]" />
                <div className="absolute inset-x-0 bottom-0 z-[2] h-[18%] bg-[#efe1cc]" />
                <div className="absolute inset-x-0 bottom-[10%] z-[4] text-center"><p className="font-editorial text-[1.7rem] italic text-[#392719]">Clara <span className="font-display text-[#ad7f4b]">&amp;</span> Julien</p><p className="mt-2 text-[0.48rem] font-semibold uppercase tracking-[0.28em] text-[#846344]">Our wedding invitation</p></div>
                <motion.button type="button" onClick={open} aria-label="Open the invitation" className="absolute left-1/2 top-[18.5%] z-[6] grid h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[#2d1c0e] shadow-[0_16px_30px_-12px_rgba(40,20,5,0.6),inset_0_1px_2px_rgba(255,255,255,0.35)]" style={{ background: 'radial-gradient(circle at 35% 28%,#d9ba8a,#b5895a 55%,#946b41 100%)' }} animate={{ opacity: flapOpen ? 0 : 1, scale: flapOpen ? 0.5 : 1, rotate: flapOpen ? -22 : 0 }} transition={{ duration: 0.35 }}><span className="absolute inset-[6px] rounded-full border border-[#3a2410]/35" /><span className="font-script text-[1.55rem]">C&amp;J</span></motion.button>
                <motion.div className="absolute inset-0 z-[5] bg-[#f9f0e1]" style={{ transformOrigin: 'top center', backfaceVisibility: 'hidden', clipPath: 'polygon(0 0,100% 0,100% 19%,50% 30%,0 19%)' }} animate={{ rotateX: flapOpen ? -168 : 0, opacity: flapOpen ? 0 : 1 }} transition={{ duration: 0.8, ease: EASE }} />
              </div></div>
              <div className="mt-7 text-center"><button type="button" onClick={open} className="group inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-ink-soft"><span className="grid h-7 w-7 place-items-center rounded-full border border-ink/20"><span className="h-1.5 w-1.5 rounded-full bg-gold" /></span>Tap the seal</button><p className="mt-2 text-[0.65rem] text-muted">A little theatre, before the vows.</p></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
