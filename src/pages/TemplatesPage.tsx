import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Reveal } from '@/components/marketing/Reveal';
import { TemplateCard } from '@/components/marketing/TemplateCard';
import { TEMPLATES } from '@/templates/registry';
import { buttonClass } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const FILTERS = [
  'All',
  'Editorial',
  'Botanical',
  'Indian',
  'Celestial',
  'Destination',
  'Black tie',
  'Vintage',
  'Playful',
  'Multi-day',
];

export function TemplatesPage() {
  const [filter, setFilter] = useState('All');
  const [creating, setCreating] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();

  const templates = useMemo(() => {
    if (filter === 'All') return TEMPLATES;
    return TEMPLATES.filter(
      (template) =>
        template.keywords.some((keyword) => keyword.toLowerCase() === filter.toLowerCase()) ||
        template.descriptor.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [filter]);

  const useTemplate = async (templateId: string) => {
    if (!user) {
      navigate(`/signup?next=/templates&design=${templateId}`);
      return;
    }
    setCreating(templateId);
    try {
      const { invitation } = await api.invitations.create(templateId);
      push('Your studio is ready. Let’s make it yours.');
      navigate(`/studio/${invitation.id}`);
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'Could not create the invitation.', 'error');
      setCreating(null);
    }
  };

  return (
    <div className="mkt-scope texture-paper min-h-svh">
      <MarketingNav />
      <main className="pt-[112px]">
        <section className="shell pb-10">
          <p className="eyebrow">The collection</p>
          <div className="mt-5 grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <h1 className="display text-[2.8rem] leading-[1.02] text-ink sm:text-[4.2rem]">
              Eight design directions,
              <br />
              drawn from <em className="text-gold">scratch.</em>
            </h1>
            <div>
              <p className="text-sm leading-relaxed text-muted sm:text-[0.98rem]">
                Not one template recoloured eight times. Each design has its own typography, palette,
                illustration, envelope and rhythm — then everything is yours to change.
              </p>
              <p className="mt-4 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-gold">
                <Sparkles size={13} /> Every preview is live and interactive
              </p>
            </div>
          </div>

          <div className="no-scrollbar mt-9 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={`flex-none rounded-full border px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] transition ${
                  filter === item
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink-soft hover:border-gold/60 hover:text-ink'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="shell pb-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => {
              return (
                <Reveal key={template.id} delay={Math.min(index * 0.04, 0.2)}>
                  <article className="group flex h-full flex-col">
                    <TemplateCard template={template} cta="Open the live preview" />

                    <div className="mt-4 flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-display text-[1.55rem] leading-tight text-ink">{template.name}</h2>
                          <p className="text-[0.75rem] italic text-muted">{template.tagline}</p>
                        </div>
                        <span className="mt-1 flex items-center gap-1.5">
                          {[template.palette.bg, template.palette.accent, template.palette.deep].map((color) => (
                            <span
                              key={color}
                              className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                              style={{ background: color }}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="mt-3 text-[0.83rem] leading-relaxed text-muted">{template.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2 pt-1">
                        <Link to={`/templates/${template.id}`} className={buttonClass('outline', 'sm')}>
                          Live preview
                        </Link>
                        <button
                          type="button"
                          onClick={() => void useTemplate(template.id)}
                          className={buttonClass('primary', 'sm')}
                          disabled={creating === template.id}
                        >
                          {creating === template.id ? <Loader2 size={13} className="animate-spin" /> : null}
                          Use this design
                        </button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          {templates.length === 0 && (
            <p className="py-16 text-center text-sm text-muted">
              No designs match that filter. <button type="button" className="text-gold underline" onClick={() => setFilter('All')}>Show everything</button>
            </p>
          )}
        </section>

        <section className="border-t border-line/70 bg-[#f1e9dc] py-16">
          <div className="shell grid gap-8 md:grid-cols-3">
            {[
              ['Change anything', 'Names, wording, colours, fonts, photographs, ceremonies and the envelope itself.'],
              ['Preview as a guest', 'See the exact experience your guests get, with sample names or your own guests.'],
              ['Publish in one click', 'Share a public link or personal links for each household — you decide who sees what.'],
            ].map(([title, body]) => (
              <div key={title}>
                <h3 className="font-display text-[1.4rem] text-ink">{title}</h3>
                <p className="mt-2 text-[0.83rem] leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
