import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Music2, RotateCcw } from 'lucide-react';
import { TemplateArt } from '@/templates/art';
import { DiamondRule, LaurelCrest, RoyalCorner } from '@/templates/ornaments';
import { FASTENING, FasteningPieces, ReleasedCover } from '@/components/invitation/Fastening';

const EASE = [0.22, 0.61, 0.36, 1] as const;
const EASE_PAGE = [0.65, 0, 0.2, 1] as const;

const GREEN = '#10241b';
const GREEN_DEEP = '#081510';
const GOLD = '#d5b274';

/**
 * The invitation on the home page. Closed, it is the cover itself — a
 * photograph of the printed piece, whole, with the names set on its blank
 * face. Tapping runs the same two-act ceremony as the guest gate: first
 * the wax seal cracks and the gold bow unties, only then does the cover
 * part down the middle. Never a page being flipped.
 */
export function EnvelopeTeaser() {
  const [stage, setStage] = useState<'closed' | 'fastening' | 'opening' | 'open'>('closed');
  const reduce = useReducedMotion();
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const open = () => {
    if (stage !== 'closed') return;
    if (reduce) {
      setStage('open');
      return;
    }
    setStage('fastening');
    timers.current.push(window.setTimeout(() => setStage('opening'), 1950));
    timers.current.push(window.setTimeout(() => setStage('open'), 1950 + 1350));
  };

  const reset = () => {
    clearTimers();
    setStage('closed');
  };

  const opening = stage === 'opening';
  const released = stage !== 'closed';

  return (
    <div className="relative mx-auto w-full max-w-[460px] select-none">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[50%] opacity-60 blur-3xl"
        style={{ background: `radial-gradient(ellipse, ${GOLD}1f, transparent 68%)` }}
      />

      <div
        className="relative aspect-[3/4] overflow-hidden shadow-[0_54px_90px_-44px_rgba(12,20,15,0.75)]"
        style={{ containerType: 'inline-size' }}
      >
        <AnimatePresence>
          {stage !== 'open' && (
            <motion.div
              key="cover"
              className="absolute inset-0"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {/* the room — the same photograph, out of focus */}
              <img
                src="/covers/aurelia.jpg"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover"
                style={{ filter: 'blur(24px) saturate(0.92) brightness(0.6)' }}
                draggable={false}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(92% 66% at 50% 32%, transparent 28%, ${GREEN_DEEP}f2 100%)`,
                }}
              />

              {/* the printed piece, whole — two gatefold halves under a live
                  fastening. Act I unties it; Act II parts the halves. */}
              <motion.div
                className="absolute inset-0"
                animate={opening ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.25, delay: opening ? 1.05 : 0 }}
              >
                {(['left', 'right'] as const).map((side) => (
                  <motion.div
                    key={side}
                    className="absolute top-0 bottom-0 overflow-hidden"
                    style={{ [side]: 0, width: '50.4%', zIndex: 10 } as React.CSSProperties}
                    initial={false}
                    animate={opening ? { x: side === 'left' ? '-104%' : '104%' } : { x: '0%' }}
                    transition={{ duration: 1.3, ease: EASE_PAGE }}
                  >
                    <div
                      className="absolute top-0 bottom-0"
                      style={{ width: '198.4%', [side === 'left' ? 'left' : 'right']: 0 } as React.CSSProperties}
                    >
                      <ReleasedCover src="/covers/aurelia.jpg" spec={FASTENING.aurelia} tint="#f8f4ea" />
                    </div>
                  </motion.div>
                ))}
                <div className="absolute inset-0" style={{ zIndex: 20, pointerEvents: 'none' }}>
                  <FasteningPieces src="/covers/aurelia.jpg" spec={FASTENING.aurelia} released={released} />
                </div>
                <motion.div
                  className="relative h-full w-full"
                  style={{ zIndex: 15, pointerEvents: 'none' }}
                  animate={{ opacity: opening ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* the names, printed on the card's blank face */}
                  <div
                    className="absolute left-[23%] right-[31%] top-[17%] text-center"
                    style={{ color: '#33271a', transform: 'rotate(-1.6deg)' }}
                  >
                    <p
                      className="uppercase"
                      style={{ fontFamily: 'var(--font-caps)', fontSize: '1.55cqw', letterSpacing: '0.3em', color: '#6f5b40' }}
                    >
                      Together with our families
                    </p>
                    <p
                      className="mt-[2.4%] leading-[1.02]"
                      style={{ fontFamily: 'var(--font-editorial)', fontSize: '4.7cqw', letterSpacing: '-0.02em' }}
                    >
                      Clara
                      <span
                        className="mx-[0.14em] align-middle"
                        style={{ fontFamily: 'var(--font-script)', fontSize: '0.72em', color: '#9a7c4d', letterSpacing: 0 }}
                      >
                        &amp;
                      </span>
                      Julien
                    </p>
                    <span className="mx-auto mt-[3.4%] flex w-[46%] items-center gap-[3%]" style={{ color: '#a8865c' }} aria-hidden>
                      <span className="h-px flex-1 bg-current opacity-70" />
                      <span className="size-[0.8cqw] rotate-45 border border-current" />
                      <span className="h-px flex-1 bg-current opacity-70" />
                    </span>
                    <p
                      className="mt-[3%] uppercase"
                      style={{ fontFamily: 'var(--font-caps)', fontSize: '1.5cqw', letterSpacing: '0.26em', color: '#5f4d36' }}
                    >
                      22 January 2027<span className="mx-[0.4em] opacity-50">·</span>Lake Como
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <div className="absolute inset-x-0 top-0 flex justify-center pt-[6.4%]">
                <span
                  className="uppercase"
                  style={{
                    fontFamily: 'var(--font-caps)',
                    fontSize: 'clamp(8px, 2.2cqw, 10px)',
                    letterSpacing: '0.42em',
                    color: `${GOLD}b8`,
                    paddingLeft: '0.42em',
                  }}
                >
                  The royal invitation
                </span>
              </div>

              <button
                type="button"
                onClick={open}
                disabled={opening}
                aria-label="Open the invitation"
                className="absolute inset-0 z-30 cursor-pointer disabled:cursor-default"
              />

              <motion.div
                className="absolute inset-x-0 bottom-[5.6%] z-20 flex flex-col items-center gap-[1.6cqw]"
                animate={released ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <span
                  className="uppercase"
                  style={{
                    fontFamily: 'var(--font-caps)',
                    fontSize: 'clamp(8px, 2.3cqw, 10.5px)',
                    letterSpacing: '0.36em',
                    color: `${GOLD}e6`,
                    paddingLeft: '0.36em',
                  }}
                >
                  Tap the seal
                </span>
                <span className="flex items-center gap-1.5 text-[clamp(7px,1.95cqw,9px)] uppercase tracking-[0.2em] text-[#e8d7b8]/55">
                  <Music2 size={10} aria-hidden /> Music begins as it opens
                </span>
              </motion.div>
            </motion.div>
          )}

          {stage === 'open' && (
            <motion.div
              key="open"
              className="absolute inset-0 z-30"
              initial={reduce ? { opacity: 1 } : { y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, ease: EASE_PAGE }}
              style={{
                background: `radial-gradient(120% 70% at 50% 6%, #1d3d2d, ${GREEN} 44%, ${GREEN_DEEP} 100%)`,
                boxShadow: '0 -30px 60px -30px rgba(0,0,0,0.65)',
              }}
            >
              <div className="pointer-events-none absolute inset-0" style={{ color: GOLD }}>
                <TemplateArt templateId="aurelia" className="h-full w-full opacity-[0.2]" />
              </div>
              <div className="cover-damask pointer-events-none absolute inset-0" style={{ color: GOLD, opacity: 0.1 }} />
              <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)' }} />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]"
                style={{ background: `linear-gradient(180deg, ${GREEN}00 0%, ${GREEN}99 42%, ${GREEN_DEEP}e6 100%)` }}
              />

              <div className="pointer-events-none absolute inset-[4.4%] border" style={{ borderColor: `${GOLD}52` }} />
              <div className="pointer-events-none absolute inset-[5.6%] border" style={{ borderColor: `${GOLD}26` }} />
              <div className="pointer-events-none absolute inset-[4.4%]" style={{ color: GOLD }}>
                <RoyalCorner className="absolute left-[-1px] top-[-1px] h-[8cqw] w-[8cqw] opacity-70" />
                <RoyalCorner className="absolute right-[-1px] top-[-1px] h-[8cqw] w-[8cqw] -scale-x-100 opacity-70" />
                <RoyalCorner className="absolute bottom-[-1px] left-[-1px] h-[8cqw] w-[8cqw] -scale-y-100 opacity-70" />
                <RoyalCorner className="absolute bottom-[-1px] right-[-1px] h-[8cqw] w-[8cqw] -scale-100 opacity-70" />
              </div>

              <div className="relative flex h-full flex-col items-center px-[11%] pb-[12%] pt-[10%] text-center text-[#f8f0df]">
                <span
                  className="relative grid h-[17cqw] w-[17cqw] place-items-center rounded-full border"
                  style={{ borderColor: `${GOLD}99`, color: GOLD }}
                >
                  <LaurelCrest className="absolute inset-[6%] h-[88%] w-[88%] opacity-70" />
                  <span
                    className="relative"
                    style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(17px, 6.4cqw, 28px)', lineHeight: 1, paddingTop: '0.12em' }}
                  >
                    C&amp;J
                  </span>
                </span>
                <p
                  className="mt-[4%] uppercase"
                  style={{ fontFamily: 'var(--font-caps)', fontSize: 'clamp(7.5px, 2.2cqw, 9.5px)', letterSpacing: '0.4em', color: `${GOLD}c9` }}
                >
                  You are invited
                </p>

                <div className="flex flex-1 flex-col items-center justify-center">
                  <p
                    className="leading-[0.98]"
                    style={{ fontFamily: 'var(--font-editorial)', fontSize: 'clamp(30px, 9.4cqw, 46px)', letterSpacing: '-0.03em' }}
                  >
                    Clara
                    <span
                      className="mx-[0.18em] inline-block align-middle text-[#e3c68c]"
                      style={{ fontFamily: 'var(--font-script)', fontSize: '0.74em', letterSpacing: 0 }}
                    >
                      &amp;
                    </span>
                    Julien
                  </p>
                  <DiamondRule className="mt-[5.5%] h-[2.2cqw] w-[30%]" />
                  <p
                    className="mt-[4%] uppercase"
                    style={{ fontFamily: 'var(--font-caps)', fontSize: 'clamp(7.5px, 2.2cqw, 9.5px)', letterSpacing: '0.28em', color: 'rgba(248,240,223,0.78)' }}
                  >
                    22 January 2027
                    <span className="mx-[0.5em] opacity-50">·</span>
                    Lake Como
                  </p>
                  <p
                    className="mt-[8%] leading-[1.25]"
                    style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(16px, 4.6cqw, 23px)', color: '#e3cfa4' }}
                  >
                    We would be honoured
                    <br />
                    by your presence
                  </p>
                </div>

                <div className="flex w-full flex-col items-center gap-3.5">
                  <Link
                    to="/i/clara-julien"
                    className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-[clamp(8px,2.2cqw,10px)] font-semibold uppercase tracking-[0.26em] transition hover:brightness-110"
                    style={{ background: `linear-gradient(180deg, #eed9a9, ${GOLD} 55%, #b98f4d)`, color: '#20180f' }}
                  >
                    Step inside
                    <ArrowRight size={13} />
                  </Link>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-[clamp(7px,1.95cqw,9px)] uppercase tracking-[0.24em] text-[#e8d7b8]/60 transition hover:text-[#f3e6cd]"
                    style={{ fontFamily: 'var(--font-caps)' }}
                  >
                    <RotateCcw size={11} /> Seal it again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-[0.6rem] uppercase tracking-[0.24em] text-muted/75">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-burgundy/40" />
          <span className="relative inline-flex size-1.5 rounded-full bg-burgundy/70" />
        </span>
        {stage === 'open' ? 'Aurelia · the royal palette' : 'Tap the seal to open'}
      </p>
    </div>
  );
}
