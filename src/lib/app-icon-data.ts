/**
 * App Icon size requirements for Apple platforms.
 *
 * Last verified against Apple's Human Interface Guidelines and Xcode 26
 * AssetCatalog requirements as of April 2026. When Apple adds new sizes
 * (they did in iOS 26 with tinted/dark variants), update here.
 *
 * Reference:
 * - https://developer.apple.com/design/human-interface-guidelines/app-icons
 * - Xcode 26 AssetCatalog inspector
 */

export type Platform = 'ios' | 'ipados' | 'macos' | 'watchos' | 'visionos';

export type Appearance = 'any' | 'dark' | 'tinted';

/** A single rendered icon size in the AppIcon set. */
export interface IconSize {
  /** Apple's logical "size" attribute, e.g. "60x60". */
  size: string;
  /** Apple's "scale" attribute: 1, 2, or 3. */
  scale: 1 | 2 | 3;
  /** Apple's "idiom" attribute (e.g. "iphone", "ipad", "mac"). */
  idiom:
    | 'iphone'
    | 'ipad'
    | 'ios-marketing'
    | 'mac'
    | 'mac-marketing'
    | 'watch'
    | 'watch-marketing'
    | 'vision'
    | 'vision-marketing'
    | 'universal';
  /** Pixel dimension to render (size * scale). */
  pixels: number;
  /** Platform this size belongs to. */
  platform: Platform;
  /** Optional sub-platform context for watchOS (e.g. "38mm"). */
  subtype?: string;
  /** Optional role for watchOS icons. */
  role?: string;
  /** Plain-English description of where this size shows up. */
  description: string;
}

/** Top-level platform group used in the UI. */
export interface PlatformGroup {
  platform: Platform;
  label: string;
  description: string;
  /** Platform icon for the toggle UI. */
  iconPath: string;
  sizes: IconSize[];
}

// ── iOS / iPadOS ────────────────────────────────────────────────────
const IOS_SIZES: IconSize[] = [
  // iPhone — Notification
  { platform: 'ios', size: '20x20', scale: 2, idiom: 'iphone', pixels: 40, description: 'iPhone Notification @2x' },
  { platform: 'ios', size: '20x20', scale: 3, idiom: 'iphone', pixels: 60, description: 'iPhone Notification @3x' },
  // iPhone — Settings
  { platform: 'ios', size: '29x29', scale: 2, idiom: 'iphone', pixels: 58, description: 'iPhone Settings @2x' },
  { platform: 'ios', size: '29x29', scale: 3, idiom: 'iphone', pixels: 87, description: 'iPhone Settings @3x' },
  // iPhone — Spotlight
  { platform: 'ios', size: '40x40', scale: 2, idiom: 'iphone', pixels: 80, description: 'iPhone Spotlight @2x' },
  { platform: 'ios', size: '40x40', scale: 3, idiom: 'iphone', pixels: 120, description: 'iPhone Spotlight @3x' },
  // iPhone — App
  { platform: 'ios', size: '60x60', scale: 2, idiom: 'iphone', pixels: 120, description: 'iPhone Home Screen @2x' },
  { platform: 'ios', size: '60x60', scale: 3, idiom: 'iphone', pixels: 180, description: 'iPhone Home Screen @3x' },
  // App Store
  { platform: 'ios', size: '1024x1024', scale: 1, idiom: 'ios-marketing', pixels: 1024, description: 'App Store listing' },
];

const IPADOS_SIZES: IconSize[] = [
  // iPad — Notification
  { platform: 'ipados', size: '20x20', scale: 1, idiom: 'ipad', pixels: 20, description: 'iPad Notification @1x' },
  { platform: 'ipados', size: '20x20', scale: 2, idiom: 'ipad', pixels: 40, description: 'iPad Notification @2x' },
  // iPad — Settings
  { platform: 'ipados', size: '29x29', scale: 1, idiom: 'ipad', pixels: 29, description: 'iPad Settings @1x' },
  { platform: 'ipados', size: '29x29', scale: 2, idiom: 'ipad', pixels: 58, description: 'iPad Settings @2x' },
  // iPad — Spotlight
  { platform: 'ipados', size: '40x40', scale: 1, idiom: 'ipad', pixels: 40, description: 'iPad Spotlight @1x' },
  { platform: 'ipados', size: '40x40', scale: 2, idiom: 'ipad', pixels: 80, description: 'iPad Spotlight @2x' },
  // iPad — App
  { platform: 'ipados', size: '76x76', scale: 1, idiom: 'ipad', pixels: 76, description: 'iPad App @1x (legacy)' },
  { platform: 'ipados', size: '76x76', scale: 2, idiom: 'ipad', pixels: 152, description: 'iPad App @2x' },
  { platform: 'ipados', size: '83.5x83.5', scale: 2, idiom: 'ipad', pixels: 167, description: 'iPad Pro App @2x' },
];

