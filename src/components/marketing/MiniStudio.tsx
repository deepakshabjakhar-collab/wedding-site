import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { TEMPLATES, getTemplate, resolveTheme, themeStyle } from '@/templates/registry';
import { sampleInvitation } from '@/templates/samples';
import { TemplateArt, TemplateMark } from '@/templates/art';
import type { Palette } from '@shared/types';
import type { TemplateId } from '@/templates/types';
import { PALETTE_PRESETS } from '@/templates/types';
import { formatDateShort } from '@/lib/format';
import { buttonClass } from '@/components/ui/Button';

const PALETTES: { id: string; label: string; palette?: Palette }[] = [
  { id: 'original', label: 'Original' },
  ...PALETTE_PRESETS.filter((p) =>
    ['sage-rose', 'burgundy-gold', 'ink-couture', 'celestial'].includes(p.id),
  ).map((p) => ({ id: p.id, label: p.label, palette: p.palette })),
];

export function MiniStudio() {
  const [templateId, setTemplateId] = useState<TemplateId>('aurelia');
  const [paletteId, setPaletteId] = useState('original');
  const reduce = useReducedMotion();

  const sample = useMemo(() => sampleInvitation(templateId), [templateId]);
  const palette = PALETTES.find((p) => p.id === paletteId)?.palette;
  const theme = resolveTheme(templateId, { palette });
  const template = getTemplate(templateId);

  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-paper shadow-[0_40px_90px_-55px_rgba(50,35,20,0.55)]">
      <div className="flex items-center justify-between gap-4 border-b border-line/80 bg-[#f8f3e9] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#d9c7b2]" />
          <span className="h-2 w-2 rounded-full bg-[#d9c7b2]" />
          <span className="h-2 w-2 rounded-full bg-[#d9c7b2]" />
          <span className="ml-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted">
            Vellum Studio
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#5c7a4f]">
          <Check size={11} /> Live preview
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_1.02fr]">
        <div className="relative flex items-center justify-center bg-[#efe6d8] px-6 py-9 sm:px-10">
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
          <AnimatePresence mode="wait">
            <motion.div
              key={`${templateId}-${paletteId}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              className="invite-root relative aspect-[3/4] w-full max-w-[310px] overflow-hidden rounded-[2px] shadow-[0_30px_60px_-30px_rgba(40,26,14,0.55)]"
              style={themeStyle(theme)}
              data-layout={theme.layout}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: `linear-gradient(160deg, ${theme.palette.deep}, ${theme.palette.deep} 55%, ${theme.palette.ink})` }}
              >
                <TemplateArt templateId={templateId} className="absolute inset-0 h-full w-full text-[#d9b87b] opacity-65" />
              </div>
              <div className="relative flex h-full flex-col items-center justify-between px-6 py-7 text-center">
                <div className="text-[#f5e6cb]">
                  <span className="inline-grid h-11 w-11 place-items-center rounded-full border border-[#f5e6cb]/45">
                    <span className="font-script text-[1.2rem] leading-none">{sample.monogram}</span>
                  </span>
                </div>
                <div className="text-[#f8edda]">
                  <p className="text-[0.5rem] font-semibold uppercase tracking-[0.32em] opacity-75">
                    {sample.welcomeHeading}
                  </p>
                  <p
                    className={`mt-3 text-[1.75rem] leading-[1.05] ${template.cover.namesCase === 'upper' ? 'uppercase' : ''}`}
                    style={{ fontFamily: 'var(--inv-display)', letterSpacing: template.cover.tracking }}
                  >
                    {sample.coupleA}
                    <span className="mx-1 italic" style={{ fontFamily: 'var(--inv-script)', color: theme.palette.accent }}>
                      &amp;
                    </span>
                    {sample.coupleB}
                  </p>
                  <p className="mt-3 text-[0.54rem] font-semibold uppercase tracking-[0.22em] opacity-80">
                    {formatDateShort(sample.weddingDate)} · {sample.location.split(',')[0]}
                  </p>
                </div>
                <div className="text-[#e8d3ae]">
                  <TemplateMark templateId={templateId} className="mx-auto h-7 w-24" />
                  <p className="mt-2 text-[0.47rem] uppercase tracking-[0.3em] opacity-70">Open the invitation</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col justify-between gap-7 p-6 sm:p-7">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted">Template</p>
                <h3 className="mt-1 font-display text-[1.9rem] leading-none text-ink">{template.name}</h3>
              </div>
              <span className="pill pill-gold">{template.descriptor.split(' ').slice(-1)}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{template.tagline}.</p>

            <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Choose a template">
              {TEMPLATES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTemplateId(item.id)}
                  aria-pressed={templateId === item.id}
                  className={`rounded-full border px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] transition ${
                    templateId === item.id
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line text-ink-soft hover:border-gold/60 hover:text-ink'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-muted">Palette</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {PALETTES.map((preset) => {
                  const swatch = preset.palette ?? theme.palette;
                  const active = paletteId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setPaletteId(preset.id)}
                      className={`group flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[0.62rem] font-medium transition ${
                        active ? 'border-ink/50 bg-[#f8f2e7] text-ink' : 'border-transparent text-muted hover:border-line'
                      }`}
                      aria-pressed={active}
                      title={preset.label}
                    >
                      <span
                        className="grid h-6 w-6 place-items-center overflow-hidden rounded-full border border-black/10"
                        style={{
                          background: `conic-gradient(${swatch.bg} 0 40%, ${swatch.accent} 40% 70%, ${swatch.ink} 70% 100%)`,
                        }}
                      >
                        {active && <Check size={11} className="text-white drop-shadow" />}
                      </span>
                      <span className="hidden sm:inline">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link to={`/templates/${templateId}`} className={buttonClass('primary', 'md', 'w-full')}>
              Preview this design
              <ArrowUpRight size={14} />
            </Link>
            <Link
              to="/templates"
              className="text-center text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted transition hover:text-ink"
            >
              Browse all eight
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
