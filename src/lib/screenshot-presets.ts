/**
 * Pre-built slide presets — drop-in starting points the user can apply
 * with one click and then swap in their own copy + screenshot.
 *
 * Each preset is a `SlideState` factory: calling `build()` returns a
 * fresh slide with new ids so applying the same preset twice produces
 * two independent slides (no shared layer references).
 *
 * Presets are intentionally rich — not just headline/label but composed
 * with multiple text layers (badges, eyebrows, signatures, decorative
 * emoji) positioned with intent. Each one is a self-contained look
 * inspired by patterns from top App Store apps.
 *
 * Categories help the panel group presets meaningfully:
 *   - Hero        → first-slide showpieces (the screenshot most people see)
 *   - Feature     → mid-deck feature explainers
 *   - Social Proof → ratings, user counts, trust signals
 *   - Trust       → awards, badges, privacy / quality signals
 *
 * Adding a new preset: append to SLIDE_PRESETS. Templates, themes, and
 * style overrides are all the same primitives the editor exposes — so
 * a preset is just a saved configuration the user could've built by hand.
 */

import {
  makeId,
  RENDER_WIDTH,
  type SlideState,
  type TemplateId,
  type TextLayer,
  type ImageLayer,
} from './app-store-screenshot-types';

export type PresetCategory = 'Hero' | 'Feature' | 'Social Proof' | 'Trust';

export interface SlidePreset {
  id: string;
  name: string;
  category: PresetCategory;
  /** One-line pitch shown under the preset thumbnail. */
  description: string;
  /** Returns a fresh SlideState each call (new ids, no shared refs). */
  build: () => SlideState;
}

// ── Builder helpers ──────────────────────────────────────────────

const W = RENDER_WIDTH; // shorthand for layer position math

/**
 * Wrap a partial SlideState with the boilerplate fields every slide
 * needs (fresh id, empty layers, null screenshot, etc.).
 */
function makeSlide(
  templateId: TemplateId,
  themeId: string,
  partial: Partial<SlideState> = {}
): SlideState {
  return {
    id: makeId('slide'),
    templateId,
    themeId,
    headline: 'Build better habits',
    label: 'Daily streak',
    screenshotUrl: null,
    layers: [],
    ...partial,
  };
}

/**
 * Compact factory for decorative IMAGE layers — used to drop SVG assets
 * (laurel wreaths, blobs, arrows, logo chips) into a preset at a specific
 * canvas position. Source must be a path under /public/preset-assets/
 * (or any URL the client can fetch).
 */
function decoImg(opts: {
  src: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  shadow?: boolean;
}): ImageLayer {
  return {
    id: makeId('layer'),
    kind: 'image',
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height ?? opts.width, // square default; SVG aspectRatio handles the rest
    src: opts.src,
    fit: 'contain',
    rotation: opts.rotation,
    opacity: opts.opacity ?? 1,
    shadow: opts.shadow ?? false,
  };
}

/**
 * Compact factory for decorative text layers — 80% of preset code is
 * positioning a chip / badge / signature so this saves a lot of
 * boilerplate. All fields default to sensible "decorative chip" values.
 */
function deco(opts: {
  text: string;
  x: number;
  y: number;
  width?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  rotation?: number;
  letterSpacing?: number;
  uppercase?: boolean;
  shadow?: boolean;
  opacity?: number;
}): TextLayer {
  return {
    id: makeId('layer'),
    kind: 'text',
    x: opts.x,
    y: opts.y,
    width: opts.width ?? W * 0.4,
    height: 0,
    content: opts.text,
    fontFamily: opts.fontFamily ?? 'inter',
    fontSize: opts.fontSize ?? W * 0.026,
    fontWeight: opts.fontWeight ?? 700,
    color: opts.color ?? '#FFFFFF',
    align: opts.align ?? 'left',
    lineHeight: 1.1,
    letterSpacing: opts.letterSpacing ?? 0,
    rotation: opts.rotation,
    uppercase: opts.uppercase,
    shadow: opts.shadow ?? false,
    opacity: opts.opacity ?? 1,
  };
}

