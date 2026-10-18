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
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { EventDetails, InvitationData, PhotoRecord, RsvpRecord } from '@shared/types';
import type { WallMessage } from './MessageWall';
import { StarField, TemplateArt, TemplateMark } from '@/templates/art';
import type { TemplateId } from '@/templates/types';
import type { ResolvedTheme } from '@/templates/registry';
import { formatDate, formatDateShort, formatDayMonth, formatTime, groupEventsByDate } from '@/lib/format';
import { Countdown } from './Countdown';
import { Gallery } from './Gallery';
import { RsvpForm } from './RsvpForm';
import { MessageWall } from './MessageWall';
import { t, type InvitationLang } from './i18n';

const EASE = [0.22, 0.61, 0.36, 1] as const;

function Header({
  eyebrow,
  title,
  description,
  centered = true,
  index,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  index?: number;
}) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {index != null && <p className="inv-index">{String(index).padStart(2, '0')}</p>}
      <p className={`inv-eyebrow ${index != null ? 'mt-2' : ''}`}>{eyebrow}</p>
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

const INVITE_LINE = 'With all our love, we invite you';
const HERO_GOLD = 'color-mix(in srgb, var(--inv-accent) 40%, #fff)';

function splitDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  return { year: match[1], month: match[2], day: match[3] };
}

function DiamondRule({ color, width = 'w-14' }: { color: string; width?: string }) {
  return (
    <span className="flex items-center justify-center gap-3" style={{ color }} aria-hidden>
      <span className={`h-px ${width} bg-current opacity-70`} />
      <span className="size-[5px] rotate-45 bg-current" />
      <span className={`h-px ${width} bg-current opacity-70`} />
    </span>
  );
}

/**
 * Céleste — and only Céleste — sets the names one letter at a time,
 * each character rising out of the dark like a star coming out.
 */
