import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  Music2,
  ShieldCheck,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { EnvelopeTeaser } from '@/components/marketing/EnvelopeTeaser';
import { MiniStudio } from '@/components/marketing/MiniStudio';
import { SoundtrackDemo } from '@/components/marketing/SoundtrackDemo';
import { Reveal } from '@/components/marketing/Reveal';
import { buttonClass } from '@/components/ui/Button';
import { TEMPLATES } from '@/templates/registry';
import { TemplateArt, TemplateMark } from '@/templates/art';
import { sampleInvitation } from '@/templates/samples';
import { PRICING } from '@/lib/pricing';
import { formatDateShort, money } from '@/lib/format';
import { useAuth } from '@/context/AuthContext';

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0.35]);
  const { user } = useAuth();

  const createTo = user ? '/templates' : '/signup?next=/templates';

  return (
    <section ref={ref} className="relative overflow-hidden pb-16 pt-[112px] sm:pb-24 lg:pb-28 lg:pt-[132px]">
      <div className="pointer-events-none absolute inset-0 -z-10 texture-paper" />
      <div className="pointer-events-none absolute -right-[10%] top-[8%] -z-10 h-[34rem] w-[34rem] rounded-full border border-gold/15" />
      <div className="pointer-events-none absolute -right-[4%] top-[2%] -z-10 h-[28rem] w-[28rem] rounded-full border border-gold/10" />
      <div className="pointer-events-none absolute left-4 top-1/3 hidden h-24 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent lg:block" />

      {!reduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 -z-0"
          aria-hidden="true"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(48% 38% at 78% 14%, rgba(157,123,54,0.16), rgba(157,123,54,0) 70%)',
          }}
        />
      )}

      <motion.div style={reduce ? undefined : { opacity: fade }} className="shell relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
          <div className="relative z-10">
            <Reveal>
                <p className="eyebrow flex items-center gap-3 text-burgundy">
                <span className="h-px w-8 bg-burgundy/50" />
                Emotion from the very first moment
              </p>
            </Reveal>
            <h1 className="hero-title mt-6 max-w-[11ch] text-ink">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={reduce ? { opacity: 1 } : { y: '108%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.15, ease: [0.22, 0.61, 0.36, 1], delay: 0.1 }}
                >
                  Your most beautiful
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={reduce ? { opacity: 1 } : { y: '108%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 1.15, ease: [0.22, 0.61, 0.36, 1], delay: 0.26 }}
                >
                  invitation, <em className="text-burgundy">made personal.</em>
                </motion.span>
              </span>
            </h1>
            <Reveal delay={0.18}>
              <p className="mt-7 max-w-[32rem] text-[0.98rem] leading-relaxed text-ink-soft sm:text-[1.05rem]">
                A digital invitation with the feeling of a keepsake. Your photos, your music, your
                story, and every RSVP — beautifully together in one personal link.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to={createTo} className={buttonClass('primary', 'lg')}>
                  Create your invitation
                  <ArrowRight size={15} />
                </Link>
                <Link to="/i/clara-julien" className={buttonClass('outline', 'lg')}>
                  Open a live invitation
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.34}>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.72rem] text-muted">
                <span className="flex items-center gap-1.5">
                  <Check size={12} className="text-gold" /> Free to design
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-line sm:block" />
                <span>From {money(PRICING[0].price, PRICING[0].currency)}, once</span>
                <span className="hidden h-1 w-1 rounded-full bg-line sm:block" />
                <span>Unlimited guests</span>
              </div>
            </Reveal>
          </div>

          <motion.div
            style={reduce ? undefined : { y }}
            className="relative mx-auto w-full max-w-[470px] lg:mx-0 lg:ml-auto"
          >
            <EnvelopeTeaser />
            <div className="absolute -bottom-2 left-0 hidden max-w-[190px] -rotate-2 border-l border-gold/40 pl-4 sm:block">
              <p className="font-display text-[1rem] italic leading-snug text-muted">
                “It felt less like a link and more like a letter.”
              </p>
              <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-muted/70">
                The guest experience
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="shell mt-16 flex items-center justify-between gap-6 border-t border-line/70 pt-6">
        <p className="text-[0.65rem] uppercase tracking-[0.22em] text-muted">
          Eight designs · One studio
        </p>
        <div className="flex items-center gap-2.5">
          {TEMPLATES.slice(0, 6).map((template) => (
            <span
              key={template.id}
              className="h-2 w-2 rounded-full ring-1 ring-black/5"
              style={{ background: template.palette.accent }}
              title={template.name}
            />
          ))}
          <Link to="/templates" className="ml-1 text-[0.65rem] uppercase tracking-[0.18em] text-gold hover:text-ink">
            See all
          </Link>
        </div>
      </div>
    </section>
  );
}

