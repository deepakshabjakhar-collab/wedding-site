import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { TemplateArt, WaxSeal } from '@/templates/art';
import { RoyalCorner, LaurelCrest, DiamondRule } from '@/templates/ornaments';

const EASE = [0.22, 0.61, 0.36, 1] as const;
const EASE_PAGE = [0.65, 0, 0.2, 1] as const;

const GREEN = '#10241b';
const GREEN_DEEP = '#081510';
const GREEN_LIGHT = '#19382a';
const GOLD = '#d5b274';
const GOLD_SOFT = '#a8865a';
const CREAM = '#fbf5e7';
const CREAM_DEEP = '#f1e6d0';
const INK = '#241d14';
const WAX = '#6d2638';

const STAGE_BACKGROUND = `
  radial-gradient(90% 62% at 50% 10%, rgba(102,141,110,0.36), transparent 64%),
  radial-gradient(70% 50% at 50% 110%, rgba(0,0,0,0.6), transparent 70%),
  linear-gradient(168deg, ${GREEN_LIGHT} 0%, ${GREEN} 46%, ${GREEN_DEEP} 100%)
`;

/**
 * The invitation on the home page: a royal cover — deep boxwood velvet, foil
 * ornament, a cream plate tied with silk and sealed in burgundy wax. Opening it
 * is a page lift, never a zoom.
 */