function CelesteNameLines({ a, b }: { a: string; b: string }) {
  const reduce = useReducedMotion();
  const renderLine = (text: string, base: number, keyPrefix: string, lead?: React.ReactNode) => (
    <span className="block overflow-hidden py-[0.06em]" aria-label={lead ? undefined : text}>
      {lead}
      {text.split('').map((ch, i) => (
        <motion.span
          key={`${keyPrefix}-${i}`}
          className="inline-block will-change-transform"
          aria-hidden="true"
          initial={reduce ? { opacity: 1 } : { y: '118%', opacity: 0, rotate: 5 }}
          animate={{ y: '0%', opacity: 1, rotate: 0 }}
          transition={{ duration: 1.15, ease: EASE, delay: base + i * 0.048 }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  );
  const ampDelay = 0.3 + a.length * 0.048;
  return (
    <>
      {renderLine(a, 0.3, 'a')}
      {renderLine(
        b,
        ampDelay + 0.22,
        'b',
        <motion.span
          className="amp inline-block"
          initial={reduce ? { opacity: 1 } : { y: '118%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: ampDelay }}
        >
          &
        </motion.span>,
      )}
    </>
  );
}

export function Hero({
  data,
  theme,
  guest,
}: {
  data: InvitationData;
  theme: ResolvedTheme;
  guest: { name: string; partySize: number } | null;
  mode: 'live' | 'sample' | 'preview';
}) {
  const reduce = useReducedMotion();
  const cover = theme.template.cover;
  const upper = cover.namesCase === 'upper';
  const isCeleste = theme.template.id === 'celeste';
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const artY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '7%']);
  const artScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-9%']);
  const contentFade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0]);
  const date = splitDate(data.weddingDate);

  const reveal = (delay: number) => ({
    initial: reduce ? { opacity: 1 } : { y: '110%', opacity: 0 },
    animate: { y: '0%', opacity: 1 },
    transition: { duration: 1.4, ease: EASE, delay },
  });

  return (
    <header ref={heroRef} className="inv-hero" id="top">
      <motion.div
        className="absolute inset-x-0 -top-[7%] h-[114%]"
        style={{ y: artY, scale: artScale }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--inv-deep) 86%, #000) 0%, var(--inv-deep) 46%, color-mix(in srgb, var(--inv-deep) 78%, var(--inv-accent)) 100%)',
          }}
        />
        <TemplateArt
          templateId={theme.template.id as TemplateId}
          className="absolute inset-0 h-full w-full text-[var(--inv-accent)] opacity-[0.24]"
        />
        {isCeleste && (
          <StarField className="absolute inset-0 h-full w-full text-[#efeaff] opacity-70" count={90} />
        )}
        {isCeleste && (
          <div
            className="absolute left-1/2 top-[12%] h-24 w-24 -translate-x-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle at 38% 34%, #f4f0ff, #cfc6ef 55%, transparent 72%)',
              boxShadow: '0 0 80px 24px rgba(203,185,230,0.35)',
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 28%, color-mix(in srgb, var(--inv-accent) 24%, transparent), transparent 55%)',
          }}
        />
      </motion.div>
      <div className="inv-hero-scrim" />
      <div className="inv-hero-frame" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <motion.div
        className="inv-hero-inner relative z-[2] flex min-h-[inherit] flex-1 flex-col items-center text-center"
        style={{ y: contentY, opacity: contentFade }}
      >
        <div className="mt-[12svh] flex w-full max-w-4xl flex-col items-center text-[#fdf7ea]">
          <span className="block overflow-hidden">
            <motion.span
              className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border"
              style={{
                borderColor: 'color-mix(in srgb, var(--inv-accent) 65%, #fff)',
                color: HERO_GOLD,
                fontFamily: 'var(--inv-script)',
                fontSize: '1.5rem',
                background: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 0 0 5px rgba(0,0,0,0.12), 0 10px 30px -12px rgba(0,0,0,0.6)',
              }}
              {...reveal(0.05)}
            >
              {data.monogram}
            </motion.span>
          </span>
          {guest && data.settings.showGuestName && (
            <span className="block overflow-hidden">
              <motion.p
                className="mb-5 text-[0.78rem] font-semibold uppercase tracking-[0.34em]"
                style={{ fontFamily: 'var(--inv-caps)', color: HERO_GOLD }}
                {...reveal(0.1)}
              >
                {t(data.settings.language, 'forGuest')} {guest.name}
              </motion.p>
            </span>
          )}

          <h1
            className={`inv-names ${upper ? 'uppercase' : ''}`}
            style={{ letterSpacing: cover.tracking, textShadow: '0 2px 34px rgba(0,0,0,0.38)' }}
          >
            {isCeleste ? (
              <CelesteNameLines a={data.coupleA} b={data.coupleB} />
            ) : (
              <>
                <span className="block overflow-hidden py-[0.05em]">
                  <motion.span className="block" {...reveal(0.2)}>
                    {data.coupleA}
                  </motion.span>
                </span>
                <span className="block overflow-hidden py-[0.05em]">
                  <motion.span className="block" {...reveal(0.38)}>
                    <span className="amp">&amp;</span>
                    {data.coupleB}
                  </motion.span>
                </span>
              </>
            )}
          </h1>

          <span className="mt-7 block overflow-hidden">
            <motion.p
              className="mx-auto max-w-[17rem] text-[0.72rem] font-medium uppercase leading-[2] tracking-[0.32em] sm:max-w-none"
              style={{ fontFamily: 'var(--inv-caps)', textShadow: '0 1px 14px rgba(0,0,0,0.45)' }}
              {...reveal(0.7)}
            >
              {INVITE_LINE}
            </motion.p>
          </span>

          <motion.div
            className="mt-6 w-full max-w-[16rem]"
            initial={reduce ? false : { opacity: 0, scaleX: 0.4 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 1.2, delay: 1.0, ease: EASE }}
          >
            <DiamondRule color={HERO_GOLD} width="w-20" />
          </motion.div>
        </div>

        <motion.div
          className="mt-auto w-full max-w-[22rem] px-1 pt-10"
          initial={reduce ? false : { opacity: 0, y: 46 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 1.1, ease: EASE }}
        >
          <div
            className="relative overflow-hidden px-7 pb-4 pt-6 text-center shadow-[0_30px_70px_-34px_rgba(0,0,0,0.7)]"
            style={{
              background: 'color-mix(in srgb, var(--inv-surface) 94%, transparent)',
              color: 'var(--inv-ink)',
              borderRadius: '0.25rem',
              backdropFilter: 'blur(6px)',
              border: '1px solid color-mix(in srgb, var(--inv-accent) 40%, transparent)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-1.5"
              style={{ border: '1px solid color-mix(in srgb, var(--inv-accent) 22%, transparent)' }}
              aria-hidden
            />
            <p
              className="text-[1.22rem] italic leading-tight"
              style={{ fontFamily: 'var(--inv-display)', color: 'var(--inv-accent)' }}
            >
              {data.location}
            </p>
            <div className="mt-3">
              <DiamondRule color="var(--inv-accent)" width="w-[4.5rem]" />
            </div>
            <div
              className="mt-4 flex items-center justify-center gap-6 text-[2.15rem] leading-none tracking-[0.06em]"
              style={{ fontFamily: 'var(--inv-display)' }}
            >
              {date ? (
                <>
                  <span>
                    {date.day}.{date.month}
                  </span>
                  <span className="h-9 w-px bg-[var(--inv-accent)]/70" aria-hidden />
                  <span>{date.year}</span>
                </>
              ) : (
                <span>{formatDate(data.weddingDate)}</span>
              )}
            </div>
            <div
              className="mt-5 flex items-center justify-between border-t pt-3 text-[0.66rem] font-medium uppercase tracking-[0.3em]"
              style={{
                fontFamily: 'var(--inv-caps)',
                borderColor: 'color-mix(in srgb, var(--inv-accent) 28%, transparent)',
                color: 'var(--inv-accent)',
              }}
            >
              <a href="#rsvp" className="transition hover:opacity-70">
                {t(data.settings.language, 'rsvpCta')}
              </a>
              <a href="#welcome" className="transition hover:opacity-70" aria-label="Scroll to the welcome">
                Scroll &darr;
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </header>
  );
}

export function Welcome({ data, theme, index }: { data: InvitationData; theme: ResolvedTheme; index?: number }) {
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
        {index != null && <p className="inv-index">{String(index).padStart(2, '0')}</p>}
        <div className={`flex items-center gap-4 ${centered ? 'justify-center' : ''} ${index != null ? 'mt-2' : ''}`}>
          <span className="h-px w-10 bg-[var(--inv-accent)]/50" />
          <span className="inv-label">{t(data.settings.language, 'welcome')}</span>
          <span className="h-px w-10 bg-[var(--inv-accent)]/50" />
        </div>
        <h2 className="inv-display mt-5 text-[clamp(1.9rem,7cqw,3rem)] leading-[1.08]">
          {data.welcomeHeading}
        </h2>
        {data.welcomeNote && <p className="inv-body-copy mt-5 whitespace-pre-line">{data.welcomeNote}</p>}
        <p className="inv-script inv-foil mt-8 text-[clamp(1.8rem,6cqw,2.5rem)]">
          {data.coupleA} &amp; {data.coupleB}
        </p>
        <p className="inv-label mt-3 !text-[0.52rem]">{formatDate(data.weddingDate)}</p>
      </motion.div>
    </section>
  );
}

