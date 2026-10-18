import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Music2, Share2 } from 'lucide-react';
import type {
  InvitationRecord,
  PhotoRecord,
  PublicInvitationPayload,
  RsvpRecord,
} from '@shared/types';
import type { WallMessage } from './MessageWall';
import { BUILT_IN_TRACKS } from '@shared/defaults';
import { resolveTheme, themeStyle } from '@/templates/registry';
import { useAudioPlayer } from '@/lib/useAudioPlayer';
import { EnvelopeGate } from './EnvelopeGate';
import { MusicPlayer } from './MusicPlayer';
import { ShareDialog } from './ShareDialog';
import {
  AlbumSection,
  Closing,
  CountdownSection,
  Details,
  GallerySection,
  Hero,
  MessagesSection,
  RsvpSection,
  Schedule,
  Story,
  Welcome,
} from './Sections';
import { t } from './i18n';

export type ExperienceMode = 'live' | 'sample' | 'preview';

interface Props {
  invitation: InvitationRecord;
  messages: WallMessage[];
  photos: PhotoRecord[];
  personalization: PublicInvitationPayload['personalization'];
  token?: string;
  mode: ExperienceMode;
  embedded?: boolean;
  initialOpen?: boolean;
  className?: string;
}

function useInvitationScroll(rootRef: React.RefObject<HTMLDivElement | null>, embedded: boolean, enabled: boolean) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const target: HTMLElement | Window = embedded && rootRef.current ? rootRef.current : window;

    const read = () => {
      const scrollTop = embedded && rootRef.current ? rootRef.current.scrollTop : window.scrollY;
      const height =
        embedded && rootRef.current
          ? rootRef.current.scrollHeight - rootRef.current.clientHeight
          : document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(1, Math.max(0, scrollTop / height)) : 0);
      setVisible(scrollTop > 420);
    };

    read();
    target.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);
    return () => {
      target.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
    };
  }, [embedded, enabled, rootRef]);

  return { visible, progress };
}

