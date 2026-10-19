import { Link } from 'react-router-dom';
import type { TemplateDefinition } from '@/templates/types';
import { TemplateCover } from '@/templates/cover';
import { sampleInvitation } from '@/templates/samples';
import { formatDateShort } from '@/lib/format';

/**
 * A template shown as a finished piece of stationery — not a colour swatch.
 * Each card is the invitation's own cover: keylines, a crest, the names set in
 * the template's display face, wax seals, silk, drapes or gatefold doors.
 */
export function TemplateCard({ template, cta }: { template: TemplateDefinition; cta: string }) {
  const sample = sampleInvitation(template.id);
  return (
    <Link
      to={`/templates/${template.id}`}
      className="template-card group relative block aspect-[3/4] overflow-hidden"
      aria-label={`Preview the ${template.name} design`}
    >
      <TemplateCover
        template={template}
        coupleA={sample.coupleA}
        coupleB={sample.coupleB}
        monogram={sample.monogram}
        dateLabel={formatDateShort(sample.weddingDate)}
        locationLabel={sample.location.split(',')[0]}
        cta={cta}
      />
    </Link>
  );
}
