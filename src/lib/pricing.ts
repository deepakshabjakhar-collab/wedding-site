export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  summary: string;
  description: string;
  featured?: boolean;
  badge?: string;
  features: string[];
  note: string;
}

/** Edit prices here — every surface reads from this config. */
export const PRICING: PricingTier[] = [
  {
    id: 'invitation',
    name: 'The Invitation',
    price: 89,
    currency: 'GBP',
    summary: 'One day, one beautiful beginning.',
    description: 'Everything you need to send a wedding invitation people remember.',
    features: [
      'Any template, fully customised',
      'Unlimited guests & personalised links',
      'One wedding day with all ceremonies',
      'RSVP collection & CSV export',
      'Music, gallery & guest blessings',
      'Shared photo album with QR code',
    ],
    note: 'One-time payment · No subscription',
  },
  {
    id: 'celebration',
    name: 'The Celebration',
    price: 149,
    currency: 'GBP',
    summary: 'For weddings that last all weekend.',
    description: 'For multi-day celebrations with different guests at each ceremony.',
    featured: true,
    badge: 'Most chosen',
    features: [
      'Everything in The Invitation',
      'Multi-day schedules & guest groups',
      'Per-guest ceremony permissions',
      'Travel, stay & shuttle details',
      'Seating planner with drag & drop',
      'Priority studio support',
    ],
    note: 'One-time payment · No subscription',
  },
  {
    id: 'heirloom',
    name: 'The Heirloom',
    price: 249,
    currency: 'GBP',
    summary: 'A design made only for you.',
    description: 'A bespoke art direction, built with our studio from the first sketch.',
    features: [
      'Everything in The Celebration',
      'Bespoke template & illustration',
      'Custom monogram & envelope seal',
      'Personal design consultation',
      'Printed stationery file included',
      'Keepsake archive after the day',
    ],
    note: 'One-time payment · Limited commissions',
  },
];

export function getTier(id: string): PricingTier | undefined {
  return PRICING.find((tier) => tier.id === id);
}
