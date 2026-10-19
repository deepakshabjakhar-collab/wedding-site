import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import type { InvitationData } from '@shared/types';
import { getTemplate } from '@/templates/registry';
import { coverKind } from '@/templates/cover';
import { playCinematicOpening, type OpeningSoundHandle } from '@/lib/openingSound';
import { formatDateShort } from '@/lib/format';
import { OpeningLetter } from './OpeningLetter';
import { t } from './i18n';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_FILM = [0.45, 0, 0.2, 1] as const;

/**
 * The ceremony as one continuous piece of film.
 *
 * Every cover exists in three photographed states of the same scene:
 * fastened, released, and open (see public/covers, covers-untied,
 * covers-open). Tapping plays them as a single shot — the camera drifts
 * slowly inward while the ribbon comes undone, the seal breaks, or the
 * curtains draw back; then the cover opens in the same light; then the
 * photographed page gives way to the letter itself. Nothing is drawn,
 * clipped or flipped: it is the invitation, filmed.
 */

/** Frames that already exist as “cover open in the photograph”. Templates
 *  without one yet dissolve from the released cover straight to the letter. */
const HAS_OPEN_FRAME = new Set(['salento', 'noir', 'miel']);

const UNTIE_MS = 2000;
const OPEN_MS = 1700;
const LETTER_MS = 1200;

interface Frame {
  src: string;
  line: string;
}

function framesFor(templateId: string, kind: string): Frame[] {
  if (kind === 'curtain') {
    // Belgrave begins behind closed drapes (the “untied” frame) and parts
    // into the original photograph, where the card already glows.
    return [
      { src: `/covers-untied/${templateId}.jpg`, line: 'The curtains draw back…' },
      { src: `/covers/${templateId}.jpg`, line: 'The cover opens…' },
    ];
  }
  const fasteningLine =
    kind === 'ribbon' ? 'The ribbon comes undone…' : kind === 'gatefold' ? 'The ribbon comes undone…' : 'The seal is broken…';
  const frames: Frame[] = [
    { src: `/covers/${templateId}.jpg`, line: fasteningLine },
    { src: `/covers-untied/${templateId}.jpg`, line: 'The cover opens…' },
  ];
  if (HAS_OPEN_FRAME.has(templateId)) {
    frames.push({ src: `/covers-open/${templateId}.jpg`, line: 'The cover opens…' });
  }
  return frames;
}

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
  const kind = coverKind(template.id);
  const language = data.settings.language;
  const frames = useMemo(() => framesFor(template.id, kind), [template.id, kind]);

  /** 0 = fastened · 1..n-1 = each photographed state · n = the letter */
  const [phase, setPhase] = useState(0);
  const started = useRef(false);
  const timers = useRef<number[]>([]);
  const sound = useRef<OpeningSoundHandle | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    frames.forEach((frame) => {
      const img = new Image();
      img.src = frame.src;
    });
  }, [frames]);

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
        kind === 'ribbon' || kind === 'gatefold' ? 'ribbon' : kind === 'curtain' ? 'curtain' : 'seal',
      );
    }
    if (reduce) {
      onOpen();
      return;
    }
    // One unbroken shot: each state dissolves into the next.
    let at = 0;
    frames.forEach((_, i) => {
      if (i === 0) return;
      at += i === 1 ? UNTIE_MS : OPEN_MS;
      const atMs = at;
      timers.current.push(window.setTimeout(() => setPhase(i), atMs));
    });
    timers.current.push(window.setTimeout(() => setPhase(frames.length), at + OPEN_MS));
    timers.current.push(window.setTimeout(onOpen, at + OPEN_MS + LETTER_MS));
  };

  const released = phase > 0;
  const letterShown = phase >= frames.length;
  const upper = template.cover.namesCase === 'upper';
  const caption = letterShown
    ? t(language, 'reveal')
    : released
      ? frames[Math.min(phase, frames.length - 1)].line
      : '';

  return (
    <motion.div
      className={`inv-gate inv-gate-open ${embedded ? 'inv-gate-embedded' : ''}`}
      style={{ background: gateBg, '--gate-bottom': embedded ? '0px' : `${bottomInset}px` } as React.CSSProperties}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_SILK }}
      data-kind={kind}
    >
      {/* the room: the cover's own photograph, darkened to a backdrop */}
      <img
        src={frames[0].src}
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

        {/* the filmed cover */}
        <div className="inv-gate-cardbox" style={{ overflow: 'hidden', background: '#141210' }}>
          {frames.map((frame, i) => (
            <motion.img
              key={frame.src}
              src={frame.src}
              alt={i === 0 ? `${template.name} cover — ${template.descriptor}` : ''}
              aria-hidden={i !== 0}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              initial={false}
              animate={{
                opacity: phase >= i ? 1 : 0,
                scale: letterShown ? 1.1 : phase >= i ? 1.045 : 1,
              }}
              transition={{
                opacity: { duration: i === 0 ? 0.4 : 1.9, ease: EASE_FILM },
                scale: { duration: letterShown ? 2.4 : 6.5, ease: 'linear' },
              }}
            />
          ))}

          {/* the letter itself, blooming out of the photographed page */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: letterShown ? 1 : 0, scale: letterShown ? 1 : 1.04 }}
            transition={{ duration: 1.35, ease: EASE_FILM }}
            aria-hidden={!letterShown}
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

          {/* one breath of light across the whole shot */}
          <motion.div
            className="inv-gate-sheen"
            aria-hidden="true"
            initial={false}
            animate={released && !letterShown ? { x: '170%', opacity: [0, 0.35, 0] } : { x: '-120%', opacity: 0 }}
            transition={{ duration: 2.2, ease: EASE_SILK }}
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
