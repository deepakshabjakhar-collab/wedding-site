import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { InvitationData } from '@shared/types';
import { getTemplate } from '@/templates/registry';
import { coverTokens } from '@/templates/cover';
import { TemplateArt, WaxSeal } from '@/templates/art';
import { playCinematicOpening, type OpeningSoundHandle } from '@/lib/openingSound';
import { formatDateShort } from '@/lib/format';
import { OpeningLetter } from './OpeningLetter';
import { SilkBow, type SilkTones } from './SilkBow';
import { t } from './i18n';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_FLAP = [0.6, 0, 0.24, 1] as const;
const EASE_DRAW = [0.33, 0.72, 0.24, 1] as const;

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
 * Slide one of the invitation, copied from the reference ceremony
 * (sponsalia.app): an embroidered envelope closed by a bow or a wax
 * seal, the couple's names beneath it, and “Tap to open”.
 *
 * The tap performs the envelope: the fastening undoes itself, the flap
 * swings open on its fold, the letter is drawn up out of the pocket
 * while the envelope falls away — and the letter becomes the
 * invitation the guest scrolls: hero, “Forever begins in”, and the
 * numbered sections.
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
    const fastenMs = sealed ? 1550 : 1900;
    timers.current.push(window.setTimeout(() => setPhase(1), 60));
    timers.current.push(window.setTimeout(() => setPhase(2), fastenMs));
    timers.current.push(window.setTimeout(() => setPhase(3), fastenMs + 1300));
    timers.current.push(window.setTimeout(onOpen, fastenMs + 1300 + 1900));
  };

  const fastening = phase >= 1;
  const flapOpen = phase >= 2;
  const drawn = phase >= 3;
  const upper = template.cover.namesCase === 'upper';

  const paper = `linear-gradient(155deg, color-mix(in srgb, ${tokens.bg} 95%, #fff) 0%, ${tokens.bg} 55%, color-mix(in srgb, ${tokens.bg} 87%, ${tokens.accentSoft}) 100%)`;
  const paperDeep = `linear-gradient(205deg, color-mix(in srgb, ${tokens.bg} 84%, ${tokens.accentSoft}) 0%, color-mix(in srgb, ${tokens.bg} 88%, #fff) 60%, ${tokens.bg} 100%)`;

  return (
    <motion.div
      className={`inv-gate inv-gate-open ${embedded ? 'inv-gate-embedded' : ''}`}
      style={{ background: gateBg, '--gate-bottom': embedded ? '0px' : `${bottomInset}px` } as React.CSSProperties}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_SILK }}
    >
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
        {/* the envelope (landscape, as in the reference)               */}
        {/* ---------------------------------------------------------- */}
        <div
          className="relative w-full"
          style={{ maxWidth: 'min(92vw, 27rem)', aspectRatio: '1.48', perspective: '1500px' }}
        >
          {/* envelope back */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: paperDeep, zIndex: 1, boxShadow: '0 40px 70px -30px rgba(16,10,4,0.75)' }}
            initial={false}
            animate={drawn ? { y: '46%', opacity: 0 } : { y: '0%', opacity: 1 }}
            transition={{ duration: 1.3, ease: EASE_DRAW }}
          />

          {/* the letter, tucked inside */}
          <motion.div
            className="absolute left-1/2 top-[4%]"
            style={{
              width: '64%',
              aspectRatio: '3/4',
              x: '-50%',
              zIndex: 2,
              boxShadow: '0 22px 40px -18px rgba(24,16,6,0.55)',
            }}
            initial={false}
            animate={
              drawn
                ? { y: '-16%', scale: 1.04, opacity: 1 }
                : flapOpen
                  ? { y: '-4%', scale: 0.98, opacity: 1 }
                  : { y: '16%', scale: 0.98, opacity: 1 }
            }
            transition={{ duration: drawn ? 1.55 : 1.1, ease: EASE_DRAW }}
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

          {/* envelope front (the pocket) */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 overflow-hidden"
            style={{ height: '62%', zIndex: 3, background: paper, clipPath: 'polygon(0 0, 50% 30%, 100% 0, 100% 100%, 0 100%)' }}
            initial={false}
            animate={drawn ? { y: '108%', opacity: 0.35 } : { y: '0%', opacity: 1 }}
            transition={{ duration: 1.3, ease: EASE_DRAW }}
          >
            <TemplateArt
              templateId={template.id}
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(115deg, rgba(30,20,8,0.13) 0%, transparent 36%), linear-gradient(245deg, rgba(30,20,8,0.13) 0%, transparent 36%), linear-gradient(180deg, transparent 60%, rgba(30,20,8,0.1))',
                color: tokens.accent,
              }}
            />
            <div
              className="absolute border"
              style={{ inset: '26% 3.5% 6%', borderColor: `color-mix(in srgb, ${tokens.accent} 36%, transparent)` }}
            />
          </motion.div>

          {/* the flap */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0"
            style={{ height: '56%', zIndex: 4, transformOrigin: '50% 0%', willChange: 'transform' }}
            initial={false}
            animate={flapOpen ? { rotateX: -174, opacity: 0 } : { rotateX: 0, opacity: 1 }}
            transition={{
              rotateX: { duration: 1.25, ease: EASE_FLAP },
              opacity: { duration: 0.32, delay: flapOpen ? 0.95 : 0 },
            }}
          >
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                background: paperDeep,
                clipPath: 'polygon(0 0, 100% 0, 100% 56%, 50% 100%, 0 56%)',
                boxShadow: '0 20px 32px -18px rgba(24,16,6,0.55)',
              }}
            >
              <TemplateArt
                templateId={template.id}
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.32), transparent 34%), linear-gradient(115deg, rgba(30,20,8,0.1), transparent 42%), linear-gradient(245deg, rgba(30,20,8,0.1), transparent 42%)',
                }}
              />
              <span
                className="absolute left-1/2 top-[13%] -translate-x-1/2"
                style={{ fontFamily: template.script, fontSize: 'clamp(18px, 6cqw, 30px)', lineHeight: 1, color: tokens.accent }}
              >
                {data.monogram}
              </span>
            </div>
          </motion.div>

          {/* the fastening, at the flap's point */}
          {sealed ? (
            <motion.div
              className="absolute left-1/2 top-[56%] z-[6] w-[21%]"
              style={{ x: '-50%', y: '-50%', color: SEAL_COLOUR[template.id] ?? '#7b2938' }}
              initial={false}
              animate={
                fastening && !flapOpen
                  ? { scale: 0.94, opacity: 0, y: '-26%' }
                  : { scale: 1, opacity: flapOpen ? 0 : 1 }
              }
              transition={{ duration: 0.85, delay: fastening ? 0.5 : 0, ease: EASE_SILK }}
            >
              <WaxSeal
                monogram={data.monogram}
                cracked={fastening}
                className="h-auto w-full drop-shadow-[0_12px_18px_rgba(40,16,20,0.42)]"
              />
            </motion.div>
          ) : (
            <motion.div
              className="absolute left-1/2 top-[56%] z-[6] w-[52%]"
              style={{ x: '-50%', y: '-50%', opacity: flapOpen ? 0 : 1, transition: 'opacity 0.3s' }}
            >
              <SilkBow
                tones={tones}
                untied={fastening}
                className="h-auto w-full drop-shadow-[0_14px_18px_rgba(40,26,8,0.35)]"
              />
            </motion.div>
          )}
        </div>

        {/* names + “Tap to open”, as the reference sets them */}
        <div className="inv-gate-undercard" style={{ color: gateInk }}>
          <motion.div
            className="inv-gate-ident"
            animate={fastening ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_SILK }}
          >
            <h1
              className={`inv-gate-names ${upper ? 'uppercase' : ''}`}
              style={{
                letterSpacing: upper ? '0.06em' : template.cover.tracking,
                color: gateInk,
                textShadow: 'none',
                fontFamily: template.display,
              }}
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

          <motion.p
            className="inv-gate-tap"
            animate={{ opacity: fastening ? 0 : 0.85 }}
            transition={{ duration: 0.3 }}
            style={{ color: gateInk }}
          >
            {language === 'en' ? 'Tap to open' : t(language, 'open')}
          </motion.p>
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
        aria-label={language === 'en' ? 'Tap to open' : t(language, 'open')}
        className="inv-gate-hit"
        style={{ opacity: fastening ? 0 : 1, pointerEvents: fastening ? 'none' : 'auto' }}
      />
    </motion.div>
  );
}
