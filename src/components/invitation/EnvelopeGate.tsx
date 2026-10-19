import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import type { InvitationData } from '@shared/types';
import { getTemplate } from '@/templates/registry';
import { playCinematicOpening, type OpeningSoundHandle } from '@/lib/openingSound';
import { formatDateShort } from '@/lib/format';
import { OpeningLetter } from './OpeningLetter';
import { FASTENING_CONFIG, FASTEN_MS, FasteningLayer } from './FasteningLayer';
import { t } from './i18n';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_DOOR = [0.7, 0, 0.24, 1] as const;

const TURN_MS = 1750;
const LETTER_MS = 1200;

const FASTENING_LINE: Record<string, string> = {
  'bow': 'The ribbon comes undone…',
  'bow-seal': 'The seal breaks, the ribbon loosens…',
  'seal': 'The seal is broken…',
  'band-seal': 'The seal breaks, the band falls away…',
  'curtain': 'The curtains draw back…',
};

/**
 * The opening, performed by the cover itself.
 *
 * The card on stage is the released cover — the photograph with its
 * fastening already gone — closed by the real fastening, extracted from
 * the tied photograph and laid back over it in perfect register.
 * Act I: that fastening undoes itself (loops fold, tails fall, a seal
 * cracks in two, a band slides off, drapes part). Act II: the two halves
 * of the cover draw apart and the letter is there. One continuous piece
 * of theatre, played by photographic objects — nothing drawn, nothing
 * crossfaded.
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
  const language = data.settings.language;
  const config = FASTENING_CONFIG[template.id] ?? FASTENING_CONFIG.aurelia;
  const curtain = config.type === 'curtain';
  const coverSrc = curtain ? `/covers/${template.id}.jpg` : `/covers-untied/${template.id}.jpg`;

  /** 0 closed · 1 fastening · 2 cover opens · 3 the letter */
  const [phase, setPhase] = useState(0);
  const started = useRef(false);
  const timers = useRef<number[]>([]);
  const sound = useRef<OpeningSoundHandle | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    [coverSrc, `/covers/${template.id}.jpg`].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [coverSrc, template.id]);

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
        config.type === 'bow' || config.type === 'bow-seal' ? 'ribbon' : curtain ? 'curtain' : 'seal',
      );
    }
    if (reduce) {
      onOpen();
      return;
    }
    const fastenMs = FASTEN_MS[config.type];
    timers.current.push(window.setTimeout(() => setPhase(1), 60));
    timers.current.push(window.setTimeout(() => setPhase(2), fastenMs));
    timers.current.push(window.setTimeout(() => setPhase(3), fastenMs + TURN_MS));
    timers.current.push(window.setTimeout(onOpen, fastenMs + TURN_MS + LETTER_MS));
  };

  const released = phase >= 1;
  const opening = phase >= 2;
  const letterShown = phase >= 3;
  const upper = template.cover.namesCase === 'upper';
  const caption = letterShown
    ? t(language, 'reveal')
    : phase === 1
      ? FASTENING_LINE[config.type]
      : phase === 2
        ? curtain
          ? 'The curtains part…'
          : 'The cover opens…'
        : '';

  const letter = useMemo(
    () => (
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
    ),
    [template, data, guestName, language],
  );

  return (
    <motion.div
      className={`inv-gate inv-gate-open ${embedded ? 'inv-gate-embedded' : ''}`}
      style={{ background: gateBg, '--gate-bottom': embedded ? '0px' : `${bottomInset}px` } as React.CSSProperties}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_SILK }}
      data-kind={config.type}
    >
      {/* the room: the scene itself, darkened to a backdrop */}
      <img
        src={`/covers/${template.id}.jpg`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ filter: 'blur(46px) saturate(0.7) brightness(0.4)' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 62% at 50% 42%, rgba(255,246,226,0.13), transparent 62%), linear-gradient(180deg, rgba(0,0,0,0.42), transparent 30%, transparent 68%, rgba(0,0,0,0.6))',
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

        {/* the card */}
        <div className="inv-gate-cardbox" style={{ overflow: 'hidden', background: '#141210' }}>
          {/* the letter, waiting inside */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ scale: opening ? 1 : 1.02, opacity: curtain && !letterShown ? 0 : 1 }}
            transition={{ duration: 1.5, ease: EASE_DOOR }}
            aria-hidden={!opening}
          >
            {letter}
          </motion.div>

          {curtain ? (
            <>
              {/* the photographed stage, glowing between the drapes */}
              <motion.img
                src={coverSrc}
                alt={`${template.name} cover — ${template.descriptor}`}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
                initial={false}
                animate={{ opacity: letterShown ? 0 : 1, scale: opening ? 1.05 : 1 }}
                transition={{ duration: 1.8, ease: EASE_DOOR }}
              />
              {/* the closed drapes, in two photographic panels */}
              {(['left', 'right'] as const).map((side) => (
                <motion.div
                  key={side}
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 overflow-hidden"
                  style={{
                    [side]: 0,
                    width: '52%',
                    zIndex: 10,
                    transformOrigin: side === 'left' ? '0% 50%' : '100% 50%',
                    willChange: 'transform, opacity',
                  } as React.CSSProperties}
                  initial={false}
                  animate={
                    opening
                      ? { x: side === 'left' ? '-64%' : '64%', scaleX: 0.55, opacity: letterShown ? 0 : 1 }
                      : { x: '0%', scaleX: 1, opacity: 1 }
                  }
                  transition={{ duration: TURN_MS / 1000, ease: EASE_DOOR }}
                >
                  <div
                    className="absolute top-0 bottom-0"
                    style={{ width: '192.3%', [side === 'left' ? 'left' : 'right']: 0 } as React.CSSProperties}
                  >
                    <img
                      src={`/covers-untied/${template.id}.jpg`}
                      alt=""
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            <>
              {/* Act II — the released cover, in two halves */}
              {(['left', 'right'] as const).map((side) => (
                <motion.div
                  key={side}
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 overflow-hidden"
                  style={{
                    [side]: 0,
                    width: '50.4%',
                    zIndex: 10,
                    willChange: 'transform, opacity',
                    boxShadow:
                      side === 'left' ? '-22px 0 38px -24px rgba(0,0,0,0.6)' : '22px 0 38px -24px rgba(0,0,0,0.6)',
                  } as React.CSSProperties}
                  initial={false}
                  animate={opening ? { x: side === 'left' ? '-103%' : '103%', opacity: letterShown ? 0 : 1 } : { x: '0%', opacity: 1 }}
                  transition={{ duration: TURN_MS / 1000, ease: EASE_DOOR }}
                >
                  <div
                    className="absolute top-0 bottom-0"
                    style={{ width: '198.4%', [side === 'left' ? 'left' : 'right']: 0 } as React.CSSProperties}
                  >
                    <img
                      src={coverSrc}
                      alt={side === 'left' ? `${template.name} cover — ${template.descriptor}` : ''}
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <span
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 w-px"
                    style={{
                      [side === 'left' ? 'right' : 'left']: 0,
                      background:
                        'linear-gradient(180deg, transparent, rgba(30,20,8,0.3) 22%, rgba(30,20,8,0.3) 78%, transparent)',
                    } as React.CSSProperties}
                  />
                </motion.div>
              ))}

              {/* Act I — the fastening undoes itself over the cover */}
              <div className="absolute inset-0" style={{ zIndex: 30, pointerEvents: 'none' }}>
                <FasteningLayer templateId={template.id} released={released} />
              </div>
            </>
          )}

          {/* one breath of light across the card */}
          <motion.div
            className="inv-gate-sheen"
            aria-hidden="true"
            initial={false}
            animate={released && !opening ? { x: '170%', opacity: [0, 0.32, 0] } : { x: '-120%', opacity: 0 }}
            transition={{ duration: 2, ease: EASE_SILK }}
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
            <motion.div
              className="inv-gate-progress"
              animate={{ opacity: released ? 1 : 0 }}
              transition={{ duration: 0.35 }}
              aria-hidden="true"
            >
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
        style={{ opacity: released ? 0 : 1, pointerEvents: released ? 'none' : 'auto' }}
      />
    </motion.div>
  );
}
