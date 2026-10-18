import { Link } from 'react-router-dom';
import { MarketingNav } from '@/components/marketing/MarketingNav';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { buttonClass } from '@/components/ui/Button';
import { TemplateMark } from '@/templates/art';

export function NotFound() {
  return (
    <div className="mkt-scope texture-paper flex min-h-svh flex-col">
      <MarketingNav />
      <main className="flex flex-1 items-center justify-center px-6 py-32">
        <div className="max-w-lg text-center">
          <TemplateMark templateId="heirloom" className="mx-auto h-10 w-32 text-gold" />
          <p className="eyebrow mt-6">Page not found</p>
          <h1 className="display mt-4 text-[2.6rem] leading-tight text-ink">
            This page has been
            <br />
            <em className="text-gold">folded away.</em>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            The link may be old, or the invitation may not be published yet. The collection, however,
            is right where you left it.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className={buttonClass('primary', 'md')}>
              Back to Vellum
            </Link>
            <Link to="/templates" className={buttonClass('outline', 'md')}>
              Browse the collection
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
