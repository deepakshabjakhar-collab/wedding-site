import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { TemplateArt } from '@/templates/art';

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function EnvelopeTeaser() {
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>('closed');
  const [flapOpen, setFlapOpen] = useState(false);
  const [letterOut, setLetterOut] = useState(false);
  const reduce = useReducedMotion();
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const open = () => {
    if (stage !== 'closed') return;
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

  return (
    <div className="relative mx-auto w-full max-w-[440px] select-none">
      {/* paper stack */}
      <div className="absolute inset-x-6 top-6 bottom-10 rotate-[-3.2deg] rounded-[2px] border border-[#d8c9b4] bg-[#fbf6ec] shadow-[0_30px_60px_-40px_rgba(50,35,20,0.5)]" />
      <div className="absolute inset-x-3 top-3 bottom-12 rotate-[1.6deg] rounded-[2px] border border-[#e0d3c0] bg-[#fdf9f1] shadow-[0_18px_40px_-30px_rgba(50,35,20,0.4)]" />

      <div className="relative aspect-[4/5]">
        {/* the invitation behind the envelope */}
        <div
          className={`absolute inset-x-8 bottom-[16%] top-[4%] overflow-hidden rounded-t-[999px] border border-[#d9cbb7] bg-[#221c15] transition-all duration-700 ${
            stage === 'open' ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ transform: stage === 'open' ? 'scale(1.04)' : 'scale(1)' }}
        >
          <TemplateArt templateId="aurelia" className="absolute inset-0 h-full w-full text-[#c9a877] opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#20160f]/75 via-transparent to-[#20160f]/35" />
          <div className="absolute inset-x-0 bottom-10 px-6 text-center text-[#fbf4e8]">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.32em] text-[#f1e3cd]/80">
              Villa Serena · Lake Como
            </p>
            <p className="mt-2 font-editorial text-[1.5rem] tracking-tight">Clara &amp; Julien</p>
          </div>
        </div>

        {/* tag */}
        <motion.div
          className="absolute right-0 top-2 z-20 rotate-[7deg] bg-[#fbf6ec] px-3 py-2 shadow-[0_10px_24px_-14px_rgba(40,28,16,0.6)]"
          initial={false}
          animate={{ opacity: stage === 'open' ? 0 : 1, y: stage === 'open' ? -8 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="font-script text-[1.15rem] leading-none text-[#6b5540]">For you</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {stage === 'open' ? (
            <motion.div
              key="opened"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="absolute inset-0 z-30 overflow-hidden rounded-[3px] border border-[#d9c9b3] bg-[#fbf6ec] shadow-[0_40px_80px_-40px_rgba(40,28,16,0.6)]"
            >
              <div className="relative h-full bg-[#221c15]">
                <TemplateArt templateId="aurelia" className="absolute inset-0 h-full w-full text-[#c9a877] opacity-55" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1b120b]/55 via-[#1b120b]/25 to-[#1b120b]/85" />
                <div className="absolute inset-0 flex flex-col items-center justify-between px-7 py-8 text-center text-[#fdf7eb]">
                  <div>
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#f0dfc4]/45">
                      <span className="font-script text-[1.4rem] leading-none">C&amp;J</span>
                    </div>
                    <p className="mt-4 text-[0.55rem] font-semibold uppercase tracking-[0.34em] text-[#f1e3cd]/75">
                      Together with our families
                    </p>
                  </div>
                  <div>
                    <p className="font-editorial text-[2.15rem] leading-[1.05] tracking-tight">
                      Clara
                      <span className="mx-1.5 font-display text-[1.7rem] italic text-[#e5cba5]">&amp;</span>
                      Julien
                    </p>
                    <p className="mt-3 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#f1e3cd]/85">
                      12 June 2027 · Lake Como
                    </p>
                    <p className="mx-auto mt-3 max-w-[15rem] font-display text-[0.98rem] italic leading-snug text-[#f3e7d4]/80">
                      “A garden, a lake, and everyone we love.”
                    </p>
                  </div>
                  <div className="w-full">
                    <Link
                      to="/i/clara-julien"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#f3e4cc] px-5 py-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#2a1f15] transition hover:bg-[#fff8ec]"
                    >
                      Step inside the invitation
                      <ArrowRight size={13} />
                    </Link>
                    <button
                      type="button"
                      onClick={reset}
                      className="mx-auto mt-3 flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#f3e7d4]/60 transition hover:text-[#f3e7d4]"
                    >
                      <RotateCcw size={11} /> Seal it again
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="envelope"
              className="absolute inset-x-0 bottom-[9%] z-10"
              initial={false}
              animate={{ opacity: stage === 'opening' && letterOut ? 0.3 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative mx-auto w-[88%]" style={{ perspective: '1100px' }}>
                <div className="relative aspect-[1.48/1]">
                  <div className="absolute inset-0 rounded-[3px] bg-[#efe6d6] shadow-[0_35px_60px_-30px_rgba(50,34,18,0.65)]" />

                  {/* letter */}
                  <motion.div
                    className="absolute bottom-[8%] left-[5%] right-[5%] z-[2] flex flex-col items-center justify-center gap-2 rounded-[2px] border border-[#ddceb8] bg-[#fdf8ef] px-4 pt-6 text-center shadow-[0_-8px_24px_-16px_rgba(50,34,18,0.5)]"
                    style={{ height: '86%' }}
                    animate={{
                      y: letterOut ? -(reduce ? 0 : 96) : 0,
                      scale: letterOut ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.75, ease: EASE }}
                  >
                    <span className="font-script text-[2rem] leading-none text-[#a9835b]">C&amp;J</span>
                    <span className="text-[0.48rem] font-semibold uppercase tracking-[0.3em] text-[#8a7865]">
                      The wedding of
                    </span>
                    <span className="font-editorial text-[1.25rem] leading-tight text-[#2b231b]">
                      Clara &amp; Julien
                    </span>
                    <span className="h-px w-8 bg-[#c9b18d]" />
                    <span className="text-[0.5rem] font-semibold uppercase tracking-[0.24em] text-[#8a7865]">
                      Lake Como · MMXXVII
                    </span>
                  </motion.div>

                  {/* pockets */}
                  <div
                    className="absolute inset-0 z-[3]"
                    style={{
                      clipPath: 'polygon(0 100%, 0 18%, 50% 63%, 100% 18%, 100% 100%)',
                      background: 'linear-gradient(155deg, #fbf4e8 10%, #f2e8d8 80%)',
                      border: '1px solid #dcccb6',
                    }}
                  />
                  {/* flap */}
                  <motion.div
                    className="absolute inset-0 z-[4]"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 50% 62%)',
                      background: 'linear-gradient(180deg, #fdf9f1, #f0e5d4)',
                      transformOrigin: 'top center',
                      backfaceVisibility: 'hidden',
                      border: '1px solid #dcccb6',
                    }}
                    animate={{ rotateX: flapOpen ? -168 : 0 }}
                    transition={{ duration: 0.8, ease: EASE }}
                  />

                  {/* seal */}
                  <motion.button
                    type="button"
                    onClick={open}
                    aria-label="Open the invitation"
                    className="absolute left-1/2 top-[52%] z-[6] grid h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[#2d1c0e] shadow-[0_16px_30px_-12px_rgba(40,20,5,0.6),inset_0_1px_2px_rgba(255,255,255,0.35)]"
                    style={{
                      background:
                        'radial-gradient(circle at 35% 28%, #d9ba8a, #b5895a 55%, #946b41 100%)',
                    }}
                    animate={{
                      opacity: flapOpen ? 0 : 1,
                      scale: flapOpen ? 0.5 : stage === 'closed' ? 1 : 0.96,
                      rotate: flapOpen ? -22 : 0,
                    }}
                    whileHover={reduce ? undefined : { scale: 1.07, rotate: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                  >
                    <span className="absolute inset-[6px] rounded-full border border-[#3a2410]/35" />
                    <span className="font-script text-[1.65rem] leading-none">C&amp;J</span>
                  </motion.button>
                </div>
              </div>

              <div className="mt-7 text-center">
                <button
                  type="button"
                  onClick={open}
                  className="group inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-ink-soft transition hover:text-ink"
                  tabIndex={0}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-ink/20 transition group-hover:border-gold">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  </span>
                  Tap the seal
                </button>
                <p className="mt-2 text-[0.65rem] text-muted">A little theatre, before the vows.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
