import { Link } from 'react-router-dom';
import type { TemplateDefinition } from '@/templates/types';
import { PhotoCover } from '@/templates/photoCover';

/**
 * The cover is the product: an art-directed photograph of the printed piece,
 * with the design's name and one line in its own hand. No names, no dates.
 */
export function TemplateCard({ template, cta }: { template: TemplateDefinition; cta: string }) {
  return (
    <Link
      to={`/templates/${template.id}`}
      className="template-card group relative block aspect-[3/4] overflow-hidden"
      aria-label={`Preview the ${template.name} design`}
    >
      <PhotoCover template={template} className="h-full w-full" showLabel={false} showTagline={false} inset="0%" />

      <span
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 -translate-x-[150%] skew-x-[-14deg] bg-white/20 blur-lg transition-transform duration-[1400ms] ease-out group-hover:translate-x-[300%]"
        aria-hidden="true"
      />

      <span className="absolute inset-x-0 bottom-[3.4%] z-20 flex justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-black/50 px-4 py-2 text-[0.52rem] font-medium uppercase tracking-[0.22em] text-white backdrop-blur-[3px]">
          {cta}
        </span>
      </span>
    </Link>
  );
}
