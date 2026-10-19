import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import type { InvitationData } from '@shared/types';
import { getTemplate } from '@/templates/registry';
import { coverPhoto } from '@/templates/photoCover';
import { playCinematicOpening, type OpeningSoundHandle } from '@/lib/openingSound';
import { formatDateShort } from '@/lib/format';
import { OpeningLetter } from './OpeningLetter';
import { t } from './i18n';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_PAGE = [0.64, 0, 0.24, 1] as const;

/** prelude, then the cover opens, a beat to see the letter, then hand over */
const PRELUDE_MS = 260;
const TURN_MS = 1180;
const CEREMONY_MS = 2680;

/**
 * The opening. The cover — a photograph of the printed piece — fastens, then
 * gives way: silk-covered cards turn like a page from the spine; theatre
 * curtains and the gatefold part down the middle like doors. Behind it is the
 * letter, dressed in the same palette and ornaments as the cover.
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
  const language = data.settings.language;

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
    if (!reduce) sound.current = playCinematicOpening(template.envelope);

    if (reduce) {
      onOpen();
      return;
    }

    setStage('fastening');
    timers.current.push(window.setTimeout(() => setStage('opening'), PRELUDE_MS));
    timers.current.push(window.setTimeout(() => setStage('open'), PRELUDE_MS + TURN_MS));
    timers.current.push(window.setTimeout(onOpen, CEREMONY_MS));
  };

  const fastening = stage !== 'closed';
  const opening = stage === 'opening' || stage === 'open';
  const parted = template.envelope === 'curtain' || templateId === 'celeste';
  const upper = template.cover.namesCase === 'upper';
  const caption = stage === 'open' ? t(language, 'reveal') : '';

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
      data-kind={parted ? 'doors' : 'page'}
    >
      {/* ------------------------------------------------------------------ */}
      {/* the letter, waiting underneath                                      */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        className="inv-gate-inside"
        initial={false}
        animate={{ scale: opening ? 1 : 1.014 }}
        transition={{ duration: 1.4, ease: EASE_PAGE }}
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
        className="inv-gate-inside-shade"
        initial={false}
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: TURN_MS / 1000, ease: EASE_PAGE }}
        aria-hidden="true"
      />

      {/* ------------------------------------------------------------------ */}
      {/* the cover                                                           */}
      {/* ------------------------------------------------------------------ */}
      <motion.div
        className="inv-gate-cover-layer"
        style={{ perspective: '1900px', perspectiveOrigin: '50% 40%' }}
        animate={{ opacity: stage === 'open' ? 0 : 1 }}
        transition={{ duration: 0.2, ease: 'linear', delay: stage === 'open' ? 0.55 : 0 }}
      >
        {parted ? (
          (['left', 'right'] as const).map((side) => (
            <motion.div
              key={side}
              className={`inv-gate-door inv-gate-door-${side}`}
              style={{
                transformOrigin: side === 'left' ? 'left center' : 'right center',
              }}
              initial={false}
              animate={{ rotateY: opening ? (side === 'left' ? -104 : 104) : 0 }}
              transition={{ duration: TURN_MS / 1000, ease: EASE_PAGE }}
            >
              <div className="inv-gate-door-face">
                <img
                  src={coverPhoto(template.id)}
                  alt={side === 'left' ? `${template.name} cover` : ''}
                  aria-hidden={side === 'right'}
                  className="inv-gate-door-img"
                  style={{ left: side === 'left' ? 0 : '-100%' }}
                  draggable={false}
                />
              </div>
              <span className="inv-gate-door-edge" aria-hidden="true" />
            </motion.div>
          ))
        ) : (
          <motion.div
            className="inv-gate-sheet"
            style={{ transformOrigin: 'left center' }}
            initial={false}
            animate={{ rotateY: opening ? -104 : 0 }}
            transition={{ duration: TURN_MS / 1000, ease: EASE_PAGE }}
          >
            <img
              src={coverPhoto(template.id)}
              alt={`${template.name} cover — ${template.descriptor}`}
              className="inv-gate-sheet-img"
              draggable={false}
            />
            <span className="inv-gate-sheet-back" aria-hidden="true" />
          </motion.div>
        )}

        {/* the light and shadow that live on the closed cover */}
        <motion.div
          className="inv-gate-scrim inv-gate-scrim-top"
          aria-hidden="true"
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: 0.7, ease: EASE_SILK }}
        />
        <motion.div
          className="inv-gate-scrim inv-gate-scrim-bottom"
          aria-hidden="true"
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: 0.7, ease: EASE_SILK }}
        />
        <motion.div
          className="inv-gate-vignette"
          aria-hidden="true"
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: 0.9, ease: EASE_SILK }}
        />

        {/* a single pass of light while the fastening gives */}
        <motion.div
          className="inv-gate-sheen"
          aria-hidden="true"
          initial={false}
          animate={fastening ? { x: '160%', opacity: [0, 0.55, 0] } : { x: '-120%', opacity: 0 }}
          transition={{ duration: 1.5, ease: EASE_SILK }}
        />

        {!embedded && stage === 'closed' && (
          <button type="button" onClick={onOpen} className="inv-gate-skip">
            Skip
          </button>
        )}

        {/* names and the invitation to open */}
        <motion.div
          className="inv-gate-cover-body"
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: 0.5, ease: EASE_SILK }}
        >
          <span className="inv-gate-cover-kicker">
            {guestName && data.settings.showGuestName
              ? `${t(language, 'forGuest')} ${guestName}`
              : 'You are invited'}
          </span>

          <div className="inv-gate-bottom">
            <motion.div
              className="inv-gate-ident"
              animate={fastening ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
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
                animate={{ opacity: fastening ? 0 : 1 }}
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
                animate={{ opacity: stage === 'open' ? 1 : 0 }}
                transition={{ duration: 0.35 }}
                aria-hidden="true"
              >
                <span className="inv-gate-caption">{caption}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <button
          ref={buttonRef}
          type="button"
          onClick={open}
          aria-label={t(language, 'open')}
          className="inv-gate-hit"
          style={{ opacity: fastening ? 0 : 1, pointerEvents: fastening ? 'none' : 'auto' }}
        />
      </motion.div>
    </motion.div>
  );
}
