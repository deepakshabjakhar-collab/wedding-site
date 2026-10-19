import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import type { InvitationData } from '@shared/types';
import { getTemplate } from '@/templates/registry';
import { coverTokens } from '@/templates/cover';
import { WaxSeal } from '@/templates/art';
import { RoyalCorner } from '@/templates/ornaments';
import { playCinematicOpening, type OpeningSoundHandle } from '@/lib/openingSound';
import { formatDateShort } from '@/lib/format';
import { OpeningLetter } from './OpeningLetter';
import { RibbonBand, SilkBow, type SilkTones } from './SilkBow';
import { t } from './i18n';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_FLAP = [0.6, 0, 0.24, 1] as const;
const EASE_DRAW = [0.33, 0.72, 0.24, 1] as const;

/** Silk, dyed for each ribbon world. */
const RIBBON_TONES: Record<string, SilkTones> = {
  maison: { light: '#c2ceb2', mid: '#7d8b6a', dark: '#4f603c' },
  salento: { light: '#eda87e', mid: '#c06a3d', dark: '#8a3f20' },
  heirloom: { light: '#e2c491', mid: '#a97e4e', dark: '#71522c' },
  miel: { light: '#f2d18d', mid: '#d9a44f', dark: '#9c6f27' },
  celeste: { light: '#eef1f8', mid: '#b3c0da', dark: '#7488ad' },
};
const GOLD_TONES: SilkTones = { light: '#f4e2ab', mid: '#d5ae62', dark: '#8f6c30' };
const SEAL_COLOUR: Record<string, string> = {
  aurelia: '#7b2938',
  belgrave: '#8a6a2f',
  noir: '#2a2c30',
  celeste: '#93a7cf',
};

/**
 * The Sponsalia ceremony, in our own stationery: an envelope, closed by
 * a silk bow or a wax seal, on a darkened stage.
 *
 *   I.   The fastening undoes itself — the bow unties, the seal cracks.
 *   II.  The flap swings open on its fold.
 *   III. The letter is drawn up out of the pocket, the envelope falls
 *        away beneath it, and the letter becomes the invitation.
 *
 * One scene, one unbroken piece of physical motion.
 */
