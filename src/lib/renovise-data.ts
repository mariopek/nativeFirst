// Renovise Pricing Data & Calculation Engine
// Port of iOS PriceData.json + PriceEngine.swift
// Sources: Angi 2025, HomeGuide 2025, NerdWallet 2025/2026, JLC 2025 Cost vs. Value

// ─── Types ───────────────────────────────────────────────────────────────

export type RoomKey = 'bathroom' | 'kitchen' | 'living' | 'bedroom' | 'basement' | 'outdoor' | 'garage' | 'whole';
export type ScopeKey = 'cosmetic' | 'midrange' | 'full' | 'luxury';

interface CostRange {
  lo: number;
  mid: number;
  hi: number;
}

interface SizePreset {
  sqft: number;
  label: string;
}

interface BreakdownItem {
  pct: number;
  note: string;
}

interface Room {
  displayName: string;
  icon: string;
  defaultSizes: Record<'S' | 'M' | 'L' | 'XL', SizePreset>;
  baseCostPerSqFt: Record<ScopeKey, CostRange>;
  typicalTotalRange: Record<ScopeKey, { lo: number; hi: number }>;
  costBreakdown: Record<string, BreakdownItem>;
  roi: Record<ScopeKey, { pct: number; source: string }>;
  timelineWeeks: Record<ScopeKey, { lo: number; hi: number }>;
  tips: string[];
}

interface Scope {
  displayName: string;
  description: string;
  icon: string;
  characteristics: string[];
}

export interface RegionInfo {
  name: string;
  state: string;
  multiplier: number;
  tier: string;
}

export interface EstimateTier {
  lo: number;
  hi: number;
  center: number;
}

export interface EstimateResult {
  room: RoomKey;
  scope: ScopeKey;
  sqft: number;
  region: RegionInfo | null;
  budget: EstimateTier;
  midRange: EstimateTier;
  premium: EstimateTier;
  breakdown: { label: string; pct: number; note: string }[];
  roi: { pct: number; source: string };
  timeline: { lo: number; hi: number };
  tips: string[];
  typicalRange: { lo: number; hi: number };
}

// ─── Room Data ───────────────────────────────────────────────────────────

