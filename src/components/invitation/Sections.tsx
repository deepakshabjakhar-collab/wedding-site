import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BedDouble,
  Car,
  ChevronRight,
  Gift,
  Images,
  Info,
  MapPin,
  QrCode,
  Shirt,
  Sparkles,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { EventDetails, InvitationData, PhotoRecord, RsvpRecord } from '@shared/types';
import type { WallMessage } from './MessageWall';
import { TemplateArt, TemplateMark } from '@/templates/art';
import type { TemplateId } from '@/templates/types';
import type { ResolvedTheme } from '@/templates/registry';
import { formatDate, formatDateShort, formatDayMonth, formatTime, groupEventsByDate } from '@/lib/format';
import { Countdown } from './Countdown';
import { Gallery } from './Gallery';
import { RsvpForm } from './RsvpForm';
import { MessageWall } from './MessageWall';
import { t, type InvitationLang } from './i18n';

const EASE = [0.22, 0.61, 0.36, 1] as const;

/** The single drawn ornament that sits under the names on every cover. */
function CoverFlourish({ kind }: { kind: 'none' | 'rule' | 'star' | 'sprig' }) {
  if (kind === 'none') return <span className="block h-4" aria-hidden />;
  return (
    <span className="mx-auto flex h-4 items-center justify-center gap-3 text-[var(--inv-accent)]" aria-hidden>
      <span className="h-px w-12 bg-current opacity-60" />
      {kind === 'rule' && <span className="h-1.5 w-1.5 rotate-45 border border-current" />}
      {kind === 'star' && (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
          <path
            d="M12 1.6l1.9 8.5 8.5 1.9-8.5 1.9L12 22.4l-1.9-8.5L1.6 12l8.5-1.9Z"
            fill="currentColor"
            fillOpacity="0.75"
          />
        </svg>
      )}
      {kind === 'sprig' && (
        <svg viewBox="0 0 34 16" className="h-3.5 w-8" fill="none" stroke="currentColor" strokeWidth="0.9">
          <path d="M17 15c0-6 0-11 0-13" />
          <path d="M17 6c-3-1-5-3-5-6 3 0 5 2 5 6ZM17 6c3-1 5-3 5-6-3 0-5 2-5 6ZM17 11c-2-1-4-2-4-4 2 0 4 1 4 4ZM17 11c2-1 4-2 4-4-2 0-4 1-4 4Z" />
        </svg>
      )}
      <span className="h-px w-12 bg-current opacity-60" />
    </span>
  );
}

function Header({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? 'text-center' : ''}>
      <p className="inv-eyebrow">{eyebrow}</p>
      <h2 className="inv-display mt-3 text-[clamp(2rem,7.5cqw,3.3rem)] leading-[1.05] text-[var(--inv-ink)]">
        {title}
      </h2>
      {description && (
        <p className={`inv-body-copy mt-4 ${centered ? 'mx-auto max-w-xl' : 'max-w-xl'}`}>{description}</p>
      )}
      <span className={`mt-6 block h-px w-16 bg-[var(--inv-accent)]/45 ${centered ? 'mx-auto' : ''}`} aria-hidden />
    </div>
  );
}