function Arrival() {
  const steps = [
    {
      number: '01',
      title: 'It arrives sealed.',
      body: 'A wax seal with your monogram, addressed to your guest by name. No app, no account — just a link that feels like an envelope on the hall table.',
    },
    {
      number: '02',
      title: 'They break the seal.',
      body: 'The flap lifts, the card rises, and your soundtrack begins — only after they choose to open it. Theatre, with manners.',
    },
    {
      number: '03',
      title: 'They stay for the story.',
      body: 'Your story, the weekend, the map, the menu, the RSVP. One continuous invitation, all the way to the last dance.',
    },
  ];

  return (
    <section id="arrival" className="relative border-y border-line/70 bg-[#f1e9dc] section-pad">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">The arrival</p>
              <h2 className="display mt-4 text-[2.6rem] leading-[1.02] text-ink sm:text-[3.4rem]">
                How a link becomes
                <br />
                <em className="text-gold">a moment.</em>
              </h2>
              <p className="mt-5 max-w-md text-[0.96rem] leading-relaxed text-ink-soft">
                Most invitations are opened in three seconds and forgotten. We built ours to be
                opened slowly.
              </p>
              <Link to="/templates" className={buttonClass('outline', 'md', 'mt-7')}>
                Find your design
                <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>

          <div className="relative">
            <Reveal>
              <div className="arch-frame relative aspect-[4/3.4] overflow-hidden bg-[#221c15] sm:aspect-[4/3]">
                <TemplateArt
                  templateId="aurelia"
                  className="absolute inset-0 h-full w-full text-[#c9a877] opacity-50"
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,240,215,0.08),transparent_70%)]" />
                <div className="relative flex h-full flex-col items-center justify-center px-8 text-center text-[#fcf5e8]">
                  <span className="font-script text-[2.4rem] leading-none text-[#d9b87b]">C&amp;J</span>
                  <span className="mt-6 h-px w-14 bg-[#d9b87b]/50" />
                  <p className="mt-6 text-[0.52rem] font-semibold uppercase tracking-[0.34em] text-[#f1e3cf]/70">
                    Together with our families
                  </p>
                  <p className="mt-3 font-display text-[2rem] leading-[1.05] tracking-tight text-[#fdf7ea] sm:text-[2.4rem]">
                    Clara <span className="font-script text-[1.6rem] italic text-[#d9b87b]">&amp;</span> Julien
                  </p>
                  <p className="mt-4 text-[0.55rem] font-semibold uppercase tracking-[0.26em] text-[#f1e3cf]/75">
                    22 January · Villa Serena, Lake Como
                  </p>
                  <TemplateMark templateId="aurelia" className="mt-8 h-6 w-24 text-[#d9b87b]/80" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#20170f]/70 to-transparent p-6 sm:p-7">
                  <p className="max-w-sm font-display text-[1.2rem] italic leading-snug text-[#f1e3cf] sm:text-[1.35rem]">
                    “Everyone went quiet when the envelope opened.”
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="mt-9 grid gap-8 sm:gap-10">
              {steps.map((step, i) => (
                <Reveal key={step.number} delay={i * 0.06}>
                  <div className="grid grid-cols-[2.6rem_1fr] gap-4 border-t border-line/80 pt-5">
                    <span className="font-display text-lg italic text-gold">{step.number}</span>
                    <div>
                      <h3 className="font-display text-[1.55rem] leading-tight text-ink">{step.title}</h3>
                      <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">{step.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TemplateRail() {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: number) => {
    railRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' });
  };

  return (
    <section className="section-pad">
      <div className="shell">
        <Reveal>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 className="display mt-4 max-w-[18ch] text-[2.6rem] leading-[1.02] text-ink sm:text-[3.4rem]">
                Eight worlds. One of them is <em className="text-gold">yours.</em>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => scroll(-1)} className="icon-btn" aria-label="Scroll templates left">
                <ArrowLeft size={16} />
              </button>
              <button type="button" onClick={() => scroll(1)} className="icon-btn" aria-label="Scroll templates right">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            Each design is drawn from scratch — its own typography, palette, illustration and
            envelope — then made entirely yours.
          </p>
        </Reveal>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1.25rem,calc((100vw-76rem)/2))] pb-6"
      >
        {TEMPLATES.map((template, i) => {
          const sample = sampleInvitation(template.id);
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: Math.min(i * 0.04, 0.24) }}
              className="w-[268px] flex-none snap-start sm:w-[300px]"
            >
              <Link to={`/templates/${template.id}`} className="group block">
                <div
                  className="relative aspect-[3/4.1] overflow-hidden rounded-[2px] border border-line/80 shadow-[0_20px_50px_-35px_rgba(50,35,20,0.5)]"
                  style={{ background: template.palette.deep }}
                >
                  <TemplateArt
                    templateId={template.id}
                    className="absolute inset-0 h-full w-full text-[#d9b87b] opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-black/80" />
                  <div className="absolute inset-x-5 top-5 h-px bg-[#fcf5e8]/25" />
                  <div className="relative flex h-full flex-col items-center justify-between p-6 text-center text-[#fcf5e8]">
                    <span className="text-[0.48rem] font-semibold uppercase tracking-[0.32em] opacity-80">
                      {template.descriptor}
                    </span>
                    <div>
                      <p
                        className={`text-[2rem] leading-[1.02] ${template.cover.namesCase === 'upper' ? 'uppercase' : ''}`}
                        style={{ fontFamily: template.display, letterSpacing: template.cover.tracking }}
                      >
                        {sample.coupleA}
                        <span
                          className="mx-1 text-[1.5rem] italic"
                          style={{ fontFamily: template.script, color: template.palette.accent }}
                        >
                          &amp;
                        </span>
                        {sample.coupleB}
                      </p>
                      <p className="mt-3 text-[0.5rem] font-semibold uppercase tracking-[0.24em] opacity-80">
                        {formatDateShort(sample.weddingDate)} · {sample.location.split(',')[0]}
                      </p>
                    </div>
                    <div>
                      <TemplateMark templateId={template.id} className="mx-auto h-6 w-20 opacity-80" />
                      <span className="mt-3 inline-block border-b border-white/30 pb-0.5 text-[0.52rem] uppercase tracking-[0.24em] opacity-0 transition group-hover:opacity-100">
                        Preview this design
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-[1.25rem] text-ink">{template.name}</p>
                    <p className="text-[0.68rem] text-muted">{template.descriptor}</p>
                  </div>
                  <span className="flex items-center gap-1.5">
                    {[template.palette.bg, template.palette.accent, template.palette.deep].map((color) => (
                      <span
                        key={color}
                        className="h-2 w-2 rounded-full ring-1 ring-black/10"
                        style={{ background: color }}
                      />
                    ))}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="shell mt-2 flex justify-end">
        <Link to="/templates" className={buttonClass('ghost', 'sm')}>
          View the full collection <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}