export function Story({ data, theme, index }: { data: InvitationData; theme: ResolvedTheme; index?: number }) {
  const reduce = useReducedMotion();
  if (!data.story.length) return null;
  return (
    <section className="inv-section" style={{ background: 'color-mix(in srgb, var(--inv-accent-soft) 24%, var(--inv-bg))' }}>
      <div className="inv-narrow !max-w-5xl">
        <Header
          eyebrow={t(data.settings.language, 'ourStory')}
          title="How we got here"
          description={data.storyIntro}
          index={index}
        />
        <div className="mt-12 space-y-12 sm:space-y-16">
          {data.story.map((chapter, chapterIndex) => {
            const reverse = chapterIndex % 2 === 1;
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
                  <figure className="frame-stationery relative">
                    <div className="overflow-hidden">
                      <img
                        src={chapter.image}
                        alt={chapter.title}
                        loading="lazy"
                        className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-[1.02]"
                      />
                    </div>
                    <figcaption className="inv-label mt-3 !text-[0.5rem]">
                      Chapter {String(chapterIndex + 1).padStart(2, '0')}
                    </figcaption>
                  </figure>
                ) : (
                  <div className="hidden sm:block" />
                )}
                <div className={chapter.image ? '' : 'sm:col-span-2 sm:mx-auto sm:max-w-2xl sm:text-center'}>
                  <TemplateMark templateId={theme.template.id as TemplateId} className="h-6 w-24 text-[var(--inv-accent)] opacity-60" />
                  <p className="inv-script mt-2 text-[2rem] leading-none text-[var(--inv-accent)]">
                    {String(chapterIndex + 1).padStart(2, '0')}
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

export function CountdownSection({ data, theme, index }: { data: InvitationData; theme: ResolvedTheme; index?: number }) {
  if (!data.settings.countdown || !data.weddingDate) return null;
  const primary = [...data.events].sort((a, b) => a.date.localeCompare(b.date))[0];
  const target = primary?.date ?? data.weddingDate;
  return (
    <section className="inv-section relative overflow-hidden" style={{ background: 'var(--inv-deep)', color: 'var(--inv-deep-ink)' }}>
      <TemplateArt
        templateId={theme.template.id as TemplateId}
        className="pointer-events-none absolute inset-0 h-full w-full text-[var(--inv-accent)] opacity-[0.14]"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--inv-accent) 16%, transparent), transparent 55%)' }}
      />
      <div className="inv-narrow relative text-center">
        {index != null && <p className="inv-index">{String(index).padStart(2, '0')}</p>}
        <p className={`inv-label !text-[var(--inv-deep-ink)]/50 ${index != null ? 'mt-2' : ''}`}>{t(data.settings.language, 'countdown')}</p>
        <p className="inv-script inv-foil mt-4 text-[clamp(2.2rem,8cqw,3.6rem)]">
          {t(data.settings.language, 'forever')}
        </p>
        <p
          className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.3em] text-[var(--inv-deep-ink)]/75"
          style={{ fontFamily: 'var(--inv-caps)' }}
        >
          {formatDate(target)}
        </p>
        <div className="mx-auto mt-9 max-w-xl !text-[var(--inv-deep-ink)]">
          <Countdown date={target} time={primary?.startTime ?? data.weddingTime} lang={data.settings.language} />
        </div>
        <p
          className="mt-9 text-[0.62rem] uppercase tracking-[0.28em] text-[var(--inv-deep-ink)]/45"
          style={{ fontFamily: 'var(--inv-caps)' }}
        >
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
  index,
}: {
  data: InvitationData;
  guestEventIds?: string[];
  index?: number;
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
          index={index}
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

export function Details({ data, theme, index }: { data: InvitationData; theme: ResolvedTheme; index?: number }) {
  const detail = data.details;
  const cards = [
    detail.dressCode && {
      icon: <Shirt size={16} />,
      title: 'Dress code',
      body: [detail.dressCode, detail.dressCodeNote].filter(Boolean).join(' — '),
      swatches: true,
    },
    detail.travel && { icon: <Car size={16} />, title: 'Getting there', body: detail.travel },
    detail.accommodation && { icon: <BedDouble size={16} />, title: 'Where to stay', body: detail.accommodation },
    detail.gifts && { icon: <Gift size={16} />, title: 'Gifts', body: detail.gifts },
    detail.additional && {
      icon: <Info size={16} />,
      title: detail.additionalTitle || 'A little more',
      body: detail.additional,
    },
  ].filter(Boolean) as { icon: React.ReactNode; title: string; body: string; swatches?: boolean }[];

  if (!cards.length && !detail.address) return null;

  return (
    <section className="inv-section" style={{ background: 'color-mix(in srgb, var(--inv-accent-soft) 22%, var(--inv-bg))' }}>
      <div className="inv-narrow !max-w-4xl">
        <Header
          eyebrow={t(data.settings.language, 'details')}
          title="A few practicalities"
          description="Everything you might want to know before you pack a bag."
          index={index}
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
                {card.swatches && (
                  <span className="mt-3 flex items-center gap-2.5">
                    {[theme.palette.accentSoft, theme.palette.accent, theme.palette.deep, theme.palette.bg].map((color) => (
                      <span
                        key={color}
                        className="h-5 w-5 rounded-full ring-1 ring-black/15"
                        style={{ background: color }}
                        aria-hidden="true"
                      />
                    ))}
                    <span
                      className="ml-1 text-[0.55rem] uppercase tracking-[0.22em] text-[var(--inv-muted)]"
                      style={{ fontFamily: 'var(--inv-caps)' }}
                    >
                      {t(data.settings.language, 'colourStory')}
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GallerySection({ data, templateId, index }: { data: InvitationData; templateId: string; index?: number }) {
  if (!data.gallery.length) return null;
  return (
    <section className="inv-section">
      <div className="inv-narrow !max-w-5xl">
        <Header
          eyebrow={t(data.settings.language, 'gallery')}
          title="Moments, so far"
          description="A few frames from the road that brought us here. The rest will be taken on the day — by you, we hope."
          index={index}
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
  index,
}: {
  data: InvitationData;
  slug: string;
  guest: { name: string; partySize: number; invitedEventIds: string[]; token: string } | null;
  existingRsvp: RsvpRecord | null;
  token?: string;
  mode: 'live' | 'sample' | 'preview';
  onSubmitted?: (rsvp: RsvpRecord) => void;
  index?: number;
}) {
  return (
    <section id="rsvp" className="inv-section" style={{ background: 'var(--inv-deep)', color: 'var(--inv-deep-ink)' }}>
      <div className="inv-narrow !max-w-3xl">
        <div className="text-center">
          {index != null && <p className="inv-index">{String(index).padStart(2, '0')}</p>}
          <p className={`inv-label !text-[var(--inv-deep-ink)]/50 ${index != null ? 'mt-2' : ''}`}>{t(data.settings.language, 'rsvp')}</p>
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
  index,
}: {
  data: InvitationData;
  slug: string;
  guest: { name: string } | null;
  token?: string;
  messages: WallMessage[];
  mode: 'live' | 'sample' | 'preview';
  index?: number;
}) {
  if (!data.settings.messagesEnabled) return null;
  return (
    <section id="messages" className="inv-section">
      <div className="inv-narrow !max-w-5xl">
        <Header
          eyebrow={t(data.settings.language, 'messages')}
          title="Blessings, from the people we love"
          description="Leave a note for the two of us — we will be reading every one, probably more than once."
          index={index}
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
  index,
}: {
  data: InvitationData;
  slug: string;
  photos: PhotoRecord[];
  token?: string;
  mode: 'live' | 'sample' | 'preview';
  index?: number;
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
            {index != null && <p className="inv-index">{String(index).padStart(2, '0')}</p>}
            <p className={`inv-label ${index != null ? 'mt-2' : ''}`}>{t(data.settings.language, 'album')}</p>
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
        <p className="inv-script inv-foil mt-6 text-[clamp(1.9rem,7cqw,2.8rem)]">
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