export const ROOMS: Record<RoomKey, Room> = {
  bathroom: {
    displayName: 'Bathroom',
    icon: '\u{1F6C1}',
    defaultSizes: {
      S: { sqft: 40, label: 'Half Bath' },
      M: { sqft: 80, label: 'Guest Bath' },
      L: { sqft: 120, label: 'Primary Bath' },
      XL: { sqft: 180, label: 'Master Suite' },
    },
    baseCostPerSqFt: {
      cosmetic: { lo: 70, mid: 100, hi: 130 },
      midrange: { lo: 140, mid: 190, hi: 250 },
      full: { lo: 250, mid: 325, hi: 400 },
      luxury: { lo: 400, mid: 550, hi: 700 },
    },
    typicalTotalRange: {
      cosmetic: { lo: 3000, hi: 10000 },
      midrange: { lo: 10000, hi: 25000 },
      full: { lo: 25000, hi: 50000 },
      luxury: { lo: 50000, hi: 100000 },
    },
    costBreakdown: {
      Labor: { pct: 45, note: 'Plumbing-heavy, 40-65% of total' },
      Materials: { pct: 22, note: 'Tile, fixtures, vanity materials' },
      Fixtures: { pct: 18, note: 'Toilet, shower, tub, faucets' },
      Demolition: { pct: 6, note: '$1,000-$2,300 typical' },
      Permits: { pct: 3, note: '$100-$1,500 depending on scope' },
      Contingency: { pct: 6, note: 'Water damage, mold, pipe issues' },
    },
    roi: {
      cosmetic: { pct: 70, source: 'JLC 2025 Cost vs Value' },
      midrange: { pct: 80, source: 'JLC 2025 Cost vs Value' },
      full: { pct: 65, source: 'Remodeling 2025 Report' },
      luxury: { pct: 55, source: 'Industry average' },
    },
    timelineWeeks: {
      cosmetic: { lo: 1, hi: 2 },
      midrange: { lo: 3, hi: 5 },
      full: { lo: 5, hi: 8 },
      luxury: { lo: 8, hi: 14 },
    },
    tips: [
      '53% of homeowners planned a bathroom remodel in 2025',
      'Plumbing is the biggest hidden cost — average $5,545',
      'Keeping the same layout saves $5,000+ in plumbing relocation',
      'Mid-range remodels recoup up to 80% at resale',
    ],
  },

  kitchen: {
    displayName: 'Kitchen',
    icon: '\u{1F373}',
    defaultSizes: {
      S: { sqft: 80, label: 'Galley' },
      M: { sqft: 150, label: 'Standard' },
      L: { sqft: 250, label: 'Large' },
      XL: { sqft: 400, label: 'Open Concept' },
    },
    baseCostPerSqFt: {
      cosmetic: { lo: 60, mid: 100, hi: 150 },
      midrange: { lo: 150, mid: 200, hi: 250 },
      full: { lo: 250, mid: 300, hi: 350 },
      luxury: { lo: 350, mid: 450, hi: 600 },
    },
    typicalTotalRange: {
      cosmetic: { lo: 5000, hi: 20000 },
      midrange: { lo: 25000, hi: 50000 },
      full: { lo: 50000, hi: 80000 },
      luxury: { lo: 80000, hi: 150000 },
    },
    costBreakdown: {
      Labor: { pct: 33, note: '30-35% typical for kitchens' },
      Cabinets: { pct: 28, note: '$100-$1,500 per linear foot' },
      Countertops: { pct: 11, note: '$15-$190 per sqft' },
      Appliances: { pct: 15, note: '$2,100-$5,400 for 4-piece' },
      Flooring: { pct: 5, note: '$23-$50 per sqft installed' },
      Permits: { pct: 3, note: '$2,300-$5,750 for plumbing' },
      Contingency: { pct: 5, note: '10-15% recommended buffer' },
    },
    roi: {
      cosmetic: { pct: 113, source: '2025 Cost vs Value — minor kitchen' },
      midrange: { pct: 75, source: 'NAR Remodeling Impact Report' },
      full: { pct: 56, source: '2025 Cost vs Value — major midrange' },
      luxury: { pct: 36, source: '2025 Cost vs Value — major upscale' },
    },
    timelineWeeks: {
      cosmetic: { lo: 1, hi: 3 },
      midrange: { lo: 3, hi: 5 },
      full: { lo: 5, hi: 10 },
      luxury: { lo: 8, hi: 16 },
    },
    tips: [
      'Minor kitchen remodels deliver 113% ROI — best of any room',
      'Cabinets account for 28% of total cost — refacing saves 50%+',
      'Keeping the same layout avoids $5,000+ in plumbing & electrical',
      'A 10x10 kitchen (100 sqft) costs $15K-$25K mid-range',
    ],
  },

  living: {
    displayName: 'Living Room',
    icon: '\u{1F6CB}\u{FE0F}',
    defaultSizes: {
      S: { sqft: 130, label: 'Compact' },
      M: { sqft: 250, label: 'Standard' },
      L: { sqft: 400, label: 'Large' },
      XL: { sqft: 600, label: 'Great Room' },
    },
    baseCostPerSqFt: {
      cosmetic: { lo: 8, mid: 18, hi: 30 },
      midrange: { lo: 30, mid: 55, hi: 85 },
      full: { lo: 85, mid: 120, hi: 160 },
      luxury: { lo: 160, mid: 230, hi: 320 },
    },
    typicalTotalRange: {
      cosmetic: { lo: 1000, hi: 5000 },
      midrange: { lo: 5000, hi: 15000 },
      full: { lo: 15000, hi: 30000 },
      luxury: { lo: 30000, hi: 60000 },
    },
    costBreakdown: {
      Labor: { pct: 35, note: '30-50% of total' },
      Flooring: { pct: 25, note: '$3-$20/sqft material + install' },
      Paint: { pct: 10, note: '$2-$6 per sqft' },
      Lighting: { pct: 10, note: '$150-$900 per fixture' },
      Furniture: { pct: 10, note: 'Optional: $1,000-$7,000' },
      Windows: { pct: 5, note: '$400-$3,000 per window' },
      Contingency: { pct: 5, note: '' },
    },
    roi: {
      cosmetic: { pct: 60, source: 'Industry estimate' },
      midrange: { pct: 55, source: 'Industry estimate' },
      full: { pct: 50, source: 'Industry estimate' },
      luxury: { pct: 40, source: 'Industry estimate' },
    },
    timelineWeeks: {
      cosmetic: { lo: 0.5, hi: 1 },
      midrange: { lo: 1, hi: 3 },
      full: { lo: 2, hi: 5 },
      luxury: { lo: 4, hi: 8 },
    },
    tips: [
      'Living rooms cost less per sqft than kitchens or bathrooms',
      'Paint alone transforms a room for $2-$6 per sqft',
      'Built-in shelving adds both function and resale value',
      'Flooring is typically the biggest single expense',
    ],
  },

  bedroom: {
    displayName: 'Bedroom',
    icon: '\u{1F6CF}\u{FE0F}',
    defaultSizes: {
      S: { sqft: 100, label: 'Kids Room' },
      M: { sqft: 200, label: 'Guest Room' },
      L: { sqft: 300, label: 'Primary' },
      XL: { sqft: 450, label: 'Master Suite' },
    },
    baseCostPerSqFt: {
      cosmetic: { lo: 8, mid: 15, hi: 25 },
      midrange: { lo: 25, mid: 45, hi: 70 },
      full: { lo: 70, mid: 100, hi: 140 },
      luxury: { lo: 140, mid: 200, hi: 300 },
    },
    typicalTotalRange: {
      cosmetic: { lo: 1000, hi: 5000 },
      midrange: { lo: 5000, hi: 15000 },
      full: { lo: 15000, hi: 35000 },
      luxury: { lo: 35000, hi: 80000 },
    },
    costBreakdown: {
      Labor: { pct: 35, note: '' },
      Flooring: { pct: 25, note: 'Carpet $3-$12/sqft, hardwood $6-$20' },
      Paint: { pct: 10, note: '' },
      Closet: { pct: 12, note: 'Custom $1,000-$8,000' },
      Lighting: { pct: 8, note: 'Ceiling fan $150-$500' },
      Windows: { pct: 5, note: '' },
      Contingency: { pct: 5, note: '' },
    },
    roi: {
      cosmetic: { pct: 55, source: 'Industry estimate' },
      midrange: { pct: 50, source: 'Industry estimate' },
      full: { pct: 45, source: 'Industry estimate' },
      luxury: { pct: 35, source: 'Industry estimate' },
    },
    timelineWeeks: {
      cosmetic: { lo: 0.5, hi: 1 },
      midrange: { lo: 1, hi: 2 },
      full: { lo: 2, hi: 4 },
      luxury: { lo: 4, hi: 8 },
    },
    tips: [
      'Bedroom renovations cost $1,500-$5,500 for basic updates',
      'Custom closets add $1,000-$8,000 but boost resale appeal',
      'Master suite additions are the most expensive at $150K+',
      'Paint + flooring + lighting gives the most bang for the buck',
    ],
  },

  basement: {
    displayName: 'Basement',
    icon: '\u{2B07}\u{FE0F}',
    defaultSizes: {
      S: { sqft: 300, label: 'Small' },
      M: { sqft: 600, label: 'Medium' },
      L: { sqft: 1000, label: 'Large' },
      XL: { sqft: 1500, label: 'Full' },
    },
    baseCostPerSqFt: {
      cosmetic: { lo: 7, mid: 15, hi: 23 },
      midrange: { lo: 30, mid: 50, hi: 75 },
      full: { lo: 75, mid: 95, hi: 120 },
      luxury: { lo: 120, mid: 175, hi: 250 },
    },
    typicalTotalRange: {
      cosmetic: { lo: 3500, hi: 12000 },
      midrange: { lo: 12000, hi: 35000 },
      full: { lo: 35000, hi: 65000 },
      luxury: { lo: 65000, hi: 150000 },
    },
    costBreakdown: {
      Labor: { pct: 45, note: '60-70% for complex builds' },
      Materials: { pct: 20, note: 'Drywall, framing, insulation' },
      Flooring: { pct: 10, note: 'Vinyl preferred for moisture' },
      Electrical: { pct: 8, note: 'GFCI required by code' },
      Waterproofing: { pct: 7, note: '$5-$10/sqft — critical' },
      Permits: { pct: 4, note: 'Egress window code compliance' },
      Contingency: { pct: 6, note: 'Foundation, mold, asbestos' },
    },
    roi: {
      cosmetic: { pct: 72, source: 'Redfin 2022 + 2025 update' },
      midrange: { pct: 70, source: 'Industry average' },
      full: { pct: 65, source: 'Industry average' },
      luxury: { pct: 50, source: 'Industry average' },
    },
    timelineWeeks: {
      cosmetic: { lo: 1, hi: 2 },
      midrange: { lo: 3, hi: 6 },
      full: { lo: 6, hi: 10 },
      luxury: { lo: 10, hi: 16 },
    },
    tips: [
      'Basement remodeling averages $22,800 nationally in 2025',
      'Waterproofing is non-negotiable — $5-$10/sqft prevents thousands in damage',
      'Egress windows required for bedrooms — $2,700-$5,900 each',
      'Finished basements add $70-$100/sqft to home value',
    ],
  },

  outdoor: {
    displayName: 'Outdoor / Patio',
    icon: '\u{1F33F}',
    defaultSizes: {
      S: { sqft: 100, label: 'Small Patio' },
      M: { sqft: 300, label: 'Standard Deck' },
      L: { sqft: 500, label: 'Large Deck' },
      XL: { sqft: 800, label: 'Full Outdoor' },
    },
    baseCostPerSqFt: {
      cosmetic: { lo: 10, mid: 20, hi: 35 },
      midrange: { lo: 35, mid: 55, hi: 75 },
      full: { lo: 75, mid: 110, hi: 150 },
      luxury: { lo: 150, mid: 225, hi: 350 },
    },
    typicalTotalRange: {
      cosmetic: { lo: 2000, hi: 8000 },
      midrange: { lo: 8000, hi: 25000 },
      full: { lo: 25000, hi: 50000 },
      luxury: { lo: 50000, hi: 100000 },
    },
    costBreakdown: {
      Labor: { pct: 40, note: '' },
      Materials: { pct: 30, note: 'Decking, stone, pavers' },
      Landscaping: { pct: 15, note: '' },
      Electrical: { pct: 5, note: 'Outdoor lighting' },
      Permits: { pct: 4, note: '' },
      Contingency: { pct: 6, note: '' },
    },
    roi: {
      cosmetic: { pct: 70, source: 'NAR' },
      midrange: { pct: 65, source: 'NAR' },
      full: { pct: 55, source: 'Industry estimate' },
      luxury: { pct: 45, source: 'Industry estimate' },
    },
    timelineWeeks: {
      cosmetic: { lo: 0.5, hi: 1 },
      midrange: { lo: 1, hi: 3 },
      full: { lo: 3, hi: 6 },
      luxury: { lo: 6, hi: 12 },
    },
    tips: [
      'Wood deck costs $15-$35/sqft, composite $25-$60/sqft',
      'Outdoor kitchens range from $5,000 to $40,000+',
      'Deck/patio additions return 65-75% at resale',
      'Permits required for most structural outdoor work',
    ],
  },

  garage: {
    displayName: 'Garage',
    icon: '\u{1F697}',
    defaultSizes: {
      S: { sqft: 200, label: '1-Car' },
      M: { sqft: 400, label: '2-Car' },
      L: { sqft: 600, label: '2-Car+' },
      XL: { sqft: 800, label: '3-Car / Workshop' },
    },
    baseCostPerSqFt: {
      cosmetic: { lo: 5, mid: 12, hi: 20 },
      midrange: { lo: 20, mid: 35, hi: 50 },
      full: { lo: 50, mid: 75, hi: 105 },
      luxury: { lo: 105, mid: 150, hi: 200 },
    },
    typicalTotalRange: {
      cosmetic: { lo: 1500, hi: 5000 },
      midrange: { lo: 5000, hi: 20000 },
      full: { lo: 20000, hi: 50000 },
      luxury: { lo: 50000, hi: 100000 },
    },
    costBreakdown: {
      Labor: { pct: 35, note: '' },
      Materials: { pct: 30, note: 'Epoxy, drywall, insulation' },
      Doors: { pct: 15, note: 'Garage door $750-$3,500' },
      Electrical: { pct: 10, note: '' },
      Permits: { pct: 4, note: '' },
      Contingency: { pct: 6, note: '' },
    },
    roi: {
      cosmetic: { pct: 55, source: 'Industry estimate' },
      midrange: { pct: 50, source: 'Industry estimate' },
      full: { pct: 45, source: 'Industry estimate' },
      luxury: { pct: 35, source: 'Industry estimate' },
    },
    timelineWeeks: {
      cosmetic: { lo: 0.5, hi: 1 },
      midrange: { lo: 1, hi: 2 },
      full: { lo: 2, hi: 5 },
      luxury: { lo: 4, hi: 8 },
    },
    tips: [
      'Epoxy floor coating costs $3-$12/sqft — huge visual impact',
      'Garage door replacement is one of highest-ROI projects (over 100%)',
      'Converting to living space requires permits and HVAC',
      'Insulation + drywall turns garage into usable workspace',
    ],
  },

  whole: {
    displayName: 'Whole House',
    icon: '\u{1F3E0}',
    defaultSizes: {
      S: { sqft: 800, label: 'Small Home' },
      M: { sqft: 1500, label: 'Average' },
      L: { sqft: 2500, label: 'Large' },
      XL: { sqft: 4000, label: 'Estate' },
    },
    baseCostPerSqFt: {
      cosmetic: { lo: 15, mid: 35, hi: 60 },
      midrange: { lo: 60, mid: 100, hi: 150 },
      full: { lo: 100, mid: 150, hi: 200 },
      luxury: { lo: 200, mid: 350, hi: 500 },
    },
    typicalTotalRange: {
      cosmetic: { lo: 10000, hi: 50000 },
      midrange: { lo: 50000, hi: 150000 },
      full: { lo: 100000, hi: 300000 },
      luxury: { lo: 200000, hi: 600000 },
    },
    costBreakdown: {
      Labor: { pct: 35, note: '' },
      Kitchen: { pct: 20, note: 'Most expensive single room' },
      Bathrooms: { pct: 15, note: '' },
      Flooring: { pct: 10, note: '' },
      Paint: { pct: 5, note: '' },
      Electrical: { pct: 5, note: '' },
      Permits: { pct: 4, note: '' },
      Contingency: { pct: 6, note: '10-20% recommended' },
    },
    roi: {
      cosmetic: { pct: 65, source: 'Industry average' },
      midrange: { pct: 60, source: 'Industry average' },
      full: { pct: 55, source: 'Industry average' },
      luxury: { pct: 40, source: 'Industry average' },
    },
    timelineWeeks: {
      cosmetic: { lo: 2, hi: 4 },
      midrange: { lo: 6, hi: 12 },
      full: { lo: 12, hi: 24 },
      luxury: { lo: 20, hi: 40 },
    },
    tips: [
      'Whole house remodels cost $15-$60/sqft for standard updates',
      'A complete gut renovation runs $60-$150/sqft',
      'Americans spent $600B+ on home renovations in 2024',
      'Plan 10-20% contingency for older homes',
    ],
  },
};