// ── macOS ───────────────────────────────────────────────────────────
const MACOS_SIZES: IconSize[] = [
  { platform: 'macos', size: '16x16', scale: 1, idiom: 'mac', pixels: 16, description: 'macOS @1x' },
  { platform: 'macos', size: '16x16', scale: 2, idiom: 'mac', pixels: 32, description: 'macOS @2x' },
  { platform: 'macos', size: '32x32', scale: 1, idiom: 'mac', pixels: 32, description: 'macOS @1x' },
  { platform: 'macos', size: '32x32', scale: 2, idiom: 'mac', pixels: 64, description: 'macOS @2x' },
  { platform: 'macos', size: '128x128', scale: 1, idiom: 'mac', pixels: 128, description: 'macOS @1x' },
  { platform: 'macos', size: '128x128', scale: 2, idiom: 'mac', pixels: 256, description: 'macOS @2x' },
  { platform: 'macos', size: '256x256', scale: 1, idiom: 'mac', pixels: 256, description: 'macOS @1x' },
  { platform: 'macos', size: '256x256', scale: 2, idiom: 'mac', pixels: 512, description: 'macOS @2x' },
  { platform: 'macos', size: '512x512', scale: 1, idiom: 'mac', pixels: 512, description: 'macOS @1x' },
  { platform: 'macos', size: '512x512', scale: 2, idiom: 'mac', pixels: 1024, description: 'macOS @2x (App Store)' },
];

// ── watchOS (Apple Watch) ───────────────────────────────────────────
const WATCHOS_SIZES: IconSize[] = [
  // Notification Center — 38mm
  { platform: 'watchos', size: '24x24', scale: 2, idiom: 'watch', pixels: 48, role: 'notificationCenter', subtype: '38mm', description: 'Notification Center 38mm @2x' },
  // Notification Center — 42mm
  { platform: 'watchos', size: '27.5x27.5', scale: 2, idiom: 'watch', pixels: 55, role: 'notificationCenter', subtype: '42mm', description: 'Notification Center 42mm @2x' },
  // Companion Settings
  { platform: 'watchos', size: '29x29', scale: 2, idiom: 'watch', pixels: 58, role: 'companionSettings', description: 'Companion Settings @2x' },
  { platform: 'watchos', size: '29x29', scale: 3, idiom: 'watch', pixels: 87, role: 'companionSettings', description: 'Companion Settings @3x' },
  // App Launcher — 38mm
  { platform: 'watchos', size: '40x40', scale: 2, idiom: 'watch', pixels: 80, role: 'appLauncher', subtype: '38mm', description: 'App Launcher 38mm @2x' },
  // App Launcher — 44mm
  { platform: 'watchos', size: '44x44', scale: 2, idiom: 'watch', pixels: 88, role: 'appLauncher', subtype: '44mm', description: 'App Launcher 44mm @2x' },
  // App Launcher — 50mm
  { platform: 'watchos', size: '50x50', scale: 2, idiom: 'watch', pixels: 100, role: 'appLauncher', subtype: '50mm', description: 'App Launcher 50mm @2x' },
  // Quick Look — 42mm
  { platform: 'watchos', size: '86x86', scale: 2, idiom: 'watch', pixels: 172, role: 'quickLook', subtype: '42mm', description: 'Quick Look 42mm @2x' },
  // Quick Look — 44mm
  { platform: 'watchos', size: '98x98', scale: 2, idiom: 'watch', pixels: 196, role: 'quickLook', subtype: '44mm', description: 'Quick Look 44mm @2x' },
  // App Store
  { platform: 'watchos', size: '1024x1024', scale: 1, idiom: 'watch-marketing', pixels: 1024, description: 'App Store' },
];

// ── visionOS (Apple Vision Pro) ─────────────────────────────────────
const VISIONOS_SIZES: IconSize[] = [
  // visionOS uses layered icons (front + middle + back) but we provide
  // the flat fallback the system uses for non-3D contexts. Layered
  // generation is a future enhancement — too app-specific for v1.
  { platform: 'visionos', size: '1024x1024', scale: 1, idiom: 'vision-marketing', pixels: 1024, description: 'App Store' },
];