// ── Presets ──────────────────────────────────────────────────────

export const SLIDE_PRESETS: SlidePreset[] = [
  // ═══════════════════════════════════════════════════════════════
  // HERO — first-slide showpieces
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'hero-bold-streak',
    name: 'Bold Streak',
    category: 'Hero',
    description: 'Streak / habit tracker — yellow accent + 🔥 chip + day-counter badge.',
    build: () =>
      makeSlide('hero-benefit', 'dark-bold', {
        headline: 'Don’t break\nthe streak',
        label: 'Daily ritual',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 1.1, color: '#FDE047' },
        labelStyle: { fontFamily: 'inter', fontWeight: 700, color: '#FDE047' },
        layers: [
          // 🔥 emoji top-left, slightly tilted — big visual anchor
          deco({
            text: '🔥',
            x: W * 0.06,
            y: W * 0.08,
            width: W * 0.2,
            fontSize: W * 0.16,
            rotation: -8,
          }),
          // Day counter chip top-right
          deco({
            text: '127 DAYS',
            x: W * 0.62,
            y: W * 0.1,
            width: W * 0.32,
            fontSize: W * 0.038,
            color: '#FDE047',
            letterSpacing: 4,
            uppercase: true,
            align: 'right',
          }),
          // Bottom signature
          deco({
            text: 'Don’t miss a day · Streaks app',
            x: W * 0.1,
            y: W * 1.95,
            width: W * 0.8,
            fontSize: W * 0.022,
            color: '#FFFFFF',
            opacity: 0.5,
            align: 'center',
          }),
        ],
      }),
  },

  {
    id: 'hero-soft-welcome',
    name: 'Soft Welcome',
    category: 'Hero',
    description: 'Wellness / journaling — warm gradient, italic serif, leaf accent.',
    build: () =>
      makeSlide('hero-benefit', 'warm-editorial', {
        headline: 'A calmer way\nto start the day.',
        label: 'Mindful mornings',
        headlineStyle: { fontFamily: 'georgia', fontWeight: 400, fontSizeScale: 0.95 },
        layers: [
          deco({
            text: '🌿',
            x: W * 0.78,
            y: W * 0.08,
            width: W * 0.16,
            fontSize: W * 0.1,
            rotation: 14,
          }),
          // Editorial date stamp top-left
          deco({
            text: 'Vol. 01 · Issue 04',
            x: W * 0.07,
            y: W * 0.06,
            width: W * 0.5,
            fontSize: W * 0.022,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#7C5A47',
            letterSpacing: 3,
            uppercase: true,
          }),
          // Bottom serif signature
          deco({
            text: 'A daily ritual for the easily distracted.',
            x: W * 0.07,
            y: W * 1.96,
            width: W * 0.86,
            fontSize: W * 0.024,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#7C5A47',
            align: 'center',
          }),
        ],
      }),
  },

  {
    id: 'hero-liquid-glass',
    name: 'Liquid Glass',
    category: 'Hero',
    description: 'iOS 26 native — frosted panel, "BUILT FOR iOS 26" badge.',
    build: () =>
      makeSlide('liquid-glass-hero', 'liquid-glass', {
        headline: 'Native to\niOS 26.',
        label: 'Liquid Glass',
        headlineStyle: { fontFamily: 'sf-pro', fontWeight: 800 },
        layers: [
          // Sparkle decorations around the glass panel
          deco({
            text: '✦',
            x: W * 0.05,
            y: W * 0.42,
            width: W * 0.06,
            fontSize: W * 0.05,
            color: '#FF6E00',
            opacity: 0.7,
          }),
          deco({
            text: '✦',
            x: W * 0.88,
            y: W * 0.5,
            width: W * 0.06,
            fontSize: W * 0.04,
            color: '#5B7CFA',
            opacity: 0.7,
          }),
          // Footer credit
          deco({
            text: '◆ Built natively for iOS 26',
            x: W * 0.07,
            y: W * 1.95,
            width: W * 0.86,
            fontSize: W * 0.024,
            fontWeight: 600,
            color: '#FFFFFF',
            opacity: 0.6,
            letterSpacing: 2,
            uppercase: true,
            align: 'center',
          }),
        ],
      }),
  },

  {
    id: 'hero-brand',
    name: 'Brand Hero',
    category: 'Hero',
    description: 'Dark + accent orange. Strong opinionated brand voice.',
    build: () =>
      makeSlide('hero-benefit', 'native-first', {
        headline: 'Ship the\napp you actually want.',
        label: 'For iOS builders',
        headlineStyle: { fontFamily: 'inter', fontWeight: 800, color: '#FFFFFF' },
        labelStyle: { color: '#FF6E00', letterSpacing: 4, fontWeight: 700 },
        layers: [
          // "NEW" badge top-right corner
          deco({
            text: 'NEW',
            x: W * 0.78,
            y: W * 0.07,
            width: W * 0.16,
            fontSize: W * 0.034,
            fontWeight: 900,
            color: '#FF6E00',
            letterSpacing: 6,
            align: 'center',
          }),
          // Tag line under hero
          deco({
            text: 'No frameworks. No overengineering.',
            x: W * 0.07,
            y: W * 0.6,
            width: W * 0.86,
            fontSize: W * 0.026,
            color: '#FFFFFF',
            opacity: 0.55,
            align: 'center',
            letterSpacing: 1,
          }),
        ],
      }),
  },

  {
    id: 'hero-editorial-cover',
    name: 'Editorial Cover',
    category: 'Hero',
    description: 'Magazine-style hero — big serif + issue number + dateline.',
    build: () =>
      makeSlide('hero-benefit', 'clean-light', {
        headline: 'The quiet\nrevolution\nin your pocket.',
        label: 'Issue 01',
        headlineStyle: { fontFamily: 'georgia', fontWeight: 400, fontSizeScale: 0.85, color: '#1A1A1A' },
        labelStyle: { fontFamily: 'georgia', color: '#E97B47', letterSpacing: 6 },
        layers: [
          // Date stamp top-right
          deco({
            text: 'April 2026',
            x: W * 0.5,
            y: W * 0.06,
            width: W * 0.43,
            fontSize: W * 0.022,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#6B6259',
            letterSpacing: 3,
            uppercase: true,
            align: 'right',
          }),
          // Bottom rule signature
          deco({
            text: '— A new way to think about productivity',
            x: W * 0.07,
            y: W * 1.94,
            width: W * 0.86,
            fontSize: W * 0.022,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#6B6259',
            align: 'center',
          }),
        ],
      }),
  },

  {
    id: 'hero-ai-assistant',
    name: 'AI Assistant',
    category: 'Hero',
    description: 'Violet-pink gradient + sparkle + bold modern type — AI / chat / generator apps.',
    build: () =>
      makeSlide('hero-benefit', 'liquid-glass', {
        headline: 'Your\nsmartest\ncoworker.',
        label: 'Powered by AI',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 1.05, color: '#FFFFFF' },
        labelStyle: { color: '#F472B6', letterSpacing: 5, fontWeight: 700 },
        customBackground: { kind: 'linearGradient', colors: ['#1E1B4B', '#831843', '#312E81'], angleDeg: 145 },
        layers: [
          // Big sparkle top-right anchor
          deco({
            text: '✦',
            x: W * 0.78,
            y: W * 0.06,
            width: W * 0.18,
            fontSize: W * 0.16,
            color: '#F472B6',
            rotation: 12,
          }),
          // Tiny sparkle accent mid-canvas
          deco({
            text: '✦',
            x: W * 0.06,
            y: W * 0.55,
            width: W * 0.06,
            fontSize: W * 0.05,
            color: '#A78BFA',
            opacity: 0.8,
          }),
          // Footer signature
          deco({
            text: 'On-device · zero latency · always private',
            x: W * 0.07,
            y: W * 1.94,
            width: W * 0.86,
            fontSize: W * 0.024,
            color: '#F472B6',
            opacity: 0.7,
            letterSpacing: 2,
            uppercase: true,
            align: 'center',
          }),
        ],
      }),
  },

  // ═══════════════════════════════════════════════════════════════
  // FEATURE — mid-deck feature explainers
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'feature-magazine-spread',
    name: 'Magazine Spread',
    category: 'Feature',
    description: 'Caption left, phone right — eyebrow + arrow indicator.',
    build: () =>
      makeSlide('split-screen', 'warm-editorial', {
        headline: 'Track every coffee\nyou actually loved.',
        label: 'Tasting notes',
        headlineStyle: { fontFamily: 'georgia', fontWeight: 400, fontSizeScale: 0.85 },
        layers: [
          // FEATURE eyebrow above caption
          deco({
            text: 'Feature 03',
            x: W * 0.07,
            y: W * 0.36,
            width: W * 0.42,
            fontSize: W * 0.024,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#D97706',
            letterSpacing: 5,
            uppercase: true,
          }),
          // Footnote
          deco({
            text: '01 · Capture · Categorize · Compare',
            x: W * 0.07,
            y: W * 0.92,
            width: W * 0.42,
            fontSize: W * 0.02,
            color: '#7C5A47',
            letterSpacing: 2,
            uppercase: true,
          }),
        ],
      }),
  },

  {
    id: 'feature-tech-punch',
    name: 'Tech Punch',
    category: 'Feature',
    description: 'High-contrast feature pitch with purple accent + INSTANT badge.',
    build: () =>
      makeSlide('split-screen', 'dark-bold', {
        headline: 'Search anything\nin under a second.',
        label: 'Spotlight built in',
        headlineStyle: { fontFamily: 'inter', fontWeight: 800, fontSizeScale: 0.92, color: '#FFFFFF' },
        labelStyle: { color: '#A78BFA', fontWeight: 700, letterSpacing: 4 },
        layers: [
          // Big purple INSTANT chip
          deco({
            text: '⚡ INSTANT',
            x: W * 0.07,
            y: W * 0.34,
            width: W * 0.42,
            fontSize: W * 0.034,
            fontWeight: 900,
            color: '#FDE047',
            letterSpacing: 4,
          }),
          // Performance stat below
          deco({
            text: '< 16ms response · on-device',
            x: W * 0.07,
            y: W * 0.92,
            width: W * 0.42,
            fontSize: W * 0.022,
            fontFamily: 'jetbrains-mono',
            fontWeight: 600,
            color: '#A78BFA',
          }),
        ],
      }),
  },

  {
    id: 'feature-comparison',
    name: 'Before / After',
    category: 'Feature',
    description: 'Two-state pitch — names a pain then kills it.',
    build: () =>
      makeSlide('hero-benefit', 'clean-light', {
        headline: 'From mess\nto momentum.',
        label: 'In one tap',
        headlineStyle: { fontFamily: 'inter', fontWeight: 800, color: '#1A1A1A' },
        labelStyle: { color: '#E97B47', letterSpacing: 4 },
        layers: [
          // BEFORE label
          deco({
            text: 'BEFORE',
            x: W * 0.07,
            y: W * 0.6,
            width: W * 0.42,
            fontSize: W * 0.026,
            fontWeight: 900,
            color: '#9B8674',
            letterSpacing: 6,
            align: 'center',
          }),
          deco({
            text: '47 untagged notes',
            x: W * 0.07,
            y: W * 0.66,
            width: W * 0.42,
            fontSize: W * 0.038,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#6B6259',
            align: 'center',
          }),
          // AFTER label
          deco({
            text: 'AFTER',
            x: W * 0.51,
            y: W * 0.6,
            width: W * 0.42,
            fontSize: W * 0.026,
            fontWeight: 900,
            color: '#E97B47',
            letterSpacing: 6,
            align: 'center',
          }),
          deco({
            text: '12 next steps',
            x: W * 0.51,
            y: W * 0.66,
            width: W * 0.42,
            fontSize: W * 0.038,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#1A1A1A',
            align: 'center',
          }),
        ],
      }),
  },

  {
    id: 'feature-code-showcase',
    name: 'Code Showcase',
    category: 'Feature',
    description: 'Developer-tool aesthetic — monospace + terminal cursor.',
    build: () =>
      makeSlide('hero-benefit', 'dark-bold', {
        headline: 'Built for\ndevelopers who ship.',
        label: '$ swift run',
        headlineStyle: { fontFamily: 'inter', fontWeight: 800, color: '#FFFFFF' },
        labelStyle: { fontFamily: 'jetbrains-mono', color: '#22D3EE', fontWeight: 600 },
        layers: [
          // Terminal-style command line at top
          deco({
            text: '> swift run --hot-reload',
            x: W * 0.07,
            y: W * 0.06,
            width: W * 0.86,
            fontSize: W * 0.024,
            fontFamily: 'jetbrains-mono',
            fontWeight: 500,
            color: '#22D3EE',
            opacity: 0.7,
          }),
          // Status indicator top-right
          deco({
            text: '● BUILD PASSING',
            x: W * 0.55,
            y: W * 0.06,
            width: W * 0.38,
            fontSize: W * 0.022,
            fontFamily: 'jetbrains-mono',
            fontWeight: 600,
            color: '#4ADE80',
            letterSpacing: 2,
            align: 'right',
          }),
          // Bottom dev signature
          deco({
            text: '// no frameworks · no fluff · ship today',
            x: W * 0.07,
            y: W * 1.95,
            width: W * 0.86,
            fontSize: W * 0.022,
            fontFamily: 'jetbrains-mono',
            fontWeight: 500,
            color: '#94A3B8',
            align: 'center',
          }),
        ],
      }),
  },

  // ═══════════════════════════════════════════════════════════════
  // SOCIAL PROOF — ratings, user counts, trust signals
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'social-rating-stars',
    name: '4.8 Stars',
    category: 'Social Proof',
    description: 'Big rating + ⭐⭐⭐⭐⭐ row + reviewer count credit.',
    build: () =>
      makeSlide('bold-metric', 'clean-light', {
        headline: '4.8',
        label: 'App Store rating',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 1.8, color: '#E97B47' },
        labelStyle: { fontWeight: 700, letterSpacing: 4 },
        layers: [
          // Star row above the metric
          deco({
            text: '★ ★ ★ ★ ★',
            x: W * 0.1,
            y: W * 0.42,
            width: W * 0.8,
            fontSize: W * 0.07,
            color: '#E97B47',
            letterSpacing: 8,
            align: 'center',
          }),
          // Reviewer count credit
          deco({
            text: 'from 12,000+ reviews worldwide',
            x: W * 0.1,
            y: W * 0.85,
            width: W * 0.8,
            fontSize: W * 0.026,
            color: '#6B6259',
            fontWeight: 600,
            align: 'center',
          }),
          // Bottom press attribution
          deco({
            text: '“Better than its $20/mo competitors.” — TechCrunch',
            x: W * 0.07,
            y: W * 1.95,
            width: W * 0.86,
            fontSize: W * 0.022,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#6B6259',
            align: 'center',
          }),
        ],
      }),
  },

  {
    id: 'social-user-count',
    name: '127K Builders',
    category: 'Social Proof',
    description: 'Big number stat — community / movement angle.',
    build: () =>
      makeSlide('bold-metric', 'native-first', {
        headline: '127K',
        label: 'Builders shipping daily',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 1.8, color: '#FF6E00' },
        labelStyle: { color: '#FFFFFF', fontWeight: 600, fontSizeScale: 1.1, letterSpacing: 3 },
        layers: [
          // "AND GROWING" sub-stat
          deco({
            text: '↑ +2,400 this week',
            x: W * 0.07,
            y: W * 0.85,
            width: W * 0.86,
            fontSize: W * 0.028,
            color: '#4ADE80',
            fontWeight: 700,
            align: 'center',
            letterSpacing: 2,
          }),
          // Bottom community signature
          deco({
            text: 'Join the iOS builders shipping native, fast, and weird.',
            x: W * 0.07,
            y: W * 1.95,
            width: W * 0.86,
            fontSize: W * 0.022,
            color: '#FFFFFF',
            opacity: 0.55,
            align: 'center',
          }),
        ],
      }),
  },

  {
    id: 'social-press-quote',
    name: 'Press Quote',
    category: 'Social Proof',
    description: 'Big pull-quote + attribution — the "TechCrunch said" slide.',
    build: () =>
      makeSlide('hero-benefit', 'warm-editorial', {
        headline: '“The fastest\nway to capture\na thought.”',
        label: '— Wired, 2026',
        headlineStyle: { fontFamily: 'georgia', fontWeight: 400, fontSizeScale: 0.85, color: '#2B1D17' },
        labelStyle: { fontFamily: 'georgia', fontWeight: 400, color: '#7C5A47', letterSpacing: 0 },
        layers: [
          // Big decorative open quote mark
          deco({
            text: '“',
            x: W * 0.04,
            y: W * 0.04,
            width: W * 0.18,
            fontSize: W * 0.32,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#D97706',
            opacity: 0.4,
          }),
          // Press logo strip at the bottom
          deco({
            text: 'WIRED · THE VERGE · DARING FIREBALL · TECHCRUNCH',
            x: W * 0.07,
            y: W * 1.94,
            width: W * 0.86,
            fontSize: W * 0.02,
            fontWeight: 700,
            color: '#7C5A47',
            opacity: 0.7,
            letterSpacing: 4,
            align: 'center',
          }),
        ],
      }),
  },

  {
    id: 'social-downloads',
    name: '1M Downloads',
    category: 'Social Proof',
    description: 'Million-download milestone with growth indicator and global tag.',
    build: () =>
      makeSlide('bold-metric', 'clean-light', {
        headline: '1M+',
        label: 'Downloads worldwide',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 1.9, color: '#1A1A1A' },
        labelStyle: { color: '#E97B47', fontWeight: 700, letterSpacing: 4 },
        layers: [
          // Growth chip above the metric
          deco({
            text: '↑ Top 10 in Productivity',
            x: W * 0.07,
            y: W * 0.34,
            width: W * 0.86,
            fontSize: W * 0.026,
            fontWeight: 700,
            color: '#22C55E',
            letterSpacing: 2,
            uppercase: true,
            align: 'center',
          }),
          // Country trio under the metric
          deco({
            text: 'US · UK · DE · JP · BR · IN · KR · AU',
            x: W * 0.07,
            y: W * 0.85,
            width: W * 0.86,
            fontSize: W * 0.024,
            color: '#6B6259',
            fontWeight: 600,
            letterSpacing: 4,
            align: 'center',
          }),
          // Bottom press credit
          deco({
            text: '“The fastest-growing app of 2026.” — Product Hunt',
            x: W * 0.07,
            y: W * 1.95,
            width: W * 0.86,
            fontSize: W * 0.022,
            fontFamily: 'georgia',
            fontWeight: 400,
            color: '#6B6259',
            align: 'center',
          }),
        ],
      }),
  },

  // ═══════════════════════════════════════════════════════════════
  // TRUST — awards, badges, privacy / quality signals
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'trust-editors-choice',
    name: 'Editor’s Choice',
    category: 'Trust',
    description: 'App Store Editor’s Choice badge styling — gold + crown.',
    build: () =>
      makeSlide('hero-benefit', 'dark-bold', {
        headline: 'App Store\nEditor’s Choice.',
        label: 'Awarded April 2026',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 0.95, color: '#FDE047' },
        labelStyle: { color: '#FDE047', letterSpacing: 5 },
        layers: [
          // Big crown emoji centered above headline
          deco({
            text: '👑',
            x: W * 0.4,
            y: W * 0.05,
            width: W * 0.2,
            fontSize: W * 0.18,
            align: 'center',
          }),
          // Curved certificate-style sub-line
          deco({
            text: '◆ ◆ ◆',
            x: W * 0.07,
            y: W * 0.62,
            width: W * 0.86,
            fontSize: W * 0.04,
            color: '#FDE047',
            opacity: 0.5,
            align: 'center',
            letterSpacing: 16,
          }),
          // Bottom award disclaimer
          deco({
            text: 'Apple App Store · Productivity · 2026',
            x: W * 0.07,
            y: W * 1.95,
            width: W * 0.86,
            fontSize: W * 0.022,
            color: '#FFFFFF',
            opacity: 0.5,
            align: 'center',
            letterSpacing: 3,
            uppercase: true,
          }),
        ],
      }),
  },

  {
    id: 'trust-privacy',
    name: 'Privacy First',
    category: 'Trust',
    description: '🔒 100% private — no tracking, no accounts, on-device.',
    build: () =>
      makeSlide('hero-benefit', 'clean-light', {
        headline: '100%\nprivate.\n100%\nyours.',
        label: 'Zero tracking',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 1.05, color: '#1A1A1A' },
        labelStyle: { color: '#22C55E', letterSpacing: 5 },
        layers: [
          // Lock emoji top-right
          deco({
            text: '🔒',
            x: W * 0.78,
            y: W * 0.05,
            width: W * 0.16,
            fontSize: W * 0.13,
          }),
          // Trust trio across bottom
          deco({
            text: '✓ On-device   ✓ No accounts   ✓ Open-source',
            x: W * 0.07,
            y: W * 1.94,
            width: W * 0.86,
            fontSize: W * 0.024,
            fontWeight: 700,
            color: '#22C55E',
            letterSpacing: 1,
            align: 'center',
          }),
        ],
      }),
  },

  {
    id: 'trust-bottom-laurel',
    name: 'Award Footer',
    category: 'Trust',
    description: 'Hero text up top, laurel rating badge anchored at the bottom — Project 10 style.',
    build: () =>
      makeSlide('hero-benefit', 'liquid-glass', {
        headline: 'Shop Better\nSave More',
        label: 'Your safe place to shop online anytime.',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 1.05, color: '#F4ECDD' },
        labelStyle: { color: '#F4ECDD', letterSpacing: 0, fontWeight: 600, fontSizeScale: 1.1 },
        layers: [
          // Bottom laurel pair around "4.8 Rating"
          decoImg({ src: '/preset-assets/laurel-left.svg', x: W * 0.18, y: W * 1.7, width: W * 0.18, height: W * 0.36 }),
          decoImg({ src: '/preset-assets/laurel-right.svg', x: W * 0.64, y: W * 1.7, width: W * 0.18, height: W * 0.36 }),
          deco({
            text: '4.8',
            x: W * 0.3, y: W * 1.78, width: W * 0.4,
            fontSize: W * 0.1, fontWeight: 900, color: '#FFFFFF', align: 'center',
          }),
          deco({
            text: 'Rating',
            x: W * 0.3, y: W * 1.93, width: W * 0.4,
            fontSize: W * 0.034, fontWeight: 700, color: '#FFFFFF', align: 'center', uppercase: true, letterSpacing: 4,
          }),
          deco({
            text: '★ ★ ★ ★ ★',
            x: W * 0.3, y: W * 2.0, width: W * 0.4,
            fontSize: W * 0.038, color: '#FACC15', align: 'center', letterSpacing: 4,
          }),
        ],
      }),
  },
  {
    id: 'hero-stacked-paint',
    name: 'Stacked Style',
    category: 'Hero',
    description: 'Bold cream/yellow split + brand name + stacked phones look — social / creative apps.',
    build: () =>
      makeSlide('hero-benefit', 'warm-editorial', {
        headline: 'CONNECT\nWITH PEOPLE\nWORLDWIDE',
        label: 'Talkivo',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 1.05, color: '#1A1A1A' },
        labelStyle: { fontFamily: 'georgia', color: '#1A1A1A', fontWeight: 400, letterSpacing: 0, fontSizeScale: 1.4 },
        customBackground: { kind: 'linearGradient', colors: ['#FFF8E1', '#FACC15'], angleDeg: 135 },
        layers: [
          // Big yellow blob top-right
          decoImg({ src: '/preset-assets/blob-yellow.svg', x: W * 0.7, y: W * -0.05, width: W * 0.45, opacity: 0.9 }),
          // Smaller yellow blob mid-left for asymmetry
          decoImg({ src: '/preset-assets/blob-yellow.svg', x: W * -0.1, y: W * 0.95, width: W * 0.32, opacity: 0.85 }),
          // Quote-mark accent bottom (recreating Project 6's bottom quote)
          deco({
            text: '“  ”',
            x: W * 0.07, y: W * 1.92,
            width: W * 0.25,
            fontSize: W * 0.16,
            fontFamily: 'georgia', fontWeight: 400,
            color: '#1A1A1A',
            align: 'left',
          }),
        ],
      }),
  },
  {
    id: 'hero-camping-trust',
    name: 'Outdoor Trust',
    category: 'Hero',
    description: 'Deep green + white-and-accent two-tone headline — outdoor / travel apps.',
    build: () =>
      makeSlide('hero-benefit', 'dark-bold', {
        // Two-line headline rendered by template; the third (accent) line lives
        // as a separate layer so we can color it green independently. Apple-
        // shape Project 9 / camping-app pattern.
        headline: 'Find perfect\ncamping',
        label: '',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 0.92, color: '#FFFFFF' },
        customBackground: { kind: 'linearGradient', colors: ['#0F2A1F', '#1B3D2A'], angleDeg: 175 },
        layers: [
          // Green third-line accent — sits right under the white two-line head
          deco({
            text: 'destinations',
            x: W * 0.07, y: W * 0.32,
            width: W * 0.86,
            fontSize: W * 0.085,
            fontFamily: 'inter', fontWeight: 900,
            color: '#4ADE80',
            align: 'center',
          }),
          // Trust signature bottom
          deco({
            text: '◆ Trusted by 12,000+ travelers',
            x: W * 0.07, y: W * 1.95,
            width: W * 0.86,
            fontSize: W * 0.024,
            color: '#4ADE80',
            opacity: 0.8,
            align: 'center',
            letterSpacing: 3,
            uppercase: true,
          }),
        ],
      }),
  },
  {
    id: 'trust-award-winner',
    name: 'Best of 2026',
    category: 'Trust',
    description: '"BEST OF 2026" hero with metallic gold accent — for award announcements.',
    build: () =>
      makeSlide('hero-benefit', 'liquid-glass', {
        headline: 'Best of\n2026.',
        label: 'Apple Design Awards',
        headlineStyle: { fontFamily: 'inter', fontWeight: 900, fontSizeScale: 1.3, color: '#FDE047' },
        labelStyle: { color: '#FDE047', letterSpacing: 5 },
        layers: [
          // Trophy emoji
          deco({
            text: '🏆',
            x: W * 0.4,
            y: W * 0.06,
            width: W * 0.2,
            fontSize: W * 0.16,
            align: 'center',
          }),
          // "FINALIST" badge top-right
          deco({
            text: 'FINALIST',
            x: W * 0.7,
            y: W * 0.08,
            width: W * 0.24,
            fontSize: W * 0.024,
            fontWeight: 900,
            color: '#FDE047',
            letterSpacing: 6,
            align: 'right',
          }),
          // Footer with category breadcrumb
          deco({
            text: 'Innovation · Inclusivity · Visual & Graphics',
            x: W * 0.07,
            y: W * 1.95,
            width: W * 0.86,
            fontSize: W * 0.022,
            color: '#FFFFFF',
            opacity: 0.55,
            letterSpacing: 3,
            uppercase: true,
            align: 'center',
          }),
        ],
      }),
  },
];

/** Preset categories in the order the panel renders them. */
export const PRESET_CATEGORIES: PresetCategory[] = [
  'Hero',
  'Feature',
  'Social Proof',
  'Trust',
];

/** Filter helper for grouping presets by category in the UI. */
export function presetsByCategory(category: PresetCategory): SlidePreset[] {
  return SLIDE_PRESETS.filter((p) => p.category === category);
}