function StudioSection() {
  return (
    <section id="studio" className="border-y border-line/70 bg-[#ede4d4] section-pad">
      <div className="shell">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <div>
              <p className="eyebrow">The studio</p>
              <h2 className="display mt-4 max-w-[20ch] text-[2.6rem] leading-[1.02] text-ink sm:text-[3.4rem]">
                Made, then remade until it feels <em className="text-gold">right.</em>
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-[0.98rem]">
                Switch a template, change a palette, rewrite a vow. The invitation on the right is
                the invitation your guests will see — not an approximation.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="grid max-w-sm gap-3 text-sm text-ink-soft">
              {[
                ['Live preview as you type', 'Every field, every ceremony, every colour.'],
                ['Autosave & undo', 'Change your mind as often as you need to.'],
                ['Publish when it is ready', 'Share a link, or a personal link for each guest.'],
              ].map(([title, body]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1 grid h-5 w-5 flex-none place-items-center rounded-full bg-ink text-paper">
                    <Check size={11} />
                  </span>
                  <span>
                    <span className="block font-medium text-ink">{title}</span>
                    <span className="text-[0.8rem] text-muted">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.12} className="mt-10">
          <MiniStudio />
        </Reveal>
      </div>
    </section>
  );
}

function GuestExperience() {
  const sample = sampleInvitation('aurelia');
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-[#241d17] section-pad text-[#f6edde]">
      <div className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-[#7a5636]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#4a1622]/40 blur-3xl" />
      <div className="shell relative grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-24">
        <Reveal>
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-[#c2a67d]">
              The guest experience
            </p>
            <h2 className="display mt-4 max-w-[16ch] text-[2.6rem] leading-[1.02] sm:text-[3.5rem]">
              The part they will
              <br />
              <em className="text-[#d9bb8c]">remember.</em>
            </h2>
            <p className="mt-5 max-w-lg text-[0.96rem] leading-relaxed text-[#d8cab7]">
              Not a wedding website with an envelope drawn on top. A single, deliberate experience
              from the seal to the last photograph — built for a phone, and for the moment someone
              opens it in a quiet room.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                'A sealed envelope, addressed to them',
                'A soundtrack that waits to be asked',
                'Every ceremony, on its own card',
                'RSVP with meals and accessibility',
                'A wall of blessings from guests',
                'A shared album, one QR away',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[0.83rem] text-[#e4d7c5]">
                  <Check size={13} className="mt-1 flex-none text-[#d9bb8c]" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/i/clara-julien" className={buttonClass('gold', 'md')}>
                Open Clara &amp; Julien&rsquo;s invitation
                <ArrowRight size={14} />
              </Link>
              <Link
                to={user ? '/templates' : '/signup?next=/templates'}
                className="btn border border-[#f0dfc6]/30 text-[#f3e7d4] hover:bg-[#f3e7d4]/10"
              >
                Make your own
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative mx-auto w-full max-w-[350px]">
            <div className="absolute -inset-8 rounded-[50%] border border-[#d9bb8c]/15" />
            <div className="phone-frame relative">
              <div className="phone-screen aspect-[9/18.6]">
                <div className="absolute inset-0" style={{ background: sample.theme.palette?.bg ?? '#221c15' }}>
                  <div className="absolute inset-0 bg-[#221c15]" />
                  <TemplateArt
                    templateId="aurelia"
                    className="absolute inset-0 h-full w-full text-[#d9b87b] opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70" />
                  <div className="relative flex h-full flex-col items-center justify-between px-6 pb-20 pt-12 text-center text-[#fbf0dc]">
                    <div>
                      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#f3e3c9]/40">
                        <span className="font-script text-[1.4rem]">C&amp;J</span>
                      </span>
                      <p className="mt-4 text-[0.45rem] uppercase tracking-[0.32em] text-[#f3e3c9]/75">
                        Together with our families
                      </p>
                    </div>
                    <div>
                      <p className="text-[2.15rem] leading-[1.02]" style={{ fontFamily: "'Bodoni Moda', 'Playfair Display', Georgia, serif" }}>
                        Clara
                        <span className="mx-1 font-script text-[1.7rem] text-[#d9b87b]">&amp;</span>
                        Julien
                      </p>
                      <p className="mt-3 text-[0.55rem] uppercase tracking-[0.24em] text-[#f3e3c9]/85">
                        {formatDateShort(sample.weddingDate)} · Lake Como
                      </p>
                      <p className="mt-5 text-[0.48rem] uppercase tracking-[0.2em] text-[#f3e3c9]/60">
                        Black tie optional · 4pm
                      </p>
                    </div>
                    <div className="w-full">
                      <p className="text-[0.6rem] italic text-[#f3e3c9]/75">Dear The Whitfield Family,</p>
                      <button
                        type="button"
                        className="mt-3 w-full rounded-full bg-[#d9b87b] px-4 py-2.5 text-[0.56rem] font-bold uppercase tracking-[0.2em] text-[#3a1420]"
                        tabIndex={-1}
                      >
                        Open the invitation
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/10 bg-[#1b1511]/85 px-4 py-3 text-[#f3e7d4] backdrop-blur">
                  <span className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#d9bb8c] text-[#2a2017]">
                      <Music2 size={12} />
                    </span>
                    <span className="text-[0.55rem] uppercase tracking-[0.16em]">Our soundtrack</span>
                  </span>
                  <span className="text-[0.55rem] uppercase tracking-[0.16em] text-[#d9bb8c]">RSVP</span>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 top-[18%] hidden -rotate-3 rounded-lg border border-[#efdfc6]/25 bg-[#2d241c]/90 px-3.5 py-2.5 text-[0.6rem] text-[#e9dbc6] shadow-xl sm:block">
              <span className="block text-[0.5rem] uppercase tracking-[0.18em] text-[#c2a67d]">Addressed to</span>
              <span className="mt-0.5 block font-display text-[0.95rem]">The Whitfield Family</span>
            </div>
            <div className="absolute -right-3 bottom-[24%] hidden rotate-2 rounded-lg border border-[#efdfc6]/25 bg-[#2d241c]/90 px-3.5 py-2.5 text-[0.6rem] text-[#e9dbc6] shadow-xl sm:block">
              <span className="block text-[0.5rem] uppercase tracking-[0.18em] text-[#c2a67d]">Invited to</span>
              <span className="mt-0.5 block">Ceremony · Dinner · Dancing</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DashboardBento() {
  return (
    <section className="section-pad">
      <div className="shell">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow">Behind the invitation</p>
            <h2 className="display mt-4 text-[2.6rem] leading-[1.02] text-ink sm:text-[3.4rem]">
              The quiet work behind the <em className="text-gold">beautiful part.</em>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted sm:text-[0.98rem]">
              Guest lists, replies, meals, seating, blessings and every photograph your guests take
              — in one calm dashboard.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <div className="panel h-full overflow-hidden p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Guests</p>
                  <h3 className="mt-1 font-display text-[1.6rem] text-ink">Everyone, accounted for.</h3>
                </div>
                <span className="pill pill-gold">Personal links</span>
              </div>
              <div className="mt-5 space-y-2">
                {[
                  ['The Whitfield Family', 'Family · 4 guests', 'Attending'],
                  ['Beatrice Hale', 'Friends · 1 guest', 'Attending'],
                  ['Tom Ashworth', 'Colleagues · 1 guest', 'Awaiting'],
                ].map(([name, meta, status], i) => (
                  <div key={name} className="flex items-center gap-3 rounded-xl border border-line/60 bg-[#fbf7ef] px-3.5 py-2.5">
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-ink text-[0.62rem] font-semibold text-paper">
                      {name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.82rem] font-medium text-ink">{name}</p>
                      <p className="text-[0.68rem] text-muted">{meta}</p>
                    </div>
                    <span className={i === 2 ? 'pill pill-neutral' : 'pill pill-green'}>{status}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[0.7rem] text-muted">
                Search, group, filter, and share a personal link with each household.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="md:col-span-5">
            <div className="panel flex h-full flex-col justify-between overflow-hidden bg-[#fbf7ef] p-6 sm:p-7">
              <div>
                <p className="eyebrow">RSVP</p>
                <h3 className="mt-1 font-display text-[1.6rem] text-ink">The answer, at a glance.</h3>
              </div>
              <div className="my-5 flex items-center gap-5">
                <div className="relative h-28 w-28 flex-none">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e7dccb" strokeWidth="9" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#7f8d78" strokeWidth="9" strokeDasharray="156 264" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#b58a43" strokeWidth="9" strokeDasharray="52 264" strokeDashoffset="-160" strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-center">
                    <span>
                      <span className="block font-display text-[1.55rem] leading-none text-ink">Live</span>
                      <span className="text-[0.52rem] uppercase tracking-[0.16em] text-muted">summary</span>
                    </span>
                  </span>
                </div>
                <div className="space-y-2 text-[0.74rem]">
                  {[
                    ['#7f8d78', 'Attending'],
                    ['#b58a43', 'Awaiting reply'],
                    ['#e7dccb', 'Declined'],
                  ].map(([color, label]) => (
                    <p key={label} className="flex items-center gap-2 text-ink-soft">
                      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                      {label}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-line/70 pt-4 text-[0.7rem] text-muted">
                <Utensils size={13} className="text-gold" />
                Meals, dietary needs and accessibility, collected once.
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="md:col-span-4">
            <div className="panel h-full overflow-hidden p-6">
              <p className="eyebrow">Shared album</p>
              <h3 className="mt-1 font-display text-[1.5rem] text-ink">Every angle of the day.</h3>
              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {['Before the ceremony', 'The first dance', 'The long table', 'Confetti', 'Candlelight', 'The last song'].map(
                  (caption) => (
                    <span
                      key={caption}
                      className="grid aspect-square w-full place-items-center rounded border border-line/60 bg-[#fbf7ef] px-1.5 text-center text-[0.45rem] uppercase leading-tight tracking-[0.08em] text-muted"
                    >
                      {caption}
                    </span>
                  ),
                )}
              </div>
              <p className="mt-3 text-[0.7rem] text-muted">
                Your guests’ own photographs, collected by QR. Download the whole album whenever you like.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-5">
            <div className="panel h-full overflow-hidden p-6">
              <p className="eyebrow">Seating</p>
              <h3 className="mt-1 font-display text-[1.5rem] text-ink">A plan that behaves.</h3>
              <div className="relative mt-4 h-[132px] rounded-xl border border-line/60 bg-[#fbf7ef] dot-grid">
                {[
                  [18, 22, 'Oak'],
                  [58, 22, 'Elm'],
                  [18, 62, 'Birch'],
                  [58, 62, 'Lime'],
                ].map(([left, top, label]) => (
                  <span
                    key={String(label)}
                    className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-paper text-[0.45rem] font-semibold uppercase tracking-[0.08em] text-ink-soft shadow-sm"
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    {label}
                  </span>
                ))}
                <span className="absolute bottom-2 right-2 rounded-full bg-ink px-2.5 py-1 text-[0.5rem] uppercase tracking-[0.14em] text-paper">
                  Drag to seat
                </span>
              </div>
              <p className="mt-3 text-[0.7rem] text-muted">
                Seating respects households, capacity and who has actually replied.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="md:col-span-3">
            <div className="panel flex h-full flex-col items-center justify-between p-6 text-center">
              <div>
                <p className="eyebrow">Share</p>
                <h3 className="mt-1 font-display text-[1.4rem] text-ink">One QR, everywhere.</h3>
              </div>
              <div className="my-4 rounded-lg border border-line bg-paper p-3">
                <QRCodeSVG value="https://vellum.studio/i/clara-julien" size={104} bgColor="#fffdf8" fgColor="#211b16" level="M" />
              </div>
              <p className="text-[0.68rem] text-muted">For the invitation, the album, or the table.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function MusicSection() {
  return (
    <section id="music" className="border-y border-line/70 bg-[#f1e9dc] section-pad">
      <div className="shell grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal>
          <div>
            <p className="eyebrow">The soundtrack</p>
            <h2 className="display mt-4 text-[2.6rem] leading-[1.02] text-ink sm:text-[3.3rem]">
              The first few bars do the <em className="text-gold">work.</em>
            </h2>
            <p className="mt-5 max-w-md text-[0.96rem] leading-relaxed text-ink-soft">
              Choose one of four original recordings, or upload the song that belongs to you. The
              music begins when your guest opens the envelope — never before, never by surprise.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-soft">
              {[
                'Play, pause, mute and volume — always within reach.',
                'Remembers where they were, and stops when they leave.',
                'A quiet player that never covers the words.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Music2 size={14} className="mt-1 flex-none text-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.7rem] leading-relaxed text-muted">
              Every built-in recording was composed and recorded for Vellum. No licensed pop songs,
              no rights headaches.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <SoundtrackDemo />
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  const { user } = useAuth();
  return (
    <section id="pricing" className="section-pad">
      <div className="shell">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Pricing</p>
            <h2 className="display mt-4 text-[2.6rem] leading-[1.02] text-ink sm:text-[3.4rem]">
              Design for free.
              <br />
              Pay once, when it&rsquo;s <em className="text-gold">perfect.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted">
              No subscription, no per-guest charge, no expiry. Build your entire invitation, preview
              it as a guest, and only pay when you are ready to send it.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PRICING.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 0.06}>
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-[18px] border p-6 sm:p-7 ${
                  tier.featured
                    ? 'border-[#3a2c21] bg-[#241d17] text-[#f6edde] shadow-[0_40px_80px_-45px_rgba(40,28,18,0.7)]'
                    : 'border-line bg-paper text-ink'
                }`}
              >
                {tier.badge && (
                  <span className="absolute right-5 top-5 rounded-full border border-[#d9bb8c]/40 bg-[#d9bb8c]/15 px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[#e7cda6]">
                    {tier.badge}
                  </span>
                )}
                <p className={`text-[0.6rem] font-semibold uppercase tracking-[0.24em] ${tier.featured ? 'text-[#c2a67d]' : 'text-muted'}`}>
                  {tier.summary}
                </p>
                <h3 className={`mt-2 font-display text-[1.9rem] leading-none ${tier.featured ? 'text-[#f8efdf]' : 'text-ink'}`}>
                  {tier.name}
                </h3>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className={`font-display text-[3rem] leading-none ${tier.featured ? 'text-[#f8efdf]' : 'text-ink'}`}>
                    {money(tier.price, tier.currency)}
                  </span>
                  <span className={`text-[0.68rem] ${tier.featured ? 'text-[#c2a67d]' : 'text-muted'}`}>once</span>
                </div>
                <p className={`mt-3 text-sm leading-relaxed ${tier.featured ? 'text-[#cfc2b0]' : 'text-muted'}`}>
                  {tier.description}
                </p>
                <div className={`my-6 h-px ${tier.featured ? 'bg-[#443528]' : 'bg-line/80'}`} />
                <ul className="space-y-2.5 text-[0.82rem]">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        size={13}
                        className={`mt-1 flex-none ${tier.featured ? 'text-[#d9bb8c]' : 'text-gold'}`}
                      />
                      <span className={tier.featured ? 'text-[#e4d7c5]' : 'text-ink-soft'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-7">
                  <Link
                    to={`${user ? '/templates' : '/signup'}?plan=${tier.id}${user ? '' : '&next=/templates'}`}
                    className={
                      tier.featured
                        ? buttonClass('gold', 'md', 'w-full')
                        : buttonClass('outline', 'md', 'w-full')
                    }
                  >
                    {user ? 'Choose this package' : 'Start designing'}
                  </Link>
                  <p className={`mt-2.5 text-center text-[0.62rem] ${tier.featured ? 'text-[#b9a58c]' : 'text-muted'}`}>
                    {tier.note}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[0.7rem] text-muted">
          Prices in GBP, inclusive of VAT. Preview and build your invitation before paying anything.
        </p>
      </div>
    </section>
  );
}

function Faq() {
  const questions = [
    {
      q: 'Do our guests need an app or an account?',
      a: 'No. Every invitation opens in the browser, from a link or a QR code. They can RSVP, leave a blessing and add photographs without creating anything.',
    },
    {
      q: 'Can we use our own song?',
      a: 'Yes. Upload an MP3, M4A, WAV or OGG file in the studio. Your guests will always see a play control — browsers require one tap before sound can begin, and we would not want to surprise anyone anyway.',
    },
    {
      q: 'Can different guests see different ceremonies?',
      a: 'Yes. Invite each household to the events that concern them — the ceremony for the family, dinner for colleagues. Their personal invitation only shows what they are invited to.',
    },
    {
      q: 'What happens to our invitation after the wedding?',
      a: 'It stays online, along with the RSVPs, blessings and shared album. The album can be downloaded in full at any time, so nothing is locked inside the studio.',
    },
    {
      q: 'Is the invitation private?',
      a: 'You choose. Publish it publicly, or keep it unlisted so it only opens through personal guest links. Either way, guest contact details are never exposed to other guests.',
    },
    {
      q: 'Do we pay per guest?',
      a: 'Never. Each package is a one-time payment for unlimited guests, unlimited previews and all of the features in that package.',
    },
  ];

  return (
    <section id="faq" className="border-t border-line/70 bg-[#f1e9dc] section-pad">
      <div className="shell grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <Reveal>
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="display mt-4 text-[2.4rem] leading-[1.02] text-ink sm:text-[3rem]">
              A few things,
              <br />
              answered <em className="text-gold">plainly.</em>
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Anything else? Write to us at{' '}
              <a href="mailto:hello@vellum.studio" className="border-b border-gold/50 text-ink-soft hover:text-gold">
                hello@vellum.studio
              </a>
              . We answer within one working day.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div>
            {questions.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>
                  <span>{item.q}</span>
                  <span className="faq-plus text-gold">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>
                </summary>
                <p className="max-w-2xl pb-5 pr-8 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ClosingCta() {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden bg-[#4a1d28] py-20 text-[#fbf0df] sm:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
        <TemplateArt templateId="belgrave" className="h-full w-full text-[#e3c79b]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#3a1420] via-[#4a1d28]/85 to-[#3a1420]/70" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-[#d9bb8c]/10 blur-3xl" />
      <div className="shell relative text-center">
        <Reveal>
          <TemplateMark templateId="belgrave" className="mx-auto h-9 w-32 text-[#d9bb8c]" />
          <h2 className="display mx-auto mt-6 max-w-[22ch] text-[2.5rem] leading-[1.02] sm:text-[4rem]">
            The first thing they open.
            <br />
            <em className="text-[#e3c79b]">The last thing they forget.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-[#e2d3c0]">
            Begin with a template. Finish with something that could only belong to the two of you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={user ? '/templates' : '/signup?next=/templates'} className={buttonClass('gold', 'lg')}>
              Begin your invitation
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/templates"
              className="btn border border-[#e9d5b4]/35 text-[#f4e8d7] hover:bg-[#f4e8d7]/10"
            >
              Browse the collection
              <ChevronRight size={14} />
            </Link>
          </div>
          <p className="mt-6 font-script text-[1.6rem] text-[#e3c79b]/90">With love, the Vellum studio</p>
        </Reveal>
      </div>
    </section>
  );
}

function Values() {
  const items = [
    { icon: <ShieldCheck size={17} />, title: 'Private by design', body: 'Guest details stay yours. Personal links only reveal what each household needs.' },
    { icon: <Sparkles size={17} />, title: 'No template feeling', body: 'Eight original art directions, not eight colour swaps.' },
    { icon: <Heart size={17} />, title: 'Yours to keep', body: 'The invitation, blessings and photographs remain — and the album is always downloadable.' },
  ];
  return (
    <section className="border-t border-line/70 py-12">
      <div className="shell grid gap-8 sm:grid-cols-3">
        {items.map((item) => (
          <Reveal key={item.title}>
            <div className="flex gap-4">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line bg-paper text-gold">
                {item.icon}
              </span>
              <div>
                <h3 className="font-display text-[1.25rem] text-ink">{item.title}</h3>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{item.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Landing() {
  return (
    <div className="texture-paper">
      <MarketingNav />
      <main>
        <Hero />
        <Arrival />
        <TemplateRail />
        <StudioSection />
        <GuestExperience />
        <DashboardBento />
        <Values />
        <MusicSection />
        <Pricing />
        <Faq />
        <ClosingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
