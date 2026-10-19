import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import type { InvitationData } from '@shared/types';
import { getTemplate } from '@/templates/registry';
import { coverKind, coverTokens } from '@/templates/cover';
import { WaxSeal } from '@/templates/art';
import { RoyalCorner } from '@/templates/ornaments';
import { playCinematicOpening, type OpeningSoundHandle } from '@/lib/openingSound';
import { formatDateShort } from '@/lib/format';
import { OpeningLetter } from './OpeningLetter';
import { RibbonBand, SilkBow, type SilkTones } from './SilkBow';
import { t } from './i18n';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_DOOR = [0.7, 0, 0.24, 1] as const;

/** Act I durations — the fastening gets its own unhurried moment. */
const FASTEN_MS = { ribbon: 1650, seal: 1350, curtain: 950, gatefold: 1300 } as const;
const TURN_MS = 1450;
const LETTER_BEAT_MS = 1050;

/** Silk, dyed for each ribbon world. */
const RIBBON_TONES: Record<string, SilkTones> = {
  maison: { light: '#c2ceb2', mid: '#7d8b6a', dark: '#4f603c' },
  salento: { light: '#eda87e', mid: '#c06a3d', dark: '#8a3f20' },
  heirloom: { light: '#e2c491', mid: '#a97e4e', dark: '#71522c' },
  miel: { light: '#f2d18d', mid: '#d9a44f', dark: '#9c6f27' },
};
const GOLD_TONES: SilkTones = { light: '#f4e2ab', mid: '#d5ae62', dark: '#8f6c30' };
const SILVER_TONES: SilkTones = { light: '#eef1f8', mid: '#b3c0da', dark: '#7488ad' };
const SEAL_COLOUR: Record<string, string> = { aurelia: '#7b2938', celeste: '#93a7cf' };

const FASTENING_LINE: Record<string, string> = {
  ribbon: 'The ribbon is untied…',
  seal: 'The seal is broken…',
  curtain: 'The tiebacks are released…',
  gatefold: 'The seal is broken…',
};

