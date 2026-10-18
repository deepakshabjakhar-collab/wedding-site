import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  CloudOff,
  ExternalLink,
  Eye,
  FileText,
  Images,
  LayoutList,
  Loader2,
  Monitor,
  Music2,
  Palette,
  Redo2,
  Send,
  Smartphone,
  Undo2,
  Users,
} from 'lucide-react';
import type { InvitationData, InvitationRecord } from '@shared/types';
import { useHistory } from '@/lib/useHistory';
import { api, ApiError } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Misc';
import { buttonClass } from '@/components/ui/Button';
import { InvitationExperience } from '@/components/invitation/InvitationExperience';
import { DesignPanel, MusicPanel, SectionsPanel } from '@/components/studio/PanelsDesign';
import { ContentPanel, EventsPanel, GalleryPanel, StoryPanel } from '@/components/studio/PanelsCore';
import { GuestsPanel, PublishPanel, RsvpPanel } from '@/components/studio/PanelsReach';
import type { PanelProps } from '@/components/studio/panel-types';

interface EditorState {
  data: InvitationData;
  templateId: string;
}

const TABS = [
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'content', label: 'Words', icon: FileText },
  { id: 'story', label: 'Story', icon: BookOpen },
  { id: 'events', label: 'Ceremonies', icon: CalendarDays },
  { id: 'gallery', label: 'Gallery', icon: Images },
  { id: 'sections', label: 'Structure', icon: LayoutList },
  { id: 'music', label: 'Music', icon: Music2 },
  { id: 'rsvp', label: 'RSVP', icon: ClipboardCheck },
  { id: 'guests', label: 'Guests', icon: Users },
  { id: 'publish', label: 'Publish', icon: Send },
] as const;

type TabId = (typeof TABS)[number]['id'];

