import { Link } from 'react-router-dom';
import { CornerFlourish, TemplateArt, TemplateMark } from '@/templates/art';
import type { TemplateDefinition } from '@/templates/types';
import { sampleInvitation } from '@/templates/samples';
import { formatDateShort } from '@/lib/format';

/**
 * A template shown as finished stationery: the couple's names set in the
 * template's own display face, a script monogram seal, keyline frames and a
 * sheen that travels across the paper on hover.
 */
export function TemplateCard({ template, cta }: { template: TemplateDefinition; cta: string }) {
  const sample = sampleInvitation(template.id);
  const { palette } = template;
  return (
    <Link
      to={`/templates/${template.id}`}
      className="template-card group relative block aspect-[3/4] overflow-hidden"
      style={{
        background: `linear-gradient(172deg, color-mix(in srgb, ${palette.bg} 96%, #fff) 0%, ${palette.bg} 45%, color-mix(in srgb, ${palette.bg} 86%, ${palette.accentSoft}) 100%)`,
        color: palette.ink,
      }}
      aria-label={`Preview the ${template.name} design`}
    >
      <div className="absolute inset-0" style={{ color: palette.accent }}>
        <TemplateArt templateId={template.id} className="h-full w-full opacity-[0.17]" />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, ${palette.accent} 14%, transparent), transparent 52%)`,
        }}
      />

      {/* keyline frames */}
      <div className="absolute inset-3 border" style={{ borderColor: `color-mix(in srgb, ${palette.accent} 45%, transparent)` }} />
      <div className="absolute inset-[17px] border" style={{ borderColor: `color-mix(in srgb, ${palette.accent} 22%, transparent)` }} />
      <div className="absolute inset-0" style={{ color: palette.accent }}>
        <CornerFlourish className="absolute left-[22px] top-[22px] h-7 w-7 opacity-70" />
        <CornerFlourish className="absolute right-[22px] top-[22px] h-7 w-7 -scale-x-100 opacity-70" />
        <CornerFlourish className="absolute bottom-[22px] left-[22px] h-7 w-7 -scale-y-100 opacity-70" />
        <CornerFlourish className="absolute bottom-[22px] right-[22px] h-7 w-7 -scale-100 opacity-70" />
      </div>

      {/* sheen */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[140%] skew-x-[-14deg] bg-white/30 blur-lg transition-transform duration-[1200ms] ease-out group-hover:translate-x-[280%]"
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col items-center justify-between px-8 py-9 text-center">
        <span
          className="text-[0.52rem] font-medium uppercase"
          style={{ fontFamily: "'Cinzel', Georgia, serif", letterSpacing: '0.32em', color: palette.muted }}
        >
          {template.descriptor}
        </span>

        <div className="flex flex-col items-center">
          <span
            className="grid h-14 w-14 place-items-center rounded-full border text-[1.3rem]"
            style={{
              borderColor: `color-mix(in srgb, ${palette.accent} 60%, transparent)`,
              color: palette.accent,
              fontFamily: template.script,
              boxShadow: `0 0 0 4px color-mix(in srgb, ${palette.accent} 10%, transparent)`,
            }}
          >
            {sample.monogram}
          </span>
          <p
            className={`mt-5 text-[2.15rem] leading-[1.04] ${template.cover.namesCase === 'upper' ? 'uppercase' : ''}`}
            style={{ fontFamily: template.display, letterSpacing: template.cover.tracking, color: palette.ink }}
          >
            {sample.coupleA}
            <span className="mx-1.5 text-[0.72em]" style={{ fontFamily: template.script, color: palette.accent }}>
              &
            </span>
            {sample.coupleB}
          </p>
          <p
            className="mt-3 text-[0.52rem] font-medium uppercase"
            style={{ fontFamily: "'Cinzel', Georgia, serif", letterSpacing: '0.26em', color: palette.muted }}
          >
            {formatDateShort(sample.weddingDate)} · {sample.location.split(',')[0]}
          </p>
        </div>

        <div className="flex flex-col items-center">
          <TemplateMark templateId={template.id} className="h-6 w-24 opacity-80" />
          <span
            className="mt-4 inline-flex translate-y-1 items-center gap-1.5 rounded-full border px-4 py-2 text-[0.52rem] font-medium uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              letterSpacing: '0.22em',
              borderColor: `color-mix(in srgb, ${palette.accent} 55%, transparent)`,
              color: palette.ink,
              background: 'rgba(255,255,255,0.35)',
            }}
          >
            {cta}
          </span>
        </div>
      </div>
    </Link>
  );
}
