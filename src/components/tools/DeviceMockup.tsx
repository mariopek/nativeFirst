/**
 * Device mockup previews for the App Icon Generator.
 *
 * Renders a stylized representation of the icon as it appears on:
 *   - iPhone home screen (default + tinted + dark)
 *   - iPad home screen
 *   - Apple Watch face (honeycomb)
 *   - Mac dock
 *
 * All CSS/SVG-based — no external mockup images. Source icon is passed in
 * as a data URL (already-rendered preview from the parent).
 */

import { useState } from 'react';
import type { Appearance } from '../../lib/app-icon-data';

export type DeviceKind = 'iphone' | 'iphone-tinted' | 'iphone-dark' | 'ipad' | 'watch' | 'mac';

interface Props {
  /** Data URL of the icon at the appropriate variant for this device. */
  iconDataUrl: string;
  /** Tinted/dark variants if available — used for iphone-tinted and iphone-dark devices. */
  variants?: Record<Appearance, string | null>;
  /** App name shown under the icon (defaults to "Your App"). */
  appName?: string;
}

const TABS: Array<{ id: DeviceKind; label: string; description: string }> = [
  { id: 'iphone', label: 'iPhone', description: 'Default home screen' },
  { id: 'iphone-tinted', label: 'iOS 26 Tinted', description: 'Liquid Glass tinted mode' },
  { id: 'iphone-dark', label: 'Dark Mode', description: 'iOS dark appearance' },
  { id: 'ipad', label: 'iPad', description: 'iPadOS home screen' },
  { id: 'watch', label: 'Watch', description: 'watchOS app launcher' },
  { id: 'mac', label: 'Mac Dock', description: 'macOS dock' },
];