export function Hero({
  data,
  theme,
  guest,
  mode,
}: {
  data: InvitationData;
  theme: ResolvedTheme;
  guest: { name: string; partySize: number } | null;
  mode: 'live' | 'sample' | 'preview';
}) {
  const templateId = theme.template.id;
  const reduce = useReducedMotion();
  const centered = ['garden', 'georgian', 'celestial', 'vintage', 'playful'].includes(theme.layout);
  const minimal = theme.layout === 'minimal';
  const stacked = centered || minimal;
  const cover = theme.template.cover;
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '9%']);
  const artScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-14%']);
  const contentFade = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0]);

  const reveal = (delay: number) => ({
    initial: reduce ? { opacity: 1 } : { y: '112%', opacity: 0 },
    animate: { y: '0%', opacity: 1 },
    transition: { duration: 1.15, ease: EASE, delay },
  });

  return (
    <header ref={heroRef} className="inv-hero" id="top">
      <motion.div
        className="absolute inset-0"
        style={{ y: artY, scale: artScale, background: `linear-gradient(165deg, ${theme.palette.deep}, ${theme.palette.ink})` }}
      >
        <TemplateArt
          templateId={templateId as TemplateId}
          className="absolute inset-0 h-full w-full text-[var(--inv-accent)] opacity-[0.55]"
        />
      </motion.div>
      <div className="inv-hero-scrim" />
      <motion.div className="inv-hero-inner" style={{ y: contentY, opacity: contentFade }}>
        <div className={centered ? 'mx-auto max-w-4xl text-center' : 'max-w-4xl'}>
          <span className="block overflow-hidden">
            <motion.p className="inv-eyebrow !text-[#f0e4d2]/70" {...reveal(0.05)}>
              {guest && data.settings.showGuestName
                ? `${t(data.settings.language, 'forGuest')} ${guest.name}${guest.partySize > 1 ? ` · ${guest.partySize} guests` : ''}`
                : data.welcomeHeading}
            </motion.p>
          </span>

          <h1
            className={`inv-names mt-5 text-[#fdf7ea] ${cover.namesCase === 'upper' ? 'uppercase' : ''}`}
            style={{ letterSpacing: cover.tracking }}
          >
            {stacked ? (
              <>
                <span className="block overflow-hidden">
                  <motion.span className="block" {...reveal(0.16)}>
                    {data.coupleA}
                  </motion.span>
                </span>
                <span className="block overflow-hidden py-[0.04em]">
                  <motion.span
                    className="amp block !text-[0.34em] leading-none"
                    {...reveal(0.3)}
                  >
                    &amp;
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span className="block" {...reveal(0.42)}>
                    {data.coupleB}
                  </motion.span>
                </span>
              </>
            ) : (
              <motion.span className="block" {...reveal(0.16)}>
                {data.coupleA}
                <span className="amp">&amp;</span>
                {data.coupleB}
              </motion.span>
            )}
          </h1>

          <span className={`block overflow-hidden ${centered ? '' : 'max-w-lg'}`}>
            <motion.span className={`mt-6 block ${centered ? '' : ''}`} {...reveal(0.58)}>
              <CoverFlourish kind={cover.flourish} />
            </motion.span>
          </span>

          {data.tagline && (
            <span className="block overflow-hidden">
              <motion.p className="inv-scripture mt-5 !text-[#f3e7d4]/85" {...reveal(0.68)}>
                {data.tagline}
              </motion.p>
            </span>
          )}

          <span className="block overflow-hidden">
            <motion.div
              className={`mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#f1e4d1]/80 ${centered ? 'justify-center' : ''}`}
              {...reveal(0.8)}
            >
              <span>{formatDate(data.weddingDate)}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--inv-accent)]" />
              <span>{data.location}</span>
            </motion.div>
          </span>

          <div className={`mt-10 flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
            <a href="#rsvp" className="inv-btn">
              {t(data.settings.language, 'rsvpCta')}
              <ArrowRight size={13} />
            </a>
            <a href="#schedule" className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#f1e4d1]/70 transition hover:text-[#f1e4d1] sm:inline-block">
              The celebrations
            </a>
          </div>

          {mode !== 'live' && (
            <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#f1e4d1]/25 px-3 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-[#f1e4d1]/60">
              <Sparkles size={10} /> Design preview
            </p>
          )}
        </div>

        <div className={`mt-12 flex ${centered ? 'justify-center' : 'justify-start'}`}>
          <a
            href="#welcome"
            className="flex flex-col items-center gap-2 text-[0.52rem] uppercase tracking-[0.28em] text-[#f1e4d1]/55 transition hover:text-[#f1e4d1]"
            aria-label="Scroll to the welcome"
          >
            <span className="inv-scroll-cue" />
            Scroll
          </a>
        </div>
      </motion.div>
    </header>
  );
}

export function Welcome({ data, theme }: { data: InvitationData; theme: ResolvedTheme }) {
  const reduce = useReducedMotion();
  const centered = ['garden', 'georgian', 'celestial', 'vintage', 'playful'].includes(theme.layout);
  return (
    <section id="welcome" className="inv-section">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.8, ease: EASE }}
        className={`inv-narrow ${centered ? 'text-center' : ''}`}
      >
        <div className={`flex items-center gap-4 ${centered ? 'justify-center' : ''}`}>
          <span className="h-px w-10 bg-[var(--inv-accent)]/50" />
          <span className="inv-label">{t(data.settings.language, 'welcome')}</span>
          <span className="h-px w-10 bg-[var(--inv-accent)]/50" />
        </div>
        <h2 className="inv-display mt-5 text-[clamp(1.9rem,7cqw,3rem)] leading-[1.08]">
          {data.welcomeHeading}
        </h2>
        {data.welcomeNote && <p className="inv-body-copy mt-5 whitespace-pre-line">{data.welcomeNote}</p>}
        <p className="inv-script mt-8 text-[clamp(1.8rem,6cqw,2.5rem)] text-[var(--inv-accent)]">
          {data.coupleA} &amp; {data.coupleB}
        </p>
        <p className="inv-label mt-3 !text-[0.52rem]">{formatDate(data.weddingDate)}</p>
      </motion.div>
    </section>
  );
}

export function Story({ data, theme }: { data: InvitationData; theme: ResolvedTheme }) {
  const reduce = useReducedMotion();
  if (!data.story.length) return null;
  return (
    <section className="inv-section" style={{ background: 'color-mix(in srgb, var(--inv-accent-soft) 24%, var(--inv-bg))' }}>
      <div className="inv-narrow !max-w-5xl">
        <Header
          eyebrow={t(data.settings.language, 'ourStory')}
          title="How we got here"
          description={data.storyIntro}
        />
        <div className="mt-12 space-y-12 sm:space-y-16">
          {data.story.map((chapter, index) => {
            const reverse = index % 2 === 1;
            return (
              <motion.article
                key={chapter.id}
                initial={reduce ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: EASE }}
                className={`grid items-center gap-6 sm:grid-cols-2 sm:gap-10 ${reverse ? 'sm:[&>figure]:order-2' : ''}`}
              >
                {chapter.image ? (
                  <figure className={`relative ${theme.layout === 'editorial' ? 'arch-frame' : ''}`}>
                    <div className="overflow-hidden">
                      <img
                        src={chapter.image}
                        alt={chapter.title}
                        loading="lazy"
                        className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-[1.02]"
                      />
                    </div>
                    <figcaption className="inv-label mt-3 !text-[0.5rem]">
                      Chapter {String(index + 1).padStart(2, '0')}
                    </figcaption>
                  </figure>
                ) : (
                  <div className="hidden sm:block" />
                )}
                <div className={chapter.image ? '' : 'sm:col-span-2 sm:mx-auto sm:max-w-2xl sm:text-center'}>
                  <p className="inv-script text-[2rem] leading-none text-[var(--inv-accent)]">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="inv-display mt-3 text-[clamp(1.5rem,5cqw,2.1rem)] leading-tight">
                    {chapter.title}
                  </h3>
                  <p className="inv-body-copy mt-3 whitespace-pre-line">{chapter.body}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CountdownSection({ data, theme }: { data: InvitationData; theme: ResolvedTheme }) {
  if (!data.settings.countdown || !data.weddingDate) return null;
  const primary = [...data.events].sort((a, b) => a.date.localeCompare(b.date))[0];
  const target = primary?.date ?? data.weddingDate;
  return (
    <section className="inv-section relative overflow-hidden" style={{ background: 'var(--inv-deep)', color: 'var(--inv-deep-ink)' }}>
      <TemplateArt
        templateId={theme.template.id as TemplateId}
        className="pointer-events-none absolute inset-0 h-full w-full text-[var(--inv-accent)] opacity-[0.14]"
      />
      <div className="inv-narrow relative text-center">
        <p className="inv-label !text-[var(--inv-deep-ink)]/50">{t(data.settings.language, 'countdown')}</p>
        <p className="inv-display mt-3 text-[clamp(1.6rem,5.5cqw,2.4rem)] !text-[var(--inv-deep-ink)]">
          {formatDate(target)}
        </p>
        <div className="mt-8">
          <Countdown date={target} time={primary?.startTime ?? data.weddingTime} lang={data.settings.language} />
        </div>
        <p className="mt-8 text-[0.65rem] uppercase tracking-[0.24em] text-[var(--inv-deep-ink)]/45">
          {data.location}
        </p>
      </div>
    </section>
  );
}

function EventRow({ event, lang }: { event: EventDetails; lang: InvitationLang }) {
  const day = formatDayMonth(event.date);
  return (
    <div className="inv-event-row">
      <div>
        <p className="inv-event-date">
          {day.day}
          <span>{day.month}</span>
        </p>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="inv-display text-[clamp(1.3rem,4.6cqw,1.7rem)] leading-tight">{event.name}</h3>
          <p className="inv-label !text-[0.52rem]">
            {formatTime(event.startTime)}
            {event.endTime ? ` – ${formatTime(event.endTime)}` : ''}
          </p>
        </div>
        {event.subtitle && <p className="mt-0.5 font-[var(--inv-script)] text-[1.1rem] text-[var(--inv-accent)]">{event.subtitle}</p>}
        <p className="mt-2 text-[0.82rem] font-medium text-[var(--inv-ink)]">{event.venue}</p>
        {event.address && <p className="text-[0.76rem] leading-relaxed text-[var(--inv-muted)]">{event.address}</p>}
        {event.description && <p className="inv-body-copy mt-2 !text-[0.86rem]">{event.description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {event.mapUrl && (
            <a
              href={event.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 border-b border-[var(--inv-accent)]/40 pb-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--inv-accent)] transition hover:border-[var(--inv-accent)]"
            >
              <MapPin size={11} /> {t(lang, 'map')}
            </a>
          )}
          {event.dressCode && (
            <span className="inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--inv-muted)]">
              <Shirt size={11} /> {event.dressCode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function Schedule({
  data,
  guestEventIds,
}: {
  data: InvitationData;
  guestEventIds?: string[];
}) {
  const allowed = guestEventIds?.length
    ? data.events.filter((event) => guestEventIds.includes(event.id))
    : data.events;
  if (!allowed.length) return null;
  const groups = groupEventsByDate(allowed);

  return (
    <section id="schedule" className="inv-section">
      <div className="inv-narrow !max-w-3xl">
        <Header
          eyebrow={t(data.settings.language, 'celebrations')}
          title={data.events.length > 3 ? 'The celebrations' : 'The day, in order'}
          description={
            guestEventIds?.length && guestEventIds.length < data.events.length
              ? `You are invited to ${guestEventIds.length} of our ${data.events.length} celebrations. Every detail of those days is below.`
              : 'Every ceremony, every venue, every time — so you can plan the weekend with ease.'
          }
        />
        <div className="mt-10">
          {groups.map((group) => (
            <div key={group.date} className="mb-8">
              <div className="mb-1 flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--inv-line)]" />
                <p className="inv-label !text-[0.55rem]">{formatDate(group.date, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <span className="h-px flex-1 bg-[var(--inv-line)]" />
              </div>
              {group.events.map((event) => (
                <EventRow key={event.id} event={event} lang={data.settings.language} />
              ))}
            </div>
          ))}
        </div>
        {data.details.mapUrl && (
          <a
            href={data.details.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inv-btn inv-btn-outline mt-2 w-full sm:w-auto"
          >
            <MapPin size={13} /> {data.details.venue}
            <ChevronRight size={13} />
          </a>
        )}
      </div>
    </section>
  );
}

export function Details({ data }: { data: InvitationData }) {
  const detail = data.details;
  const cards = [
    detail.dressCode && {
      icon: <Shirt size={16} />,
      title: 'Dress code',
      body: [detail.dressCode, detail.dressCodeNote].filter(Boolean).join(' — '),
    },
    detail.travel && { icon: <Car size={16} />, title: 'Getting there', body: detail.travel },
    detail.accommodation && { icon: <BedDouble size={16} />, title: 'Where to stay', body: detail.accommodation },
    detail.gifts && { icon: <Gift size={16} />, title: 'Gifts', body: detail.gifts },
    detail.additional && {
      icon: <Info size={16} />,
      title: detail.additionalTitle || 'A little more',
      body: detail.additional,
    },
  ].filter(Boolean) as { icon: React.ReactNode; title: string; body: string }[];

  if (!cards.length && !detail.address) return null;

  return (
    <section className="inv-section" style={{ background: 'color-mix(in srgb, var(--inv-accent-soft) 22%, var(--inv-bg))' }}>
      <div className="inv-narrow !max-w-4xl">
        <Header
          eyebrow={t(data.settings.language, 'details')}
          title="A few practicalities"
          description="Everything you might want to know before you pack a bag."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {detail.address && (
            <div className="inv-detail-card sm:col-span-2">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-[var(--inv-accent)]/30 text-[var(--inv-accent)]">
                <MapPin size={15} />
              </span>
              <div className="min-w-0">
                <p className="inv-label !text-[0.52rem]">The venue</p>
                <p className="mt-1 text-sm font-medium text-[var(--inv-ink)]">{detail.venue || data.location}</p>
                <p className="text-[0.8rem] leading-relaxed text-[var(--inv-muted)]">{detail.address}</p>
                {detail.mapUrl && (
                  <a
                    href={detail.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--inv-accent)]"
                  >
                    {t(data.settings.language, 'map')} <ArrowRight size={11} />
                  </a>
                )}
              </div>
            </div>
          )}
          {cards.map((card) => (
            <div key={card.title} className="inv-detail-card">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-[var(--inv-accent)]/30 text-[var(--inv-accent)]">
                {card.icon}
              </span>
              <div className="min-w-0">
                <p className="inv-label !text-[0.52rem]">{card.title}</p>
                <p className="mt-1 whitespace-pre-line text-[0.83rem] leading-relaxed text-[var(--inv-muted)]">{card.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GallerySection({ data, templateId }: { data: InvitationData; templateId: string }) {
  if (!data.gallery.length) return null;
  return (
    <section className="inv-section">
      <div className="inv-narrow !max-w-5xl">
        <Header
          eyebrow={t(data.settings.language, 'gallery')}
          title="Moments, so far"
          description="A few frames from the road that brought us here. The rest will be taken on the day — by you, we hope."
        />
        <div className="mt-9">
          <Gallery items={data.gallery} layout={templateId} />
        </div>
        {data.settings.albumEnabled && (
          <p className="mt-8 text-center text-[0.72rem] text-[var(--inv-muted)]">
            <Images size={12} className="mr-1.5 inline text-[var(--inv-accent)]" />
            After the wedding, this becomes the shared album — every guest&rsquo;s photographs in one place.
          </p>
        )}
      </div>
    </section>
  );
}

export function RsvpSection({
  data,
  slug,
  guest,
  existingRsvp,
  token,
  mode,
  onSubmitted,
}: {
  data: InvitationData;
  slug: string;
  guest: { name: string; partySize: number; invitedEventIds: string[]; token: string } | null;
  existingRsvp: RsvpRecord | null;
  token?: string;
  mode: 'live' | 'sample' | 'preview';
  onSubmitted?: (rsvp: RsvpRecord) => void;
}) {
  return (
    <section id="rsvp" className="inv-section" style={{ background: 'var(--inv-deep)', color: 'var(--inv-deep-ink)' }}>
      <div className="inv-narrow !max-w-3xl">
        <div className="text-center">
          <p className="inv-label !text-[var(--inv-deep-ink)]/50">{t(data.settings.language, 'rsvp')}</p>
          <p className="mx-auto mt-3 max-w-md text-[0.84rem] leading-relaxed text-[var(--inv-deep-ink)]/60">
            A reply helps us set a place for you, choose the menu, and plan the seating.
          </p>
        </div>
        <div className="mt-7">
          <RsvpForm
            data={data}
            slug={slug}
            guest={guest}
            existingRsvp={existingRsvp}
            token={token}
            lang={data.settings.language}
            mode={mode}
            onSubmitted={onSubmitted}
          />
        </div>
      </div>
    </section>
  );
}

export function MessagesSection({
  data,
  slug,
  guest,
  token,
  messages,
  mode,
}: {
  data: InvitationData;
  slug: string;
  guest: { name: string } | null;
  token?: string;
  messages: WallMessage[];
  mode: 'live' | 'sample' | 'preview';
}) {
  if (!data.settings.messagesEnabled) return null;
  return (
    <section id="messages" className="inv-section">
      <div className="inv-narrow !max-w-5xl">
        <Header
          eyebrow={t(data.settings.language, 'messages')}
          title="Blessings, from the people we love"
          description="Leave a note for the two of us — we will be reading every one, probably more than once."
        />
        <div className="mt-9">
          <MessageWall
            data={data}
            slug={slug}
            guest={guest}
            token={token}
            initialMessages={messages}
            lang={data.settings.language}
            mode={mode}
          />
        </div>
      </div>
    </section>
  );
}

export function AlbumSection({
  data,
  slug,
  photos,
  token,
  mode,
}: {
  data: InvitationData;
  slug: string;
  photos: PhotoRecord[];
  token?: string;
  mode: 'live' | 'sample' | 'preview';
}) {
  if (!data.settings.albumEnabled) return null;
  const albumHref = `/i/${slug}/album${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  const qrValue =
    typeof window !== 'undefined'
      ? `${window.location.origin}/i/${slug}/album${token ? `?token=${encodeURIComponent(token)}` : ''}`
      : albumHref;

  return (
    <section className="inv-section" style={{ background: 'color-mix(in srgb, var(--inv-accent-soft) 26%, var(--inv-bg))' }}>
      <div className="inv-narrow !max-w-4xl">
        <div className="grid items-center gap-8 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="inv-label">{t(data.settings.language, 'album')}</p>
            <h2 className="inv-display mt-3 text-[clamp(1.9rem,6.5cqw,2.8rem)] leading-[1.05]">
              Your photographs, together.
            </h2>
            <p className="inv-body-copy mt-3 max-w-lg">
              We would love to see the day through your eyes. Add your photographs to the shared
              album — at the table, from the dance floor, or the morning after.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {mode === 'live' ? (
                <Link to={albumHref} className="inv-btn">
                  <Images size={13} /> {t(data.settings.language, 'addPhotos')}
                </Link>
              ) : (
                <button type="button" className="inv-btn opacity-70" disabled>
                  <Images size={13} /> {t(data.settings.language, 'addPhotos')}
                </button>
              )}
              <span className="text-[0.68rem] text-[var(--inv-muted)]">
                {photos.length > 0
                  ? `${photos.length} ${photos.length === 1 ? 'photograph' : 'photographs'} so far`
                  : 'Be the first to add one'}
              </span>
            </div>
          </div>
          <div className="justify-self-center rounded-[2px] border border-[var(--inv-line)] bg-[var(--inv-surface)] p-3">
            <QRCodeSVG value={qrValue} size={104} bgColor="#fffdf8" fgColor="#211b16" level="M" />
            <p className="mt-2 flex items-center justify-center gap-1 text-[0.5rem] uppercase tracking-[0.14em] text-[var(--inv-muted)]">
              <QrCode size={9} /> Scan at the table
            </p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mt-8 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {photos.slice(0, 6).map((photo) => (
              <img
                key={photo.id}
                src={photo.thumbUrl}
                alt={`Photograph by ${photo.uploadedBy}`}
                loading="lazy"
                className="aspect-square w-full rounded-[1px] object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function Closing({ data, theme }: { data: InvitationData; theme: ResolvedTheme }) {
  return (
    <section className="inv-section relative overflow-hidden !pb-16" style={{ background: 'var(--inv-bg)' }}>
      <TemplateArt
        templateId={theme.template.id as TemplateId}
        className="pointer-events-none absolute -bottom-16 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 text-[var(--inv-accent)] opacity-[0.14]"
      />
      <div className="inv-narrow relative text-center">
        <span className="inv-mono mx-auto">{data.monogram}</span>
        <p className="inv-display mt-7 text-[clamp(1.8rem,6cqw,2.6rem)] leading-[1.1]">
          Thank you for being part of our story.
        </p>
        <p className="inv-body-copy mx-auto mt-4 max-w-md">
          We cannot wait to see your face, hear your laugh, and dance badly with you.
        </p>
        <p className="inv-script mt-6 text-[clamp(1.9rem,7cqw,2.8rem)] text-[var(--inv-accent)]">
          {data.coupleA} &amp; {data.coupleB}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[0.6rem] uppercase tracking-[0.22em] text-[var(--inv-muted)]">
          <span>{formatDateShort(data.weddingDate)}</span>
          {data.hashtag && <span className="h-1 w-1 rounded-full bg-[var(--inv-accent)]" />}
          {data.hashtag && <span>{data.hashtag}</span>}
        </div>
        <div className="mt-10 border-t border-[var(--inv-line)] pt-5">
          <Link to="/" className="text-[0.55rem] uppercase tracking-[0.22em] text-[var(--inv-muted)]/70 transition hover:text-[var(--inv-accent)]">
            An invitation made with Vellum
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SectionDivider({ templateId }: { templateId: string }) {
  return (
    <div className="pointer-events-none flex justify-center py-1" aria-hidden>
      <TemplateMark templateId={templateId as TemplateId} className="h-8 w-28 text-[var(--inv-accent)] opacity-50" />
    </div>
  );
}
