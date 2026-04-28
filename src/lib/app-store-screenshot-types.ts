/**
 * Core types and constants for the App Store Hero Maker tool.
 *
 * Renderers, editors, exporters all share these definitions.
 * Pure data — no React, no DOM, safe to import anywhere.
 */

// ── Export sizes (Apple required, portrait, in pixels) ──────────────

export interface ExportSize {
  id: string;
  label: string;
  width: number;
  height: number;
  device: 'iphone' | 'ipad';
  required?: boolean;
}

export const IPHONE_SIZES: ExportSize[] = [
  { id: 'iphone-69', label: '6.9" iPhone', width: 1320, height: 2868, device: 'iphone', required: true },
  { id: 'iphone-65', label: '6.5" iPhone', width: 1284, height: 2778, device: 'iphone' },
  { id: 'iphone-63', label: '6.3" iPhone', width: 1206, height: 2622, device: 'iphone' },
  { id: 'iphone-61', label: '6.1" iPhone', width: 1125, height: 2436, device: 'iphone' },
];

export const IPAD_SIZES: ExportSize[] = [
  { id: 'ipad-13', label: '13" iPad', width: 2064, height: 2752, device: 'ipad' },
  { id: 'ipad-129', label: '12.9" iPad Pro', width: 2048, height: 2732, device: 'ipad' },
];

export const ALL_SIZES: ExportSize[] = [...IPHONE_SIZES, ...IPAD_SIZES];

/** Render at the largest iPhone resolution, scale down for export. */
export const RENDER_WIDTH = 1320;
export const RENDER_HEIGHT = 2868;

// ── iPhone mockup measurements (pre-baked from skill) ───────────────

export const IPHONE_MOCKUP = {
  imageUrl: '/mockups/iphone-mockup.png',
  imageWidth: 1022,
  imageHeight: 2082,
  // Screen area inside the mockup
  screenLeftPct: 52 / 1022,        // 5.087%
  screenTopPct: 46 / 2082,         // 2.21%
  screenWidthPct: 918 / 1022,      // 89.82%
  screenHeightPct: 1990 / 2082,    // 95.58%
  // Border radius for the screen content (relative to screen size)
  screenBorderRadiusXPct: 126 / 918,   // 13.73%
  screenBorderRadiusYPct: 126 / 1990,  // 6.33%
} as const;

// ── Themes ─────────────────────────────────────────────────────────

export interface Theme {
  id: string;
  name: string;
  description: string;
  background: BackgroundSpec;
  textColor: string;
  labelColor: string;
  accentColor: string;
  /** Optional decorative blob colors (used by some templates) */
  decorations?: {
    blobColors: string[];
    glowColor?: string;
  };
  /** Liquid Glass-aware (renders frosted glass surfaces) */
  liquidGlass?: boolean;
}

export type BackgroundSpec =
  | { kind: 'solid'; color: string }
  | { kind: 'linearGradient'; colors: string[]; angleDeg: number }
  | { kind: 'radialGradient'; center: [number, number]; colors: string[] };

