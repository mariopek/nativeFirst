/**
 * Brand color extraction from a user-uploaded screenshot.
 *
 * Samples a downscaled version of the image, buckets pixels into a 4×4×4
 * RGB grid, picks the most populated buckets that aren't near-white or
 * near-black, and returns up to N representative colors.
 *
 * Fast (<50ms even on big screenshots) and good enough for "give me 3
 * brand-aware background gradient suggestions."
 */

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  populationPct: number;
}

const SAMPLE_SIZE = 100; // downscale to 100×100 for speed

/**
 * Extract dominant colors from an image URL.
 * Returns up to `count` representative colors, sorted by frequency.
 */
export async function extractDominantColors(
  imageUrl: string,
  count = 5
): Promise<ExtractedColor[]> {
  const img = await loadImage(imageUrl);

  // Downscale to a tiny canvas for fast pixel sampling
  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  const data = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;

  // Bucket pixels into a coarse 4×4×4 RGB grid (64 total buckets)
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  const bucketStep = 64; // 256 / 4
  let totalSampled = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 200) continue; // skip transparent
    // Skip near-white and near-black — they're rarely useful as brand colors
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max > 245 && min > 245) continue; // near white
    if (max < 20) continue; // near black
    // Skip very desaturated greys
    if (max - min < 12) continue;

    const br = Math.floor(r / bucketStep);
    const bg = Math.floor(g / bucketStep);
    const bb = Math.floor(b / bucketStep);
    const key = `${br},${bg},${bb}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.r += r;
      existing.g += g;
      existing.b += b;
      existing.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
    totalSampled += 1;
  }

  if (totalSampled === 0) return [];

  // Average each bucket and sort by frequency
  const sorted = [...buckets.values()]
    .map((b) => ({
      r: Math.round(b.r / b.count),
      g: Math.round(b.g / b.count),
      b: Math.round(b.b / b.count),
      count: b.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, count);

  return sorted.map((c) => ({
    hex: rgbToHex(c.r, c.g, c.b),
    rgb: { r: c.r, g: c.g, b: c.b },
    populationPct: (c.count / totalSampled) * 100,
  }));
}

/**
 * Build 3 background gradient suggestions from extracted brand colors.
 * Each suggestion uses a different combination strategy.
 */
export interface GradientSuggestion {
  id: string;
  name: string;
  colors: string[];
  angleDeg: number;
}

export function suggestBackgrounds(colors: ExtractedColor[]): GradientSuggestion[] {
  if (colors.length === 0) return [];

  const primary = colors[0]?.hex;
  const secondary = colors[1]?.hex || primary;
  const tertiary = colors[2]?.hex || secondary;

  const suggestions: GradientSuggestion[] = [];

  // 1. Dark moody — primary dimmed
  suggestions.push({
    id: 'dark-moody',
    name: 'Dark Moody',
    colors: [darken(primary, 0.7), darken(primary, 0.85)],
    angleDeg: 180,
  });

  // 2. Vibrant duo — primary + secondary
  suggestions.push({
    id: 'vibrant-duo',
    name: 'Vibrant Duo',
    colors: [lighten(primary, 0.1), darken(secondary, 0.3)],
    angleDeg: 135,
  });

  // 3. Soft cream — pastel of primary
  suggestions.push({
    id: 'soft-cream',
    name: 'Soft Cream',
    colors: [pastel(primary), pastel(tertiary)],
    angleDeg: 180,
  });

  return suggestions;
}

// ── Helpers ───────────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for color extraction.'));
    img.src = url;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const f = 1 - amount;
  return rgbToHex(Math.round(r * f), Math.round(g * f), Math.round(b * f));
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  return rgbToHex(
    Math.min(255, Math.round(r + (255 - r) * amount)),
    Math.min(255, Math.round(g + (255 - g) * amount)),
    Math.min(255, Math.round(b + (255 - b) * amount))
  );
}

function pastel(hex: string): string {
  // Mix with white at 70% — yields a pastel version
  return lighten(hex, 0.7);
}