function PreviewFrame({
  data,
  templateId,
  invitationId,
  mode,
  onModeChange,
  onClose,
}: {
  data: InvitationData;
  templateId: string;
  invitationId: string;
  mode: 'cover' | 'invitation';
  onModeChange: (mode: 'cover' | 'invitation') => void;
  onClose?: () => void;
}) {
  const previewInvitation = useMemo<InvitationRecord>(
    () => ({
      id: invitationId,
      userId: 'preview',
      slug: 'preview',
      templateId,
      status: 'draft',
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [data, invitationId, templateId],
  );
  const [device, setDevice] = useState<'phone' | 'wide'>('phone');

  return (
    <div className={`flex h-full flex-col overflow-hidden ${device === 'phone' ? 'bg-[#e9e1d4]' : 'bg-[#ddd2c1]'}`}>
      <div className="flex flex-none items-center justify-between gap-2 border-b border-line bg-[#f8f3e9] px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onModeChange('cover')}
            className={`rounded-full px-2.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] transition ${
              mode === 'cover' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
            }`}
          >
            Cover
          </button>
          <button
            type="button"
            onClick={() => onModeChange('invitation')}
            className={`rounded-full px-2.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] transition ${
              mode === 'invitation' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
            }`}
          >
            Invitation
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDevice('phone')}
            className={`icon-btn !h-7 !w-7 ${device === 'phone' ? 'bg-paper' : ''}`}
            aria-label="Phone preview"
            aria-pressed={device === 'phone'}
          >
            <Smartphone size={13} />
          </button>
          <button
            type="button"
            onClick={() => setDevice('wide')}
            className={`icon-btn !h-7 !w-7 ${device === 'wide' ? 'bg-paper' : ''}`}
            aria-label="Wide preview"
            aria-pressed={device === 'wide'}
          >
            <Monitor size={13} />
          </button>
          <a
            href={`/preview/${invitationId}`}
            target="_blank"
            rel="noreferrer"
            className="icon-btn !h-7 !w-7"
            aria-label="Open the guest preview in a new tab"
          >
            <ExternalLink size={13} />
          </a>
          {onClose && (
            <button type="button" onClick={onClose} className="ml-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-muted">
              Close
            </button>
          )}
        </div>
      </div>
      <div className={`flex min-h-0 flex-1 justify-center ${device === 'phone' ? 'px-3 py-3' : 'p-0'}`}>
        <div
          className={`h-full overflow-hidden ${
            device === 'phone'
              ? 'w-full max-w-[390px] rounded-[22px] border-[5px] border-[#2c241c] bg-[var(--inv-bg)] shadow-2xl'
              : 'w-full'
          }`}
        >
          <InvitationExperience
            key={`${mode}-${templateId}`}
            invitation={previewInvitation}
            messages={[]}
            photos={[]}
            personalization={null}
            mode="preview"
            embedded
            initialOpen={mode === 'invitation'}
            className="h-full"
          />
        </div>
      </div>
      <p className="flex-none border-t border-line bg-[#f8f3e9] px-3 py-2 text-center text-[0.58rem] uppercase tracking-[0.12em] text-muted">
        Live preview · changes appear as you type
      </p>
    </div>
  );
}

export default function StudioPage() {
  const { id = '' } = useParams();
  const { push } = useToast();
  const { data: loaded, loading, error } = useAsync(() => api.invitations.get(id), [id]);

  const history = useHistory<EditorState | null>(null);
  const [tab, setTab] = useState<TabId>('design');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'cover' | 'invitation'>('invitation');
  const [mobilePreview, setMobilePreview] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const savedRef = useRef('');
  const invitationRef = useRef<InvitationRecord | null>(null);

  useEffect(() => {
    if (!loaded?.invitation) return;
    invitationRef.current = loaded.invitation;
    setStatus(loaded.invitation.status);
    const state: EditorState = {
      data: loaded.invitation.data,
      templateId: loaded.invitation.templateId,
    };
    history.reset(state);
    savedRef.current = JSON.stringify(state);
    setLoadedOnce(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const current = history.value;

  const update = useCallback(
    (partial: Partial<InvitationData>, coalesceKey?: string) => {
      history.set(
        (state) =>
          state ? { ...state, data: { ...state.data, ...partial } } : state,
        coalesceKey,
      );
    },
    [history],
  );

  const updateSettings = useCallback(
    (partial: Partial<InvitationData['settings']>, coalesceKey?: string) => {
      history.set(
        (state) =>
          state
            ? { ...state, data: { ...state.data, settings: { ...state.data.settings, ...partial } } }
            : state,
        coalesceKey,
      );
    },
    [history],
  );

  const setTemplateId = useCallback(
    (templateId: string) => {
      history.set((state) =>
        state
          ? {
              templateId,
              data: {
                ...state.data,
                theme: { ...state.data.theme, palette: {}, fontPair: '', scriptFont: '' },
              },
            }
          : state,
      );
    },
    [history],
  );

  const save = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const state = history.value;
      if (!state) return false;
      const snapshot = JSON.stringify(state);
      if (snapshot === savedRef.current) {
        if (!options.silent) setSaveState('saved');
        return true;
      }
      setSaveState('saving');
      setSaveError(null);
      try {
        const result = await api.invitations.update(id, {
          data: state.data,
          templateId: state.templateId,
        });
        savedRef.current = snapshot;
        setStatus(result.invitation.status);
        setSaveState('saved');
        return true;
      } catch (err) {
        setSaveState('error');
        setSaveError(err instanceof ApiError ? err.message : 'Could not save your changes.');
        return false;
      }
    },
    [history, id],
  );

  // Autosave
  useEffect(() => {
    if (!loadedOnce || !current) return;
    const snapshot = JSON.stringify(current);
    if (snapshot === savedRef.current) return;
    const timer = window.setTimeout(() => {
      void save({ silent: true });
    }, 900);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, loadedOnce]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) history.redo();
        else history.undo();
      }
      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [history, save]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (current && JSON.stringify(current) !== savedRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [current]);

  if (loading) return <PageLoader label="Opening your studio" />;

  if (error || !loaded || !current) {
    return (
      <div className="dash-shell grid min-h-svh place-items-center px-6 text-center">
        <div>
          <h1 className="display text-[2rem] text-ink">We could not open this invitation</h1>
          <p className="mt-3 text-sm text-muted">{error ?? 'Please return to the dashboard and try again.'}</p>
          <Link to="/dashboard" className={buttonClass('primary', 'md', 'mt-6')}>
            <ArrowLeft size={13} /> Back to the dashboard
          </Link>
        </div>
      </div>
    );
  }

  const invitation = loaded.invitation;
  const panelProps: PanelProps = {
    invitation,
    data: current.data,
    templateId: current.templateId,
    update,
    updateSettings,
    setTemplateId,
    goto: (next) => setTab(next as TabId),
  };

  const panel = (() => {
    switch (tab) {
      case 'design':
        return <DesignPanel {...panelProps} />;
      case 'content':
        return <ContentPanel {...panelProps} />;
      case 'story':
        return <StoryPanel {...panelProps} />;
      case 'events':
        return <EventsPanel {...panelProps} />;
      case 'gallery':
        return <GalleryPanel {...panelProps} />;
      case 'sections':
        return <SectionsPanel {...panelProps} />;
      case 'music':
        return <MusicPanel {...panelProps} />;
      case 'rsvp':
        return <RsvpPanel {...panelProps} />;
      case 'guests':
        return <GuestsPanel {...panelProps} />;
      case 'publish':
        return <PublishPanel {...panelProps} />;
      default:
        return null;
    }
  })();

  const openFullPreview = async () => {
    const ok = await save();
    if (ok) window.open(`/preview/${id}`, '_blank', 'noopener');
    else push('Please fix the save error before opening the preview.', 'error');
  };

  return (
    <div className="min-h-svh bg-[#f3ede2]">
      <header className="sticky top-0 z-40 border-b border-line bg-[#f8f3e9]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[100rem] items-center justify-between gap-3 px-3 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              to="/dashboard"
              className="icon-btn !h-8 !w-8 flex-none"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="min-w-0">
              <p className="truncate font-display text-[1.1rem] leading-tight text-ink">
                {current.data.coupleA} &amp; {current.data.coupleB}
              </p>
              <p className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-muted">
                {saveState === 'saving' ? (
                  <>
                    <Loader2 size={9} className="animate-spin" /> Saving
                  </>
                ) : saveState === 'error' ? (
                  <>
                    <CloudOff size={9} className="text-[#a84632]" /> Save failed
                  </>
                ) : saveState === 'saved' ? (
                  <>
                    <Check size={9} className="text-[#5c7a4f]" /> Saved
                  </>
                ) : (
                  <>Draft · autosaves as you write</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={history.undo}
              disabled={!history.canUndo}
              className="icon-btn !h-8 !w-8"
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={14} />
            </button>
            <button
              type="button"
              onClick={history.redo}
              disabled={!history.canRedo}
              className="icon-btn !h-8 !w-8"
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => void save()}
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] transition sm:inline-flex ${
                saveState === 'error'
                  ? 'border-[#a84632]/40 text-[#8f3c2b]'
                  : 'border-line text-muted hover:border-gold/60 hover:text-ink'
              }`}
              disabled={saveState === 'saving'}
            >
              {saveState === 'saving' ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
              Save
            </button>
            <button
              type="button"
              onClick={() => setMobilePreview(true)}
              className={`${buttonClass('outline', 'sm')} xl:hidden`}
            >
              <Eye size={13} /> Preview
            </button>
            <button
              type="button"
              onClick={() => void openFullPreview()}
              className={`${buttonClass('outline', 'sm')} hidden lg:inline-flex`}
            >
              <ExternalLink size={13} /> Guest view
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await save();
                if (!ok) return;
                setTab('publish');
              }}
              className={buttonClass('primary', 'sm')}
            >
              {status === 'published' ? 'Share' : 'Publish'}
            </button>
          </div>
        </div>
        {saveError && (
          <div className="bg-[#8f3c2b]/10 px-4 py-1.5 text-center text-[0.7rem] text-[#8f3c2b]" role="alert">
            {saveError} Your changes are kept in this browser — try saving again.
          </div>
        )}
        <div className="mx-auto flex w-full max-w-[100rem] gap-1 overflow-x-auto px-3 pb-2 no-scrollbar sm:px-5">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex flex-none items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.66rem] font-medium transition ${
                  tab === item.id ? 'bg-ink text-paper' : 'text-muted hover:bg-ink/5 hover:text-ink'
                }`}
                aria-current={tab === item.id ? 'page' : undefined}
              >
                <Icon size={12} />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[100rem] gap-6 px-3 py-5 sm:px-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <main className="min-w-0">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">{TABS.find((item) => item.id === tab)?.label}</p>
                <p className="mt-1 text-[0.72rem] text-muted">Every change is reflected in the preview.</p>
              </div>
              <span className="hidden text-[0.62rem] uppercase tracking-[0.12em] text-muted sm:block">
                {status === 'published' ? 'Live' : 'Not published'}
              </span>
            </div>
            <div className="rounded-2xl border border-line bg-[#fbf7ef] p-5 sm:p-6">{panel}</div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                className={buttonClass('ghost', 'sm')}
                onClick={() => {
                  const index = TABS.findIndex((item) => item.id === tab);
                  if (index > 0) setTab(TABS[index - 1].id);
                }}
                disabled={TABS.findIndex((item) => item.id === tab) === 0}
              >
                <ArrowLeft size={12} /> Previous
              </button>
              <button
                type="button"
                className={buttonClass('outline', 'sm')}
                onClick={() => {
                  const index = TABS.findIndex((item) => item.id === tab);
                  if (index < TABS.length - 1) setTab(TABS[index + 1].id);
                }}
                disabled={TABS.findIndex((item) => item.id === tab) === TABS.length - 1}
              >
                Next <ArrowLeft size={12} className="rotate-180" />
              </button>
            </div>
          </div>
        </main>

        <aside className="hidden xl:block">
          <div className="sticky top-[118px] h-[calc(100vh-136px)] overflow-hidden rounded-2xl border border-line shadow-sm">
            <PreviewFrame
              data={current.data}
              templateId={current.templateId}
              invitationId={id}
              mode={previewMode}
              onModeChange={setPreviewMode}
            />
          </div>
        </aside>
      </div>

      {mobilePreview && (
        <div className="fixed inset-0 z-[85] bg-[#f3ede2] xl:hidden">
          <PreviewFrame
            data={current.data}
            templateId={current.templateId}
            invitationId={id}
            mode={previewMode}
            onModeChange={setPreviewMode}
            onClose={() => setMobilePreview(false)}
          />
        </div>
      )}
    </div>
  );
}
