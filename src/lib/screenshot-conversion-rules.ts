/**
 * Real-time conversion guidance for App Store screenshot designs.
 *
 * Inspired by App Store Optimization best practices — first-3-screenshot rule,
 * thumbnail readability, contrast, etc. These checks are advisory; the user
 * can ignore any of them, but seeing them helps avoid rookie mistakes.
 */

import {
  getTheme,
  type SlideState,
  type ConversionCheckResult,
} from './app-store-screenshot-types';

export interface ConversionTip {
  id: string;
  status: ConversionCheckResult['status'];
  category: 'headline' | 'visual' | 'composition' | 'accessibility';
  title: string;
  message: string;
  fix?: string;
}

/**
 * Run all checks on a slide. Returns a list of tips (passes + warnings + fails).
 * Empty list means everything is great.
 */
export function runConversionChecks(slide: SlideState): ConversionTip[] {
  const tips: ConversionTip[] = [];
  const theme = getTheme(slide.themeId);

  // ── Headline length ────────────────────────────────────────────
  const headlineLength = slide.headline.trim().length;
  const wordsPerLine = slide.headline.split('\n').map((line) => line.trim().split(/\s+/).length);
  const maxLineWords = Math.max(...wordsPerLine);

  if (headlineLength === 0) {
    tips.push({
      id: 'headline-empty',
      status: 'fail',
      category: 'headline',
      title: 'Headline is empty',
      message: 'A blank screenshot does not sell anything.',
      fix: 'Write 3–5 words: an outcome, a moment, or a pain point you kill.',
    });
  } else if (headlineLength < 8) {
    tips.push({
      id: 'headline-too-short',
      status: 'warn',
      category: 'headline',
      title: 'Headline is very short',
      message: `${headlineLength} characters — risk of being too vague.`,
      fix: 'A 3–5 word phrase usually wins. "Save dinner" beats "Save".',
    });
  } else if (headlineLength > 60) {
    tips.push({
      id: 'headline-too-long',
      status: 'fail',
      category: 'headline',
      title: 'Headline is too long for App Store thumbnail',
      message: `${headlineLength} characters won't be readable at gallery thumbnail size (~140px wide).`,
      fix: 'Cut to 24–40 characters. The first 3 screenshots are 60% of the conversion decision; thumb-readable copy matters.',
    });
  } else if (maxLineWords > 6) {
    tips.push({
      id: 'headline-line-too-wide',
      status: 'warn',
      category: 'headline',
      title: 'Line has more than 6 words',
      message: `Longest line: ${maxLineWords} words. Wraps badly at thumbnail size.`,
      fix: 'Break with manual line breaks. 3–5 words per line reads in one second.',
    });
  } else {
    tips.push({
      id: 'headline-good',
      status: 'pass',
      category: 'headline',
      title: 'Headline length looks good',
      message: `${headlineLength} chars, ≤${maxLineWords} words per line — readable at thumbnail size.`,
    });
  }

  // ── "and" conjunction (joins two ideas into one weak headline) ──
  if (/\b(and|or)\b/i.test(slide.headline)) {
    tips.push({
      id: 'headline-conjunction',
      status: 'warn',
      category: 'headline',
      title: 'Headline joins two ideas with "and" / "or"',
      message: 'Each screenshot should sell ONE idea. Two ideas = neither lands.',
      fix: 'Pick the stronger idea. Move the second to its own slide.',
    });
  }

  // ── Screenshot present ────────────────────────────────────────
  if (!slide.screenshotUrl) {
    tips.push({
      id: 'screenshot-missing',
      status: 'fail',
      category: 'visual',
      title: 'No screenshot uploaded',
      message: 'Empty device frame — looks like a placeholder.',
      fix: 'Upload an actual screenshot from your app at iPhone resolution.',
    });
  } else {
    tips.push({
      id: 'screenshot-present',
      status: 'pass',
      category: 'visual',
      title: 'Screenshot uploaded',
    });
  }

  // ── Contrast (text vs background) ──────────────────────────────
  if (theme.background.kind === 'solid' || theme.background.kind === 'linearGradient') {
    const bgColor =
      theme.background.kind === 'solid' ? theme.background.color : theme.background.colors[0];
    const ratio = contrastRatio(theme.textColor, bgColor);
    if (ratio < 3) {
      tips.push({
        id: 'contrast-fail',
        status: 'fail',
        category: 'accessibility',
        title: 'Text contrast fails WCAG AA Large',
        message: `Contrast ratio: ${ratio.toFixed(2)}:1 (need 3:1 minimum for large text).`,
        fix: 'Pick a darker text or lighter background. Apple rejects unreadable screenshots in some markets.',
      });
    } else if (ratio < 4.5) {
      tips.push({
        id: 'contrast-warn',
        status: 'warn',
        category: 'accessibility',
        title: 'Contrast borderline for accessibility',
        message: `Contrast ratio: ${ratio.toFixed(2)}:1 — passes for large text but not body.`,
        fix: 'Lift contrast to 4.5:1+ for full WCAG AA compliance.',
      });
    } else {
      tips.push({
        id: 'contrast-pass',
        status: 'pass',
        category: 'accessibility',
        title: 'Contrast is strong',
        message: `${ratio.toFixed(2)}:1 — passes WCAG AA.`,
      });
    }
  }

  return tips;
}

// ── Color helpers ─────────────────────────────────────────────────

/**
 * WCAG-style relative luminance for a hex color.
 */
function relativeLuminance(hex: string): number {
  const c = parseHex(hex);
  if (!c) return 0;
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/**
 * WCAG contrast ratio between two hex colors.
 */
export function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([\da-f]{6}|[\da-f]{3})$/i);
  if (!m) return null;
  const h = m[1];
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
