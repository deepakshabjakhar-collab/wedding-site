import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Misc';
import { PRICING } from '@/lib/pricing';

export function MarketingFooter() {
  return (
    <footer className="border-t border-line/70 bg-[#efe7d9]">
      <div className="shell py-14">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs font-display text-[1.35rem] leading-snug text-ink-soft">
              An invitation is the first thing your people touch. Make it worth keeping.
            </p>
            <a
              href="mailto:hello@vellum.studio"
              className="mt-5 inline-block border-b border-gold/50 text-sm text-ink-soft transition hover:border-gold hover:text-ink"
            >
              hello@vellum.studio
            </a>
          </div>
          <div>
            <p className="eyebrow mb-4">Explore</p>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <li><Link to="/templates" className="hover:text-gold">Templates</Link></li>
              <li><a href="/#arrival" className="hover:text-gold">The arrival</a></li>
              <li><a href="/#music" className="hover:text-gold">Music</a></li>
              <li><a href="/#pricing" className="hover:text-gold">Pricing</a></li>
              <li><a href="/#faq" className="hover:text-gold">Questions</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">The studio</p>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <li><Link to="/signup" className="hover:text-gold">Create an account</Link></li>
              <li><Link to="/login" className="hover:text-gold">Sign in</Link></li>
              <li><Link to="/dashboard" className="hover:text-gold">Your dashboard</Link></li>
              <li><Link to="/i/clara-julien" className="hover:text-gold">Open a live invitation</Link></li>
              <li><Link to="/i/rosalind-henry" className="hover:text-gold">A garden celebration</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-4">The collection</p>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              {PRICING.map((tier) => (
                <li key={tier.id} className="flex items-baseline justify-between gap-3">
                  <span>{tier.name}</span>
                  <span className="font-display text-base">£{tier.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              One-time payment. No subscriptions, no per-guest fees, no expiry.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line/70 pt-6 text-[0.68rem] tracking-wide text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Vellum Studio. Designed for the moment it arrives.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Photography via Unsplash</span>
            <span className="hidden h-1 w-1 rounded-full bg-line sm:block" />
            <span>Original recordings by The Vellum Ensemble</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
