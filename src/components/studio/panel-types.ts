import type { InvitationData, InvitationRecord, InvitationSettings } from '@shared/types';

export interface PanelProps {
  invitation: InvitationRecord;
  data: InvitationData;
  templateId: string;
  update: (partial: Partial<InvitationData>, coalesceKey?: string) => void;
  updateSettings: (partial: Partial<InvitationSettings>, coalesceKey?: string) => void;
  setTemplateId: (id: string) => void;
  goto: (tab: string) => void;
}