export function EnvelopeGate({
  data,
  templateId,
  guestName,
  onOpen,
  onIntent,
  embedded,
  bottomInset = 0,
}: {
  data: InvitationData;
  templateId: string;
  guestName?: string;
  onOpen: () => void;
  onIntent?: () => void;
  embedded?: boolean;
  bottomInset?: number;
}) {
  const reduce = useReducedMotion();
  const template = getTemplate(templateId);
  const { gateBg, gateInk } = template.art;
  const tokens = coverTokens(template);
  const language = data.settings.language;
  const sealed = template.envelope === 'seal' || template.envelope === 'curtain';
  const tones = RIBBON_TONES[template.id] ?? GOLD_TONES;

  /** 0 closed · 1 fastening · 2 flap · 3 letter drawn */
  const [phase, setPhase] = useState(0);
  const started = useRef(false);
  const timers = useRef<number[]>([]);
  const sound = useRef<OpeningSoundHandle | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!embedded) buttonRef.current?.focus({ preventScroll: true });
    const previousOverflow = document.body.style.overflow;
    if (!embedded) document.body.style.overflow = 'hidden';
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      sound.current?.release(400);
      if (!embedded) document.body.style.overflow = previousOverflow;
    };
  }, [embedded]);

  const open = () => {
    if (started.current) return;
    started.current = true;
    onIntent?.();
    if (!reduce) sound.current = playCinematicOpening(template.envelope);
    if (reduce) {
      onOpen();
      return;
    }
    const fastenMs = sealed ? 1500 : 1850;
    timers.current.push(window.setTimeout(() => setPhase(1), 60));
    timers.current.push(window.setTimeout(() => setPhase(2), fastenMs));
    timers.current.push(window.setTimeout(() => setPhase(3), fastenMs + 1250));
    timers.current.push(window.setTimeout(onOpen, fastenMs + 1250 + 1850));
  };

  const fastening = phase >= 1;
  const flapOpen = phase >= 2;
  const drawn = phase >= 3;
  const upper = template.cover.namesCase === 'upper';
  const caption =
    phase === 1
      ? sealed
        ? 'The seal is broken…'
        : 'The ribbon comes undone…'
      : phase === 2
        ? 'The envelope opens…'
        : phase === 3
          ? t(language, 'reveal')
          : '';

  const paper = `linear-gradient(160deg, color-mix(in srgb, ${tokens.bg} 94%, #fff) 0%, ${tokens.bg} 52%, color-mix(in srgb, ${tokens.bg} 86%, ${tokens.accentSoft}) 100%)`;
  const paperDeep = `linear-gradient(200deg, color-mix(in srgb, ${tokens.bg} 88%, ${tokens.accentSoft}) 0%, color-mix(in srgb, ${tokens.bg} 80%, #000) 130%)`;

  return (
    <motion.div
      className={`inv-gate inv-gate-open ${embedded ? 'inv-gate-embedded' : ''}`}
      style={{ background: gateBg, '--gate-bottom': embedded ? '0px' : `${bottomInset}px` } as React.CSSProperties}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_SILK }}
    >
      {/* the room: a pool of light on the template's own colour */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(88% 60% at 50% 40%, color-mix(in srgb, ${gateInk} 15%, transparent), transparent 62%), linear-gradient(180deg, rgba(0,0,0,0.26), transparent 30%, transparent 70%, rgba(0,0,0,0.36))`,
        }}
      />

      <div className="inv-gate-ceremony">
        <motion.span
          className="inv-gate-cover-kicker"
          style={{ color: gateInk, textShadow: 'none' }}
          animate={{ opacity: fastening ? 0 : 0.92, y: fastening ? -8 : 0 }}
          transition={{ duration: 0.45, ease: EASE_SILK }}
        >
          {guestName && data.settings.showGuestName ? `${t(language, 'forGuest')} ${guestName}` : 'You are invited'}
        </motion.span>

        {/* ---------------------------------------------------------- */}
        {/* the envelope                                                */}
        {/* ---------------------------------------------------------- */}
        <div className="inv-gate-cardbox" style={{ perspective: '1500px', overflow: 'visible', background: 'transparent', boxShadow: 'none' }}>
          {/* the letter, inside the envelope */}
          <motion.div
            className="absolute"
            style={{ inset: '3.5% 5%', zIndex: 1, boxShadow: '0 24px 44px -20px rgba(24,16,6,0.55)' }}
            initial={false}
            animate={
              drawn
                ? { y: '-1.5%', scale: 1, opacity: 1 }
                : flapOpen
                  ? { y: '-13%', scale: 0.985, opacity: 1 }
                  : { y: '0%', scale: 0.985, opacity: 1 }
            }
            transition={{ duration: drawn ? 1.5 : 1.15, ease: EASE_DRAW }}
            aria-hidden={!flapOpen}
          >
            <OpeningLetter
              template={template}
              data={{
                coupleA: data.coupleA,
                coupleB: data.coupleB,
                monogram: data.monogram,
                weddingDate: data.weddingDate,
                location: data.location,
              }}
              guestName={guestName && data.settings.showGuestName ? `${t(language, 'forGuest')} ${guestName}` : undefined}
            />
          </motion.div>

          {/* the pocket (envelope front) — falls away as the letter is drawn */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0"
            style={{
              height: '63%',
              zIndex: 3,
              background: paper,
              clipPath: 'polygon(0 0, 50% 27%, 100% 0, 100% 100%, 0 100%)',
              boxShadow: '0 -18px 34px -22px rgba(24,16,6,0.5)',
            }}
            initial={false}
            animate={drawn ? { y: '112%', opacity: 0.4 } : { y: '0%', opacity: 1 }}
            transition={{ duration: 1.35, ease: EASE_DRAW }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(115deg, rgba(30,20,8,0.14) 0%, transparent 34%), linear-gradient(245deg, rgba(30,20,8,0.12) 0%, transparent 34%), linear-gradient(180deg, transparent 62%, rgba(30,20,8,0.1))',
              }}
            />
            <div className="absolute inset-x-[4%] bottom-[5%] top-[30%] border" style={{ borderColor: `color-mix(in srgb, ${tokens.accent} 34%, transparent)` }} />
          </motion.div>

          {/* seam shading the pocket throws on the letter */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              zIndex: 2,
              background: 'linear-gradient(180deg, rgba(24,16,6,0.22), transparent 26%, transparent 74%, rgba(24,16,6,0.26))',
            }}
            initial={false}
            animate={{ opacity: drawn ? 0 : 1 }}
            transition={{ duration: 1.2, ease: EASE_DRAW }}
          />

          {/* the flap — swings open on its top fold */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0"
            style={{
              height: '54%',
              zIndex: 4,
              transformOrigin: '50% 0%',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
            initial={false}
            animate={flapOpen ? { rotateX: -178, opacity: 0.0 } : { rotateX: 0, opacity: 1 }}
            transition={{
              rotateX: { duration: 1.2, ease: EASE_FLAP },
              opacity: { duration: 0.35, delay: flapOpen ? 0.92 : 0 },
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: paperDeep,
                clipPath: 'polygon(0 0, 100% 0, 100% 58%, 50% 100%, 0 58%)',
                backfaceVisibility: 'hidden',
                boxShadow: '0 22px 34px -20px rgba(24,16,6,0.55)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.35), transparent 30%), linear-gradient(115deg, rgba(30,20,8,0.12), transparent 40%), linear-gradient(245deg, rgba(30,20,8,0.12), transparent 40%)',
                }}
              />
              <div className="pointer-events-none absolute inset-0" style={{ color: tokens.accent }}>
                <RoyalCorner className="absolute left-[3%] top-[6%] h-[16%] w-auto opacity-70" />
                <RoyalCorner className="absolute right-[3%] top-[6%] h-[16%] w-auto -scale-x-100 opacity-70" />
              </div>
              <span
                className="absolute left-1/2 top-[16%] -translate-x-1/2"
                style={{ fontFamily: template.script, fontSize: 'clamp(20px, 7cqw, 34px)', lineHeight: 1, color: tokens.accent }}
              >
                {data.monogram}
              </span>
            </div>
          </motion.div>

          {/* the fastening, at the flap's point */}
          {sealed ? (
            <motion.div
              className="absolute left-1/2 top-[54%] z-[6] w-[24%]"
              style={{ x: '-50%', y: '-50%', color: SEAL_COLOUR[template.id] ?? '#7b2938' }}
              initial={false}
              animate={fastening && !flapOpen ? { scale: 0.94, opacity: 0, y: '-30%' } : { scale: 1, opacity: flapOpen ? 0 : 1 }}
              transition={{ duration: 0.85, delay: fastening ? 0.5 : 0, ease: EASE_SILK }}
            >
              <WaxSeal monogram={data.monogram} cracked={fastening} className="h-auto w-full drop-shadow-[0_12px_18px_rgba(40,16,20,0.42)]" />
            </motion.div>
          ) : (
            <>
              <div className="absolute inset-0 z-[5]" style={{ opacity: flapOpen ? 0 : 1, transition: 'opacity 0.3s' }}>
                <RibbonBand tones={tones} released={fastening} delay={0.72} />
              </div>
              <motion.div
                className="absolute left-1/2 top-[54%] z-[6] w-[58%]"
                style={{ x: '-50%', y: '-50%' }}
                initial={false}
                animate={{ opacity: flapOpen ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <SilkBow tones={tones} untied={fastening} className="h-auto w-full drop-shadow-[0_14px_18px_rgba(40,26,8,0.35)]" />
              </motion.div>
            </>
          )}

          {/* the envelope's shadow on the table, easing as it empties */}
          <motion.div
            aria-hidden="true"
            className="absolute -inset-x-4 -bottom-7 h-10 rounded-[50%]"
            style={{ background: 'radial-gradient(50% 50% at 50% 50%, rgba(10,8,4,0.5), transparent 70%)', filter: 'blur(6px)', zIndex: 0 }}
            initial={false}
            animate={{ opacity: drawn ? 0.35 : 0.8, scaleX: drawn ? 0.82 : 1 }}
            transition={{ duration: 1.4, ease: EASE_DRAW }}
          />
        </div>

        {/* names and the invitation to open */}
        <div className="inv-gate-undercard" style={{ color: gateInk }}>
          <motion.div
            className="inv-gate-ident"
            animate={fastening ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_SILK }}
          >
            <h1
              className={`inv-gate-names ${upper ? 'uppercase' : ''}`}
              style={{ letterSpacing: upper ? '0.06em' : template.cover.tracking, color: gateInk, textShadow: 'none', fontFamily: template.display }}
            >
              {data.coupleA}
              <span className="inv-gate-amp" style={{ fontFamily: template.script }}>
                &amp;
              </span>
              {data.coupleB}
            </h1>
            <p className="inv-gate-date" style={{ color: gateInk }}>
              {formatDateShort(data.weddingDate)}
              <span aria-hidden> · </span>
              {data.location.split(',')[0]}
            </p>
          </motion.div>

          <div className="inv-gate-cue-wrap">
            <motion.div className="inv-gate-cue" animate={{ opacity: fastening ? 0 : 1 }} transition={{ duration: 0.3 }}>
              <span className="inv-gate-tapline">
                <span className="h-px w-8 bg-current opacity-60" aria-hidden />
                <span className="inv-gate-tap">{t(language, 'open')}</span>
                <span className="h-px w-8 bg-current opacity-60" aria-hidden />
              </span>
              {data.music.enabled && (
                <span className="inv-gate-music">
                  <Music2 size={11} aria-hidden /> Music begins as it opens
                </span>
              )}
            </motion.div>
            <motion.div className="inv-gate-progress" animate={{ opacity: fastening ? 1 : 0 }} transition={{ duration: 0.35 }} aria-hidden="true">
              <span className="inv-gate-caption">{caption}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {!embedded && phase === 0 && (
        <button type="button" onClick={onOpen} className="inv-gate-skip" style={{ color: gateInk }}>
          Skip
        </button>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={open}
        aria-label={t(language, 'open')}
        className="inv-gate-hit"
        style={{ opacity: fastening ? 0 : 1, pointerEvents: fastening ? 'none' : 'auto' }}
      />
    </motion.div>
  );
}