export const THEMES: Theme[] = [
  {
    id: 'clean-light',
    name: 'Clean Light',
    description: 'Cream background, dark text. Conversion-tested for utility apps.',
    background: { kind: 'linearGradient', colors: ['#FAF7F2', '#F0EAE0'], angleDeg: 180 },
    textColor: '#1A1A1A',
    labelColor: '#6B6259',
    accentColor: '#E97B47',
    decorations: { blobColors: ['rgba(233, 123, 71, 0.12)', 'rgba(91, 124, 250, 0.08)'] },
  },
  {
    id: 'dark-bold',
    name: 'Dark Bold',
    description: 'Deep navy, white text. High contrast for productivity apps.',
    background: { kind: 'linearGradient', colors: ['#0B1020', '#1A1F35'], angleDeg: 180 },
    textColor: '#FFFFFF',
    labelColor: '#94A3B8',
    accentColor: '#8B5CF6',
    decorations: { blobColors: ['rgba(139, 92, 246, 0.20)', 'rgba(59, 130, 246, 0.15)'] },
  },
  {
    id: 'liquid-glass',
    name: 'Liquid Glass (iOS 26)',
    description: 'Frosted glass aesthetic. Differentiator — nobody else has this.',
    background: { kind: 'linearGradient', colors: ['#1F1F2F', '#2D1F3F', '#1F2F2F'], angleDeg: 135 },
    textColor: '#FFFFFF',
    labelColor: '#A8A8B8',
    accentColor: '#FF6E00',
    liquidGlass: true,
    decorations: { blobColors: ['rgba(255, 110, 0, 0.25)', 'rgba(91, 124, 250, 0.20)'] },
  },
  {
    id: 'warm-editorial',
    name: 'Warm Editorial',
    description: 'Warm peach + brown. Great for lifestyle / creative apps.',
    background: { kind: 'linearGradient', colors: ['#F7E8DA', '#E5C4A8'], angleDeg: 180 },
    textColor: '#2B1D17',
    labelColor: '#7C5A47',
    accentColor: '#D97706',
    decorations: { blobColors: ['rgba(217, 119, 6, 0.15)', 'rgba(120, 80, 50, 0.10)'] },
  },
  {
    id: 'native-first',
    name: 'NativeFirst Brand',
    description: 'Our own dark + accent orange. Showcases the tool as marketed.',
    background: { kind: 'linearGradient', colors: ['#0A0A0F', '#1A1428'], angleDeg: 165 },
    textColor: '#FFFFFF',
    labelColor: '#94A3B8',
    accentColor: '#FF6E00',
    decorations: { blobColors: ['rgba(255, 110, 0, 0.18)', 'rgba(91, 124, 250, 0.12)'] },
  },
];

// ── Templates ──────────────────────────────────────────────────────

export type TemplateId =
  | 'hero-benefit'
  | 'split-screen'
  | 'bold-metric'
  | 'liquid-glass-hero';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  /** What kind of message this layout sells best */
  bestFor: string;
  /** Phone position inside the canvas */
  phoneLayout: 'centered-bottom' | 'left' | 'right';
  recommendedTheme?: Theme['id'];
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'hero-benefit',
    name: 'Hero Benefit',
    description: 'Big headline at top, phone centered at bottom. The classic, conversion-tested layout.',
    bestFor: 'Slide #1 — your main app benefit. Works for almost any app.',
    phoneLayout: 'centered-bottom',
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    description: 'Caption on one side, phone on the other. Magazine spread feel.',
    bestFor: 'Feature explanations where you want both prose and a phone in frame.',
    phoneLayout: 'right',
  },
  {
    id: 'bold-metric',
    name: 'Bold Metric',
    description: 'Massive number or stat (LEVEL 47, 2.3M USERS), phone below.',
    bestFor: 'Games, finance apps, social proof. Anything with a big number.',
    phoneLayout: 'centered-bottom',
  },
  {
    id: 'liquid-glass-hero',
    name: 'Liquid Glass Hero',
    description: 'Frosted glass caption panel floats over background. iOS 26 native aesthetic.',
    bestFor: 'iOS 26 apps. Differentiator nobody else has yet.',
    phoneLayout: 'centered-bottom',
    recommendedTheme: 'liquid-glass',
  },
];

// ── Layers (custom text + images on top of templates) ──────────────

export type LayerKind = 'text' | 'image';

export interface BaseLayer {
  id: string;
  kind: LayerKind;
  /** Position in logical canvas pixels (0..1320 wide for iPhone) */
  x: number;
  y: number;
  /** Width in logical canvas pixels */
  width: number;
  /** Height in logical canvas pixels (auto for text if 0) */
  height: number;
  /** Rotation in degrees, optional */
  rotation?: number;
  /** Opacity 0..1, default 1 */
  opacity?: number;
  /** Lock layer position so accidental drags don't move it */
  locked?: boolean;
}

export interface TextLayer extends BaseLayer {
  kind: 'text';
  content: string;
  fontFamily: string;
  /** Font size in logical pixels */
  fontSize: number;
  /** CSS font weight 100..900 */
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  letterSpacing: number;
  /** Optional text shadow for readability over busy backgrounds */
  shadow?: boolean;
  /** Optional uppercase styling */
  uppercase?: boolean;
}

export interface ImageLayer extends BaseLayer {
  kind: 'image';
  /** Data URL of the uploaded image */
  src: string;
  fit: 'cover' | 'contain';
  borderRadius?: number;
  /** Optional drop shadow for visual separation */
  shadow?: boolean;
}

export type Layer = TextLayer | ImageLayer;

