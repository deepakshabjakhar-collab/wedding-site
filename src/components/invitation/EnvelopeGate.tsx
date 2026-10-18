import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import type { InvitationData } from '@shared/types';
import { getTemplate } from '@/templates/registry';
import {
  CornerFlourish,
  GoldBow,
  StarField,
  TemplateArt,
  TemplateMark,
  WaxSeal,
} from '@/templates/art';
import type { TemplateId } from '@/templates/types';
import { playCinematicOpening, type OpeningSoundHandle } from '@/lib/openingSound';
import { formatDateShort } from '@/lib/format';
import { t } from './i18n';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_DOOR = [0.65, 0, 0.2, 1] as const;
const EASE_EXPAND = [0.76, 0, 0.24, 1] as const;

/** The full ceremony runs just under eleven seconds. */
const OPEN_AT = 10_800;
const SCHEDULE: [number, number][] = [
  [120, 1], // the invitation lifts and catches the light
  [2100, 2], // the fastening gives way
  [4600, 3], // the letter is drawn out
  [7100, 4], // the letter unfolds toward you
  [9200, 5], // the paper blooms into the invitation
];

type GateKind = 'seal' | 'ribbon' | 'curtain' | 'celeste';

export function EnvelopeGate({
  data,
  templateId,
  guestName,
  onOpen,
  onIntent,
  embedded,
}: {
  data: InvitationData;
  templateId: string;
  guestName?: string;
  onOpen: () => void;
  onIntent?: () => void;
  embedded?: boolean;
}) {
  const reduce = useReducedMotion();
  const template = getTemplate(templateId);
  const { gateBg, gateInk } = template.art;
  const upper = template.cover.namesCase === 'upper';

  const setting = data.settings.envelopeAnimation;
  const kind: GateKind =
    templateId === 'celeste'
      ? 'celeste'
      : setting === 'ribbon' || setting === 'curtain' || setting === 'seal'
        ? setting
        : template.envelope;

  const [phase, setPhase] = useState(0);
  const [begun, setBegun] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const sound = useRef<OpeningSoundHandle | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => buttonRef.current?.focus({ preventScroll: true }), 250);
    return () => {
      window.clearTimeout(focusTimer);
      timers.current.forEach((id) => window.clearTimeout(id));
      sound.current?.release(400);
    };
  }, []);

  const open = () => {
    if (started.current) return;
    started.current = true;

    // Both of these must happen inside the original gesture.
    onIntent?.();
    if (!reduce) sound.current = playCinematicOpening(kind);

    if (reduce) {
      onOpen();
      return;
    }

    setBegun(true);
    SCHEDULE.forEach(([delay, next]) => {
      timers.current.push(window.setTimeout(() => setPhase(next), delay));
    });
    timers.current.push(window.setTimeout(onOpen, OPEN_AT));
  };

  const lifted = phase >= 1;
  const broken = phase >= 2;
  const drawn = phase >= 3;
  const expanding = phase >= 4;
  const blooming = phase >= 5;

  const caption =
    phase >= 4
      ? t(data.settings.language, 'reveal')
      : phase >= 2
        ? t(data.settings.language, 'open')
        : t(data.settings.language, 'tapSeal');

  const tapLabel =
    kind === 'seal'
      ? t(data.settings.language, 'tapSeal')
      : kind === 'curtain'
        ? t(data.settings.language, 'reveal')
        : t(data.settings.language, 'open');

  return (
    <motion.div
      className={`inv-gate inv-gate-${templateId} ${embedded ? 'inv-gate-embedded' : ''}`}
      style={{ background: gateBg, color: gateInk }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeOut' } }}
    >
      {/* pool of light on the table */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 42%, color-mix(in srgb, ${gateInk} 12%, transparent), transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.06), transparent 30%, rgba(0,0,0,0.22))`,
        }}
      />

      {/* drifting dust */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {kind === 'celeste' && (
            <StarField className="absolute inset-0 h-full w-full text-[#cfc6ef] opacity-70" count={70} />
          )}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${(i * 37 + 11) % 100}%`,
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                background: gateInk,
              }}
              initial={{ y: '104vh', opacity: 0 }}
              animate={{ y: '-6vh', opacity: [0, 0.35, 0] }}
              transition={{ duration: 13 + (i % 5) * 2, delay: (i % 7) * 0.9, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      {!embedded && (
        <button
          type="button"
          onClick={onOpen}
          className="absolute right-4 top-4 z-40 rounded-full border px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.24em] transition hover:opacity-100 sm:right-6 sm:top-6"
          style={{
            borderColor: `color-mix(in srgb, ${gateInk} 35%, transparent)`,
            color: gateInk,
            opacity: begun ? 0 : 0.75,
            pointerEvents: begun ? 'none' : 'auto',
            fontFamily: 'var(--inv-caps)',
          }}
        >
          Skip
        </button>
      )}

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 py-6">
        <motion.p
          className="mb-4 min-h-[1.25rem] text-center text-[0.72rem] font-semibold uppercase tracking-[0.34em]"
          style={{ fontFamily: 'var(--inv-caps)', color: gateInk }}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: lifted ? 0 : 0.85, y: 0 }}
          transition={{ duration: 0.8, delay: lifted ? 0 : 0.3, ease: EASE_SILK }}
        >
          {guestName && data.settings.showGuestName ? `${t(data.settings.language, 'forGuest')} ${guestName}` : 'You are invited'}
        </motion.p>

        {kind === 'celeste' ? (
          <CelesteGatefold
            data={data}
            lifted={lifted}
            broken={broken}
            drawn={drawn}
            expanding={expanding}
            upper={upper}
            embedded={embedded}
          />
        ) : kind === 'curtain' ? (
          <CurtainStage
            data={data}
            templateId={templateId as TemplateId}
            lifted={lifted}
            broken={broken}
            drawn={drawn}
            expanding={expanding}
            upper={upper}
          />
        ) : (
          <EnvelopeStage
            data={data}
            templateId={templateId as TemplateId}
            kind={kind}
            lifted={lifted}
            broken={broken}
            drawn={drawn}
            expanding={expanding}
            upper={upper}
          />
        )}

        {/* tap cue */}
        <motion.div
          className="mt-5 flex min-h-[3.4rem] flex-col items-center gap-2 text-center"
          initial={false}
          animate={{ opacity: lifted ? 0 : 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="text-[0.78rem] font-semibold uppercase tracking-[0.44em]"
            style={{ fontFamily: 'var(--inv-caps)', color: gateInk }}
            animate={reduce || begun ? undefined : { opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {tapLabel}
          </motion.span>
          {data.music.enabled && (
            <span
              className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em]"
              style={{ fontFamily: 'var(--inv-caps)', color: gateInk, opacity: 0.6 }}
            >
              <Music2 size={12} aria-hidden /> Music begins as it opens
            </span>
          )}
        </motion.div>

        {/* ceremony progress */}
        <div
          className="mt-1 flex w-44 flex-col items-center gap-2 transition-opacity duration-700"
          style={{ opacity: begun ? 1 : 0 }}
          aria-hidden="true"
        >
          <div
            className="h-px w-full overflow-hidden"
            style={{ background: `color-mix(in srgb, ${gateInk} 22%, transparent)` }}
          >
            <motion.div
              className="h-full w-full origin-left"
              style={{ background: 'linear-gradient(90deg, #8a6a3c, #e6c886, #8a6a3c)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: begun ? 1 : 0 }}
              transition={{ duration: OPEN_AT / 1000, ease: 'linear' }}
            />
          </div>
          <span
            className="text-[0.6rem] uppercase tracking-[0.3em]"
            style={{ fontFamily: 'var(--inv-caps)', color: gateInk, opacity: 0.7 }}
          >
            {caption}
          </span>
        </div>
      </div>

      {/* the paper blooms to fill the screen, then hands over to the invitation */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ background: 'var(--inv-bg)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: blooming ? 1 : 0 }}
        transition={{ duration: 1.5, ease: EASE_SILK }}
      />

      <button
        ref={buttonRef}
        type="button"
        onClick={open}
        aria-label={tapLabel}
        className="absolute inset-0 z-30 cursor-pointer"
        style={{ opacity: begun ? 0 : 1, pointerEvents: begun ? 'none' : 'auto' }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The letter shared by every ceremony                                 */
/* ------------------------------------------------------------------ */

function LetterCard({
  data,
  templateId,
  upper,
  compact,
}: {
  data: InvitationData;
  templateId: TemplateId;
  upper: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center text-center"
      style={{
        background: 'linear-gradient(165deg, #fffef9 0%, var(--inv-surface) 46%, color-mix(in srgb, var(--inv-surface) 82%, var(--inv-accent-soft)) 100%)',
        color: 'var(--inv-ink)',
        containerType: 'inline-size',
        padding: compact ? '6cqw 7cqw' : '5cqw 6cqw',
      }}
    >
      <div
        className="pointer-events-none absolute"
        style={{ inset: '3.5%', border: '1px solid color-mix(in srgb, var(--inv-accent) 45%, transparent)' }}
      />
      <div
        className="pointer-events-none absolute"
        style={{ inset: '5%', border: '1px solid color-mix(in srgb, var(--inv-accent) 22%, transparent)' }}
      />
      <TemplateMark templateId={templateId} className="h-[4.5cqw] w-[16cqw] text-[var(--inv-accent)]" />
      <p
        className="mt-[3cqw] text-[2.6cqw] font-semibold uppercase"
        style={{ fontFamily: 'var(--inv-caps)', letterSpacing: '0.34em', color: 'var(--inv-muted)' }}
      >
        Together with our families
      </p>
      <p
        className={`mt-[2.5cqw] leading-[1.04] ${upper ? 'uppercase' : ''}`}
        style={{ fontFamily: 'var(--inv-display)', fontSize: '10.5cqw', letterSpacing: '-0.015em' }}
      >
        {data.coupleA}
      </p>
      <p className="leading-none" style={{ fontFamily: 'var(--inv-script)', fontSize: '8cqw', color: 'var(--inv-accent)', margin: '0.5cqw 0' }}>
        &
      </p>
      <p
        className={`leading-[1.04] ${upper ? 'uppercase' : ''}`}
        style={{ fontFamily: 'var(--inv-display)', fontSize: '10.5cqw', letterSpacing: '-0.015em' }}
      >
        {data.coupleB}
      </p>
      <span className="mt-[3.5cqw] flex items-center gap-[2cqw]" style={{ color: 'var(--inv-accent)' }} aria-hidden>
        <span className="h-px w-[10cqw] bg-current opacity-70" />
        <span className="size-[1.4cqw] rotate-45 bg-current" />
        <span className="h-px w-[10cqw] bg-current opacity-70" />
      </span>
      <p
        className="mt-[2.5cqw] text-[3cqw] font-medium uppercase"
        style={{ fontFamily: 'var(--inv-caps)', letterSpacing: '0.28em', color: 'var(--inv-ink)' }}
      >
        {formatDateShort(data.weddingDate)} · {data.location.split(',')[0]}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seal & ribbon — the embroidered envelope                            */
/* ------------------------------------------------------------------ */

function EnvelopeStage({
  data,
  templateId,
  kind,
  lifted,
  broken,
  drawn,
  expanding,
  upper,
}: {
  data: InvitationData;
  templateId: TemplateId;
  kind: 'seal' | 'ribbon';
  lifted: boolean;
  broken: boolean;
  drawn: boolean;
  expanding: boolean;
  upper: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="relative w-[min(88vw,30rem)]"
      style={{ aspectRatio: '3 / 2.1', perspective: '1400px' }}
      initial={reduce ? false : { opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: lifted && !drawn ? -10 : 0, scale: 1 }}
      transition={{ duration: lifted ? 1.8 : 1.2, ease: EASE_SILK }}
    >
      {/* shadow pooled beneath */}
      <motion.div
        className="absolute -bottom-7 left-1/2 h-8 w-[86%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-xl"
        initial={false}
        animate={{ opacity: lifted && !expanding ? 0.55 : 0.35, scaleX: lifted && !expanding ? 0.92 : 1 }}
        transition={{ duration: 1.6, ease: EASE_SILK }}
        aria-hidden="true"
      />

      {/* envelope back */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(150deg, color-mix(in srgb, var(--inv-surface) 94%, #fff), color-mix(in srgb, var(--inv-surface) 84%, var(--inv-accent-soft)))',
          border: '1px solid color-mix(in srgb, var(--inv-line) 80%, transparent)',
          borderRadius: 3,
          boxShadow: lifted && !expanding ? '0 60px 100px -40px rgba(0,0,0,0.55)' : '0 34px 70px -40px rgba(0,0,0,0.45)',
        }}
      />

      {/* the letter, waiting inside */}
      <motion.div
        className="absolute overflow-hidden"
        style={{ left: '5%', right: '5%', bottom: '7%', height: '86%', zIndex: 2, borderRadius: 2 }}
        initial={false}
        animate={{
          y: drawn ? '-54%' : lifted ? '-4%' : '0%',
          scale: 1,
        }}
        transition={
          drawn
            ? { y: { duration: 2.4, ease: EASE_SILK } }
            : { duration: 1.4, ease: EASE_SILK }
        }
      >
        <LetterCard data={data} templateId={templateId} upper={upper} compact />
      </motion.div>

      {/* envelope front pocket */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 4,
          clipPath: 'polygon(0 100%, 0 26%, 50% 60%, 100% 26%, 100% 100%)',
          background: 'linear-gradient(165deg, color-mix(in srgb, var(--inv-surface) 97%, #fff), color-mix(in srgb, var(--inv-surface) 86%, var(--inv-line)))',
          borderRadius: 3,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          zIndex: 4,
          clipPath: 'polygon(0 100%, 0 26%, 50% 60%, 100% 26%, 100% 100%)',
          boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--inv-line) 60%, transparent)',
          borderRadius: 3,
        }}
      />
      {/* embroidered edge along the pocket */}
      <svg viewBox="0 0 300 210" className="absolute inset-0 z-[4] h-full w-full" aria-hidden="true" preserveAspectRatio="none">
        <path
          d="M4 206 L4 60 L150 128 L296 60 L296 206"
          fill="none"
          stroke="var(--inv-accent)"
          strokeOpacity="0.55"
          strokeWidth="1.6"
          strokeDasharray="5 5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* the flap */}
      <motion.div
        className="absolute inset-0"
        style={{
          zIndex: drawn ? 1 : 3,
          transformOrigin: 'top center',
          clipPath: 'polygon(0 0, 100% 0, 50% 60%)',
          background: 'linear-gradient(180deg, color-mix(in srgb, var(--inv-surface) 90%, var(--inv-accent-soft)), color-mix(in srgb, var(--inv-surface) 96%, #fff))',
          borderRadius: 3,
          backfaceVisibility: 'hidden',
        }}
        initial={false}
        animate={{ rotateX: drawn ? -168 : 0 }}
        transition={{ duration: 1.7, ease: EASE_DOOR }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[62%]"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.16), transparent)',
          clipPath: 'polygon(0 0, 100% 0, 50% 96%)',
          transformOrigin: 'top center',
        }}
        initial={false}
        animate={{ opacity: drawn ? 0 : 1, rotateX: drawn ? -168 : 0 }}
        transition={{ duration: 1.7, ease: EASE_DOOR }}
      />

      {/* corner embroidery */}
      {(['left-2 top-2', 'right-2 top-2 -scale-x-100', 'bottom-2 left-2 -scale-y-100', 'bottom-2 right-2 -scale-100'] as const).map((pos) => (
        <CornerFlourish key={pos} className={`absolute z-[5] h-6 w-6 text-[var(--inv-accent)] opacity-70 ${pos}`} />
      ))}

      {/* the fastening */}
      {kind === 'seal' ? (
        <motion.div
          className="absolute left-1/2 top-[46%] z-[6] -translate-x-1/2 -translate-y-1/2"
          style={{ color: 'color-mix(in srgb, var(--inv-accent) 78%, #4a1f1f)' }}
          initial={false}
          animate={{ opacity: drawn ? 0 : 1, y: drawn ? 46 : 0, scale: broken && !drawn ? 1.12 : 1 }}
          transition={{ duration: drawn ? 0.9 : 0.5, ease: EASE_SILK }}
        >
          <motion.div
            animate={reduce || broken ? undefined : { scale: [1, 1.045, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <WaxSeal monogram={data.monogram} cracked={broken} className="h-20 w-20 drop-shadow-[0_14px_20px_rgba(0,0,0,0.4)] sm:h-24 sm:w-24" />
          </motion.div>
        </motion.div>
      ) : (
        <>
          {/* silk bands */}
          <motion.div
            className="absolute inset-y-0 left-1/2 z-[5] w-[9%] -translate-x-1/2"
            style={{ background: 'linear-gradient(90deg, #7d5628, #dcb876 48%, #7d5628)', boxShadow: '0 0 18px rgba(0,0,0,0.25)' }}
            initial={false}
            animate={{ x: broken ? '-420%' : '-50%', opacity: broken ? 0 : 1, rotate: broken ? -6 : 0 }}
            transition={{ duration: 1.5, ease: EASE_DOOR }}
          />
          <motion.div
            className="absolute inset-x-0 top-1/2 z-[5] h-[13%] -translate-y-1/2"
            style={{ background: 'linear-gradient(180deg, #7d5628, #dcb876 48%, #7d5628)', boxShadow: '0 0 18px rgba(0,0,0,0.25)' }}
            initial={false}
            animate={{ x: broken ? '60%' : '0%', opacity: broken ? 0 : 1, rotate: broken ? 6 : 0 }}
            transition={{ duration: 1.5, ease: EASE_DOOR }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 z-[6] -translate-x-1/2 -translate-y-1/2"
            initial={false}
            animate={{ opacity: drawn ? 0 : 1, y: drawn ? 40 : broken ? 8 : 0, scale: broken ? 0.86 : 1, rotate: broken ? -10 : 0 }}
            transition={{ duration: drawn ? 0.9 : 1.1, ease: EASE_SILK }}
          >
            <motion.div
              animate={reduce || broken ? undefined : { scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <GoldBow className="h-[74px] w-[96px] drop-shadow-[0_14px_18px_rgba(60,40,16,0.45)] sm:h-[86px] sm:w-[112px]" />
            </motion.div>
          </motion.div>
        </>
      )}

      {/* light travelling across the paper */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 z-[7] overflow-hidden" aria-hidden="true" style={{ borderRadius: 3 }}>
          <motion.div
            className="absolute inset-y-0 w-[55%]"
            style={{
              background: 'linear-gradient(105deg, transparent 0%, rgba(255,244,214,0) 20%, rgba(255,244,214,0.5) 50%, rgba(255,244,214,0) 80%, transparent 100%)',
              mixBlendMode: 'soft-light',
            }}
            initial={{ x: '-120%' }}
            animate={{ x: lifted ? '260%' : '-120%' }}
            transition={{ duration: 2, ease: EASE_SILK }}
          />
        </div>
      )}

      {/* the letter's final bloom toward the camera */}
      <ExpandingVeil active={expanding}>
        <LetterCard data={data} templateId={templateId} upper={upper} compact />
      </ExpandingVeil>
    </motion.div>
  );
}

/** A duplicate of the letter that blooms to fill the screen for the handover. */
function ExpandingVeil({ active, children }: { active: boolean; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (!active || reduce) return null;
  return (
    <motion.div
      className="absolute overflow-hidden"
      style={{ left: '5%', right: '5%', bottom: '7%', height: '86%', zIndex: 8, borderRadius: 2 }}
      initial={{ y: '-54%', scale: 1 }}
      animate={{ y: '-54%', scale: 9 }}
      transition={{ duration: 2.1, ease: EASE_EXPAND }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Curtain — the theatre drapes part                                     */
/* ------------------------------------------------------------------ */

function CurtainStage({
  data,
  templateId,
  lifted,
  broken,
  drawn,
  expanding,
  upper,
}: {
  data: InvitationData;
  templateId: TemplateId;
  lifted: boolean;
  broken: boolean;
  drawn: boolean;
  expanding: boolean;
  upper: boolean;
}) {
  const reduce = useReducedMotion();
  const fabric =
    'repeating-linear-gradient(90deg, rgba(0,0,0,0.4) 0 5px, rgba(255,255,255,0.05) 5px 9px, transparent 9px 22px), linear-gradient(90deg, #0c0a09, var(--inv-deep) 30%, color-mix(in srgb, var(--inv-deep) 70%, var(--inv-accent)) 50%, var(--inv-deep) 70%, #0c0a09)';
  return (
    <motion.div
      className="relative w-[min(84vw,23rem)]"
      style={{ aspectRatio: '3 / 4.1', perspective: '1400px' }}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: EASE_SILK }}
    >
      {/* the invitation waiting behind the drapes */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: 3,
          boxShadow: '0 50px 100px -40px rgba(0,0,0,0.6)',
          filter: broken ? 'brightness(1)' : 'brightness(0.5)',
        }}
        initial={false}
        animate={{
          scale: expanding ? 9 : drawn ? 1.05 : lifted ? 1.02 : 1,
          filter: broken ? 'brightness(1)' : 'brightness(0.5)',
        }}
        transition={
          expanding
            ? { duration: 2.1, ease: EASE_EXPAND }
            : { duration: 1.8, ease: EASE_SILK }
        }
      >
        <LetterCard data={data} templateId={templateId} upper={upper} />
      </motion.div>

      {/* the drapes */}
      {(['left', 'right'] as const).map((side) => (
        <motion.div
          key={side}
          className="absolute inset-y-[-4%] w-[54%]"
          style={{
            [side]: '-2%',
            background: fabric,
            boxShadow: side === 'left' ? '12px 0 30px -12px rgba(0,0,0,0.7)' : '-12px 0 30px -12px rgba(0,0,0,0.7)',
            borderLeft: side === 'right' ? '2px solid color-mix(in srgb, var(--inv-accent) 70%, #fff)' : undefined,
            borderRight: side === 'left' ? '2px solid color-mix(in srgb, var(--inv-accent) 70%, #fff)' : undefined,
          }}
          initial={false}
          animate={{ x: broken ? (side === 'left' ? '-108%' : '108%') : '0%' }}
          transition={{ duration: 2.9, ease: EASE_DOOR }}
        >
          <div
            className="absolute inset-y-0 w-10"
            style={{
              [side === 'left' ? 'right' : 'left']: 0,
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.45))',
              transform: side === 'left' ? undefined : 'scaleX(-1)',
            }}
          />
        </motion.div>
      ))}

      {/* valance */}
      <div
        className="absolute inset-x-[-4%] top-[-4%] z-[5] h-14"
        style={{
          background: `${fabric}, var(--inv-deep)`,
          borderBottom: '1px solid color-mix(in srgb, var(--inv-accent) 60%, transparent)',
          boxShadow: '0 14px 30px -14px rgba(0,0,0,0.7)',
        }}
      >
        <div className="flex h-full items-center justify-center">
          <TemplateMark templateId={templateId} className="h-6 w-24 text-[var(--inv-accent)]" />
        </div>
      </div>

      {/* the medallion that parts them */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-[6] -translate-x-1/2 -translate-y-1/2"
        style={{ color: 'color-mix(in srgb, var(--inv-accent) 80%, #3a2a12)' }}
        initial={false}
        animate={{ opacity: broken ? 0 : 1, scale: broken ? 1.4 : 1 }}
        transition={{ duration: 0.8, ease: EASE_SILK }}
      >
        <motion.div
          animate={reduce || broken ? undefined : { scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <WaxSeal monogram={data.monogram} cracked={false} className="h-20 w-20 drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)] sm:h-24 sm:w-24" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Céleste — the celestial gatefold. The letter animation lives here,  */
/* and only here.                                                      */
/* ------------------------------------------------------------------ */

const CARD_RATIO = 768 / 1376;

function CelesteGatefold({
  data,
  lifted,
  broken,
  drawn,
  expanding,
  upper,
  embedded,
}: {
  data: InvitationData;
  lifted: boolean;
  broken: boolean;
  drawn: boolean;
  expanding: boolean;
  upper: boolean;
  embedded?: boolean;
}) {
  const reduce = useReducedMotion();
  const names = `${data.coupleA} & ${data.coupleB}`;
  const doorsOpen = broken;
  return (
    <motion.div
      className="relative"
      style={{
        width: embedded ? 'auto' : `min(84vw, calc(min(70svh, 48rem) * ${CARD_RATIO}))`,
        height: embedded ? '72%' : undefined,
        aspectRatio: '768 / 1376',
        perspective: '1800px',
        containerType: 'inline-size',
      }}
      initial={reduce ? false : { opacity: 0, y: 26, scale: 0.97 }}
      animate={expanding ? { opacity: 1, y: 0, scale: 9 } : { opacity: 1, y: 0, scale: lifted ? 1.03 : 1 }}
      transition={expanding ? { duration: 2.1, ease: EASE_EXPAND } : { duration: lifted ? 1.8 : 1.2, ease: EASE_SILK }}
    >
      <div
        className="absolute inset-0 transition-shadow duration-[1400ms]"
        style={{
          boxShadow: lifted && !expanding ? '0 70px 120px -50px rgba(0,0,0,0.65)' : '0 40px 80px -50px rgba(0,0,0,0.45)',
        }}
        aria-hidden="true"
      />

      {/* the night sky inside, waiting behind the doors */}
      <motion.div
        className="absolute inset-0 z-[1] overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0a0e22 0%, #141b3a 45%, #080b16 100%)', borderRadius: 2 }}
        initial={false}
        animate={{ filter: doorsOpen ? 'brightness(1)' : 'brightness(0.5)' }}
        transition={{ duration: 2.8, ease: EASE_SILK }}
      >
        <TemplateArt templateId="celeste" className="absolute inset-0 h-full w-full text-[#cfc6ef] opacity-80" />
        <StarField className="absolute inset-0 h-full w-full text-[#efeaff] opacity-60" count={50} />
        <div className="absolute left-1/2 top-[9%] h-[16cqw] w-[16cqw] -translate-x-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle at 38% 34%, #f4f0ff, #cfc6ef 55%, transparent 72%)', boxShadow: '0 0 60px 18px rgba(203,185,230,0.35)' }}
        />
        <motion.div
          className="absolute inset-x-0 top-[34%] flex flex-col items-center px-[8%] text-center text-[#fdf7ea]"
          initial={false}
          animate={{ opacity: drawn && !expanding ? 1 : 0, y: drawn && !expanding ? 0 : 14 }}
          transition={{ duration: expanding ? 0.5 : 1.6, delay: drawn && !expanding ? 0.9 : 0, ease: EASE_SILK }}
        >
          <span
            className={`block leading-[0.98] ${upper ? 'uppercase' : ''}`}
            style={{ fontFamily: 'var(--inv-display)', fontSize: '13cqw', letterSpacing: '0.1em', textShadow: '0 2px 26px rgba(0,0,0,0.5)' }}
          >
            {data.coupleA}
          </span>
          <span className="block leading-none" style={{ fontFamily: 'var(--inv-script)', fontSize: '10cqw', margin: '1.4cqw 0', color: '#cbb9e6' }}>
            &
          </span>
          <span
            className={`block leading-[0.98] ${upper ? 'uppercase' : ''}`}
            style={{ fontFamily: 'var(--inv-display)', fontSize: '13cqw', letterSpacing: '0.1em', textShadow: '0 2px 26px rgba(0,0,0,0.5)' }}
          >
            {data.coupleB}
          </span>
          <span className="mt-[4cqw] flex items-center gap-[2.5cqw]" style={{ color: '#cbb9e6' }} aria-hidden>
            <span className="h-px w-[12cqw] bg-current opacity-70" />
            <span className="size-[1.6cqw] rotate-45 bg-current" />
            <span className="h-px w-[12cqw] bg-current opacity-70" />
          </span>
          <span className="mt-[3cqw] block text-[3.4cqw] uppercase" style={{ fontFamily: 'var(--inv-caps)', letterSpacing: '0.3em' }}>
            {formatDateShort(data.weddingDate)}
          </span>
        </motion.div>
      </motion.div>

      {/* the two leaves of the gatefold */}
      {(['left', 'right'] as const).map((side) => (
        <motion.div
          key={side}
          className="absolute inset-y-0 z-[3] w-1/2 overflow-hidden"
          style={{
            [side]: 0,
            transformOrigin: side === 'left' ? 'left center' : 'right center',
            background: 'linear-gradient(160deg, #10142b 0%, #1a2144 50%, #0b0e20 100%)',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
          }}
          initial={false}
          animate={{
            rotateY: doorsOpen ? (side === 'left' ? -118 : 118) : 0,
            opacity: expanding ? 0 : 1,
          }}
          transition={{
            rotateY: { duration: 3.4, ease: EASE_DOOR },
            opacity: { duration: 0.6 },
          }}
        >
          <div className="absolute inset-0" style={{ width: '200%', [side === 'left' ? 'left' : 'right']: 0 }}>
            <StarField className="absolute inset-0 h-full w-full text-[#b9aee0] opacity-50" count={46} />
          </div>
          <div className="absolute inset-3 border border-[#cbb9e6]/30" />
          <div className="absolute inset-4 border border-[#cbb9e6]/15" />
          <TemplateMark templateId="celeste" className="absolute left-1/2 top-[7%] h-5 w-20 -translate-x-1/2 text-[#cbb9e6]/80" />
          <p
            className="absolute inset-x-0 bottom-[8%] text-center text-[0.6rem] uppercase tracking-[0.4em] text-[#cbb9e6]/70"
            style={{ fontFamily: 'var(--inv-caps)' }}
          >
            {side === 'left' ? data.coupleA : data.coupleB}
          </p>
          <motion.div
            className="absolute inset-0 bg-black"
            initial={false}
            animate={{ opacity: doorsOpen ? 0.55 : 0 }}
            transition={{ duration: 2.6, ease: EASE_SILK }}
          />
        </motion.div>
      ))}

      {/* gold spine where the doors meet */}
      <motion.div
        className="absolute inset-y-0 left-1/2 z-[4] w-px -translate-x-1/2"
        style={{ background: 'linear-gradient(180deg, transparent, #cbb9e6 20%, #cbb9e6 80%, transparent)', opacity: 0.7 }}
        initial={false}
        animate={{ opacity: doorsOpen ? 0 : 0.7 }}
        transition={{ duration: 0.8 }}
      />

      {/* light travelling across the paper before it opens */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute inset-y-0 w-[55%]"
            style={{
              background: 'linear-gradient(105deg, transparent 0%, rgba(255,244,214,0) 20%, rgba(255,244,214,0.55) 50%, rgba(255,244,214,0) 80%, transparent 100%)',
              mixBlendMode: 'soft-light',
            }}
            initial={{ x: '-120%' }}
            animate={{ x: lifted ? '260%' : '-120%', opacity: doorsOpen ? 0 : 1 }}
            transition={{ x: { duration: 2, ease: EASE_SILK }, opacity: { duration: 0.3 } }}
          />
        </div>
      )}

      {/* the name card tucked under the doors — only Céleste keeps this */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[8.5%] z-[6] -translate-x-1/2 whitespace-nowrap text-center shadow-[0_10px_24px_-14px_rgba(40,26,12,0.7)]"
        style={{
          width: '60%',
          padding: '2.4cqw 3cqw',
          background: 'color-mix(in srgb, var(--inv-surface) 96%, #fff)',
          color: 'var(--inv-ink)',
          border: '1px solid color-mix(in srgb, var(--inv-accent) 35%, transparent)',
        }}
        initial={false}
        animate={{ opacity: lifted ? 0 : 1, y: lifted ? -10 : 0 }}
        transition={{ duration: 0.9, ease: EASE_SILK }}
      >
        <span className="block leading-none" style={{ fontFamily: 'var(--inv-script)', fontSize: names.length > 18 ? '6.2cqw' : '7.6cqw' }}>
          {names}
        </span>
      </motion.div>
    </motion.div>
  );
}
