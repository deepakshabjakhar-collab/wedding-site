import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import type { InvitationData } from '@shared/types';
import { getTemplate } from '@/templates/registry';
import { coverPhoto } from '@/templates/photoCover';
import { coverTokens } from '@/templates/cover';
import { playCinematicOpening, type OpeningSoundHandle } from '@/lib/openingSound';
import { formatDateShort } from '@/lib/format';
import { OpeningLetter } from './OpeningLetter';
import { CURTAIN_CLIPS, FASTENING, FASTEN_MS, FasteningPieces, ReleasedCover } from './Fastening';
import { t } from './i18n';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_DOOR = [0.7, 0, 0.24, 1] as const;

/** Act II — the cover parts. Act III — a beat with the letter, then hand over. */
const TURN_MS = 1450;
const LETTER_BEAT_MS = 1150;

const FASTENING_LINE: Record<string, string> = {
  'bow': 'The ribbon is untied…',
  'bow-seal': 'The seal breaks, the ribbon loosens…',
  'seal': 'The seal is broken…',
  'seal-band': 'The seal breaks, the ribbon falls away…',
  'curtain': 'The tiebacks are released…',
};

/**
 * The opening ceremony, in two acts — never a book being flipped.
 *
 * The photographed cover stands as a portrait card on a darkened stage.
 * Act I: its fastening undoes itself — a bow unties loop by loop, a wax
 * seal cracks in two, curtain tiebacks drop (see Fastening.tsx, where each
 * piece is a live clipped copy of the photograph itself).
 * Act II: only once the fastening is undone does the cover part down the
 * middle like gatefold doors — or, for Belgrave, the drapes bunch to the
 * wings — revealing the letter dressed in the same world.
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
  const { gateBg } = template.art;
  const tokens = coverTokens(template);
  const language = data.settings.language;
  const spec = FASTENING[template.id] ?? FASTENING.aurelia;
  const fastenMs = FASTEN_MS[spec.kind];
  const src = coverPhoto(template.id);

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
        spec.kind === 'curtain' ? 'curtain' : spec.kind === 'bow' ? 'ribbon' : spec.kind === 'bow-seal' ? 'celeste' : 'seal',
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
  const curtain = spec.kind === 'curtain';
  const upper = template.cover.namesCase === 'upper';
  const caption =
    stage === 'open'
      ? t(language, 'reveal')
      : stage === 'fastening'
        ? FASTENING_LINE[spec.kind]
        : stage === 'opening'
          ? curtain
            ? 'The curtains part…'
            : 'The cover opens…'
          : '';

  return (
    <motion.div
      className={`inv-gate inv-gate-open ${embedded ? 'inv-gate-embedded' : ''}`}
      style={
        {
          background: gateBg,
          '--gate-bottom': embedded ? '0px' : `${bottomInset}px`,
        } as React.CSSProperties
      }
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_SILK }}
      data-kind={spec.kind}
    >
      {/* the stage: the cover's own photograph, darkened to a backdrop */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ filter: 'blur(46px) saturate(0.7) brightness(0.42)' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 62% at 50% 42%, rgba(255,246,226,0.14), transparent 62%), linear-gradient(180deg, rgba(0,0,0,0.42), transparent 30%, transparent 68%, rgba(0,0,0,0.6))',
        }}
      />

      <div className="inv-gate-ceremony">
        <motion.span
          className="inv-gate-cover-kicker"
          animate={{ opacity: released ? 0 : 1, y: released ? -8 : 0 }}
          transition={{ duration: 0.45, ease: EASE_SILK }}
        >
          {guestName && data.settings.showGuestName
            ? `${t(language, 'forGuest')} ${guestName}`
            : 'You are invited'}
        </motion.span>

        {/* ------------------------------------------------------------ */}
        {/* the card                                                      */}
        {/* ------------------------------------------------------------ */}
        <div className="inv-gate-cardbox">
          {/* the letter, waiting inside the card */}
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ scale: opening ? 1 : 1.025 }}
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
              guestName={
                guestName && data.settings.showGuestName ? `${t(language, 'forGuest')} ${guestName}` : undefined
              }
            />
          </motion.div>

          {/* the shade the closed cover throws on the letter */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(20,12,4,0.3), rgba(20,12,4,0.05) 40%, rgba(20,12,4,0.34))' }}
            initial={false}
            animate={{ opacity: opening ? 0 : 1 }}
            transition={{ duration: TURN_MS / 1000, ease: EASE_DOOR }}
          />

          {/* Act II — the cover itself. Two gatefold halves (or two drapes);
              never a single sheet turning like a page. */}
          {curtain ? (
            (['left', 'right'] as const).map((side) => (
              <motion.div
                key={side}
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  clipPath: CURTAIN_CLIPS[side],
                  transformOrigin: side === 'left' ? '0% 50%' : '100% 50%',
                  zIndex: 20,
                  willChange: 'transform, opacity',
                }}
                initial={false}
                animate={
                  opening
                    ? { x: side === 'left' ? '-58%' : '58%', scaleX: 0.62, opacity: stage === 'open' ? 0 : 1 }
                    : { x: '0%', scaleX: 1, opacity: 1 }
                }
                transition={{ duration: TURN_MS / 1000, ease: EASE_DOOR }}
              >
                <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
              </motion.div>
            ))
          ) : (
            (['left', 'right'] as const).map((side) => (
              <motion.div
                key={side}
                aria-hidden="true"
                className="absolute top-0 bottom-0 overflow-hidden"
                style={{
                  [side]: 0,
                  width: '50.4%',
                  zIndex: 20,
                  willChange: 'transform, opacity',
                  boxShadow: side === 'left' ? '-18px 0 34px -22px rgba(0,0,0,0.55)' : '18px 0 34px -22px rgba(0,0,0,0.55)',
                } as React.CSSProperties}
                initial={false}
                animate={
                  opening
                    ? { x: side === 'left' ? '-104%' : '104%', opacity: stage === 'open' ? 0 : 1 }
                    : { x: '0%', opacity: 1 }
                }
                transition={{ duration: TURN_MS / 1000, ease: EASE_DOOR }}
              >
                <div
                  className="absolute top-0 bottom-0"
                  style={{ width: '198.4%', [side === 'left' ? 'left' : 'right']: 0 } as React.CSSProperties}
                >
                  <ReleasedCover src={src} spec={spec} tint={tokens.bg} />
                </div>
                {/* the centre seam the bow was tied across */}
                <span
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 w-px"
                  style={{
                    [side === 'left' ? 'right' : 'left']: 0,
                    background: 'linear-gradient(180deg, transparent, rgba(30,20,8,0.28) 22%, rgba(30,20,8,0.28) 78%, transparent)',
                  } as React.CSSProperties}
                />
              </motion.div>
            ))
          )}

          {/* Act I — the fastening undoes itself, over the cover */}
          <div className="absolute inset-0" style={{ zIndex: 30, pointerEvents: 'none' }}>
            <FasteningPieces src={src} spec={spec} released={released} />
          </div>

          {/* a single pass of light as the fastening gives */}
          <motion.div
            className="inv-gate-sheen"
            aria-hidden="true"
            initial={false}
            animate={released && !opening ? { x: '160%', opacity: [0, 0.5, 0] } : { x: '-120%', opacity: 0 }}
            transition={{ duration: 1.4, ease: EASE_SILK }}
          />
        </div>

        {/* names and the invitation to open */}
        <div className="inv-gate-undercard">
          <motion.div
            className="inv-gate-ident"
            animate={released ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_SILK }}
          >
            <h1
              className={`inv-gate-names ${upper ? 'uppercase' : ''}`}
              style={{ letterSpacing: template.cover.namesCase === 'upper' ? '0.06em' : template.cover.tracking }}
            >
              {data.coupleA}
              <span className="inv-gate-amp">&amp;</span>
              {data.coupleB}
            </h1>
            <p className="inv-gate-date">
              {formatDateShort(data.weddingDate)}
              <span aria-hidden> · </span>
              {data.location.split(',')[0]}
            </p>
          </motion.div>

          <div className="inv-gate-cue-wrap">
            <motion.div
              className="inv-gate-cue"
              animate={{ opacity: released ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
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

      {!embedded && stage === 'closed' && (
        <button type="button" onClick={onOpen} className="inv-gate-skip">
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