export function InvitationExperience({
  invitation,
  messages,
  photos,
  personalization,
  token,
  mode,
  embedded,
  initialOpen,
  className,
}: Props) {
  const data = invitation.data;
  const theme = useMemo(
    () => resolveTheme(invitation.templateId, data.theme),
    [invitation.templateId, data.theme],
  );
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(
    Boolean(initialOpen) || data.settings.envelopeAnimation === 'none',
  );
  const [shareOpen, setShareOpen] = useState(false);
  const [musicHint, setMusicHint] = useState<string | null>(null);
  const [rsvp, setRsvp] = useState<RsvpRecord | null>(personalization?.existingRsvp ?? null);

  const guest = personalization?.guest ?? null;
  const guestToken = token ?? guest?.token;

  const trackSrc = useMemo(() => {
    if (!data.music.enabled) return null;
    if (data.music.customSrc) return data.music.customSrc;
    const track = BUILT_IN_TRACKS.find((item) => item.id === data.music.trackId);
    return track?.src ?? BUILT_IN_TRACKS[0].src;
  }, [data.music.customSrc, data.music.enabled, data.music.trackId]);

  const player = useAudioPlayer(trackSrc, { loop: true, volume: 0.5 });
  const { visible: barVisible, progress } = useInvitationScroll(rootRef, Boolean(embedded), true);

  useEffect(() => {
    setOpened(Boolean(initialOpen) || data.settings.envelopeAnimation === 'none');
  }, [initialOpen, data.settings.envelopeAnimation]);

  const startMusic = useCallback(() => {
    if (!trackSrc || !data.music.startOnOpen) return;
    void player.play().then((ok) => {
      if (!ok) {
        setMusicHint('Tap the play button to start the music.');
        window.setTimeout(() => setMusicHint(null), 7000);
      }
    });
  }, [data.music.startOnOpen, player, trackSrc]);

  const sections = useMemo(() => {
    const order = data.settings.sectionsOrder;
    const hidden = new Set(data.settings.hiddenSections);
    return order.filter((section) => !hidden.has(section));
  }, [data.settings.hiddenSections, data.settings.sectionsOrder]);

  const guestEventIds = guest?.invitedEventIds ?? [];

  const renderSection = (section: string, position: number) => {
    switch (section) {
      case 'welcome':
        return <Welcome key={section} data={data} theme={theme} index={position} />;
      case 'story':
        return <Story key={section} data={data} theme={theme} index={position} />;
      case 'countdown':
        return <CountdownSection key={section} data={data} theme={theme} index={position} />;
      case 'schedule':
        return <Schedule key={section} data={data} guestEventIds={guestEventIds} index={position} />;
      case 'gallery':
        return <GallerySection key={section} data={data} templateId={invitation.templateId} index={position} />;
      case 'details':
        return <Details key={section} data={data} theme={theme} index={position} />;
      case 'rsvp':
        return (
          <RsvpSection
            key={section}
            data={data}
            slug={invitation.slug}
            guest={guest}
            existingRsvp={rsvp}
            token={guestToken}
            mode={mode}
            onSubmitted={setRsvp}
            index={position}
          />
        );
      case 'messages':
        return (
          <MessagesSection
            key={section}
            data={data}
            slug={invitation.slug}
            guest={guest}
            token={guestToken}
            messages={messages}
            mode={mode}
            index={position}
          />
        );
      case 'album':
        return (
          <AlbumSection key={section} data={data} slug={invitation.slug} photos={photos} token={guestToken} mode={mode} index={position} />
        );
      case 'closing':
        return <Closing key={section} data={data} theme={theme} />;
      default:
        return null;
    }
  };

  const shareUrl =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/i/')
      ? window.location.href
      : guestToken
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/i/${invitation.slug}/g/${guestToken}`
        : `/i/${invitation.slug}`;
  const shareTitle = data.settings.shareTitle || `${data.coupleA} & ${data.coupleB} — our wedding invitation`;
  const shareDescription =
    data.settings.shareDescription ||
    `${data.coupleA} & ${data.coupleB} are getting married${data.location ? ` at ${data.location}` : ''}. Open the invitation.`;

  return (
    <div
      className={`invite-shell ${embedded ? 'invite-embedded' : ''} ${className ?? ''}`}
      style={themeStyle(theme)}
      data-template={invitation.templateId}
    >
      <div
        ref={rootRef}
        className={`invite-root ${embedded ? 'inv-preview' : ''}`}
        data-layout={theme.layout}
      >
        <Hero data={data} theme={theme} guest={guest} mode={mode} />
        {sections.map((section, i) => renderSection(section, i + 1))}
      </div>

      <div className="invite-overlay">
        {/* top bar */}
        <AnimatePresence>
          {barVisible && opened && !embedded && (
            <motion.div
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              className="inv-topbar"
            >
              <span className="inv-topbar-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
                <span className="flex items-center gap-2.5">
                  <span className="inv-mono !h-8 !w-8 !text-[0.85rem]">{data.monogram}</span>
                  <span className="hidden text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-[var(--inv-deep-ink)]/80 sm:block">
                    {data.coupleA} &amp; {data.coupleB}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  {mode === 'live' && (
                    <button
                      type="button"
                      onClick={() => setShareOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[var(--inv-deep-ink)]/80 transition hover:bg-[var(--inv-deep-ink)]/10"
                    >
                      <Share2 size={12} /> {t(data.settings.language, 'share')}
                    </button>
                  )}
                  <a
                    href="#rsvp"
                    className="inline-flex items-center rounded-full bg-[var(--inv-accent)] px-3.5 py-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--inv-deep)]"
                  >
                    RSVP
                  </a>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {trackSrc && opened && (
          <MusicPlayer
            player={player}
            title={data.music.title}
            artist={data.music.artist}
            embedded={embedded}
          />
        )}

        <AnimatePresence>
          {musicHint && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="inv-music-hint"
              role="status"
            >
              <Music2 size={12} /> {musicHint}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!opened && (
            <EnvelopeGate
              data={data}
              templateId={invitation.templateId}
              guestName={guest?.name}
              embedded={embedded}
              onIntent={startMusic}
              onOpen={() => setOpened(true)}
            />
          )}
        </AnimatePresence>
      </div>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={shareTitle}
        description={shareDescription}
        guestName={guest?.name}
      />
    </div>
  );
}