// ─── Scope Data ──────────────────────────────────────────────────────────

export const SCOPES: Record<ScopeKey, Scope> = {
  cosmetic: {
    displayName: 'Cosmetic Refresh',
    description: 'Paint, fixtures, hardware, minor updates',
    icon: '\u{1F3A8}',
    characteristics: [
      'No structural changes',
      'Keep existing layout',
      'Surface-level improvements',
      'DIY-friendly',
      '1-3 week timeline',
    ],
  },
  midrange: {
    displayName: 'Mid-Range Update',
    description: 'New surfaces, upgraded fixtures, moderate changes',
    icon: '\u{1F527}',
    characteristics: [
      'Replace key fixtures and surfaces',
      'Improved materials',
      'Minor layout tweaks possible',
      'Professional recommended',
      '3-8 week timeline',
    ],
  },
  full: {
    displayName: 'Full Renovation',
    description: 'Gut and rebuild, new layout possible',
    icon: '\u{1F3D7}\u{FE0F}',
    characteristics: [
      'Complete teardown to studs',
      'Layout changes possible',
      'New plumbing and electrical',
      'Professional required',
      '6-16 week timeline',
    ],
  },
  luxury: {
    displayName: 'Luxury Remodel',
    description: 'Premium materials, custom design, high-end finishes',
    icon: '\u{2728}',
    characteristics: [
      'Custom cabinetry and millwork',
      'Premium imported materials',
      'Smart home integration',
      'Architect / designer involvement',
      '12-40 week timeline',
    ],
  },
};

