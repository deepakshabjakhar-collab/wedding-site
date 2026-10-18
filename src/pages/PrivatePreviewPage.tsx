import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { api } from '@/lib/api';
import { useAsync } from '@/lib/useAsync';
import { InvitationExperience } from '@/components/invitation/InvitationExperience';
import { PageLoader } from '@/components/ui/Misc';
import { buttonClass } from '@/components/ui/Button';

export function PrivatePreviewPage() {
  const { id = '' } = useParams();
  const { data, loading, error } = useAsync(() => api.public.preview(id), [id]);

  useEffect(() => {
    if (data) {
      document.title = `Preview · ${data.invitation.data.coupleA} & ${data.invitation.data.coupleB}`;
    }
  }, [data]);

  if (loading) return <PageLoader label="Preparing your preview" />;

  if (error || !data) {
    return (
      <div className="mkt-scope grid min-h-svh place-items-center bg-[#f6f1e7] px-6 text-center">
        <div>
          <h1 className="display text-[2rem] text-ink">This preview is unavailable</h1>
          <p className="mt-3 text-sm text-muted">{error ?? 'Please sign in to preview your invitation.'}</p>
          <Link to="/dashboard" className={buttonClass('primary', 'md', 'mt-6')}>
            Back to the dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mkt-scope relative">
      <div className="fixed left-1/2 top-3 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#d8c9b5] bg-[#fffdf8]/95 px-3 py-2 shadow-lg backdrop-blur">
        <span className="flex items-center gap-1.5 pl-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          <Eye size={12} className="text-gold" /> Your invitation, exactly as guests see it
        </span>
        <Link to={`/studio/${id}`} className={buttonClass('primary', 'sm')}>
          <ArrowLeft size={12} /> Back to the studio
        </Link>
      </div>
      <InvitationExperience
        invitation={data.invitation}
        messages={data.messages}
        photos={data.photos}
        personalization={data.personalization}
        mode="preview"
        initialOpen
      />
    </div>
  );
}