export default function DeviceMockup({ iconDataUrl, variants, appName = 'Your App' }: Props) {
  const [active, setActive] = useState<DeviceKind>('iphone');

  // Pick the correct variant based on device
  const activeIcon =
    active === 'iphone-tinted'
      ? variants?.tinted || iconDataUrl
      : active === 'iphone-dark'
        ? variants?.dark || iconDataUrl
        : iconDataUrl;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              active === t.id
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-surface text-text-muted hover:border-border/80 hover:text-white'
            }`}
            title={t.description}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mockup canvas */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        {(active === 'iphone' || active === 'iphone-tinted' || active === 'iphone-dark') && (
          <IPhoneMockup iconUrl={activeIcon} appName={appName} mode={active} />
        )}
        {active === 'ipad' && <IPadMockup iconUrl={activeIcon} appName={appName} />}
        {active === 'watch' && <WatchMockup iconUrl={activeIcon} />}
        {active === 'mac' && <MacDockMockup iconUrl={activeIcon} appName={appName} />}
      </div>

      <p className="text-[11px] text-text-muted/70 text-center px-2 leading-relaxed">
        Approximate render. Actual appearance depends on device, wallpaper, and user settings.
      </p>
    </div>
  );
}

// ── iPhone ──────────────────────────────────────────────────────────
// 4×6 home-screen grid with the user's icon highlighted in the center.
function IPhoneMockup({
  iconUrl,
  appName,
  mode,
}: {
  iconUrl: string;
  appName: string;
  mode: 'iphone' | 'iphone-tinted' | 'iphone-dark';
}) {
  // Background palette per mode
  const bg =
    mode === 'iphone-dark'
      ? 'linear-gradient(180deg, #0a0a14 0%, #1a1830 100%)'
      : mode === 'iphone-tinted'
        ? 'linear-gradient(180deg, #1a1820 0%, #2a1a1a 100%)'
        : 'linear-gradient(180deg, #4a3070 0%, #2a4070 50%, #1a4040 100%)';

  // Dummy icon colors for visual context (gradient swatches)
  const dummyColors =
    mode === 'iphone-tinted'
      ? // Tinted mode — all icons monochrome
        ['#5a5a6a', '#6a5a6a', '#5a6a5a', '#5a5a7a', '#7a6a5a', '#5a7a6a', '#6a7a5a', '#5a6a7a']
      : mode === 'iphone-dark'
        ? ['#3a4a8a', '#5a3a7a', '#7a4a3a', '#3a7a5a', '#7a5a3a', '#5a3a3a', '#3a5a3a', '#4a3a7a']
        : ['#4a90e2', '#7b4ae2', '#e24a90', '#4ae29a', '#e2c34a', '#e2734a', '#9ae24a', '#4ad7e2'];

  return (
    <div className="p-6 sm:p-8 flex justify-center">
      <div
        className="relative rounded-[2.2rem] sm:rounded-[2.5rem] overflow-hidden border-[10px] border-zinc-900 shadow-2xl"
        style={{ width: 240, height: 480, background: bg }}
      >
        {/* Status bar */}
        <div className="px-5 pt-2 flex items-center justify-between text-white text-[10px] font-medium">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="opacity-70">●●●●</span>
            <span className="opacity-70">▮</span>
          </div>
        </div>

        {/* Notch / Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-zinc-950" />

        {/* Icon grid */}
        <div className="px-4 pt-12 grid grid-cols-4 gap-3 gap-y-5">
          {dummyColors.slice(0, 3).map((c, i) => (
            <DummyIcon key={i} color={c} mode={mode} />
          ))}
          {/* User's icon — highlighted */}
          <UserIcon iconUrl={iconUrl} appName={appName} highlighted />
          {dummyColors.slice(3).map((c, i) => (
            <DummyIcon key={`b-${i}`} color={c} mode={mode} />
          ))}
        </div>

        {/* Dock */}
        <div
          className="absolute bottom-3 left-3 right-3 rounded-2xl backdrop-blur-md p-2 grid grid-cols-4 gap-2"
          style={{ background: 'rgba(255,255,255,0.18)' }}
        >
          <DummyIcon color="#3aa3e2" mode={mode} small />
          <DummyIcon color="#7a3ae2" mode={mode} small />
          <DummyIcon color="#e23a8a" mode={mode} small />
          <DummyIcon color="#3ae27a" mode={mode} small />
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-0.5 rounded-full bg-white/60" />
      </div>
    </div>
  );
}

// ── iPad ────────────────────────────────────────────────────────────
function IPadMockup({ iconUrl, appName }: { iconUrl: string; appName: string }) {
  const bg = 'linear-gradient(135deg, #2a3a6a 0%, #3a2a5a 50%, #5a3a4a 100%)';
  const dummyColors = ['#4a90e2', '#e24a90', '#7b4ae2', '#4ae29a', '#e2c34a', '#e2734a'];

  return (
    <div className="p-4 sm:p-6 flex justify-center">
      <div
        className="relative rounded-[1.6rem] overflow-hidden border-[8px] border-zinc-900 shadow-2xl"
        style={{ width: 380, height: 280, background: bg }}
      >
        {/* Status bar */}
        <div className="px-4 pt-1.5 flex items-center justify-between text-white text-[9px] font-medium">
          <span>9:41 Mon Apr 28</span>
          <div className="flex items-center gap-1">
            <span className="opacity-70">●●●●</span>
            <span className="opacity-70">▮</span>
          </div>
        </div>

        {/* Icon grid — denser for iPad */}
        <div className="px-5 pt-4 grid grid-cols-7 gap-2 gap-y-3">
          {dummyColors.slice(0, 4).map((c, i) => (
            <DummyIcon key={i} color={c} mode="iphone" smallish />
          ))}
          <UserIcon iconUrl={iconUrl} appName={appName} highlighted smallish />
          {dummyColors.slice(4).map((c, i) => (
            <DummyIcon key={`b-${i}`} color={c} mode="iphone" smallish />
          ))}
          {dummyColors.map((c, i) => (
            <DummyIcon key={`r-${i}`} color={c} mode="iphone" smallish />
          ))}
          {dummyColors.slice(0, 1).map((c, i) => (
            <DummyIcon key={`r2-${i}`} color={c} mode="iphone" smallish />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Apple Watch ─────────────────────────────────────────────────────
function WatchMockup({ iconUrl }: { iconUrl: string }) {
  // Honeycomb pattern: 6 surrounding icons + user icon center
  return (
    <div className="p-6 sm:p-8 flex justify-center">
      <div
        className="relative rounded-[2.5rem] overflow-hidden border-[10px] border-zinc-900 shadow-2xl bg-black"
        style={{ width: 200, height: 240 }}
      >
        {/* Honeycomb container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 240" width="100%" height="100%">
            {/* Surrounding hex icons */}
            {[
              { x: 60, y: 80, color: '#4a90e2' },
              { x: 140, y: 80, color: '#e24a90' },
              { x: 100, y: 50, color: '#7b4ae2' },
              { x: 60, y: 160, color: '#e2c34a' },
              { x: 140, y: 160, color: '#4ae29a' },
              { x: 100, y: 190, color: '#e2734a' },
            ].map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={20} fill={d.color} opacity="0.7" />
            ))}
            {/* User icon — center, larger */}
            <defs>
              <clipPath id="watch-clip">
                <circle cx="100" cy="120" r="32" />
              </clipPath>
            </defs>
            <circle cx="100" cy="120" r="34" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6" />
            <image
              href={iconUrl}
              x="68"
              y="88"
              width="64"
              height="64"
              clipPath="url(#watch-clip)"
              preserveAspectRatio="xMidYMid slice"
            />
          </svg>
        </div>

        {/* Time top right */}
        <div className="absolute top-2 right-3 text-white text-[10px] font-bold">9:41</div>

        {/* Digital Crown indicator */}
        <div className="absolute right-[-14px] top-[40%] w-3 h-8 rounded-r bg-zinc-700" />
      </div>
    </div>
  );
}

// ── Mac Dock ────────────────────────────────────────────────────────
function MacDockMockup({ iconUrl, appName }: { iconUrl: string; appName: string }) {
  const dummyColors = ['#4a90e2', '#7b4ae2', '#e24a90', '#4ae29a', '#e2c34a', '#e2734a', '#3aa3e2'];

  return (
    <div className="p-6 flex justify-center">
      <div
        className="relative rounded-2xl overflow-hidden border border-border shadow-2xl w-full max-w-[440px]"
        style={{
          background: 'linear-gradient(135deg, #2a3a4a 0%, #1a2a3a 50%, #2a1a3a 100%)',
          aspectRatio: '16/10',
        }}
      >
        {/* Menu bar */}
        <div className="absolute top-0 left-0 right-0 px-3 py-1 flex items-center gap-2 bg-black/30 backdrop-blur-md text-white text-[9px] font-semibold">
          <span></span>
          <span>{appName}</span>
          <span className="opacity-70">File</span>
          <span className="opacity-70">Edit</span>
          <span className="opacity-70">View</span>
          <span className="ml-auto opacity-70">9:41</span>
        </div>

        {/* Wallpaper area is empty — let the gradient show through */}

        {/* Dock at bottom */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-3 rounded-2xl px-3 py-2 flex items-end gap-2 backdrop-blur-md border border-white/15"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          {dummyColors.slice(0, 3).map((c, i) => (
            <div
              key={i}
              className="rounded-lg shadow-md"
              style={{ width: 30, height: 30, background: c }}
            />
          ))}
          <div
            className="rounded-lg shadow-lg overflow-hidden ring-2 ring-white/40"
            style={{ width: 38, height: 38 }}
          >
            <img src={iconUrl} alt={appName} className="w-full h-full object-cover" />
          </div>
          {dummyColors.slice(3).map((c, i) => (
            <div
              key={`b-${i}`}
              className="rounded-lg shadow-md"
              style={{ width: 30, height: 30, background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────
function UserIcon({
  iconUrl,
  appName,
  highlighted,
  smallish,
}: {
  iconUrl: string;
  appName: string;
  highlighted?: boolean;
  smallish?: boolean;
}) {
  const size = smallish ? 36 : 44;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`rounded-[10px] sm:rounded-xl overflow-hidden ${
          highlighted ? 'ring-2 ring-white/60 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''
        }`}
        style={{ width: size, height: size }}
      >
        <img src={iconUrl} alt={appName} className="w-full h-full object-cover" />
      </div>
      <span className="text-white text-[8px] font-medium truncate max-w-full">{appName}</span>
    </div>
  );
}

function DummyIcon({
  color,
  mode,
  small,
  smallish,
}: {
  color: string;
  mode: 'iphone' | 'iphone-tinted' | 'iphone-dark';
  small?: boolean;
  smallish?: boolean;
}) {
  const size = small ? 32 : smallish ? 36 : 44;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-[10px] sm:rounded-xl"
        style={{
          width: size,
          height: size,
          background: color,
          opacity: mode === 'iphone-tinted' ? 0.5 : 0.85,
        }}
      />
      {!small && <span className="text-white/40 text-[8px] font-medium">·····</span>}
    </div>
  );
}
