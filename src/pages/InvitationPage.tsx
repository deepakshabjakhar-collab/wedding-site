import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Lock, MailQuestion } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { InvitationExperience } from '@/components/invitation/InvitationExperience';
import { buttonClass } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Misc';

function GuestShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh place-items-center bg-[#191410] px-5 py-16 text-center">
      <div className="w-full max-w-md">
        <Logo tone="light" />
        <div className="mt-10 rounded-2xl border border-white/10 bg-[#241d18] p-7 text-[#f3e8d7] shadow-2xl">
          {children}
        </div>
        <p className="mt-8 font-script text-[1.4rem] text-[#d9bb8c]/80">Invitations, remembered.</p>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="grid min-h-svh place-items-center bg-[#f6f1e7]">
      <div className="flex flex-col items-center gap-5">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-[#d8c9b5]">
          <span className="font-script text-[1.8rem] text-[#a9835b]">V</span>
        </span>
        <p className="eyebrow">Opening the envelope</p>
      </div>
    </div>
  );
}

export function InvitationPage() {
  const { slug = '', token: routeToken } = useParams();

  const storedToken = useMemo(() => {
    if (routeToken) return routeToken;
    try {
      return window.localStorage.getItem(`vellum:guest:${slug}`) ?? undefined;
    } catch {
      return undefined;
    }
  }, [routeToken, slug]);

  const { data, loading, error } = useAsync(
    () => api.public.get(slug, storedToken),
    [slug, storedToken],
  );

  useEffect(() => {
    const recipe = data?.invitation.data;
    if (!recipe) return;
    const names = `${recipe.coupleA} & ${recipe.coupleB}`;
    document.title = `${names} — a wedding invitation`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        `${names} invite you to ${recipe.location || 'their wedding'}. Open the invitation for the full schedule, music and RSVP.`,
      );
    }
  }, [data]);

  if (loading) return <Loading />;

  if (error) {
    const requiresToken = /private|personal link/i.test(error);
    const notFound = /not found/i.test(error);
    return (
      <GuestShell>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/15 text-[#d9bb8c]">
          {requiresToken ? <Lock size={18} /> : <MailQuestion size={18} />}
        </span>
        <h1 className="mt-5 font-display text-[1.9rem] leading-tight">
          {notFound ? 'This invitation could not be found' : requiresToken ? 'This invitation is private' : 'Something went wrong'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#cfc0ad]">
          {notFound
            ? 'The link may have changed, or the invitation has not been published yet. Ask the couple for a fresh link.'
            : requiresToken
              ? 'This celebration is unlisted. Please open the personal link you were sent — it knows who you are and which ceremonies you are invited to.'
              : error}
        </p>
        <div className="mt-7 flex flex-col gap-2.5">
          <Link to="/" className={buttonClass('gold', 'md')}>
            Visit Vellum
          </Link>
          <Link to="/templates" className={buttonClass('outline', 'md', '!border-white/20 !text-[#f3e8d7]')}>
            Browse the collection
          </Link>
        </div>
      </GuestShell>
    );
  }

  if (!data) return null;

  return (
    <InvitationExperience
      invitation={data.invitation}
      messages={data.messages}
      photos={data.photos}
      personalization={data.personalization}
      token={routeToken ?? storedToken}
      mode="live"
    />
  );
}