export function EnvelopeTeaser() {
  const [stage, setStage] = useState<'closed' | 'opening' | 'open'>('closed');
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
    setStage('opening');
    timers.current.push(window.setTimeout(() => setStage('open'), 1500));
  };

  const reset = () => {
    clearTimers();
    setStage('closed');
  };

  const opening = stage === 'opening';

  return (
    <div className="relative mx-auto w-full max-w-[440px] select-none">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[50%] opacity-70 blur-3xl"
        style={{ background: `radial-gradient(ellipse, ${GOLD}22, transparent 68%)` }}
      />

      <div
        className="relative aspect-[0.79/1] overflow-hidden shadow-[0_50px_90px_-40px_rgba(20,32,24,0.8)]"
        style={{ background: STAGE_BACKGROUND, containerType: 'inline-size' }}
      >
        {/* velvet engraving + grain */}
        <div className="pointer-events-none absolute inset-0" style={{ color: GOLD }}>
          <TemplateArt templateId="aurelia" className="h-full w-full opacity-[0.16]" />
        </div>
        <div className="cover-damask pointer-events-none absolute inset-0" style={{ color: GOLD, opacity: 0.1 }} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 0 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        />

        {/* gold keylines on the velvet stage */}
        <div className="pointer-events-none absolute inset-[3.4%] border" style={{ borderColor: `${GOLD}66` }} />
        <div className="pointer-events-none absolute inset-[4.6%] border" style={{ borderColor: `${GOLD}2e` }} />
        <div className="pointer-events-none absolute inset-[3.4%]" style={{ color: GOLD }}>
          <RoyalCorner className="absolute left-[-1px] top-[-1px] h-[9.5cqw] w-[9.5cqw] opacity-80" />
          <RoyalCorner className="absolute right-[-1px] top-[-1px] h-[9.5cqw] w-[9.5cqw] -scale-x-100 opacity-80" />
          <RoyalCorner className="absolute bottom-[-1px] left-[-1px] h-[9.5cqw] w-[9.5cqw] -scale-y-100 opacity-80" />
          <RoyalCorner className="absolute bottom-[-1px] right-[-1px] h-[9.5cqw] w-[9.5cqw] -scale-100 opacity-80" />
        </div>

        <AnimatePresence>
          {stage !== 'open' && (
            <motion.div
              key="cover"
              className="absolute inset-0 z-10"
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14, transition: { duration: 0.55, ease: EASE } }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <span
                className="absolute inset-x-0 top-[5.6%] z-20 text-center text-[clamp(8px,2.3cqw,10.5px)] uppercase"
                style={{ fontFamily: 'var(--font-caps)', letterSpacing: '0.42em', color: `${GOLD}d9` }}
              >
                The royal invitation
              </span>

              {/* the cream plate, closed with silk and wax */}
              <motion.div
                className="absolute inset-x-[9.5%] top-[10.2%] bottom-[17.4%] overflow-hidden"
                style={{
                  background: `linear-gradient(163deg, #fffdf6 0%, ${CREAM} 42%, ${CREAM_DEEP} 100%)`,
                  color: INK,
                  boxShadow: '0 34px 60px -30px rgba(0,0,0,0.7), 0 2px 0 rgba(255,255,255,0.4) inset',
                }}
                animate={opening ? { y: '-2.4%' } : { y: '0%' }}
                transition={{ duration: 1.5, ease: EASE }}
              >
                <div className="pointer-events-none absolute inset-0" style={{ color: GOLD }}>
                  <TemplateArt templateId="aurelia" className="h-full w-full opacity-[0.13]" />
                </div>
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(78% 46% at 50% 0%, rgba(255,255,255,0.85), transparent 62%), radial-gradient(60% 40% at 50% 100%, rgba(168,134,90,0.14), transparent 70%)',
                  }}
                />
                <div className="pointer-events-none absolute inset-[4%] border" style={{ borderColor: `${GOLD}99` }} />
                <div className="pointer-events-none absolute inset-[5.4%] border" style={{ borderColor: `${GOLD}4d` }} />
                <div className="pointer-events-none absolute inset-[4%]" style={{ color: GOLD }}>
                  <RoyalCorner className="absolute left-[-1px] top-[-1px] h-[8.4cqw] w-[8.4cqw] opacity-90" />
                  <RoyalCorner className="absolute right-[-1px] top-[-1px] h-[8.4cqw] w-[8.4cqw] -scale-x-100 opacity-90" />
                  <RoyalCorner className="absolute bottom-[-1px] left-[-1px] h-[8.4cqw] w-[8.4cqw] -scale-y-100 opacity-90" />
                  <RoyalCorner className="absolute bottom-[-1px] right-[-1px] h-[8.4cqw] w-[8.4cqw] -scale-100 opacity-90" />
                </div>

                <div className="absolute inset-0 px-[9%] pt-[8.6%] text-center">
                  {/* crest */}
                  <span
                    className="relative mx-auto grid h-[17cqw] w-[17cqw] place-items-center rounded-full border"
                    style={{ borderColor: `${GOLD}80`, color: GOLD_SOFT }}
                  >
                    <LaurelCrest className="absolute inset-[6%] h-[88%] w-[88%] opacity-55" />
                    <span
                      className="relative"
                      style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(15px, 6.6cqw, 26px)', lineHeight: 1, paddingTop: '0.14em', color: WAX }}
                    >
                      C&amp;J
                    </span>
                  </span>

                  <p
                    className="mx-auto mt-[4.4%] uppercase"
                    style={{ fontFamily: 'var(--font-caps)', fontSize: 'clamp(7.5px, 2.35cqw, 10px)', letterSpacing: '0.34em', color: '#7d6a52' }}
                  >
                    Together with our families
                  </p>

                  <p
                    className="mx-auto mt-[4%] leading-[1.02]"
                    style={{
                      fontFamily: 'var(--font-editorial)',
                      fontSize: 'clamp(26px, 7.9cqw, 38px)',
                      letterSpacing: '-0.028em',
                      color: INK,
                    }}
                  >
                    Clara
                    <span
                      className="mx-[2.4%] inline-block align-middle"
                      style={{ fontFamily: 'var(--font-script)', fontSize: '0.72em', color: GOLD_SOFT, letterSpacing: 0 }}
                    >
                      &amp;
                    </span>
                    Julien
                  </p>

                  <span className="mx-auto mt-[4.4%] flex w-[46%] items-center justify-center gap-[2%]" style={{ color: GOLD }} aria-hidden>
                    <span className="h-px flex-1 bg-current opacity-60" />
                    <span className="size-[1.1cqw] rotate-45 border border-current" />
                    <span className="h-px flex-1 bg-current opacity-60" />
                  </span>

                  <p
                    className="mt-[4.2%] uppercase"
                    style={{ fontFamily: 'var(--font-caps)', fontSize: 'clamp(8px, 2.45cqw, 10.5px)', letterSpacing: '0.26em', color: '#6f5c45' }}
                  >
                    22 January 2027
                    <span className="mx-[2%] opacity-45">·</span>
                    Lake Como
                  </p>

                  <div className="absolute inset-x-0 bottom-[6.4%] flex flex-col items-center">
                    <span
                      className="text-[clamp(6.5px,1.95cqw,8px)] uppercase"
                      style={{ fontFamily: 'var(--font-caps)', letterSpacing: '0.34em', color: '#8a7458' }}
                    >
                      Villa Serena · An invitation
                    </span>
                  </div>

                  {/* silk belly band, tied below the words */}
                  <motion.div
                    className="absolute"
                    style={{ top: '68.4%', height: '10.2%', left: '-9%', right: '-9%' }}
                    animate={opening ? { y: '200%', opacity: 0 } : { y: '0%', opacity: 1 }}
                    transition={{ duration: 1.1, ease: EASE_PAGE }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'repeating-linear-gradient(96deg, rgba(255,255,255,0.16) 0 2px, transparent 2px 7px), linear-gradient(180deg, #a9803f 0%, #e8cd93 26%, #f3e2b8 50%, #d3ac6d 74%, #9c7438 100%)',
                        boxShadow: '0 10px 18px -12px rgba(60,40,16,0.55), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(80,52,18,0.35)',
                      }}
                    />
                    <div className="absolute inset-y-0 left-[7%] w-px bg-[#7d5a2b]/35" />
                    <div className="absolute inset-y-0 right-[7%] w-px bg-[#7d5a2b]/35" />
                  </motion.div>

                  <motion.div
                    className="absolute left-1/2 z-20 -translate-x-1/2"
                    style={{ top: '63.4%' }}
                    animate={opening ? { y: 30, opacity: 0 } : { y: 0, opacity: 1 }}
                    transition={{ duration: 0.85, ease: EASE }}
                  >
                    <span className="block" style={{ color: WAX }}>
                      <WaxSeal
                        monogram="C&J"
                        cracked={false}
                        className="h-[19.5cqw] w-[19.5cqw] drop-shadow-[0_12px_16px_rgba(40,16,22,0.45)]"
                      />
                    </span>
                  </motion.div>
                </div>
              </motion.div>

              <button
                type="button"
                onClick={open}
                disabled={opening}
                aria-label="Open the invitation"
                className="absolute inset-0 z-30 cursor-pointer disabled:cursor-default"
              />

              <div className="absolute inset-x-0 bottom-[5%] z-20 flex flex-col items-center gap-[1cqw]">
                <span
                  className="text-[clamp(8px,2.35cqw,10.5px)] uppercase"
                  style={{ fontFamily: 'var(--font-caps)', letterSpacing: '0.34em', color: `${GOLD}e6` }}
                >
                  {opening ? 'Lifting the seal' : 'Tap the seal'}
                </span>
                <span className="text-[clamp(7.5px,2.1cqw,9.5px)] italic" style={{ color: 'rgba(245,235,214,0.6)' }}>
                  A little theatre, before the vows
                </span>
              </div>
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
                background: STAGE_BACKGROUND,
                boxShadow: '0 -30px 60px -30px rgba(0,0,0,0.65)',
              }}
            >
              <div className="pointer-events-none absolute inset-0" style={{ color: GOLD }}>
                <TemplateArt templateId="aurelia" className="h-full w-full opacity-[0.2]" />
              </div>
              <div className="cover-damask pointer-events-none absolute inset-0" style={{ color: GOLD, opacity: 0.1 }} />
              <div
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)' }}
              />
              {/* the light falls away at the foot of the card, so the seal's echo and the
                  gold step read cleanly against the velvet */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]"
                style={{ background: `linear-gradient(180deg, ${GREEN}00 0%, ${GREEN}99 42%, ${GREEN_DEEP}e6 100%)` }}
              />

              {/* the inside of the card: one gilded frame, like the cover */}
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

      <p className="mt-4 text-center text-[0.62rem] uppercase tracking-[0.24em] text-muted/70">
        Cover · Aurelia, in the royal palette
      </p>
    </div>
  );
}
