import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import type { InvitationRecord } from '@shared/types';
import { InvitationExperience } from '@/components/invitation/InvitationExperience';
import { getTemplate } from '@/templates/registry';
import { sampleInvitation } from '@/templates/samples';
import { TEMPLATE_IDS } from '@shared/defaults';
import { buttonClass } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export function TemplatePreviewPage() {
  const { templateId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { push } = useToast();
  const [creating, setCreating] = useState(false);

  const valid = TEMPLATE_IDS.includes(templateId as never);
  const template = getTemplate(templateId);

  const invitation = useMemo<InvitationRecord>(() => {
    const data = sampleInvitation(template.id);
    return {
      id: `sample-${template.id}`,
      userId: 'sample',
      slug: `sample-${template.id}`,
      templateId: template.id,
      status: 'draft',
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [template.id]);

  if (!valid) return <Navigate to="/templates" replace />;

  const useTemplate = async () => {
    if (!user) {
      navigate(`/signup?next=/templates&design=${template.id}`);
      return;
    }
    setCreating(true);
    try {
      const { invitation: created } = await api.invitations.create(template.id);
      push(`${template.name} is yours. Let’s make it personal.`);
      navigate(`/studio/${created.id}`);
    } catch (error) {
      push(error instanceof ApiError ? error.message : 'Could not create the invitation.', 'error');
      setCreating(false);
    }
  };

  return (
    <div className="mkt-scope relative">
      <InvitationExperience
        invitation={invitation}
        messages={[]}
        photos={[]}
        personalization={null}
        mode="sample"
        bottomInset={72}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2">
        <div className="pointer-events-auto flex w-full max-w-[36rem] items-center justify-between gap-2 border border-line bg-[var(--color-paper)]/97 px-2.5 py-2 shadow-[0_20px_50px_-26px_rgba(40,28,16,0.55)] backdrop-blur sm:gap-3 sm:px-4 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-line text-gold">
              <Sparkles size={14} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-muted">
                Live design preview
              </span>
              <span className="block truncate font-display text-[1rem] leading-tight text-ink">
                {template.name}
                <span className="hidden sm:inline"> — {template.descriptor}</span>
              </span>
            </span>
          </div>
          <div className="flex flex-none items-center gap-1.5">
            <Link to="/templates" className={buttonClass('ghost', 'sm', '!px-2.5')} aria-label="All designs">
              <ArrowLeft size={12} /> <span className="hidden sm:inline">All designs</span>
            </Link>
            <button
              type="button"
              onClick={() => void useTemplate()}
              className={buttonClass('primary', 'sm', '!px-3')}
              disabled={creating}
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : null}
              <span className="hidden sm:inline">Use this design</span>
              <span className="sm:hidden">Use it</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
