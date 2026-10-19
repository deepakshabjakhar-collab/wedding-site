import type { CSSProperties, ReactNode } from 'react';
import type { TemplateDefinition } from '@/templates/types';
import { COVER_TONES, coverTokens } from '@/templates/cover';
import { TemplateMark, WaxSeal } from '@/templates/art';
import { DiamondRule, LaurelCrest, RoyalCorner } from '@/templates/ornaments';

export interface LetterData {
  coupleA: string;
  coupleB: string;
  monogram: string;
  weddingDate: string;
  location: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function dateLine(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * The inside of the invitation — the letter the cover has been hiding. Paper,
 * ink and ornament all come from the same palette as the cover, so the reveal
 * never changes world: cream and gold under silk, midnight under stars.
 */
export function OpeningLetter({
  template,
  data,
  guestName,
  children,
  footer,
  eyebrow = 'You are invited',
  scriptLine = 'We would be honoured by your presence',
  className,
}: {
  template: TemplateDefinition;
  data: LetterData;
  guestName?: string;
  children?: ReactNode;
  footer?: ReactNode;
  eyebrow?: string;
  scriptLine?: string;
  className?: string;
}) {
  const tokens = coverTokens(template);
  const dark = COVER_TONES[template.id] === 'dark';
  const upper = template.cover.namesCase === 'upper';
  const ink = dark ? '#f7f1e4' : tokens.ink;
  const muted = dark ? 'rgba(247,241,228,0.7)' : tokens.muted;
  const gold = dark ? `color-mix(in srgb, ${tokens.accent} 76%, #f4e5c2)` : tokens.accent;

  const paper = dark
    ? `linear-gradient(168deg, color-mix(in srgb, ${tokens.bg} 86%, #fff) 0%, ${tokens.bg} 34%, color-mix(in srgb, ${tokens.bg} 72%, #000) 100%)`
    : `linear-gradient(166deg, #fffdf6 0%, color-mix(in srgb, ${tokens.bg} 92%, #fff) 40%, color-mix(in srgb, ${tokens.bg} 86%, ${tokens.accentSoft}) 100%)`;

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className ?? ''}`}
      style={
        {
          background: paper,
          color: ink,
          containerType: 'size',
          '--cover-accent': tokens.accent,
        } as CSSProperties
      }
    >
      {/* the cover's own light, blurred until it is only colour */}
      <img
        src={`/covers/${template.id}.jpg`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ filter: 'blur(64px) saturate(0.85)', opacity: dark ? 0.3 : 0.24 }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? 'radial-gradient(90% 58% at 50% 4%, rgba(255,255,255,0.1), transparent 64%)'
            : 'radial-gradient(86% 54% at 50% 2%, rgba(255,255,255,0.92), transparent 62%)',
        }}
      />
      {/* the fold: light falls away at the spine and the edges of the page */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(38,26,12,0.16) 0%, rgba(38,26,12,0.03) 7%, transparent 18%), linear-gradient(270deg, rgba(38,26,12,0.1) 0%, transparent 14%)',
          mixBlendMode: dark ? 'screen' : 'multiply',
          opacity: dark ? 0.35 : 0.7,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: dark ? 'inset 0 0 90px rgba(0,0,0,0.5)' : 'inset 0 0 70px rgba(96,70,38,0.12)',
        }}
      />

      {/* a single gilded frame, the way the cover is framed */}
      <div className="pointer-events-none absolute inset-[5.4%] border" style={{ borderColor: `color-mix(in srgb, ${gold} 46%, transparent)` }} />
      <div className="pointer-events-none absolute inset-[6.6%] border" style={{ borderColor: `color-mix(in srgb, ${gold} 20%, transparent)` }} />
      <div className="pointer-events-none absolute inset-[5.4%]" style={{ color: gold }}>
        <RoyalCorner className="absolute left-[-1px] top-[-1px] h-[7.4cqw] w-[7.4cqw] opacity-75" />
        <RoyalCorner className="absolute right-[-1px] top-[-1px] h-[7.4cqw] w-[7.4cqw] -scale-x-100 opacity-75" />
        <RoyalCorner className="absolute bottom-[-1px] left-[-1px] h-[7.4cqw] w-[7.4cqw] -scale-y-100 opacity-75" />
        <RoyalCorner className="absolute bottom-[-1px] right-[-1px] h-[7.4cqw] w-[7.4cqw] -scale-100 opacity-75" />
      </div>

      {/* the couple's mark, blind-engraved into the page */}
      <span
        className="pointer-events-none absolute left-1/2 top-[68%] -translate-x-1/2 -translate-y-1/2 select-none"
        aria-hidden="true"
        style={{
          fontFamily: template.script,
          fontSize: '44cqw',
          lineHeight: 1,
          color: gold,
          opacity: dark ? 0.06 : 0.045,
          whiteSpace: 'nowrap',
        }}
      >
        {data.monogram}
      </span>

      <div className="relative flex h-full flex-col items-center px-[13%] pb-[10.5%] pt-[11%] text-center">
        {/* crest: wax where the cover was sealed, a monogram roundel otherwise */}
        {template.envelope === 'seal' && !dark ? (
          <span className="block w-[19cqw]" style={{ color: 'color-mix(in srgb, #7b2938 82%, var(--cover-accent))' }}>
            <WaxSeal monogram={data.monogram} className="h-auto w-full drop-shadow-[0_10px_14px_rgba(60,24,30,0.28)]" />
          </span>
        ) : (
          <span
            className="relative grid size-[18cqw] place-items-center rounded-full border"
            style={{ borderColor: `color-mix(in srgb, ${gold} 62%, transparent)`, color: gold }}
          >
            <LaurelCrest className="absolute inset-[8%] h-[84%] w-[84%] opacity-40" />
            <span
              className="relative"
              style={{
                fontFamily: template.script,
                fontSize: 'clamp(15px, 6.4cqw, 34px)',
                lineHeight: 1,
                paddingTop: '0.12em',
              }}
            >
              {data.monogram}
            </span>
          </span>
        )}

        <p
          className="mt-[4.4%] uppercase"
          style={{
            fontFamily: "'Cinzel', Georgia, serif",
            fontSize: 'clamp(7px, 2.1cqw, 11px)',
            letterSpacing: '0.42em',
            color: gold,
            paddingLeft: '0.42em',
          }}
        >
          {guestName || eyebrow}
        </p>

        <div className="flex flex-1 flex-col items-center justify-center">
          <p
            className={`leading-[0.97] ${upper ? 'uppercase' : ''}`}
            style={{
              fontFamily: template.display,
              fontSize: upper ? 'clamp(24px, 8.6cqw, 58px)' : 'clamp(30px, 12.6cqw, 78px)',
              letterSpacing: upper ? '0.04em' : template.cover.tracking,
              color: ink,
              textWrap: 'balance',
              maxWidth: '100%',
            }}
          >
            {data.coupleA}
            <span
              className="mx-[0.14em] inline-block align-middle"
              style={{ fontFamily: template.script, fontSize: '0.66em', color: gold, letterSpacing: 0 }}
            >
              &amp;
            </span>
            {data.coupleB}
          </p>

          <DiamondRule className="mt-[5%] h-[2cqw] w-[34%]" />

          <p
            className="mt-[4.2%] uppercase"
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: 'clamp(7px, 2.1cqw, 11px)',
              letterSpacing: '0.28em',
              color: muted,
            }}
          >
            {dateLine(data.weddingDate)}
            <span className="mx-[0.6em] opacity-50">·</span>
            {data.location.split(',')[0]}
          </p>

          {scriptLine && (
            <p
              className="mt-[7%] leading-[1.24]"
              style={{
                fontFamily: template.script,
                fontSize: 'clamp(16px, 5.2cqw, 30px)',
                color: dark ? `color-mix(in srgb, ${gold} 82%, #fff)` : `color-mix(in srgb, ${tokens.ink} 62%, ${gold})`,
              }}
            >
              {scriptLine}
            </p>
          )}
        </div>

        {/* the particulars, set like a card within the card */}
        <div
          className="w-full px-[7%] py-[5.4%]"
          style={{
            borderTop: `1px solid color-mix(in srgb, ${gold} 34%, transparent)`,
            borderBottom: `1px solid color-mix(in srgb, ${gold} 34%, transparent)`,
          }}
        >
          <div className="flex items-stretch justify-center gap-[7%]">
            {[
              { k: 'The day', v: dateLine(data.weddingDate) },
              { k: 'The place', v: data.location.split(',')[0] },
            ].map((item, i) => (
              <div
                key={item.k}
                className="flex flex-1 flex-col items-center gap-[2.2cqw]"
                style={i === 1 ? { borderLeft: `1px solid color-mix(in srgb, ${gold} 24%, transparent)` } : undefined}
              >
                <span
                  className="uppercase"
                  style={{
                    fontFamily: "'Cinzel', Georgia, serif",
                    fontSize: 'clamp(6px, 1.7cqw, 9px)',
                    letterSpacing: '0.36em',
                    color: `color-mix(in srgb, ${gold} 88%, transparent)`,
                    paddingLeft: '0.36em',
                  }}
                >
                  {item.k}
                </span>
                <span
                  style={{
                    fontFamily: template.display,
                    fontSize: 'clamp(12px, 3.5cqw, 20px)',
                    letterSpacing: '0.01em',
                    color: ink,
                    lineHeight: 1.2,
                  }}
                >
                  {item.v}
                </span>
              </div>
            ))}
          </div>
        </div>

        {children}

        <div className="mt-auto flex w-full flex-col items-center gap-[3cqw]">
          {footer ?? (
            <span className="flex items-center gap-[2cqw]" style={{ color: gold }}>
              <span className="h-px w-[8cqw] bg-current opacity-50" />
              <TemplateMark templateId={template.id} className="h-[3.4cqw] w-[16cqw] opacity-60" />
              <span className="h-px w-[8cqw] bg-current opacity-50" />
            </span>
          )}
          <span
            className="uppercase"
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: 'clamp(6px, 1.7cqw, 9px)',
              letterSpacing: '0.34em',
              color: `color-mix(in srgb, ${muted} 88%, transparent)`,
              paddingLeft: '0.34em',
            }}
          >
            {template.name} · {dateLine(data.weddingDate).split(' ').pop()}
          </span>
        </div>
      </div>
    </div>
  );
}