// ─── Regional Data ───────────────────────────────────────────────────────

const ZIP_PREFIXES: Record<string, { name: string; state: string; multiplier: number; tier: string }> = {
  '100': { name: 'New York, NY', state: 'NY', multiplier: 1.45, tier: 'premium' },
  '101': { name: 'New York, NY', state: 'NY', multiplier: 1.45, tier: 'premium' },
  '102': { name: 'New York, NY', state: 'NY', multiplier: 1.40, tier: 'premium' },
  '103': { name: 'Staten Island, NY', state: 'NY', multiplier: 1.35, tier: 'high' },
  '104': { name: 'Bronx, NY', state: 'NY', multiplier: 1.40, tier: 'premium' },
  '110': { name: 'Queens, NY', state: 'NY', multiplier: 1.38, tier: 'high' },
  '111': { name: 'Long Island, NY', state: 'NY', multiplier: 1.35, tier: 'high' },
  '112': { name: 'Brooklyn, NY', state: 'NY', multiplier: 1.42, tier: 'premium' },
  '900': { name: 'Los Angeles, CA', state: 'CA', multiplier: 1.38, tier: 'high' },
  '901': { name: 'Los Angeles, CA', state: 'CA', multiplier: 1.38, tier: 'high' },
  '902': { name: 'Beverly Hills, CA', state: 'CA', multiplier: 1.50, tier: 'premium' },
  '906': { name: 'Pasadena, CA', state: 'CA', multiplier: 1.35, tier: 'high' },
  '908': { name: 'Long Beach, CA', state: 'CA', multiplier: 1.32, tier: 'high' },
  '910': { name: 'Pasadena, CA', state: 'CA', multiplier: 1.35, tier: 'high' },
  '941': { name: 'San Francisco, CA', state: 'CA', multiplier: 1.52, tier: 'premium' },
  '940': { name: 'San Francisco, CA', state: 'CA', multiplier: 1.48, tier: 'premium' },
  '945': { name: 'Oakland, CA', state: 'CA', multiplier: 1.40, tier: 'premium' },
  '950': { name: 'San Jose, CA', state: 'CA', multiplier: 1.45, tier: 'premium' },
  '921': { name: 'San Diego, CA', state: 'CA', multiplier: 1.28, tier: 'high' },
  '958': { name: 'Sacramento, CA', state: 'CA', multiplier: 1.22, tier: 'above_avg' },
  '606': { name: 'Chicago, IL', state: 'IL', multiplier: 1.15, tier: 'above_avg' },
  '600': { name: 'Chicago Suburbs, IL', state: 'IL', multiplier: 1.12, tier: 'above_avg' },
  '770': { name: 'Houston, TX', state: 'TX', multiplier: 0.95, tier: 'below_avg' },
  '750': { name: 'Dallas, TX', state: 'TX', multiplier: 1.00, tier: 'average' },
  '752': { name: 'Dallas, TX', state: 'TX', multiplier: 1.00, tier: 'average' },
  '760': { name: 'Fort Worth, TX', state: 'TX', multiplier: 0.97, tier: 'average' },
  '787': { name: 'Austin, TX', state: 'TX', multiplier: 1.05, tier: 'average' },
  '782': { name: 'San Antonio, TX', state: 'TX', multiplier: 0.92, tier: 'below_avg' },
  '850': { name: 'Phoenix, AZ', state: 'AZ', multiplier: 0.92, tier: 'below_avg' },
  '852': { name: 'Mesa, AZ', state: 'AZ', multiplier: 0.90, tier: 'below_avg' },
  '853': { name: 'Scottsdale, AZ', state: 'AZ', multiplier: 0.95, tier: 'below_avg' },
  '303': { name: 'Atlanta, GA', state: 'GA', multiplier: 0.98, tier: 'average' },
  '300': { name: 'Atlanta Metro, GA', state: 'GA', multiplier: 0.95, tier: 'below_avg' },
  '981': { name: 'Seattle, WA', state: 'WA', multiplier: 1.32, tier: 'high' },
  '980': { name: 'Seattle Metro, WA', state: 'WA', multiplier: 1.28, tier: 'high' },
  '802': { name: 'Denver, CO', state: 'CO', multiplier: 1.08, tier: 'above_avg' },
  '800': { name: 'Denver Metro, CO', state: 'CO', multiplier: 1.05, tier: 'average' },
  '331': { name: 'Miami, FL', state: 'FL', multiplier: 1.18, tier: 'above_avg' },
  '330': { name: 'Miami Metro, FL', state: 'FL', multiplier: 1.15, tier: 'above_avg' },
  '327': { name: 'Orlando, FL', state: 'FL', multiplier: 1.05, tier: 'average' },
  '336': { name: 'Tampa, FL', state: 'FL', multiplier: 1.02, tier: 'average' },
  '337': { name: 'St. Petersburg, FL', state: 'FL', multiplier: 1.02, tier: 'average' },
  '020': { name: 'Boston, MA', state: 'MA', multiplier: 1.35, tier: 'high' },
  '021': { name: 'Boston, MA', state: 'MA', multiplier: 1.35, tier: 'high' },
  '191': { name: 'Philadelphia, PA', state: 'PA', multiplier: 1.12, tier: 'above_avg' },
  '200': { name: 'Washington, DC', state: 'DC', multiplier: 1.25, tier: 'high' },
  '201': { name: 'Washington, DC', state: 'DC', multiplier: 1.25, tier: 'high' },
  '220': { name: 'Northern Virginia', state: 'VA', multiplier: 1.22, tier: 'above_avg' },
  '481': { name: 'Detroit, MI', state: 'MI', multiplier: 0.88, tier: 'below_avg' },
  '551': { name: 'Minneapolis, MN', state: 'MN', multiplier: 1.05, tier: 'average' },
  '631': { name: 'St. Louis, MO', state: 'MO', multiplier: 0.92, tier: 'below_avg' },
  '462': { name: 'Indianapolis, IN', state: 'IN', multiplier: 0.88, tier: 'below_avg' },
  '441': { name: 'Cleveland, OH', state: 'OH', multiplier: 0.85, tier: 'low' },
  '432': { name: 'Columbus, OH', state: 'OH', multiplier: 0.90, tier: 'below_avg' },
  '152': { name: 'Pittsburgh, PA', state: 'PA', multiplier: 0.92, tier: 'below_avg' },
  '371': { name: 'Nashville, TN', state: 'TN', multiplier: 1.02, tier: 'average' },
  '282': { name: 'Charlotte, NC', state: 'NC', multiplier: 0.95, tier: 'below_avg' },
  '276': { name: 'Raleigh, NC', state: 'NC', multiplier: 0.98, tier: 'average' },
  '974': { name: 'Portland, OR', state: 'OR', multiplier: 1.20, tier: 'above_avg' },
  '891': { name: 'Las Vegas, NV', state: 'NV', multiplier: 1.02, tier: 'average' },
  '841': { name: 'Salt Lake City, UT', state: 'UT', multiplier: 1.00, tier: 'average' },
};