/** Curated font families that work well in App Store screenshots. */
export const FONT_FAMILIES = [
  { id: 'sf-pro', label: 'SF Pro (system)', stack: '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' },
  { id: 'inter', label: 'Inter', stack: 'Inter, system-ui, sans-serif' },
  { id: 'space-grotesk', label: 'Space Grotesk', stack: '"Space Grotesk", system-ui, sans-serif' },
  { id: 'jetbrains-mono', label: 'JetBrains Mono', stack: '"JetBrains Mono", "SF Mono", monospace' },
  { id: 'georgia', label: 'Georgia', stack: 'Georgia, "Times New Roman", serif' },
] as const;

export type FontFamilyId = typeof FONT_FAMILIES[number]['id'];

export function getFontStack(id: string): string {
  return FONT_FAMILIES.find((f) => f.id === id)?.stack ?? FONT_FAMILIES[0].stack;
}

// ── Slide state ────────────────────────────────────────────────────

/**
 * Per-text typography overrides applied on top of theme defaults.
 *
 * `fontSizeScale` is a multiplier (1.0 = theme default). We store a scale
 * rather than absolute pixels so a slide stays resolution-independent
 * across export sizes — a 1.4× headline is 1.4× at every iPhone size.
 *
 * Every field is optional; unset = inherit from theme.
 */
export interface CaptionTextStyle {
  fontFamily?: string;
  fontSizeScale?: number;
  color?: string;
  fontWeight?: number;
}

export interface SlideState {
  id: string;
  templateId: TemplateId;
  themeId: string;
  headline: string;
  label?: string;
  /** Per-slide typography overrides for the built-in headline + label. */
  headlineStyle?: CaptionTextStyle;
  labelStyle?: CaptionTextStyle;
  /** Base64 or object URL of the user's uploaded screenshot. */
  screenshotUrl: string | null;
  /** Custom theme override (only set if user customized colors) */
  customTheme?: Partial<Theme>;
  /** Background override — supersedes the theme's default background when set */
  customBackground?: BackgroundSpec;
  /** Custom text + image layers stacked on top of the template */
  layers: Layer[];
}

/** Generate a stable unique id for layers/slides. */
export function makeId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Create a default text layer with sensible starting position + style. */
export function createTextLayer(canvasWidth: number = RENDER_WIDTH): TextLayer {
  return {
    id: makeId('layer'),
    kind: 'text',
    x: canvasWidth * 0.1,
    y: canvasWidth * 0.5, // start somewhere visible mid-canvas
    width: canvasWidth * 0.8,
    height: 0, // auto
    content: 'Your text here',
    fontFamily: 'sf-pro',
    fontSize: canvasWidth * 0.05,
    fontWeight: 700,
    color: '#FFFFFF',
    align: 'center',
    lineHeight: 1.1,
    letterSpacing: 0,
    shadow: true,
    opacity: 1,
  };
}

/** Create a default image layer from a data URL. */
export function createImageLayer(src: string, canvasWidth: number = RENDER_WIDTH): ImageLayer {
  return {
    id: makeId('layer'),
    kind: 'image',
    x: canvasWidth * 0.35,
    y: canvasWidth * 0.4,
    width: canvasWidth * 0.3,
    height: canvasWidth * 0.3,
    src,
    fit: 'contain',
    borderRadius: 0,
    shadow: true,
    opacity: 1,
  };
}

/** Default slide for a fresh project. */
export function createDefaultSlide(templateId: TemplateId = 'hero-benefit'): SlideState {
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    templateId,
    themeId: 'clean-light',
    headline: 'Build better habits',
    label: 'Daily streak',
    screenshotUrl: null,
  };
}

// ── Conversion guidance rules ──────────────────────────────────────

export interface ConversionRule {
  id: string;
  category: 'headline' | 'visual' | 'composition' | 'accessibility';
  check: (slide: SlideState, theme: Theme) => ConversionCheckResult;
}

export interface ConversionCheckResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  fix?: string;
}

// ── Helpers ───────────────────────────────────────────────────────

export function getTheme(themeId: string): Theme {
  return THEMES.find((t) => t.id === themeId) ?? THEMES[0];
}

export function getTemplate(id: TemplateId): TemplateMeta {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function getSize(id: string): ExportSize | undefined {
  return ALL_SIZES.find((s) => s.id === id);
}
