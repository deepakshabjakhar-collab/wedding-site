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
 * The opening, composed as the reference composes it (sponsalia.app):
 * the envelope fills the frame — embroidered paper, the fastening at
 * the flap's point, the couple's names printed on the front, “Tap to
 * open”. On tap the bow unties / the seal cracks, the flap swings open,
 * and the letter draws up out of the pocket to fill the frame, becoming
 * the invitation: hero, “Forever begins in”, the numbered sections.
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

  const paper = `linear-gradient(160deg, color-mix(in srgb, ${tokens.bg} 88%, ${tokens.accentSoft}) 0%, color-mix(in srgb, ${tokens.bg} 82%, ${tokens.accent}) 52%, color-mix(in srgb, ${tokens.bg} 74%, ${tokens.accentSoft}) 100%)`;
  const paperDeep = `linear-gradient(205deg, color-mix(in srgb, ${tokens.bg} 78%, ${tokens.accent}) 0%, color-mix(in srgb, ${tokens.bg} 84%, ${tokens.accentSoft}) 58%, color-mix(in srgb, ${tokens.bg} 80%, ${tokens.accent}) 100%)`;

  return (
    <motion.div
      className={`inv-gate inv-gate-open ${embedded ? 'inv-gate-embedded' : ''}`}
      style={{ background: tokens.bg, '--gate-bottom': embedded ? '0px' : `${bottomInset}px` } as React.CSSProperties}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_SILK }}
    >
      {/* the letter — full frame, waiting inside */}
      <motion.div
        className="absolute inset-0"
        style={{ zIndex: 1 }}
        initial={false}
        animate={
          drawn
            ? { y: '0%', scale: 1, opacity: 1 }
            : flapOpen
              ? { y: '-2%', scale: 0.99, opacity: 1 }
              : { y: '5%', scale: 0.97, opacity: 0 }
        }
        transition={{ duration: drawn ? 1.5 : 1.1, ease: EASE_DRAW, opacity: { duration: 0.7, delay: flapOpen && !drawn ? 0.25 : 0 } }}
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

      {/* envelope back / inside shade */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          zIndex: 2,
          background: 'linear-gradient(180deg, rgba(24,16,6,0.2), transparent 22%, transparent 78%, rgba(24,16,6,0.24))',
        }}
        initial={false}
        animate={{ opacity: drawn ? 0 : 1 }}
        transition={{ duration: 1.1, ease: EASE_DRAW }}
      />

      {/* the pocket — envelope front, with the names printed on it */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0"
        style={{
          height: '60%',
          zIndex: 3,
          background: paper,
          clipPath: 'polygon(0 0, 50% 26%, 100% 0, 100% 100%, 0 100%)',
          filter: 'drop-shadow(0 -12px 18px rgba(24,16,6,0.3))',
        }}
        initial={false}
        animate={drawn ? { y: '106%', opacity: 0.3 } : { y: '0%', opacity: 1 }}
        transition={{ duration: 1.3, ease: EASE_DRAW }}
      >
        <TemplateArt templateId={template.id} className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.45]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(112deg, rgba(30,20,8,0.13) 0%, transparent 34%), linear-gradient(248deg, rgba(30,20,8,0.13) 0%, transparent 34%), linear-gradient(180deg, transparent 58%, rgba(30,20,8,0.1))',
          }}
        />
        {/* the names, printed on the envelope front */}
        <motion.div
          className="absolute inset-x-0 flex flex-col items-center text-center"
          style={{ top: '46%', color: tokens.ink }}
          animate={{ opacity: drawn ? 0 : 1 }}
          transition={{ duration: 0.35 }}
        >
          <span
            className="uppercase"
            style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '0.58rem', letterSpacing: '0.42em', paddingLeft: '0.42em', color: tokens.accent }}
          >
            {guestName && data.settings.showGuestName ? `${t(language, 'forGuest')} ${guestName}` : 'You are invited'}
          </span>
          <span
            className={`mt-3 leading-[1.04] ${upper ? 'uppercase' : ''}`}
            style={{
              fontFamily: template.display,
              fontSize: 'clamp(1.7rem, 8.4cqw, 2.6rem)',
              letterSpacing: upper ? '0.05em' : template.cover.tracking,
              paddingInline: '1rem',
            }}
          >
            {data.coupleA}{' '}
            <span style={{ fontFamily: template.script, color: tokens.accent, fontSize: '0.72em' }}>&amp;</span>{' '}
            {data.coupleB}
          </span>
          <span
            className="mt-2 uppercase"
            style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '0.56rem', letterSpacing: '0.3em', paddingLeft: '0.3em', color: tokens.muted }}
          >
            {formatDateShort(data.weddingDate)} · {data.location.split(',')[0]}
          </span>
        </motion.div>
      </motion.div>

      {/* the flap */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0"
        style={{ height: '54%', zIndex: 4, transformOrigin: '50% 0%', willChange: 'transform' }}
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
            clipPath: 'polygon(0 0, 100% 0, 100% 54%, 50% 100%, 0 54%)',
            filter: 'drop-shadow(0 16px 20px rgba(24,16,6,0.35))',
          }}
        >
          <TemplateArt templateId={template.id} className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.45]" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.3), transparent 32%), linear-gradient(112deg, rgba(30,20,8,0.1), transparent 42%), linear-gradient(248deg, rgba(30,20,8,0.1), transparent 42%)',
            }}
          />
          <span
            className="absolute left-1/2 top-[12%] -translate-x-1/2"
            style={{ fontFamily: template.script, fontSize: 'clamp(22px, 7cqw, 36px)', lineHeight: 1, color: tokens.accent }}
          >
            {data.monogram}
          </span>
        </div>
      </motion.div>

      {/* the fastening, at the flap's point */}
      {sealed ? (
        <motion.div
          className="absolute left-1/2 top-[54%] z-[6]"
          style={{ x: '-50%', y: '-50%', width: 'clamp(64px, 19cqw, 92px)', color: SEAL_COLOUR[template.id] ?? '#7b2938' }}
          initial={false}
          animate={fastening && !flapOpen ? { scale: 0.94, opacity: 0, y: '-24%' } : { scale: 1, opacity: flapOpen ? 0 : 1 }}
          transition={{ duration: 0.85, delay: fastening ? 0.5 : 0, ease: EASE_SILK }}
        >
          <WaxSeal monogram={data.monogram} cracked={fastening} className="h-auto w-full drop-shadow-[0_12px_18px_rgba(40,16,20,0.42)]" />
        </motion.div>
      ) : (
        <motion.div
          className="absolute left-1/2 top-[54%] z-[6]"
          style={{ x: '-50%', y: '-50%', width: 'clamp(170px, 52cqw, 250px)', opacity: flapOpen ? 0 : 1, transition: 'opacity 0.3s' }}
        >
          <SilkBow tones={tones} untied={fastening} className="h-auto w-full drop-shadow-[0_14px_18px_rgba(40,26,8,0.35)]" />
        </motion.div>
      )}

      {/* “Tap to open” */}
      <motion.p
        className="absolute inset-x-0 z-[6] text-center uppercase"
        style={{
          bottom: `calc(max(1.4rem, env(safe-area-inset-bottom)) + var(--gate-bottom, 0px))`,
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: '0.62rem',
          letterSpacing: '0.38em',
          paddingLeft: '0.38em',
          color: tokens.muted,
        }}
        animate={{ opacity: fastening ? 0 : 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {language === 'en' ? 'Tap to open' : t(language, 'open')}
      </motion.p>

      {!embedded && phase === 0 && (
        <button type="button" onClick={onOpen} className="inv-gate-skip" style={{ color: tokens.muted, borderColor: `color-mix(in srgb, ${tokens.accent} 45%, transparent)`, background: 'transparent' }}>
          Skip
        </button>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={open}
        aria-label={language === 'en' ? 'Tap to open' : t(language, 'open')}
        className="inv-gate-hit"
        style={{ opacity: fastening ? 0 : 1, pointerEvents: fastening ? 'none' : 'auto', zIndex: 7 }}
      />
    </motion.div>
  );
}
