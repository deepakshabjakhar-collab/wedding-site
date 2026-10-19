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
import { DiamondRule, LaurelCrest, RoyalCorner } from '@/templates/ornaments';
import type { TemplateId } from '@/templates/types';
import { playCinematicOpening, type OpeningSoundHandle } from '@/lib/openingSound';
import { formatDateShort } from '@/lib/format';
import { t } from './i18n';

const EASE_SILK = [0.22, 0.61, 0.36, 1] as const;
const EASE_PAGE = [0.65, 0, 0.2, 1] as const;
const EASE_DOOR = [0.7, 0, 0.22, 1] as const;

/** The ceremony is a short, confident four seconds — never a wait. */
const CEREMONY_MS = 4200;

type GateKind = 'seal' | 'ribbon' | 'curtain' | 'gatefold';

/**
 * The opening service: a full-screen printed cover, then the stationery opens
 * — wax seal, silk ribbon, theatre curtains or a gatefold — and the letter is
 * drawn out. The hand-over to the invitation is a page lift, never a zoom.
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
  const upper = template.cover.namesCase === 'upper';

  const setting = data.settings.envelopeAnimation;
  const kind: GateKind =
    templateId === 'celeste'
      ? 'gatefold'
      : setting === 'ribbon' || setting === 'curtain' || setting === 'seal'
        ? setting
        : template.envelope === 'curtain'
          ? 'curtain'
          : template.envelope;

  const [phase, setPhase] = useState(0);
  const [begun, setBegun] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const sound = useRef<OpeningSoundHandle | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => buttonRef.current?.focus({ preventScroll: true }), 250);
    const previousOverflow = document.body.style.overflow;
    if (!embedded) document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(focusTimer);
      timers.current.forEach((id) => window.clearTimeout(id));
      sound.current?.release(400);
      if (!embedded) document.body.style.overflow = previousOverflow;
    };
  }, [embedded]);

  const open = () => {
    if (started.current) return;
    started.current = true;

    // Both of these must happen inside the original gesture.
    onIntent?.();
    if (!reduce) sound.current = playCinematicOpening(kind === 'gatefold' ? 'celeste' : kind);

    if (reduce) {
      onOpen();
      return;
    }

    setBegun(true);
    setPhase(1);
    const beats: [number, number][] =
      kind === 'curtain' || kind === 'gatefold'
        ? [
            [260, 2],
            [1900, 3],
            [3000, 4],
          ]
        : [
            [560, 2],
            [1250, 3],
            [2900, 4],
          ];
    beats.forEach(([delay, next]) => {
      timers.current.push(window.setTimeout(() => setPhase(next), delay));
    });
    timers.current.push(window.setTimeout(onOpen, CEREMONY_MS));
  };

  const opening = phase >= 1;
  const drawn = phase >= 3;
  const lifting = phase >= 4;

  const language = data.settings.language;
  const caption = lifting || drawn ? t(language, 'reveal') : begun ? t(language, 'open') : '';
  const tapLabel =
    kind === 'seal'
      ? t(language, 'tapSeal')
      : kind === 'curtain'
        ? t(language, 'reveal')
        : kind === 'gatefold'
          ? t(language, 'reveal')
          : t(language, 'open');

  const gold = `color-mix(in srgb, var(--inv-accent) 78%, #e7cd94)`;
  const plateWidth =
    kind === 'curtain' || kind === 'gatefold'
      ? 'min(88cqw, 26rem, calc(58cqh * 0.72))'
      : 'min(94cqw, 28rem, calc(56cqh * 1.463))';

  return (
    <motion.div
      className={`inv-gate inv-gate-${kind} ${embedded ? 'inv-gate-embedded' : ''}`}
      style={
        {
          background: gateBg,
          color: gateInk,
          '--gate-gold': gold,
          '--gate-bottom': embedded ? '0px' : bottomInset ? `${bottomInset}px` : '0px',
        } as React.CSSProperties
      }
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE_SILK }}
      data-kind={kind}
    >
      <motion.div
        className="inv-gate-panel"
        animate={{ y: lifting ? '-100%' : '0%' }}
        transition={{ duration: 1.05, ease: EASE_PAGE }}
      >
        {/* the table, the light, the grain */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(120% 74% at 50% 6%, color-mix(in srgb, ${gateInk} 14%, transparent), transparent 58%),
              radial-gradient(90% 56% at 50% 108%, rgba(0,0,0,0.55), transparent 70%),
              linear-gradient(178deg, color-mix(in srgb, ${gateBg} 92%, #fff) 0%, ${gateBg} 36%, color-mix(in srgb, ${gateBg} 62%, #0a0806) 100%)`,
          }}
        />
        <div
          className="cover-damask pointer-events-none absolute inset-0"
          style={{ color: gateInk, opacity: 0.055 }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 0 160px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.14)' }}
        />

        {/* the printed frame around the whole cover */}
        <div
          className="pointer-events-none absolute inset-[max(0.7rem,2.4cqw)] z-[5] border"
          style={{ borderColor: `color-mix(in srgb, ${gateInk} 26%, transparent)` }}
        />
        <div
          className="pointer-events-none absolute inset-[max(1rem,3.2cqw)] z-[5] border"
          style={{ borderColor: `color-mix(in srgb, ${gateInk} 12%, transparent)` }}
        />
        <div
          className="pointer-events-none absolute inset-[max(0.7rem,2.4cqw)] z-[5]"
          style={{ color: `color-mix(in srgb, ${gateInk} 46%, transparent)` }}
        >
          <RoyalCorner className="absolute left-[-1px] top-[-1px] h-[8.5cqw] w-[8.5cqw]" />
          <RoyalCorner className="absolute right-[-1px] top-[-1px] h-[8.5cqw] w-[8.5cqw] -scale-x-100" />
          <RoyalCorner className="absolute bottom-[-1px] left-[-1px] h-[8.5cqw] w-[8.5cqw] -scale-y-100" />
          <RoyalCorner className="absolute bottom-[-1px] right-[-1px] h-[8.5cqw] w-[8.5cqw] -scale-100" />
        </div>

        {!embedded && (
          <button
            type="button"
            onClick={onOpen}
            className="inv-gate-skip"
            style={{
              borderColor: `color-mix(in srgb, ${gateInk} 30%, transparent)`,
              color: gateInk,
              opacity: begun ? 0 : 0.72,
              pointerEvents: begun ? 'none' : 'auto',
            }}
          >
            Skip
          </button>
        )}

        {/* drifting flecks of light */}
        {!reduce && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {kind === 'gatefold' && (
              <StarField className="absolute inset-0 h-full w-full text-[#e4dcff] opacity-45" count={48} />
            )}
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${(i * 41 + 9) % 100}%`,
                  width: 1.5 + (i % 3),
                  height: 1.5 + (i % 3),
                  background: `color-mix(in srgb, ${gateInk} 70%, #e8d3a4)`,
                }}
                initial={{ y: '104%', opacity: 0 }}
                animate={{ y: '-6%', opacity: [0, 0.3, 0] }}
                transition={{ duration: 16 + (i % 5) * 3, delay: (i % 7) * 1.1, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </div>
        )}

        <div className="inv-gate-stage">
          <div className="inv-gate-top">
            <span className="inv-gate-kicker" style={{ color: `color-mix(in srgb, ${gateInk} 78%, transparent)` }}>
              {guestName && data.settings.showGuestName
                ? `${t(language, 'forGuest')} ${guestName}`
                : 'You are invited'}
            </span>
            <span className="inv-gate-toporn" aria-hidden style={{ color: `color-mix(in srgb, ${gateInk} 46%, #b98c4d)` }}>
              <span className="h-px w-7 bg-current opacity-50" />
              <span className="size-1 rotate-45 border border-current" />
              <span className="h-px w-7 bg-current opacity-50" />
            </span>
          </div>

          <div className="inv-gate-object" style={{ width: plateWidth }}>
            {kind === 'curtain' ? (
              <CurtainStage
                data={data}
                templateId={template.id as TemplateId}
                upper={upper}
                opening={opening}
              />
            ) : kind === 'gatefold' ? (
              <GatefoldStage
                data={data}
                templateId={template.id as TemplateId}
                upper={upper}
                opening={opening}
              />
            ) : (
              <EnvelopeStage
                data={data}
                templateId={template.id as TemplateId}
                upper={upper}
                kind={kind}
                opening={opening}
                cracked={phase >= 1}
                drawn={drawn}
              />
            )}
          </div>

          <div className="inv-gate-bottom">
            <motion.div
              className="inv-gate-ident"
              animate={begun ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE_SILK }}
            >
              <h1
                className={`inv-gate-names ${upper ? 'uppercase' : ''}`}
                style={{ letterSpacing: template.cover.namesCase === 'upper' ? '0.06em' : template.cover.tracking }}
              >
                {data.coupleA}
                <span className="inv-gate-amp" style={{ color: `color-mix(in srgb, ${gateInk} 55%, #b98c4d)` }}>
                  &amp;
                </span>
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
                animate={{ opacity: begun ? 0 : 1 }}
                transition={{ duration: 0.35 }}
              >
                <span className="inv-gate-tapline" style={{ color: `color-mix(in srgb, ${gateInk} 65%, #b98c4d)` }}>
                  <span className="h-px w-8 bg-current opacity-60" aria-hidden />
                  <span className="inv-gate-tap">{tapLabel}</span>
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
                animate={{ opacity: begun ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                aria-hidden="true"
              >
                <span className="inv-gate-caption">{caption}</span>
                <span className="inv-gate-track">
                  <motion.span
                    className="inv-gate-track-fill"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: begun ? 1 : 0 }}
                    transition={{ duration: CEREMONY_MS / 1000, ease: 'linear' }}
                  />
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={open}
          aria-label={tapLabel}
          className="inv-gate-hit"
          style={{ opacity: begun ? 0 : 1, pointerEvents: begun ? 'none' : 'auto' }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The letter — used as the inside of every cover                      */
/* ------------------------------------------------------------------ */

function InvitationPlate({
  data,
  templateId,
  tone = 'paper',
  upper,
  compact,
}: {
  data: InvitationData;
  templateId: TemplateId;
  tone?: 'paper' | 'night';
  upper?: boolean;
  compact?: boolean;
}) {
  const night = tone === 'night';
  const ink = night ? '#f7f2e6' : 'var(--inv-ink)';
  const accent = night ? 'color-mix(in srgb, var(--inv-accent) 72%, #ecd9ab)' : 'var(--inv-accent)';
  const muted = night ? 'color-mix(in srgb, #f7f2e6 64%, transparent)' : 'var(--inv-muted)';
  const line = night
    ? 'color-mix(in srgb, var(--inv-accent) 40%, transparent)'
    : 'color-mix(in srgb, var(--inv-accent) 42%, transparent)';

  return (
    <div
      className="inv-plate"
      style={{
        background: night
          ? 'linear-gradient(168deg, #10162c 0%, #1a2140 46%, #0a0e1e 100%)'
          : 'linear-gradient(166deg, #fffdf7 0%, var(--inv-surface) 46%, color-mix(in srgb, var(--inv-surface) 84%, var(--inv-accent-soft)) 100%)',
        color: ink,
        padding: compact ? '8cqh 7.5cqw 0' : '7% 8.5%',
      }}
    >
      {night && <StarField className="absolute inset-0 h-full w-full text-[#efeaff] opacity-45" count={64} />}
      {!night && (
        <div className="pointer-events-none absolute inset-0" style={{ color: 'var(--inv-accent)' }}>
          <TemplateArt templateId={templateId} className="h-full w-full opacity-[0.06]" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0" style={{ background: night
        ? 'radial-gradient(80% 44% at 50% 0%, rgba(203,185,230,0.18), transparent 62%)'
        : 'radial-gradient(74% 40% at 50% 2%, rgba(255,255,255,0.75), transparent 60%)' }} />
      <div className="pointer-events-none absolute inset-[4.2%] border" style={{ borderColor: line }} />
      <div className="pointer-events-none absolute inset-[5.8%] border" style={{ borderColor: 'color-mix(in srgb, var(--inv-accent) 20%, transparent)' }} />
      <div className="pointer-events-none absolute inset-[4.2%]" style={{ color: accent }}>
        <RoyalCorner className="absolute left-[-1px] top-[-1px] h-[7.5cqw] w-[7.5cqw] opacity-80" />
        <RoyalCorner className="absolute right-[-1px] top-[-1px] h-[7.5cqw] w-[7.5cqw] -scale-x-100 opacity-80" />
        <RoyalCorner className="absolute bottom-[-1px] left-[-1px] h-[7.5cqw] w-[7.5cqw] -scale-y-100 opacity-80" />
        <RoyalCorner className="absolute bottom-[-1px] right-[-1px] h-[7.5cqw] w-[7.5cqw] -scale-100 opacity-80" />
      </div>

      <div className={`relative flex h-full flex-col items-center text-center ${compact ? 'justify-start' : 'justify-between'}`}>
        {/* crest */}
        <div className="flex flex-col items-center">
          <span
            className={`relative grid flex-none place-items-center rounded-full border ${compact ? 'h-[15.4cqh] w-[15.4cqh]' : 'h-[18cqw] w-[18cqw]'}`}
            style={{ borderColor: line, color: accent }}
          >
            <LaurelCrest className="absolute inset-[5%] h-[90%] w-[90%] opacity-55" />
            <span
              className="relative"
              style={{
                fontFamily: 'var(--inv-script)',
                fontSize: compact ? 'clamp(13px, 6.6cqh, 22px)' : 'clamp(15px, 7.2cqw, 25px)',
                lineHeight: 1,
                paddingTop: '0.14em',
                color: accent,
              }}
            >
              {data.monogram}
            </span>
          </span>
          <p
            className={`uppercase ${compact ? 'mt-[2.6cqh] text-[2.2cqw]' : 'mt-[5.2%] text-[2.85cqw]'}`}
            style={{ fontFamily: 'var(--inv-caps)', letterSpacing: compact ? '0.24em' : '0.32em', color: muted }}
          >
            Together with our families
          </p>
        </div>

        {/* names */}
        <div className="flex flex-col items-center">
          {compact ? (
            <div className={`mt-[2.2cqh] flex flex-col items-center ${upper ? 'uppercase' : ''}`}>
              <span
                className="leading-[1.02]"
                style={{
                  fontFamily: 'var(--inv-display)',
                  fontSize: upper ? 'clamp(15px, 8.4cqh, 24px)' : 'clamp(20px, 10.4cqh, 31px)',
                  letterSpacing: upper ? '0.05em' : '-0.015em',
                  color: ink,
                }}
              >
                {data.coupleA}
              </span>
              <span
                className="leading-none"
                style={{ fontFamily: 'var(--inv-script)', fontSize: 'clamp(13px, 6.4cqh, 21px)', color: accent, margin: '0.16em 0' }}
              >
                &amp;
              </span>
              <span
                className="leading-[1.02]"
                style={{
                  fontFamily: 'var(--inv-display)',
                  fontSize: upper ? 'clamp(15px, 8.4cqh, 24px)' : 'clamp(20px, 10.4cqh, 31px)',
                  letterSpacing: upper ? '0.05em' : '-0.015em',
                  color: ink,
                }}
              >
                {data.coupleB}
              </span>
            </div>
          ) : (
            <p
              className={`max-w-[96%] leading-[1.02] ${upper ? 'uppercase' : ''}`}
              style={{
                fontFamily: 'var(--inv-display)',
                fontSize: upper ? 'clamp(19px, 7.8cqw, 29px)' : 'clamp(26px, 9.9cqw, 38px)',
                letterSpacing: upper ? '0.05em' : '-0.02em',
                color: ink,
                textWrap: 'balance',
              }}
            >
              {data.coupleA}
              <span
                className="mx-[2cqw] inline-block align-middle"
                style={{ fontFamily: 'var(--inv-script)', fontSize: '0.82em', color: accent, letterSpacing: 0 }}
              >
                &amp;
              </span>
              {data.coupleB}
            </p>
          )}

          <DiamondRule className={compact ? 'mt-[2.4cqh] h-[1.8cqh] w-[44%]' : 'mt-[4.4%] h-[2.6cqw] w-[46%]'} />
          <p
            className={`uppercase ${compact ? 'mt-[2.2cqh] text-[2.5cqw]' : 'mt-[4%] text-[3cqw]'}`}
            style={{ fontFamily: 'var(--inv-caps)', letterSpacing: '0.24em', color: ink }}
          >
            {formatDateShort(data.weddingDate)}
          </p>
          <p
            className={`max-w-[92%] uppercase ${compact ? 'mt-[0.7cqh] text-[2.1cqw]' : 'mt-[1.8%] text-[2.7cqw]'}`}
            style={{ fontFamily: 'var(--inv-caps)', letterSpacing: '0.22em', color: muted }}
          >
            {compact ? data.location.split(',')[0] : data.location}
          </p>
        </div>

        {/* maker's mark */}
        <span
          className={`flex flex-col items-center ${compact ? 'mt-auto pb-[3.4cqh]' : 'gap-[2.4cqw]'}`}
          style={{ color: accent }}
        >
          <TemplateMark templateId={templateId} className={`${compact ? 'h-[3.4cqh] w-[18cqw]' : 'h-[4.2cqw] w-[20cqw]'} opacity-60`} />
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wax seal & silk ribbon — a folio with the letter waiting inside     */
/* ------------------------------------------------------------------ */

function EnvelopeStage({
  data,
  templateId,
  upper,
  kind,
  opening,
  cracked,
  drawn,
}: {
  data: InvitationData;
  templateId: TemplateId;
  upper: boolean;
  kind: 'seal' | 'ribbon';
  opening: boolean;
  cracked: boolean;
  drawn: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="gate-folio">
      <motion.div
        className="gate-folio-shadow"
        initial={false}
        animate={{ opacity: opening ? 0.5 : 0.34 }}
        transition={{ duration: 1.2 }}
        aria-hidden="true"
      />

      <div className="gate-folio-body">
        {/* the folio's back board */}
        <div className="gate-folio-back" />
        <div className="gate-folio-grain" aria-hidden />

        {/* the letter, tucked under the pocket */}
        <motion.div
          className="gate-folio-letter"
          initial={false}
          animate={drawn ? { y: '-48%' } : { y: '0%' }}
          transition={{ duration: 1.5, ease: EASE_SILK }}
        >
          <InvitationPlate data={data} templateId={templateId} tone="paper" upper={upper} compact />
        </motion.div>

        {/* the pocket: blind-embossed, stitched along its top edge */}
        <div className="gate-folio-pocket">
          <div className="gate-folio-pocket-inner" />
          <div className="gate-folio-stitch" aria-hidden />
          <div className="gate-folio-pocket-emboss" aria-hidden>
            <span className="gate-folio-pocket-rule" />
            <span className="gate-folio-pocket-caption">An invitation</span>
          </div>
          <div className="gate-folio-pocket-mark" aria-hidden>
            <TemplateMark templateId={templateId} className="h-[4cqw] w-[18cqw] opacity-35" />
          </div>
        </div>

        {/* silk, for the ribbon covers */}
        {kind === 'ribbon' && (
          <>
            <motion.div
              className="gate-folio-ribbon gate-folio-ribbon-v"
              initial={false}
              animate={opening ? { y: '120%', opacity: 0 } : { y: '0%', opacity: 1 }}
              transition={{ duration: 1.25, ease: EASE_PAGE }}
            />
            <motion.div
              className="gate-folio-ribbon gate-folio-ribbon-h"
              initial={false}
              animate={opening ? { x: '120%', opacity: 0 } : { x: '0%', opacity: 1 }}
              transition={{ duration: 1.25, ease: EASE_PAGE, delay: 0.1 }}
            />
          </>
        )}

        {/* the fastening, at the foot of the pocket */}
        <motion.div
          className={`gate-folio-seal gate-folio-seal-${kind}`}
          style={{ color: 'color-mix(in srgb, #7b2938 86%, var(--inv-accent))' }}
          initial={false}
          animate={opening ? { y: 26, opacity: 0, rotate: -7 } : { y: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 1, ease: EASE_SILK, delay: opening ? 0.5 : 0 }}
        >
          {kind === 'seal' ? (
            <motion.div
              animate={reduce || cracked ? undefined : { y: [0, -2.5, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <WaxSeal monogram={data.monogram} cracked={cracked} className="h-auto w-full" />
            </motion.div>
          ) : (
            <motion.div
              animate={opening ? { rotate: -10, y: 8 } : reduce ? undefined : { y: [0, -2, 0] }}
              transition={opening ? { duration: 0.9, ease: EASE_SILK } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <GoldBow className="h-auto w-[98%] -translate-x-[1%]" />
            </motion.div>
          )}
        </motion.div>

        {/* corner embroidery */}
        <div className="pointer-events-none absolute inset-0" style={{ color: 'var(--inv-accent)' }}>
          <CornerFlourish className="absolute left-[3.4%] top-[3.4%] h-[7cqw] w-[7cqw] opacity-45" />
          <CornerFlourish className="absolute right-[3.4%] top-[3.4%] h-[7cqw] w-[7cqw] -scale-x-100 opacity-45" />
          <CornerFlourish className="absolute bottom-[3.4%] left-[3.4%] h-[7cqw] w-[7cqw] -scale-y-100 opacity-45" />
          <CornerFlourish className="absolute bottom-[3.4%] right-[3.4%] h-[7cqw] w-[7cqw] -scale-100 opacity-45" />
        </div>

        {/* light travelling across the board */}
        {!reduce && (
          <div className="gate-folio-sheen" aria-hidden>
            <motion.div
              className="gate-folio-sheen-bar"
              initial={{ x: '-130%' }}
              animate={{ x: opening ? '260%' : '-130%' }}
              transition={{ duration: 2, ease: EASE_SILK }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Curtain — a theatre valance, parted by hand                         */
/* ------------------------------------------------------------------ */

function CurtainStage({
  data,
  templateId,
  upper,
  opening,
}: {
  data: InvitationData;
  templateId: TemplateId;
  upper: boolean;
  opening: boolean;
}) {
  return (
    <div className="gate-curtain" style={{ aspectRatio: '3 / 4.15' }}>
      {/* the invitation waiting in the light */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: opening ? 1 : 0.82 }}
          transition={{ duration: 1.6, ease: EASE_SILK }}
        >
          <InvitationPlate data={data} templateId={templateId} tone="paper" upper={upper} />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-black"
          initial={false}
          animate={{ opacity: opening ? 0 : 0.42 }}
          transition={{ duration: 2.2, ease: EASE_SILK }}
          aria-hidden
        />
      </div>

      {/* the drapes */}
      {(['left', 'right'] as const).map((side) => (
        <motion.div
          key={side}
          className="gate-curtain-panel"
          style={{
            [side]: '-1.5%',
            boxShadow: side === 'left' ? '14px 0 30px -14px rgba(0,0,0,0.78)' : '-14px 0 30px -14px rgba(0,0,0,0.78)',
          }}
          initial={false}
          animate={{ x: opening ? (side === 'left' ? '-103%' : '103%') : '0%' }}
          transition={{ duration: 2.3, ease: EASE_DOOR }}
        >
          <div
            className="absolute inset-y-0 w-px"
            style={{
              [side === 'left' ? 'right' : 'left']: 0,
              background: 'color-mix(in srgb, var(--inv-accent) 78%, #f4e2ba)',
              opacity: 0.7,
            }}
          />
          <div
            className="absolute inset-y-0 w-6"
            style={{
              [side === 'left' ? 'right' : 'left']: 0,
              background: side === 'left' ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.5))' : 'linear-gradient(270deg, transparent, rgba(0,0,0,0.5))',
            }}
          />
        </motion.div>
      ))}

      {/* the valance with its fringe */}
      <div className="gate-curtain-valance">
        <div className="gate-curtain-valance-cloth" />
        <div className="gate-curtain-medallion">
          <span>{data.monogram}</span>
        </div>
        <div className="gate-curtain-fringe" aria-hidden />
      </div>

      {/* silk cord and two tassels, hung from the crest */}
      <motion.div
        className="gate-curtain-tassels"
        initial={false}
        animate={opening ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_SILK }}
        aria-hidden
      >
        <span className="gate-curtain-cord" />
        <span className="gate-curtain-tassel gate-curtain-tassel-l" />
        <span className="gate-curtain-tassel gate-curtain-tassel-r" />
        <span className="gate-curtain-tassel-head gate-curtain-tassel-head-l" />
        <span className="gate-curtain-tassel-head gate-curtain-tassel-head-r" />
      </motion.div>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Céleste — the gatefold doors                                        */
/* ------------------------------------------------------------------ */

function GatefoldStage({
  data,
  templateId,
  upper,
  opening,
}: {
  data: InvitationData;
  templateId: TemplateId;
  upper: boolean;
  opening: boolean;
}) {
  return (
    <div className="gate-gatefold" style={{ aspectRatio: '768 / 1376' }}>
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={false}
        animate={{ opacity: opening ? 1 : 0.7 }}
        transition={{ duration: 1.8, ease: EASE_SILK }}
      >
        <InvitationPlate data={data} templateId={templateId} tone="night" upper={upper} />
      </motion.div>

      {(['left', 'right'] as const).map((side) => (
        <motion.div
          key={side}
          className="gate-gatefold-door"
          style={{
            [side]: 0,
            transformOrigin: side === 'left' ? 'left center' : 'right center',
          }}
          initial={false}
          animate={{ rotateY: opening ? (side === 'left' ? -112 : 112) : 0 }}
          transition={{ duration: 2.5, ease: EASE_DOOR }}
        >
          <div className="gate-gatefold-door-face">
            <TemplateArt templateId="celeste" className="absolute inset-0 h-full w-full text-[#cfc6ef] opacity-40" />
            <StarField className="absolute inset-0 h-full w-full text-[#efeaff] opacity-55" count={36} />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,22,0.15)_30%,rgba(8,11,22,0.62)_72%,rgba(8,11,22,0.8)_100%)]" />
            <div className="absolute inset-[6%] border border-[#cbb9e6]/35" />
            <div className="absolute inset-[8.4%] border border-[#cbb9e6]/16" />
            <RoyalCorner className="absolute left-[5.4%] top-[5.4%] aspect-square w-[22%] text-[#cbb9e6] opacity-60" />
            <RoyalCorner className="absolute right-[5.4%] top-[5.4%] aspect-square w-[22%] -scale-x-100 text-[#cbb9e6] opacity-60" />
            <div className="absolute inset-x-0 top-[58%] flex flex-col items-center gap-[3.2cqw] text-[#e9e2fa]">
              <span
                className="text-[5.2cqw] uppercase"
                style={{ fontFamily: 'var(--inv-caps)', letterSpacing: '0.32em', opacity: 0.9 }}
              >
                {side === 'left' ? data.coupleA : data.coupleB}
              </span>
              <span className="h-px w-[26%] bg-[#cbb9e6] opacity-50" />
              <span className="text-[2.4cqw] uppercase" style={{ fontFamily: 'var(--inv-caps)', letterSpacing: '0.4em', opacity: 0.6 }}>
                {side === 'left' ? 'Together with' : 'our families'}
              </span>
            </div>
            <span
              className="absolute inset-x-0 bottom-[10%] text-center text-[2.6cqw] uppercase text-[#cbb9e6]"
              style={{ fontFamily: 'var(--inv-caps)', letterSpacing: '0.4em', opacity: 0.7 }}
            >
              {side === 'left' ? 'MMXXVII' : 'An invitation'}
            </span>
            <span className="gate-gatefold-door-grain" aria-hidden />
          </div>
        </motion.div>
      ))}

      {/* the gold spine */}
      <motion.div
        className="gate-gatefold-spine"
        initial={false}
        animate={{ opacity: opening ? 0 : 0.85 }}
        transition={{ duration: 0.8 }}
        aria-hidden
      />

    </div>
  );
}