/**
 * The opening ceremony, in two acts.
 *
 * The cover is a finished piece of stationery in the template's own world —
 * paper, foil keylines, engraved corners — closed by a real fastening:
 * a silk bow, a wax seal, a pair of velvet drapes. Act I undoes only the
 * fastening: the bow unties, the seal cracks, the tassels drop. Act II
 * then swings the gatefold doors (or parts the drapes) to reveal the
 * letter inside. Slow, quiet, and physical — never a page being flipped.
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
  const kind = coverKind(template.id);
  const language = data.settings.language;
  const tones = kind === 'gatefold' ? SILVER_TONES : (RIBBON_TONES[template.id] ?? GOLD_TONES);
  const fastenMs = FASTEN_MS[kind];

  const [stage, setStage] = useState<'closed' | 'fastening' | 'opening' | 'open'>('closed');
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
    if (!reduce) {
      sound.current = playCinematicOpening(
        kind === 'ribbon' ? 'ribbon' : kind === 'curtain' ? 'curtain' : kind === 'gatefold' ? 'celeste' : 'seal',
      );
    }
    if (reduce) {
      onOpen();
      return;
    }
    setStage('fastening');
    timers.current.push(window.setTimeout(() => setStage('opening'), fastenMs));
    timers.current.push(window.setTimeout(() => setStage('open'), fastenMs + TURN_MS));
    timers.current.push(window.setTimeout(onOpen, fastenMs + TURN_MS + LETTER_BEAT_MS));
  };

  const released = stage !== 'closed';
  const opening = stage === 'opening' || stage === 'open';
  const curtain = kind === 'curtain';
  const upper = template.cover.namesCase === 'upper';
  const caption =
    stage === 'open'
      ? t(language, 'reveal')
      : stage === 'fastening'
        ? FASTENING_LINE[kind]
        : stage === 'opening'
          ? curtain
            ? 'The curtains part…'
            : 'The cover opens…'
          : '';

  const doorBg = curtain
    ? `repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 10px, rgba(0,0,0,0.16) 10px 22px), linear-gradient(100deg, ${tokens.bg} 0%, color-mix(in srgb, ${tokens.bg} 82%, #000) 55%, ${tokens.bg} 100%)`
    : `linear-gradient(155deg, color-mix(in srgb, ${tokens.bg} 92%, #fff) 0%, ${tokens.bg} 48%, color-mix(in srgb, ${tokens.bg} 84%, ${tokens.accentSoft}) 100%)`;

  return (
    <motion.div
      className={`inv-gate inv-gate-open ${embedded ? 'inv-gate-embedded' : ''}`}
      style={{ background: gateBg, '--gate-bottom': embedded ? '0px' : `${bottomInset}px` } as React.CSSProperties}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_SILK }}
      data-kind={kind}
    >
      {/* the room: a pool of light on the template's own colour */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(88% 60% at 50% 40%, color-mix(in srgb, ${gateInk} 16%, transparent), transparent 62%), linear-gradient(180deg, rgba(0,0,0,0.24), transparent 30%, transparent 70%, rgba(0,0,0,0.34))`,
        }}
      />

      <div className="inv-gate-ceremony">
        <motion.span
          className="inv-gate-cover-kicker"
          style={{ color: gateInk, textShadow: 'none' }}
          animate={{ opacity: released ? 0 : 0.92, y: released ? -8 : 0 }}
          transition={{ duration: 0.45, ease: EASE_SILK }}
        >
          {guestName && data.settings.showGuestName ? `${t(language, 'forGuest')} ${guestName}` : 'You are invited'}
        </motion.span>

        {/* ------------------------------------------------------------ */}
        {/* the card                                                      */}
        {/* ------------------------------------------------------------ */}
        <div className="inv-gate-cardbox" style={{ perspective: '1600px' }}>
          {/* the letter, waiting inside */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ scale: opening ? 1 : 1.02 }}
            transition={{ duration: 1.5, ease: EASE_DOOR }}
            aria-hidden={!opening}
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
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 z-[5]"
            style={{ background: 'linear-gradient(180deg, rgba(24,16,6,0.26), rgba(24,16,6,0.04) 42%, rgba(24,16,6,0.3))' }}
            initial={false}
            animate={{ opacity: opening ? 0 : 1 }}
            transition={{ duration: TURN_MS / 1000, ease: EASE_DOOR }}
          />

          {/* Act II — the two doors. Gatefolds swing from their outer
              hinges; drapes bunch into the wings. */}
          {(['left', 'right'] as const).map((side) => (
            <motion.div
              key={side}
              aria-hidden="true"
              className="absolute top-0 bottom-0"
              style={{
                [side]: 0,
                width: '50.3%',
                zIndex: 10,
                transformOrigin: side === 'left' ? '0% 50%' : '100% 50%',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                willChange: 'transform, opacity',
              } as React.CSSProperties}
              initial={false}
              animate={
                opening
                  ? curtain
                    ? { x: side === 'left' ? '-72%' : '72%', scaleX: 0.5, opacity: stage === 'open' ? 0 : 1 }
                    : { rotateY: side === 'left' ? -102 : 102, opacity: stage === 'open' ? 0 : 1 }
                  : curtain
                    ? { x: '0%', scaleX: 1, opacity: 1 }
                    : { rotateY: 0, opacity: 1 }
              }
              transition={{ duration: TURN_MS / 1000, ease: EASE_DOOR }}
            >
              <div className="absolute inset-0 overflow-hidden" style={{ background: doorBg, boxShadow: 'inset 0 0 60px rgba(20,14,6,0.14)' }}>
                {/* foil keyline, inset from the trim */}
                <div
                  className="pointer-events-none absolute border"
                  style={{
                    inset: '4.5%',
                    [side === 'left' ? 'right' : 'left']: '7%',
                    borderColor: `color-mix(in srgb, ${tokens.accent} 42%, transparent)`,
                  } as React.CSSProperties}
                />
                <div className="pointer-events-none absolute inset-[4.5%]" style={{ color: tokens.accent }}>
                  {side === 'left' ? (
                    <>
                      <RoyalCorner className="absolute left-0 top-0 h-[9%] w-auto opacity-70" />
                      <RoyalCorner className="absolute bottom-0 left-0 h-[9%] w-auto -scale-y-100 opacity-70" />
                    </>
                  ) : (
                    <>
                      <RoyalCorner className="absolute right-0 top-0 h-[9%] w-auto -scale-x-100 opacity-70" />
                      <RoyalCorner className="absolute bottom-0 right-0 h-[9%] w-auto -scale-100 opacity-70" />
                    </>
                  )}
                </div>
                {/* the centre edge catches the light as the door turns */}
                <span
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 w-[3px]"
                  style={{
                    [side === 'left' ? 'right' : 'left']: 0,
                    background: curtain
                      ? `repeating-linear-gradient(180deg, ${tokens.accent} 0 5px, transparent 5px 9px)`
                      : 'linear-gradient(180deg, transparent, rgba(30,20,8,0.3) 20%, rgba(30,20,8,0.3) 80%, transparent)',
                  } as React.CSSProperties}
                />
                {curtain && (
                  /* the tassel that holds this drape — it drops in Act I */
                  <motion.span
                    aria-hidden="true"
                    className="absolute"
                    style={{
                      [side === 'left' ? 'right' : 'left']: '9%',
                      top: '58%',
                      width: 3,
                      height: '16%',
                      background: `linear-gradient(180deg, transparent, ${tokens.accent})`,
                    } as React.CSSProperties}
                    initial={false}
                    animate={released && !opening ? { y: 90, opacity: 0 } : { y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: EASE_SILK }}
                  />
                )}
              </div>
            </motion.div>
          ))}

          {/* what is printed on the closed cover: the couple's mark above
              the fastening, the house name below it */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-[10%] z-[15] flex flex-col items-center"
            initial={false}
            animate={{ opacity: opening ? 0 : 1 }}
            transition={{ duration: 0.4, ease: EASE_SILK }}
          >
            <span
              style={{
                fontFamily: template.script,
                fontSize: 'clamp(28px, 11cqw, 44px)',
                lineHeight: 1,
                color: tokens.accent,
              }}
            >
              {data.monogram}
            </span>
            <span
              className="mt-2 flex items-center gap-2"
              style={{ color: `color-mix(in srgb, ${tokens.accent} 78%, transparent)` }}
            >
              <span className="h-px w-7 bg-current opacity-60" />
              <span className="size-1 rotate-45 border border-current" />
              <span className="h-px w-7 bg-current opacity-60" />
            </span>
          </motion.div>
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-[7%] z-[15] text-center uppercase"
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: 'clamp(7px, 2cqw, 10px)',
              letterSpacing: '0.44em',
              paddingLeft: '0.44em',
              color: `color-mix(in srgb, ${tokens.ink} 58%, transparent)`,
              opacity: opening ? 0 : 1,
            }}
          >
            {template.name}
          </motion.span>

          {/* Act I — the fastening, and only the fastening */}
          {kind === 'ribbon' && (
            <>
              <RibbonBand tones={tones} released={released} />
              <motion.div
                className="absolute left-1/2 top-[50%] z-[26] w-[62%]"
                style={{ x: '-50%', y: '-50%' }}
                initial={false}
                animate={released ? { y: '-46%' } : { y: '-50%' }}
                transition={{ duration: 1.2, ease: EASE_SILK }}
              >
                <SilkBow tones={tones} untied={released} className="h-auto w-full drop-shadow-[0_14px_18px_rgba(40,26,8,0.35)]" />
              </motion.div>
            </>
          )}

          {(kind === 'seal' || kind === 'gatefold') && (
            <>
              <RibbonBand tones={tones} released={released} delay={0.6} />
              <motion.div
                className="absolute left-1/2 top-[50%] z-[26] w-[27%]"
                style={{ x: '-50%', y: '-50%', color: SEAL_COLOUR[template.id] ?? '#7b2938' }}
                initial={false}
                animate={released ? { scale: 0.92, opacity: 0, y: '-38%' } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: released ? 0.55 : 0, ease: EASE_SILK }}
              >
                <WaxSeal monogram={data.monogram} cracked={released} className="h-auto w-full drop-shadow-[0_14px_20px_rgba(40,16,20,0.4)]" />
              </motion.div>
            </>
          )}

          {/* a single pass of light as the fastening gives */}
          <motion.div
            className="inv-gate-sheen"
            aria-hidden="true"
            initial={false}
            animate={released && !opening ? { x: '160%', opacity: [0, 0.45, 0] } : { x: '-120%', opacity: 0 }}
            transition={{ duration: 1.3, ease: EASE_SILK }}
          />
        </div>

        {/* names and the invitation to open */}
        <div className="inv-gate-undercard" style={{ color: gateInk }}>
          <motion.div
            className="inv-gate-ident"
            animate={released ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_SILK }}
          >
            <h1
              className={`inv-gate-names ${upper ? 'uppercase' : ''}`}
              style={{ letterSpacing: upper ? '0.06em' : template.cover.tracking, color: gateInk, textShadow: 'none', fontFamily: template.display }}
            >
              {data.coupleA}
              <span className="inv-gate-amp" style={{ fontFamily: template.script }}>&amp;</span>
              {data.coupleB}
            </h1>
            <p className="inv-gate-date" style={{ color: gateInk }}>
              {formatDateShort(data.weddingDate)}
              <span aria-hidden> · </span>
              {data.location.split(',')[0]}
            </p>
          </motion.div>

          <div className="inv-gate-cue-wrap">
            <motion.div className="inv-gate-cue" animate={{ opacity: released ? 0 : 1 }} transition={{ duration: 0.3 }}>
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
            <motion.div className="inv-gate-progress" animate={{ opacity: released ? 1 : 0 }} transition={{ duration: 0.35 }} aria-hidden="true">
              <span className="inv-gate-caption">{caption}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {!embedded && stage === 'closed' && (
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
        style={{ opacity: released ? 0 : 1, pointerEvents: released ? 'none' : 'auto' }}
      />
    </motion.div>
  );
}
