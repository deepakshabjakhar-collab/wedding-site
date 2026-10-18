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
    <div className="relative">
      <InvitationExperience
        invitation={invitation}
        messages={[]}
        photos={[]}
        personalization={null}
        mode="sample"
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4">
        <div className="pointer-events-auto flex w-full max-w-[38rem] flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-[var(--color-paper)]/97 px-4 py-3 shadow-[0_24px_60px_-30px_rgba(40,28,16,0.6)] backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-line text-gold">
              <Sparkles size={15} />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-muted">
                Live design preview
              </span>
              <span className="block truncate font-display text-[1.15rem] leading-tight text-ink">
                {template.name} — {template.descriptor}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/templates" className={buttonClass('ghost', 'sm')}>
              <ArrowLeft size={12} /> All designs
            </Link>
            <button
              type="button"
              onClick={() => void useTemplate()}
              className={buttonClass('primary', 'sm')}
              disabled={creating}
            >
              {creating ? <Loader2 size={13} className="animate-spin" /> : null}
              Use this design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