const STATE_FALLBACKS: Record<string, number> = {
  CA: 1.35, NY: 1.40, MA: 1.30, CT: 1.28, NJ: 1.25,
  WA: 1.25, OR: 1.18, CO: 1.05, IL: 1.10, DC: 1.25,
  VA: 1.08, MD: 1.12, FL: 1.08, HI: 1.55, AK: 1.45,
  PA: 1.05, MN: 1.02, WI: 0.95, MI: 0.88, OH: 0.88,
  IN: 0.88, MO: 0.92, KS: 0.88, NE: 0.90, IA: 0.85,
  TX: 0.97, GA: 0.95, NC: 0.95, SC: 0.90, TN: 0.95,
  AL: 0.85, MS: 0.82, AR: 0.82, LA: 0.88, KY: 0.85,
  AZ: 0.92, NV: 1.00, NM: 0.88, UT: 1.00, ID: 0.95,
  MT: 0.92, WY: 0.90, ND: 0.90, SD: 0.85, OK: 0.85,
  WV: 0.82, ME: 0.95, VT: 1.00, NH: 1.05, RI: 1.15,
  DE: 1.05,
};

// ZIP prefix to state mapping for fallback
const ZIP_TO_STATE: Record<string, string> = {
  '0': 'CT', '01': 'MA', '02': 'MA', '03': 'NH', '04': 'ME', '05': 'VT', '06': 'CT',
  '07': 'NJ', '08': 'NJ', '09': 'NY', '10': 'NY', '11': 'NY', '12': 'NY', '13': 'NY',
  '14': 'NY', '15': 'PA', '16': 'PA', '17': 'PA', '18': 'PA', '19': 'PA',
  '20': 'DC', '21': 'MD', '22': 'VA', '23': 'VA', '24': 'VA', '25': 'WV', '26': 'WV',
  '27': 'NC', '28': 'NC', '29': 'SC', '30': 'GA', '31': 'GA', '32': 'FL',
  '33': 'FL', '34': 'FL', '35': 'AL', '36': 'AL', '37': 'TN', '38': 'TN',
  '39': 'MS', '40': 'KY', '41': 'KY', '42': 'KY', '43': 'OH', '44': 'OH',
  '45': 'OH', '46': 'IN', '47': 'IN', '48': 'MI', '49': 'MI',
  '50': 'IA', '51': 'IA', '52': 'IA', '53': 'WI', '54': 'WI', '55': 'MN',
  '56': 'MN', '57': 'SD', '58': 'ND', '59': 'MT',
  '60': 'IL', '61': 'IL', '62': 'IL', '63': 'MO', '64': 'MO', '65': 'MO',
  '66': 'KS', '67': 'KS', '68': 'NE', '69': 'NE',
  '70': 'LA', '71': 'LA', '72': 'AR', '73': 'OK', '74': 'OK', '75': 'TX',
  '76': 'TX', '77': 'TX', '78': 'TX', '79': 'TX',
  '80': 'CO', '81': 'CO', '82': 'WY', '83': 'ID', '84': 'UT', '85': 'AZ',
  '86': 'AZ', '87': 'NM', '88': 'NM', '89': 'NV',
  '90': 'CA', '91': 'CA', '92': 'CA', '93': 'CA', '94': 'CA', '95': 'CA',
  '96': 'HI', '97': 'OR', '98': 'WA', '99': 'AK',
};