export const PLATFORM_GROUPS: PlatformGroup[] = [
  {
    platform: 'ios',
    label: 'iPhone',
    description: 'Required for any iPhone app. App Store needs the 1024×1024.',
    iconPath:
      'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
    sizes: IOS_SIZES,
  },
  {
    platform: 'ipados',
    label: 'iPad',
    description: 'Universal iPhone+iPad apps need both. Pure iPhone apps can skip.',
    iconPath:
      'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25',
    sizes: IPADOS_SIZES,
  },
  {
    platform: 'macos',
    label: 'macOS',
    description: 'Mac Catalyst or native Mac app. Required if you ship to Mac.',
    iconPath:
      'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25',
    sizes: MACOS_SIZES,
  },
  {
    platform: 'watchos',
    label: 'watchOS',
    description: 'Apple Watch app. Optional unless you ship a watch target.',
    iconPath:
      'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    sizes: WATCHOS_SIZES,
  },
  {
    platform: 'visionos',
    label: 'visionOS',
    description: 'Apple Vision Pro. Single 1024×1024 fallback (layered icons not generated).',
    iconPath:
      'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    sizes: VISIONOS_SIZES,
  },
];

// ── Contents.json builder ───────────────────────────────────────────

interface ContentsImage {
  filename: string;
  size: string;
  scale: string;
  idiom: string;
  appearances?: Array<{ appearance: string; value: string }>;
  role?: string;
  subtype?: string;
}

/**
 * Build the Contents.json file for an AppIcon.appiconset directory.
 * Apple's AssetCatalog format — Xcode reads this to know which file
 * is which size/scale/idiom/appearance.
 */
export function buildContentsJson(
  sizes: IconSize[],
  options: { includeAppearanceVariants: boolean }
): string {
  const images: ContentsImage[] = [];

  for (const s of sizes) {
    const baseFilename = filenameFor(s, 'any');
    images.push({
      filename: baseFilename,
      size: s.size,
      scale: `${s.scale}x`,
      idiom: s.idiom,
      ...(s.role ? { role: s.role } : {}),
      ...(s.subtype ? { subtype: s.subtype } : {}),
    });

    // Liquid Glass variants — only on iOS App icon (60x60) and 1024x1024
    // marketing, since that's what the system uses for tint/dark display.
    // Other sizes (Settings, Spotlight, Notification) don't use variants.
    if (
      options.includeAppearanceVariants &&
      shouldHaveAppearanceVariants(s)
    ) {
      images.push({
        filename: filenameFor(s, 'dark'),
        size: s.size,
        scale: `${s.scale}x`,
        idiom: s.idiom,
        appearances: [{ appearance: 'luminosity', value: 'dark' }],
      });
      images.push({
        filename: filenameFor(s, 'tinted'),
        size: s.size,
        scale: `${s.scale}x`,
        idiom: s.idiom,
        appearances: [{ appearance: 'luminosity', value: 'tinted' }],
      });
    }
  }

  return JSON.stringify(
    {
      images,
      info: { author: 'NativeFirst Icon Generator', version: 1 },
    },
    null,
    2
  );
}

/**
 * Generate a stable filename for an icon size + appearance combination.
 *   { size: '60x60', scale: 3, idiom: 'iphone' }, 'any' →
 *   "iphone-60x60@3x.png"
 */
export function filenameFor(s: IconSize, appearance: Appearance): string {
  const base = `${s.idiom}-${s.size}@${s.scale}x`;
  const subtype = s.subtype ? `-${s.subtype}` : '';
  const role = s.role ? `-${s.role}` : '';
  const variant = appearance === 'any' ? '' : `-${appearance}`;
  return `${base}${role}${subtype}${variant}.png`;
}

/**
 * Determine if a given size should have light/dark/tinted variants
 * generated. iOS 26 only uses these on the home-screen app icon
 * (60×60) and the App Store 1024×1024, not on Settings/Spotlight/etc.
 */
function shouldHaveAppearanceVariants(s: IconSize): boolean {
  if (s.platform !== 'ios') return false;
  return s.size === '60x60' || s.size === '1024x1024';
}

/**
 * Get the platform group(s) the given size belongs to. Used in UI
 * to highlight which platform an icon is for.
 */
export function platformLabel(p: Platform): string {
  return (
    PLATFORM_GROUPS.find((g) => g.platform === p)?.label || p
  );
}
