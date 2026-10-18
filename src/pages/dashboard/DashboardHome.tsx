import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, LayoutTemplate, Plus, Sparkles, Users } from 'lucide-react';
import { api, ApiError, shareUrl } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { buttonClass } from '@/components/ui/Button';
import { EmptyState, Skeleton, StatusPill } from '@/components/ui/Misc';
import { formatDate } from '@/lib/format';
import { TEMPLATES } from '@/templates/registry';
import { TemplateArt } from '@/templates/art';

export default function DashboardHome() {
  const { user } = useAuth();
  const { push } = useToast();
  const { data, loading, error } = useAsync(() => api.invitations.list(), []);
  const [busy, setBusy] = useState<string | null>(null);

  const invitations = data?.invitations ?? [];

  const create = async (templateId: string) => {
    setBusy(templateId);
    try {
      const { invitation } = await api.invitations.create(templateId);
      push('Your studio is ready.');
      window.location.assign(`/studio/${invitation.id}`);
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not create the invitation.', 'error');
      setBusy(null);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="display mt-2 text-[2.3rem] leading-tight text-ink sm:text-[2.8rem]">
            {invitations.length ? 'Your invitations' : 'Welcome to the studio'}
          </h1>
          <p className="mt-2 max-w-xl text-[0.86rem] leading-relaxed text-muted">
            Signed in as {user?.email}. Design freely — publishing happens only when you decide it is
            ready.
          </p>
        </div>
        <Link to="/templates" className={buttonClass('primary', 'md')}>
          <Plus size={14} /> New invitation
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-[#b4553f]/30 bg-[#b4553f]/8 px-4 py-3 text-sm text-[#8f3c2b]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="panel p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-3 h-4 w-56" />
              <Skeleton className="mt-6 h-24 w-full" />
            </div>
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <div className="panel mt-8">
          <EmptyState
            icon={<LayoutTemplate size={20} />}
            eyebrow="Begin anywhere"
            title="No invitations yet"
            description="Choose one of eight design directions, then make it entirely yours. You can preview everything before paying a penny."
            action={
              <Link to="/templates" className={buttonClass('primary', 'md')}>
                Browse the collection
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {invitations.map((invitation) => {
            const attending = invitation.counts.attending;
            const total = Math.max(1, invitation.counts.guests);
            const percent = Math.round((attending / total) * 100);
            return (
              <article key={invitation.id} className="panel overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  <span
                    className="hidden h-16 w-16 flex-none place-items-center rounded-xl border border-line text-[0.7rem] uppercase tracking-[0.1em] sm:grid"
                    style={{
                      background: `linear-gradient(150deg, ${invitation.data.theme.palette?.bg ?? '#f6f1e7'}, ${invitation.data.theme.palette?.accentSoft ?? '#e9dcc9'})`,
                    }}
                  >
                    <span className="font-script text-[1.3rem] text-ink">
                      {invitation.data.monogram}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-[1.5rem] leading-tight text-ink">
                        {invitation.data.coupleA} &amp; {invitation.data.coupleB}
                      </h2>
                      <StatusPill status={invitation.status} />
                    </div>
                    <p className="mt-1 text-[0.78rem] text-muted">
                      {invitation.data.weddingDate ? formatDate(invitation.data.weddingDate) : 'Date to be set'}
                      {invitation.data.location ? ` · ${invitation.data.location}` : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px border-y border-line/70 bg-line/40 sm:grid-cols-4">
                  {[
                    ['Attending', invitation.counts.attending],
                    ['Awaiting', invitation.counts.pending],
                    ['Declined', invitation.counts.declined],
                    ['Guests', invitation.counts.guests],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="bg-[#fbf7ef] px-4 py-3">
                      <p className="font-display text-[1.5rem] leading-none text-ink">{value}</p>
                      <p className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-muted">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70">
                      <span
                        className="block h-full rounded-full bg-[#7f8d78] transition-[width] duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="text-[0.68rem] text-muted">{percent}% replied yes</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/studio/${invitation.id}`} className={buttonClass('primary', 'sm')}>
                      Open the studio
                    </Link>
                    <Link to={`/dashboard/i/${invitation.id}`} className={buttonClass('outline', 'sm')}>
                      <Users size={12} /> Replies &amp; guests
                    </Link>
                    <a
                      href={`/preview/${invitation.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClass('ghost', 'sm')}
                    >
                      <ExternalLink size={12} /> Guest view
                    </a>
                    <button
                      type="button"
                      className={buttonClass('ghost', 'sm')}
                      onClick={async () => {
                        const url = shareUrl(invitation.slug);
                        try {
                          await navigator.clipboard.writeText(url);
                          push('Invitation link copied.');
                        } catch {
                          push(url, 'info');
                        }
                      }}
                    >
                      <Copy size={12} /> Copy link
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Start something new</p>
            <h2 className="display mt-1.5 text-[1.7rem] text-ink">Pick a design direction</h2>
          </div>
          <Link to="/templates" className={buttonClass('ghost', 'sm')}>
            See the full collection
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.slice(0, 4).map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => void create(template.id)}
              className="group overflow-hidden rounded-xl border border-line bg-paper text-left transition hover:border-gold/60"
              disabled={busy === template.id}
            >
              <span
                className="relative block h-28 overflow-hidden"
                style={{ background: template.palette.deep }}
              >
                <TemplateArt
                  templateId={template.id}
                  className="absolute inset-0 h-full w-full text-[#d9b87b] opacity-70 transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3 text-center text-[0.8rem] text-[#fcf5e8]">
                  <span
                    className={template.cover.namesCase === 'upper' ? 'uppercase' : ''}
                    style={{ fontFamily: template.display, letterSpacing: template.cover.tracking }}
                  >
                    {template.name}
                  </span>
                </span>
              </span>
              <span className="flex items-center justify-between gap-2 px-3.5 py-3">
                <span>
                  <span className="block font-display text-[1.1rem] leading-tight text-ink">{template.name}</span>
                  <span className="block text-[0.66rem] text-muted">{template.descriptor}</span>
                </span>
                <Sparkles size={14} className="text-gold" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