// ─── Region Resolution ───────────────────────────────────────────────────

export function resolveRegion(zip: string): RegionInfo | null {
  if (!zip || zip.length < 3) return null;

  const cleaned = zip.replace(/\D/g, '').slice(0, 5);
  if (cleaned.length < 3) return null;

  const prefix3 = cleaned.slice(0, 3);

  // Try exact 3-digit prefix match
  const exact = ZIP_PREFIXES[prefix3];
  if (exact) {
    return { name: exact.name, state: exact.state, multiplier: exact.multiplier, tier: exact.tier };
  }

  // Fall back to state by 2-digit prefix
  const prefix2 = cleaned.slice(0, 2);
  const state = ZIP_TO_STATE[prefix2];
  if (state && STATE_FALLBACKS[state]) {
    return { name: `${state} Average`, state, multiplier: STATE_FALLBACKS[state], tier: 'state_avg' };
  }

  return null;
}

// ─── Cost Calculation ────────────────────────────────────────────────────

export function calculateEstimate(
  roomKey: RoomKey,
  scopeKey: ScopeKey,
  sqft: number,
  zip?: string,
): EstimateResult {
  const room = ROOMS[roomKey];
  const costs = room.baseCostPerSqFt[scopeKey];
  const region = zip ? resolveRegion(zip) : null;
  const multiplier = region?.multiplier ?? 1.0;

  const budgetCenter = costs.lo * sqft * multiplier;
  const midCenter = costs.mid * sqft * multiplier;
  const premiumCenter = costs.hi * sqft * multiplier;

  const makeRange = (center: number): EstimateTier => ({
    lo: Math.round(center * 0.88),
    hi: Math.round(center * 1.12),
    center: Math.round(center),
  });

  const breakdown = Object.entries(room.costBreakdown).map(([label, item]) => ({
    label,
    pct: item.pct,
    note: item.note,
  }));

  return {
    room: roomKey,
    scope: scopeKey,
    sqft,
    region,
    budget: makeRange(budgetCenter),
    midRange: makeRange(midCenter),
    premium: makeRange(premiumCenter),
    breakdown,
    roi: room.roi[scopeKey],
    timeline: room.timelineWeeks[scopeKey],
    tips: room.tips,
    typicalRange: room.typicalTotalRange[scopeKey],
  };
}

// ─── Formatting Helpers ──────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  return '$' + value.toString();
}

export function formatRange(lo: number, hi: number): string {
  return `${formatCurrency(lo)} - ${formatCurrency(hi)}`;
}

export function formatTimeline(weeks: { lo: number; hi: number }): string {
  if (weeks.lo < 1) return `${Math.round(weeks.lo * 7)}-${Math.round(weeks.hi * 7)} days`;
  if (weeks.lo === weeks.hi) return `${weeks.lo} weeks`;
  return `${weeks.lo}-${weeks.hi} weeks`;
}

export const ROOM_KEYS: RoomKey[] = ['bathroom', 'kitchen', 'living', 'bedroom', 'basement', 'outdoor', 'garage', 'whole'];
export const SCOPE_KEYS: ScopeKey[] = ['cosmetic', 'midrange', 'full', 'luxury'];
