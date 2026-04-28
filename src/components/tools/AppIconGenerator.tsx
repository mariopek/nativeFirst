import { useState, useCallback, useRef } from 'react';
import {
  PLATFORM_GROUPS,
  buildContentsJson,
  filenameFor,
  type Platform,
  type IconSize,
  type Appearance,
} from '../../lib/app-icon-data';
import {
  loadImageFromFile,
  validateSource,
  resizeToBlob,
  previewDataUrl,
  transformFor,
  type SourceValidation,
} from '../../lib/icon-image-utils';
import DeviceMockup from './DeviceMockup';

/**
 * App Icon Generator
 *
 * Drop a single 1024×1024 source image, generate every Apple icon size
 * across iOS/iPadOS/macOS/watchOS/visionOS, plus iOS 26 Liquid Glass
 * tinted + dark variants, packaged as an Xcode-ready AppIcon.appiconset
 * ZIP file.
 */

type GenerateState = 'idle' | 'generating' | 'done' | 'error';

export default function AppIconGenerator() {
  // Source image
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [validation, setValidation] = useState<SourceValidation | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Settings
  const [enabledPlatforms, setEnabledPlatforms] = useState<Set<Platform>>(
    new Set(['ios', 'ipados']) // Sensible default
  );
  const [includeAppearanceVariants, setIncludeAppearanceVariants] = useState(true);

  // Generation
  const [state, setState] = useState<GenerateState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Preview variants for the device mockup
  const [previews, setPreviews] = useState<Record<Appearance, string | null>>({
    any: null,
    dark: null,
    tinted: null,
  });

  // Drag-drop
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File handling ────────────────────────────────────────────────
  const handleFile = useCallback(async (f: File) => {
    setLoadError(null);
    setState('idle');
    setError(null);

    if (!/image\/(png|jpeg|svg\+xml|webp)/.test(f.type)) {
      setLoadError(`Unsupported file type: ${f.type || 'unknown'}. Use PNG, JPEG, SVG, or WebP.`);
      return;
    }
    if (f.size > 16 * 1024 * 1024) {
      setLoadError('File is over 16MB. Please use a smaller source image.');
      return;
    }

    try {
      const loaded = await loadImageFromFile(f);
      const v = validateSource(loaded);
      setFile(f);
      setImg(loaded);
      setValidation(v);
      // Generate variants at 256px (high enough for sharp mockup display)
      const [any, dark, tinted] = await Promise.all([
        previewDataUrl(loaded, 256, 'any'),
        previewDataUrl(loaded, 256, 'dark'),
        previewDataUrl(loaded, 256, 'tinted'),
      ]);
      setPreviews({ any, dark, tinted });
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load image.');
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const togglePlatform = (p: Platform) => {
    setEnabledPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  // ── Generation ───────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!img) return;
    setState('generating');
    setError(null);

    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      const sizes: IconSize[] = [];
      for (const group of PLATFORM_GROUPS) {
        if (enabledPlatforms.has(group.platform)) {
          sizes.push(...group.sizes);
        }
      }

      if (sizes.length === 0) {
        setError('Select at least one platform.');
        setState('idle');
        return;
      }

      const appiconset = zip.folder('AppIcon.appiconset');
      if (!appiconset) throw new Error('Could not create folder in ZIP.');

      for (const s of sizes) {
        const baseFilename = filenameFor(s, 'any');
        const baseBlob = await resizeToBlob(img, s.pixels);
        appiconset.file(baseFilename, baseBlob);

        if (
          includeAppearanceVariants &&
          s.platform === 'ios' &&
          (s.size === '60x60' || s.size === '1024x1024')
        ) {
          const darkFilename = filenameFor(s, 'dark');
          const darkBlob = await resizeToBlob(img, s.pixels, transformFor('dark'));
          appiconset.file(darkFilename, darkBlob);

          const tintFilename = filenameFor(s, 'tinted');
          const tintBlob = await resizeToBlob(img, s.pixels, transformFor('tinted'));
          appiconset.file(tintFilename, tintBlob);
        }
      }

      const contents = buildContentsJson(sizes, { includeAppearanceVariants });
      appiconset.file('Contents.json', contents);

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AppIcon.appiconset.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setState('done');
      setTimeout(() => setState('idle'), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
      setState('error');
    }
  };

  // ── Computed totals + per-platform breakdown ─────────────────────
  const platformBreakdown = PLATFORM_GROUPS.filter((g) =>
    enabledPlatforms.has(g.platform)
  ).map((g) => ({
    label: g.label,
    count: g.sizes.length,
  }));

  const variantBonus =
    includeAppearanceVariants && enabledPlatforms.has('ios') ? 4 : 0; // 60×60 + 1024 each ×2 variants

  const totalIcons =
    platformBreakdown.reduce((sum, p) => sum + p.count, 0) + variantBonus;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* ── Step 1: Source ─────────────────────────────────────── */}
      <section
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`rounded-2xl border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-accent bg-accent/5'
            : img
              ? 'border-border bg-surface'
              : 'border-border bg-surface hover:border-accent/40 cursor-pointer'
        }`}
        onClick={() => !img && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={onFileInput}
          className="hidden"
        />

        {!img ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/15 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-white text-base sm:text-lg mb-1.5">
              Drop your 1024×1024 source icon
            </h3>
            <p className="text-xs sm:text-sm text-text-muted mb-4">
              PNG, JPEG, SVG, or WebP. Square. Up to 16MB. Image stays in your browser.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-brand text-white font-semibold text-xs hover:scale-105 transition-transform"
            >
              Choose file
            </button>
          </div>
        ) : (
          <div className="p-5 flex items-center gap-4">
            <img
              src={previews.any || ''}
              alt="Source preview"
              className="w-14 h-14 rounded-xl border border-border flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{file?.name}</p>
              <p className="text-xs text-text-muted">
                {validation?.width}×{validation?.height} ·{' '}
                {file && (file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              type="button"
              className="text-xs px-3 py-1.5 rounded-md border border-border bg-bg text-text-muted hover:border-accent hover:text-accent transition-colors font-semibold flex-shrink-0"
            >
              Replace
            </button>
          </div>
        )}
      </section>

      {/* Errors / warnings */}
      {loadError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-text-muted">
          <span className="font-semibold text-red-400">Error: </span>
          {loadError}
        </div>
      )}
      {validation && validation.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1.5">
          {validation.warnings.map((w, i) => (
            <p key={i} className="text-xs text-text-muted leading-relaxed">
              <span className="font-semibold text-amber-300">⚠ Warning: </span>
              {w}
            </p>
          ))}
        </div>
      )}

      {/* ── Step 2: Settings | Preview (when image is loaded) ── */}
      {img && (
        <div className="grid lg:grid-cols-[minmax(0,1fr),minmax(0,1.1fr)] gap-6 lg:gap-8 items-start">
          {/* LEFT: Settings */}
          <div className="space-y-5">
            {/* Platforms */}
            <section className="rounded-2xl border border-border bg-surface p-5">
              <header className="mb-3">
                <h3 className="font-display font-semibold text-white text-sm">Platforms</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Pick which Apple platforms you ship to.
                </p>
              </header>

              <div className="space-y-1.5">
                {PLATFORM_GROUPS.map((group) => {
                  const isOn = enabledPlatforms.has(group.platform);
                  return (
                    <label
                      key={group.platform}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        isOn
                          ? 'border-accent/40 bg-accent/5'
                          : 'border-border bg-bg hover:border-border/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isOn}
                        onChange={() => togglePlatform(group.platform)}
                        className="w-4 h-4 rounded border-border bg-bg text-accent focus:ring-2 focus:ring-accent/40 flex-shrink-0"
                      />
                      <span className="text-sm font-medium text-white flex-1">
                        {group.label}
                      </span>
                      <span className="text-[10px] text-text-muted/70 font-mono">
                        {group.sizes.length} sizes
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* Liquid Glass */}
            {enabledPlatforms.has('ios') && (
              <section className="rounded-2xl border border-border bg-surface p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAppearanceVariants}
                    onChange={(e) => setIncludeAppearanceVariants(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-border bg-bg text-accent focus:ring-2 focus:ring-accent/40 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-white">
                        iOS 26 Liquid Glass variants
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold uppercase tracking-wider">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      Adds <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-bg border border-border text-white">dark</code> +{' '}
                      <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-bg border border-border text-white">tinted</code>{' '}
                      for the iOS app icon. Dark = auto-darkened (replace with hand-crafted for production).
                    </p>
                  </div>
                </label>
              </section>
            )}

            {/* Generate — natural width, not full-bleed */}
            <div className="space-y-2.5">
              <button
                onClick={handleGenerate}
                disabled={state === 'generating' || enabledPlatforms.size === 0}
                type="button"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg gradient-brand text-white font-semibold text-sm hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-transform"
              >
                {state === 'generating' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Generating {totalIcons}…
                  </>
                ) : state === 'done' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Downloaded
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Generate ZIP
                    <span className="text-[11px] font-mono opacity-80">
                      ({totalIcons} icons)
                    </span>
                  </>
                )}
              </button>

              {/* Compact size summary — replaces the empty grid */}
              <p className="text-[11px] text-text-muted leading-relaxed">
                Drops <strong className="text-white">AppIcon.appiconset</strong> with{' '}
                {platformBreakdown
                  .map((p) => `${p.count} ${p.label}`)
                  .join(' · ')}
                {variantBonus > 0 && (
                  <>
                    {' '}+ <strong className="text-accent">{variantBonus} Liquid Glass</strong>
                  </>
                )}
                .
              </p>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-xs text-text-muted">
                  <span className="font-semibold text-red-400">Failed: </span>
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Device Mockup */}
          <div>
            <DeviceMockup
              iconDataUrl={previews.any || ''}
              variants={previews}
              appName={file?.name?.replace(/\.[^.]+$/, '').slice(0, 12) || 'Your App'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
