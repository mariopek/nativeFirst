import { useEffect, useRef, useState } from 'react';
import {
  THEMES,
  TEMPLATES,
  IPHONE_SIZES,
  IPAD_SIZES,
  RENDER_WIDTH,
  RENDER_HEIGHT,
  FONT_FAMILIES,
  createDefaultSlide,
  getTemplate,
  createTextLayer,
  createImageLayer,
  type SlideState,
  type TemplateId,
  type Layer,
  type TextLayer,
  type ImageLayer,
  type BackgroundSpec,
  type CaptionTextStyle,
} from '../../../lib/app-store-screenshot-types';
import {
  SLIDE_PRESETS,
  PRESET_CATEGORIES,
  presetsByCategory,
  type SlidePreset,
} from '../../../lib/screenshot-presets';
import { runConversionChecks } from '../../../lib/screenshot-conversion-rules';
import {
  extractDominantColors,
  suggestBackgrounds,
  type GradientSuggestion,
} from '../../../lib/screenshot-color-extractor';
import SlidePreview from './SlidePreview';
import TemplateRenderer from './TemplateRenderer';
import LayerRenderer, { type ResizeHandleDir } from './LayerRenderer';
import LayerPropertiesPanel from './LayerPropertiesPanel';
import { exportSlides, downloadBlob } from './exportPipeline';

type ExportPhase = 'idle' | 'exporting' | 'done' | 'error';

/**
 * Panel open/close timing. Long enough that the column expansion reads as
 * a deliberate motion, short enough that it never feels sluggish. Apple's
 * standard "decelerate" cubic-bezier matches the rest of iOS feel.
 */
const PANEL_ANIM_MS = 280;
const PANEL_ANIM_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

/**
 * Categories drive the middle panel — picking one switches the editor mode.
 * Selecting a layer in the canvas auto-switches to the matching category so
 * the user lands directly on the controls for what they clicked. AppLaunchpad
 * pattern: nav | category panel | horizontal row of all slides.
 */
type Category =
  | 'presets'
  | 'templates'
  | 'background'
  | 'text'
  | 'images'
  | 'style'
  | 'export';

export default function AppStoreHeroMaker() {
  // ── Slides ────────────────────────────────────────────────────
  const [slides, setSlides] = useState<SlideState[]>([
    { ...createDefaultSlide('hero-benefit'), layers: [] },
  ]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  /**
   * `null` = no panel open → middle column collapses, canvas gets the
   * full width. Click a nav icon to toggle its panel; click again to close.
   */
  const [category, setCategory] = useState<Category | null>(null);

  /**
   * Mirror of `category` that lags behind on close so the panel content
   * stays mounted while the column animates from 320 → 0 px. Without
   * this, content unmounts on the same frame and the close looks like
   * the content vanishes before the panel itself shrinks.
   */
  const [renderedCategory, setRenderedCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (category) {
      setRenderedCategory(category);
      return;
    }
    // Closing: keep content rendered until the slide-out finishes.
    const t = setTimeout(() => setRenderedCategory(null), PANEL_ANIM_MS);
    return () => clearTimeout(t);
  }, [category]);

  const toggleCategory = (c: Category) => {
    setCategory((prev) => (prev === c ? null : c));
  };

  // ── Export config ─────────────────────────────────────────────
  const [device, setDevice] = useState<'iphone' | 'ipad'>('iphone');
  const [enabledSizes, setEnabledSizes] = useState<Set<string>>(
    new Set(IPHONE_SIZES.filter((s) => s.required).map((s) => s.id))
  );
  const [exportPhase, setExportPhase] = useState<ExportPhase>('idle');
  const [exportLabel, setExportLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ── Auxiliary state ───────────────────────────────────────────
  const [suggestedGradients, setSuggestedGradients] = useState<GradientSuggestion[]>([]);
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [logoFileInput] = useState(() => {
    if (typeof document !== 'undefined') {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
      inp.style.display = 'none';
      return inp;
    }
    return null;
  });

  const offscreenRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const active = slides[activeIdx];
  const activeTpl = getTemplate(active.templateId);
  const activeTheme = THEMES.find((t) => t.id === active.themeId) ?? THEMES[0];
  const tips = runConversionChecks(active);
  const failCount = tips.filter((t) => t.status === 'fail').length;
  const warnCount = tips.filter((t) => t.status === 'warn').length;
  const isClean = failCount === 0 && warnCount === 0;
  const selectedLayer = active.layers.find((l) => l.id === selectedLayerId) || null;

  // ── Slide mutations ───────────────────────────────────────────
  const updateActive = (patch: Partial<SlideState>) => {
    setSlides((prev) => prev.map((s, i) => (i === activeIdx ? { ...s, ...patch } : s)));
  };

  const updateSlideAt = (idx: number, patch: Partial<SlideState>) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const addSlide = () => {
    const newSlide = { ...createDefaultSlide('hero-benefit'), layers: [] };
    newSlide.themeId = active.themeId;
    setSlides((prev) => [...prev, newSlide]);
    setActiveIdx(slides.length);
    setSelectedLayerId(null);
  };

  const duplicateSlide = (idx: number) => {
    setSlides((prev) => {
      const src = prev[idx];
      if (!src) return prev;
      const copy: SlideState = {
        ...src,
        id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        layers: src.layers.map((l) => ({
          ...l,
          id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        })),
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setActiveIdx(idx + 1);
    setSelectedLayerId(null);
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      const [removed] = next.splice(idx, 1);
      next.splice(target, 0, removed);
      return next;
    });
    setActiveIdx(target);
  };

  const removeSlide = (idx: number) => {
    if (slides.length === 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== idx));
    setActiveIdx(Math.min(idx, slides.length - 2));
    setSelectedLayerId(null);
  };

  /**
   * Drop a pre-designed slide into the deck. Always inserted as a new slide
   * (matches Canva / AppLaunchpad pattern — never destructive). Each call
   * to preset.build() returns a fresh slide with a new id, so applying the
   * same preset twice produces two independent slides.
   */
  const applyPreset = (preset: SlidePreset) => {
    const newSlide = preset.build();
    setSlides((prev) => [...prev, newSlide]);
    setActiveIdx(slides.length);
    setSelectedLayerId(null);
  };

  // ── Layer mutations ──────────────────────────────────────────
  const addTextLayer = () => {
    const newLayer = createTextLayer(RENDER_WIDTH);
    updateActive({ layers: [...active.layers, newLayer] });
    setSelectedLayerId(newLayer.id);
    setCategory('text');
  };

  const addImageLayer = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const newLayer = createImageLayer(url, RENDER_WIDTH);
      updateActive({ layers: [...active.layers, newLayer] });
      setSelectedLayerId(newLayer.id);
      setCategory('images');
    };
    reader.readAsDataURL(file);
  };

  const triggerImageLayerUpload = () => {
    if (!logoFileInput) return;
    logoFileInput.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) addImageLayer(f);
      logoFileInput.value = '';
    };
    logoFileInput.click();
  };

  const updateLayer = (layerId: string, patch: Partial<Layer>) => {
    updateActive({
      layers: active.layers.map((l) =>
        l.id === layerId ? ({ ...l, ...patch } as Layer) : l
      ),
    });
  };

  const deleteLayer = (layerId: string) => {
    updateActive({ layers: active.layers.filter((l) => l.id !== layerId) });
    setSelectedLayerId(null);
  };

  /**
   * Click handler for layers inside a slide tile. Selecting a layer also
   * jumps to the matching category panel so the user lands on its controls.
   */
  const handleLayerSelect = (slideIdx: number, layerId: string) => {
    if (slideIdx !== activeIdx) setActiveIdx(slideIdx);
    setSelectedLayerId(layerId);
    const layer = slides[slideIdx]?.layers.find((l) => l.id === layerId);
    if (layer?.kind === 'text') setCategory('text');
    else if (layer?.kind === 'image') setCategory('images');
  };

  // ── Layer drag (in canvas pixels, accounting for SlidePreview scale) ──
  const dragRef = useRef<{
    layerId: string;
    startX: number;
    startY: number;
    layerX: number;
    layerY: number;
    scale: number;
  } | null>(null);

  /**
   * Drag-to-resize. Captures the layer's starting geometry + the pointer's
   * starting position, then on every pointermove translates Δpointer (in
   * screen px, divided by canvas scale to get canvas px) into Δw / Δh / Δx /
   * Δy depending on which handle was grabbed.
   *
   * Image layers preserve aspect ratio (height = width / startAspect) so
   * dragging a corner scales uniformly. Text layers only resize horizontally
   * (height is auto-derived from wrapped text).
   */
  const handleLayerResizePointerDown = (
    layerId: string,
    e: React.PointerEvent,
    dir: ResizeHandleDir,
    canvasScale: number
  ) => {
    const layer = active.layers.find((l) => l.id === layerId);
    if (!layer) return;
    const startW = layer.width;
    const startH = layer.height > 0 ? layer.height : startW; // text auto-h: assume ~square baseline
    const startX = layer.x;
    const startY = layer.y;
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const aspect = startW / Math.max(1, startH);
    const lockAspect = layer.kind === 'image';
    const MIN = 30;

    (e.target as Element).setPointerCapture?.(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startMouseX) / canvasScale;
      const dy = (ev.clientY - startMouseY) / canvasScale;

      // Per-handle deltas. west/north handles also shift x/y to keep the
      // opposite edge anchored.
      let newW = startW;
      let newH = startH;
      let newX = startX;
      let newY = startY;

      if (dir.includes('e')) newW = Math.max(MIN, startW + dx);
      if (dir.includes('w')) {
        newW = Math.max(MIN, startW - dx);
        newX = startX + (startW - newW);
      }
      if (dir.includes('s')) newH = Math.max(MIN, startH + dy);
      if (dir.includes('n')) {
        newH = Math.max(MIN, startH - dy);
        newY = startY + (startH - newH);
      }

      // Image: aspect-lock — pick the axis with the larger relative delta as
      // the source of truth, derive the other from the locked aspect.
      if (lockAspect) {
        const wRatio = newW / startW;
        const hRatio = newH / startH;
        if (Math.abs(1 - wRatio) >= Math.abs(1 - hRatio)) {
          newH = newW / aspect;
          // Re-anchor north if north handle is active
          if (dir.includes('n')) newY = startY + (startH - newH);
        } else {
          newW = newH * aspect;
          if (dir.includes('w')) newX = startX + (startW - newW);
        }
      }

      // Text layers ignore vertical resize entirely (height is auto)
      const patch: Partial<Layer> =
        layer.kind === 'text'
          ? { width: newW, x: newX }
          : { width: newW, height: newH, x: newX, y: newY };

      updateLayer(layerId, patch);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleLayerPointerDown = (
    layerId: string,
    e: React.PointerEvent,
    canvasScale: number
  ) => {
    const layer = active.layers.find((l) => l.id === layerId);
    if (!layer) return;
    setSelectedLayerId(layerId);
    if (layer.kind === 'text') setCategory('text');
    else if (layer.kind === 'image') setCategory('images');
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      layerId,
      startX: e.clientX,
      startY: e.clientY,
      layerX: layer.x,
      layerY: layer.y,
      scale: canvasScale,
    };

    const onMove = (ev: PointerEvent) => {
      if (!dragRef.current) return;
      const dx = (ev.clientX - dragRef.current.startX) / dragRef.current.scale;
      const dy = (ev.clientY - dragRef.current.startY) / dragRef.current.scale;
      updateLayer(dragRef.current.layerId, {
        x: dragRef.current.layerX + dx,
        y: dragRef.current.layerY + dy,
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // ── Screenshot upload (in-template) ──────────────────────────
  /** One screenshot per slide. */
  const handleScreenshotFile = async (file: File, slideIdx?: number) => {
    if (!file.type.startsWith('image/')) return;
    const targetIdx = slideIdx ?? activeIdx;
    const reader = new FileReader();
    reader.onload = async () => {
      const url = reader.result as string;
      updateSlideAt(targetIdx, { screenshotUrl: url });
      try {
        const colors = await extractDominantColors(url, 5);
        const grads = suggestBackgrounds(colors);
        setSuggestedGradients(grads);
      } catch {
        // non-blocking
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Export ────────────────────────────────────────────────────
  const handleExport = async () => {
    setError(null);
    setExportPhase('exporting');

    const sizes = (device === 'iphone' ? IPHONE_SIZES : IPAD_SIZES).filter((s) =>
      enabledSizes.has(s.id)
    );
    if (sizes.length === 0) {
      setError('Pick at least one export size.');
      setExportPhase('error');
      return;
    }

    try {
      const slideElements: Record<string, HTMLElement> = {};
      for (const s of slides) {
        const el = offscreenRefs.current[s.id];
        if (el) slideElements[s.id] = el;
      }

      const blob = await exportSlides({
        slides,
        sizes,
        slideElements,
        onProgress: (p) => {
          if (p.label) setExportLabel(p.label);
        },
      });

      downloadBlob(blob, 'app-store-screenshots.zip');
      setExportPhase('done');
      setTimeout(() => setExportPhase('idle'), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.');
      setExportPhase('error');
    }
  };

  const toggleSize = (id: string) => {
    setEnabledSizes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const list = device === 'iphone' ? IPHONE_SIZES : IPAD_SIZES;
    setEnabledSizes(new Set(list.filter((s) => s.required).map((s) => s.id)));
  }, [device]);

  // Reset selection when switching slides via filmstrip
  useEffect(() => {
    setSelectedLayerId(null);
  }, [activeIdx]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      className="grid rounded-2xl border border-border bg-surface overflow-hidden"
      style={{
        // Middle panel collapses to 0 when no category is open
        gridTemplateColumns: category ? '72px 320px 1fr' : '72px 0px 1fr',
        height: 'calc(100vh - 140px)',
        minHeight: '640px',
        transition: `grid-template-columns ${PANEL_ANIM_MS}ms ${PANEL_ANIM_EASE}`,
      }}
    >
      {/* ─── Left vertical icon nav ───────────────────────────── */}
      <nav className="border-r border-border bg-bg/40 flex flex-col items-stretch py-2 px-1.5 gap-0.5">
        <NavBtn
          icon={IconPresets}
          label="Presets"
          active={category === 'presets'}
          onClick={() => toggleCategory('presets')}
          accent
        />
        <NavBtn
          icon={IconTemplates}
          label="Templates"
          active={category === 'templates'}
          onClick={() => toggleCategory('templates')}
        />
        <NavBtn
          icon={IconBackground}
          label="Background"
          active={category === 'background'}
          onClick={() => toggleCategory('background')}
        />
        <NavBtn
          icon={IconText}
          label="Text"
          active={category === 'text'}
          onClick={() => toggleCategory('text')}
        />
        <NavBtn
          icon={IconImages}
          label="Images"
          active={category === 'images'}
          onClick={() => toggleCategory('images')}
        />
        <NavBtn
          icon={IconStyle}
          label="Style"
          active={category === 'style'}
          onClick={() => toggleCategory('style')}
        />
        {/* Export lives only in the top-right action button — having it here
            too just doubled the surface area for the same destination. */}
      </nav>

      {/* ─── Middle category panel — collapsed when category===null ──
          Renders against `renderedCategory` (lagged copy of `category`)
          so the content stays mounted during the close animation and
          fades out together with the column collapse instead of vanishing
          on the first frame. */}
      <aside
        className="border-r border-border bg-surface overflow-hidden flex flex-col"
        style={{
          opacity: category ? 1 : 0,
          transform: category ? 'translateX(0)' : 'translateX(-8px)',
          pointerEvents: category ? 'auto' : 'none',
          transition: `opacity ${PANEL_ANIM_MS}ms ${PANEL_ANIM_EASE}, transform ${PANEL_ANIM_MS}ms ${PANEL_ANIM_EASE}`,
        }}
      >
        {renderedCategory && (
          <>
            <div className="px-4 py-3 border-b border-border bg-bg/30 flex items-center justify-between flex-shrink-0">
              <h3 className="text-[12px] font-display font-bold text-white uppercase tracking-wider">
                {categoryTitle(renderedCategory)}
              </h3>
              <button
                type="button"
                onClick={() => setCategory(null)}
                className="text-text-muted hover:text-white text-base leading-none px-1"
                title="Close panel"
              >
                ×
              </button>
            </div>
            <div className="px-4 py-3 border-b border-border text-[12px] font-mono text-text-muted/60 flex-shrink-0">
              Editing slide {activeIdx + 1} of {slides.length}
            </div>
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {renderedCategory === 'presets' && (
            <PresetsPanel onApply={applyPreset} />
          )}
          {renderedCategory === 'templates' && (
            <TemplatesPanel
              activeId={active.templateId}
              onPick={(id) => updateActive({ templateId: id })}
            />
          )}
          {renderedCategory === 'background' && (
            <BackgroundPanel
              currentBackground={active.customBackground}
              themeBackground={activeTheme.background}
              suggestedGradients={suggestedGradients}
              onPick={(bg) => updateActive({ customBackground: bg })}
              onReset={() => updateActive({ customBackground: undefined })}
            />
          )}
          {renderedCategory === 'text' && (
            <TextPanel
              slide={active}
              selectedLayer={selectedLayer && selectedLayer.kind === 'text' ? selectedLayer : null}
              onAdd={addTextLayer}
              onSelect={(id) => setSelectedLayerId(id)}
              onUpdateLayer={updateLayer}
              onDeleteLayer={deleteLayer}
              onDeselect={() => setSelectedLayerId(null)}
              onUpdateSlide={updateActive}
            />
          )}
          {renderedCategory === 'images' && (
            <ImagesPanel
              slide={active}
              selectedLayer={selectedLayer && selectedLayer.kind === 'image' ? selectedLayer : null}
              onUploadScreenshot={() => {
                const inp = document.createElement('input');
                inp.type = 'file';
                inp.accept = 'image/png,image/jpeg,image/webp';
                inp.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) handleScreenshotFile(f);
                };
                inp.click();
              }}
              onRemoveScreenshot={() => updateActive({ screenshotUrl: null })}
              onAddImage={triggerImageLayerUpload}
              onSelect={(id) => setSelectedLayerId(id)}
              onUpdateLayer={updateLayer}
              onDeleteLayer={deleteLayer}
              onDeselect={() => setSelectedLayerId(null)}
            />
          )}
          {renderedCategory === 'style' && (
            <StylePanel
              slide={active}
              tips={tips}
              tipsExpanded={tipsExpanded}
              onToggleTips={() => setTipsExpanded((v) => !v)}
              onUpdate={updateActive}
            />
          )}
          {renderedCategory === 'export' && (
            <ExportPanel
              device={device}
              onDeviceChange={setDevice}
              enabledSizes={enabledSizes}
              onToggleSize={toggleSize}
              onExport={handleExport}
              exportPhase={exportPhase}
              exportLabel={exportLabel}
              error={error}
              slidesCount={slides.length}
            />
          )}
            </div>
          </>
        )}
      </aside>

      {/* ─── Right: horizontal row of slides ───────────────────── */}
      <main className="bg-zinc-950 flex flex-col overflow-hidden">
        <header className="px-4 py-2.5 border-b border-border bg-bg/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[12px]">
            <span className="font-display font-semibold text-white">
              {slides.length} slide{slides.length === 1 ? '' : 's'}
            </span>
            <span className="text-text-muted/50">·</span>
            <button
              type="button"
              onClick={() => setTipsExpanded((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[13px] font-semibold border transition-colors ${
                isClean
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'
                  : failCount > 0
                    ? 'border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10'
                    : 'border-amber-500/30 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10'
              }`}
              title="Conversion checks for active slide"
            >
              {isClean ? '✓ Active slide clean' : `${failCount + warnCount} tip${failCount + warnCount === 1 ? '' : 's'}`}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCategory('export')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-brand text-white text-[12px] font-semibold hover:scale-[1.03] transition-transform"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
        </header>

        {/* Conversion-tip drawer */}
        {tipsExpanded && (
          <div className="px-4 py-3 border-b border-border bg-bg/60 max-h-[240px] overflow-y-auto space-y-1.5">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className={`text-[12px] p-2 rounded-md border ${
                  tip.status === 'fail'
                    ? 'border-red-500/30 bg-red-500/5'
                    : tip.status === 'warn'
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-emerald-500/30 bg-emerald-500/5'
                }`}
              >
                <p className="font-semibold text-white mb-0.5">{tip.title}</p>
                <p className="text-text-muted leading-relaxed">{tip.message}</p>
                {tip.fix && (
                  <p className="text-text-muted/80 leading-relaxed mt-1 pl-1.5 border-l border-border">
                    <span className="font-semibold text-white">Fix: </span>
                    {tip.fix}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Horizontal slide row — extra left padding so the first slide
            doesn't visually butt up against the nav column. */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex items-center gap-6 h-full pl-10 pr-10 py-5 min-w-max">
            {slides.map((s, i) => (
              <SlideCard
                key={s.id}
                slide={s}
                index={i}
                isActive={i === activeIdx}
                isOnlySlide={slides.length === 1}
                isFirst={i === 0}
                isLast={i === slides.length - 1}
                selectedLayerId={i === activeIdx ? selectedLayerId : null}
                onSelectSlide={() => {
                  setActiveIdx(i);
                  setSelectedLayerId(null);
                }}
                onSelectLayer={(layerId) => handleLayerSelect(i, layerId)}
                onLayerPointerDown={i === activeIdx ? handleLayerPointerDown : undefined}
                onLayerResizePointerDown={i === activeIdx ? handleLayerResizePointerDown : undefined}
                onScreenshotChange={(f) => handleScreenshotFile(f, i)}
                onAddTextAt={(x, y) => {
                  if (i !== activeIdx) {
                    setActiveIdx(i);
                  }
                  const newLayer = createTextLayer(RENDER_WIDTH);
                  newLayer.x = x;
                  newLayer.y = y;
                  setSlides((prev) =>
                    prev.map((sl, idx) =>
                      idx === i ? { ...sl, layers: [...sl.layers, newLayer] } : sl
                    )
                  );
                  setSelectedLayerId(newLayer.id);
                  setCategory('text');
                }}
                onDuplicate={() => duplicateSlide(i)}
                onDelete={() => removeSlide(i)}
                onMoveLeft={() => moveSlide(i, -1)}
                onMoveRight={() => moveSlide(i, 1)}
                onAddAfter={addSlide}
              />
            ))}
            {/* Trailing add card */}
            {slides.length < 10 && (
              <button
                type="button"
                onClick={addSlide}
                className="flex-shrink-0 self-center w-32 h-32 rounded-2xl border-2 border-dashed border-border hover:border-accent/60 text-text-muted hover:text-accent transition-colors flex flex-col items-center justify-center gap-1.5"
                title="Add slide"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[13px] font-semibold uppercase tracking-wider">Add slide</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Off-screen full-resolution render targets for export */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-99999px',
          top: 0,
          width: 0,
          height: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {slides.map((s) => (
          <div
            key={s.id}
            ref={(el) => {
              offscreenRefs.current[s.id] = el;
            }}
            style={{ width: `${RENDER_WIDTH}px`, height: `${RENDER_HEIGHT}px`, position: 'relative' }}
          >
            <TemplateRenderer
              slide={s}
              canvasWidth={RENDER_WIDTH}
              canvasHeight={RENDER_HEIGHT}
            />
            <LayerRenderer layers={s.layers} interactive={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────

function categoryTitle(c: Category): string {
  switch (c) {
    case 'presets': return 'Presets';
    case 'templates': return 'Templates';
    case 'background': return 'Background';
    case 'text': return 'Text';
    case 'images': return 'Images';
    case 'style': return 'Style & content';
    case 'export': return 'Export';
  }
}

// ── Left nav button ─────────────────────────────────────────────

function NavBtn({
  icon: Icon,
  label,
  active,
  onClick,
  accent = false,
}: {
  icon: () => JSX.Element;
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`group flex flex-col items-center gap-1 py-2.5 rounded-md transition-colors ${
        active
          ? accent
            ? 'bg-accent text-white'
            : 'bg-accent/10 text-accent'
          : accent
            ? 'text-accent hover:bg-accent/10'
            : 'text-text-muted hover:text-white hover:bg-bg/60'
      }`}
    >
      <Icon />
      <span className="text-[9px] font-semibold uppercase tracking-wider leading-none">
        {label}
      </span>
    </button>
  );
}

const iconClass = 'w-5 h-5';
const IconPresets = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);
const IconTemplates = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);
const IconBackground = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const IconText = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h10.5M6.75 7.5h10.5M9 11.25h6M9 15h6M5.25 4.5v15M18.75 4.5v15" />
  </svg>
);
const IconImages = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v18m6-18v18M3 9h18M3 15h18M5.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3z" />
  </svg>
);
const IconStyle = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
  </svg>
);
const IconExport = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

// ── Slide card (right-area tile) ────────────────────────────────

function SlideCard({
  slide,
  index,
  isActive,
  isOnlySlide,
  isFirst,
  isLast,
  selectedLayerId,
  onSelectSlide,
  onSelectLayer,
  onLayerPointerDown,
  onLayerResizePointerDown,
  onScreenshotChange,
  onAddTextAt,
  onDuplicate,
  onDelete,
  onMoveLeft,
  onMoveRight,
  onAddAfter,
}: {
  slide: SlideState;
  index: number;
  isActive: boolean;
  isOnlySlide: boolean;
  isFirst: boolean;
  isLast: boolean;
  selectedLayerId: string | null;
  onSelectSlide: () => void;
  onSelectLayer: (id: string) => void;
  onLayerPointerDown?: (id: string, e: React.PointerEvent, scale: number) => void;
  onLayerResizePointerDown?: (id: string, e: React.PointerEvent, dir: ResizeHandleDir, scale: number) => void;
  onScreenshotChange: (f: File) => void;
  onAddTextAt: (x: number, y: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onAddAfter: () => void;
}) {
  // Fixed pixel width per tile — height auto from aspect ratio.
  // iPhone (1320:2868 ≈ 0.46) → 280px wide → ~608px tall.
  // Pixel-based avoids the `h-full + aspect-ratio` overflow trap where an
  // ambiguous height collapses the aspect calc and the tile blows up wider
  // than its grid column.
  const tileWidth = 280;
  const aspectRatio = `${RENDER_WIDTH}/${RENDER_HEIGHT}`;
  // Pre-compute scale here so SlidePreview doesn't have to wait for
  // ResizeObserver. Both axes share the same scale because tile aspect
  // ratio matches the canvas aspect ratio exactly.
  const previewScale = tileWidth / RENDER_WIDTH;

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-0">
      {/* Per-slide action bar */}
      <div className={`flex items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>
        <ActionIconBtn label="Move left" onClick={onMoveLeft} disabled={isFirst}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </ActionIconBtn>
        <ActionIconBtn label="Insert slide after" onClick={onAddAfter}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </ActionIconBtn>
        <ActionIconBtn label="Duplicate" onClick={onDuplicate}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
          </svg>
        </ActionIconBtn>
        <ActionIconBtn label="Delete" onClick={onDelete} disabled={isOnlySlide} danger>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </ActionIconBtn>
        <ActionIconBtn label="Move right" onClick={onMoveRight} disabled={isLast}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </ActionIconBtn>
      </div>

      {/* Slide preview — explicit pixel width so the inner SlidePreview's
          ResizeObserver locks onto a definite size and scales to fit. */}
      <div
        className={`relative rounded-xl overflow-hidden transition-all ${
          isActive
            ? 'ring-2 ring-accent shadow-[0_0_0_4px_rgba(255,110,0,0.15)]'
            : 'ring-1 ring-border hover:ring-border/80 cursor-pointer'
        }`}
        style={{ width: `${tileWidth}px`, aspectRatio }}
        onMouseDown={() => {
          if (!isActive) onSelectSlide();
        }}
      >
        <SlidePreview
          slide={slide}
          scale={previewScale}
          editable={isActive}
          onScreenshotChange={onScreenshotChange}
          selectedLayerId={selectedLayerId}
          onLayerSelect={onSelectLayer}
          onLayerPointerDown={onLayerPointerDown}
          onLayerResizePointerDown={onLayerResizePointerDown}
          onCanvasBackgroundClick={() => onSelectSlide()}
          onAddTextAt={onAddTextAt}
        />
      </div>

      {/* Slide number */}
      <div
        className={`text-[13px] font-mono ${
          isActive ? 'text-accent font-bold' : 'text-text-muted/60'
        }`}
      >
        #{String(index + 1).padStart(2, '0')}
      </div>
    </div>
  );
}

function ActionIconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={label}
      className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
        disabled
          ? 'border-border/30 text-text-muted/30 cursor-not-allowed'
          : danger
            ? 'border-border bg-bg text-text-muted hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5'
            : 'border-border bg-bg text-text-muted hover:border-accent/40 hover:text-accent hover:bg-accent/5'
      }`}
    >
      {children}
    </button>
  );
}

// ── Templates panel ─────────────────────────────────────────────

function TemplatesPanel({
  activeId,
  onPick,
}: {
  activeId: TemplateId;
  onPick: (id: TemplateId) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[13px] text-text-muted/70 leading-relaxed">
        Picks the layout for the active slide. Each template handles its own
        Phone placement, headline alignment, and panorama logic.
      </p>
      <div className="grid grid-cols-1 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t.id)}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeId === t.id
                ? 'border-accent bg-accent/5 shadow-[0_0_0_3px_rgba(255,110,0,0.1)]'
                : 'border-border bg-bg/40 hover:border-accent/40'
            }`}
          >
            <div className="mb-0.5">
              <span className={`font-display font-semibold text-[12px] ${activeId === t.id ? 'text-accent' : 'text-white'}`}>
                {t.name}
              </span>
            </div>
            <p className="text-[13px] text-text-muted leading-snug">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Presets panel (pre-designed slides) ─────────────────────────

/**
 * Browse pre-designed slides grouped by use case (Hero / Feature / Social
 * Proof). Click one and it lands as a NEW slide in the deck — never
 * destructive to whatever the user has already built.
 *
 * Each preset card renders a real, scaled-down `SlidePreview` of the
 * actual slide that would be created. No separate thumbnail asset
 * pipeline — what you see is what you get.
 */
function PresetsPanel({ onApply }: { onApply: (preset: SlidePreset) => void }) {
  // Tile width tuned to fit two cards per row in the 320px panel.
  const PRESET_TILE_WIDTH = 130;
  const previewScale = PRESET_TILE_WIDTH / RENDER_WIDTH;

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-text-muted/70 leading-relaxed">
        Click a preset to add it as a new slide. Then swap in your screenshot
        and tweak the copy — the layout, colors, and typography are already
        dialed in.
      </p>

      {PRESET_CATEGORIES.map((category) => {
        const items = presetsByCategory(category);
        if (items.length === 0) return null;
        return (
          <div key={category} className="space-y-2">
            <h4 className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80">
              {category}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {items.map((preset) => {
                // Build the slide once for the thumbnail. Re-builds on any
                // re-render but cheap (just object literals, no side effects).
                const previewSlide = preset.build();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApply(preset)}
                    title={preset.description}
                    className="group rounded-lg border border-border bg-bg/40 hover:border-accent transition-colors overflow-hidden text-left"
                  >
                    <div
                      className="relative pointer-events-none"
                      style={{
                        width: PRESET_TILE_WIDTH,
                        aspectRatio: `${RENDER_WIDTH}/${RENDER_HEIGHT}`,
                      }}
                    >
                      <SlidePreview slide={previewSlide} scale={previewScale} />
                    </div>
                    <div className="px-2 py-1.5 border-t border-border">
                      <p className="text-[12px] font-display font-semibold text-white truncate">
                        {preset.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Background panel ────────────────────────────────────────────

function BackgroundPanel({
  currentBackground,
  themeBackground,
  suggestedGradients,
  onPick,
  onReset,
}: {
  currentBackground?: BackgroundSpec;
  themeBackground: BackgroundSpec;
  suggestedGradients: GradientSuggestion[];
  onPick: (bg: BackgroundSpec) => void;
  onReset: () => void;
}) {
  const themePresets = THEMES.map((t) => ({ id: t.id, name: t.name, bg: t.background }));
  const activeBg = currentBackground ?? themeBackground;
  const activeSwatch = bgToCss(activeBg);

  return (
    <div className="space-y-4">
      {/* Current */}
      <div>
        <p className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80 mb-1.5">
          Current
        </p>
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border bg-bg/50">
          <span className="w-9 h-9 rounded-md border border-border" style={{ background: activeSwatch }} />
          <span className="text-[12px] text-white flex-1 truncate">
            {currentBackground ? 'Custom override' : 'Theme default'}
          </span>
          {currentBackground && (
            <button
              type="button"
              onClick={onReset}
              className="text-[13px] text-text-muted hover:text-white px-2 py-1 rounded hover:bg-bg/80"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Theme presets */}
      <div>
        <p className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80 mb-1.5">
          Theme presets
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {themePresets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(p.bg)}
              className="aspect-square rounded-md border border-border hover:border-accent transition-colors"
              style={{ background: bgToCss(p.bg) }}
              title={p.name}
            />
          ))}
        </div>
      </div>

      {/* Brand-extracted suggestions */}
      {suggestedGradients.length > 0 && (
        <div>
          <p className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80 mb-1.5">
            Brand-aware (from screenshot)
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {suggestedGradients.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() =>
                  onPick({ kind: 'linearGradient', colors: g.colors, angleDeg: g.angleDeg })
                }
                className="aspect-square rounded-md border border-border hover:border-accent transition-colors relative overflow-hidden"
                style={{ background: `linear-gradient(${g.angleDeg}deg, ${g.colors.join(', ')})` }}
                title={g.name}
              >
                <span className="absolute inset-x-0 bottom-0 text-[13px] text-white font-semibold p-0.5 bg-black/40 truncate">
                  {g.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Solid color picker */}
      <div>
        <p className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80 mb-1.5">
          Solid color
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {[
            '#000000', '#FFFFFF', '#FF6E00', '#7B5FFF', '#22C55E', '#EF4444',
            '#3B82F6', '#F59E0B', '#EC4899', '#06B6D4', '#1F2937', '#FDE6F1',
          ].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onPick({ kind: 'solid', color: c })}
              className="w-7 h-7 rounded-md border border-border hover:scale-110 transition-transform"
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <p className="text-[12px] text-text-muted/60 leading-relaxed pt-1">
        Background is independent of Theme — Theme controls text colors, Background controls the canvas fill.
      </p>
    </div>
  );
}

function bgToCss(bg: BackgroundSpec): string {
  if (bg.kind === 'linearGradient') {
    return `linear-gradient(${bg.angleDeg}deg, ${bg.colors.join(', ')})`;
  }
  if (bg.kind === 'solid') return bg.color;
  return '#222';
}

// ── Text panel ──────────────────────────────────────────────────

function TextPanel({
  slide,
  selectedLayer,
  onAdd,
  onSelect,
  onUpdateLayer,
  onDeleteLayer,
  onDeselect,
  onUpdateSlide,
}: {
  slide: SlideState;
  selectedLayer: TextLayer | null;
  onAdd: () => void;
  onSelect: (id: string) => void;
  onUpdateLayer: (id: string, patch: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onDeselect: () => void;
  onUpdateSlide: (patch: Partial<SlideState>) => void;
}) {
  const textLayers = slide.layers.filter((l): l is TextLayer => l.kind === 'text');

  // When a layer is selected → show its full property editor
  if (selectedLayer) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={onDeselect}
          className="text-[13px] text-text-muted hover:text-white inline-flex items-center gap-1 font-semibold"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to all text
        </button>
        <LayerPropertiesPanel
          layer={selectedLayer}
          canvasWidth={RENDER_WIDTH}
          onUpdate={(patch) => onUpdateLayer(selectedLayer.id, patch as Partial<Layer>)}
          onDelete={() => onDeleteLayer(selectedLayer.id)}
          onClose={onDeselect}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Built-in template text — primary headline + label */}
      <CaptionEditorBlock
        title="Template headline & label"
        headline={slide.headline}
        label={slide.label}
        headlineStyle={slide.headlineStyle}
        labelStyle={slide.labelStyle}
        headlinePlaceholder="Build better habits"
        labelPlaceholder="Daily streak"
        onChange={(patch) => onUpdateSlide(patch)}
      />

      {/* Custom text layers */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80">
            Custom text layers ({textLayers.length})
          </h4>
        </div>
        {textLayers.length === 0 ? (
          <p className="text-[13px] text-text-muted/70 leading-relaxed py-1">
            No custom text layers yet. Add one — or double-click anywhere on the canvas to drop text in place.
          </p>
        ) : (
          <div className="space-y-1.5">
            {textLayers.map((l, i) => (
              // Outer is a div (not button) so the inner Delete button is
              // valid HTML. We still get the clickable behavior via onClick
              // and keyboard via role/tabIndex. Avoids the nested-button
              // hydration error React flags as invalid markup.
              <div
                key={l.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(l.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(l.id);
                  }
                }}
                className="w-full p-2 rounded-md border border-border bg-bg/50 hover:border-accent hover:bg-accent/5 transition-colors text-left flex items-start gap-2 group cursor-pointer focus:outline-none focus:border-accent"
              >
                <span className="text-[12px] font-mono text-text-muted/60 mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="flex-1 text-[12px] truncate font-display font-semibold"
                  style={{ color: l.color }}
                >
                  {l.content || '(empty)'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayer(l.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 text-[12px] transition-opacity"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={onAdd}
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-dashed border-border hover:border-accent text-text-muted hover:text-accent text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add text layer
        </button>
      </div>
    </div>
  );
}

// ── Caption editor block (headline + label + typography overrides) ──

/**
 * Inline editor for the headline + label text plus a Typography section
 * that lets the user override font, size, weight, and color per-text.
 * The Typography panel is open by default — users almost always want to
 * tweak the look once they've typed the text.
 */
function CaptionEditorBlock({
  title,
  headline,
  label,
  headlineStyle,
  labelStyle,
  headlinePlaceholder,
  labelPlaceholder,
  onChange,
}: {
  title: string;
  headline: string;
  label: string | undefined;
  headlineStyle: CaptionTextStyle | undefined;
  labelStyle: CaptionTextStyle | undefined;
  headlinePlaceholder: string;
  labelPlaceholder: string;
  onChange: (patch: Partial<SlideState>) => void;
}) {
  const [stylesOpen, setStylesOpen] = useState(true);

  const updateHeadlineStyle = (patch: Partial<CaptionTextStyle>) => {
    onChange({ headlineStyle: { ...(headlineStyle ?? {}), ...patch } });
  };
  const updateLabelStyle = (patch: Partial<CaptionTextStyle>) => {
    onChange({ labelStyle: { ...(labelStyle ?? {}), ...patch } });
  };
  const resetHeadlineStyle = () => onChange({ headlineStyle: undefined });
  const resetLabelStyle = () => onChange({ labelStyle: undefined });

  const hasOverrides = !!(headlineStyle || labelStyle);

  return (
    <div className="space-y-2">
      <h4 className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80">
        {title}
      </h4>
      <div>
        <label className="text-[12px] uppercase tracking-wider font-semibold text-text-muted mb-1 block">
          Headline
        </label>
        <textarea
          value={headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          rows={2}
          maxLength={80}
          placeholder={headlinePlaceholder}
          className="w-full px-2.5 py-1.5 rounded-md bg-bg border border-border text-white text-[12px] focus:outline-none focus:border-accent resize-y font-display font-semibold"
        />
      </div>
      <div>
        <label className="text-[12px] uppercase tracking-wider font-semibold text-text-muted mb-1 block">
          Label
        </label>
        <input
          type="text"
          value={label || ''}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder={labelPlaceholder}
          maxLength={30}
          className="w-full px-2.5 py-1.5 rounded-md bg-bg border border-border text-white text-[12px] focus:outline-none focus:border-accent"
        />
      </div>

      {/* Typography overrides — open by default since users usually want
          to tweak font/size/color right after typing the copy. */}
      <button
        type="button"
        onClick={() => setStylesOpen((v) => !v)}
        className="w-full mt-1 flex items-center justify-between px-2 py-1.5 rounded-md border border-border bg-bg/40 hover:border-accent/40 transition-colors"
      >
        <span className="text-[13px] uppercase tracking-wider font-bold text-text-muted">
          Typography{hasOverrides ? ' · custom' : ''}
        </span>
        <svg
          className={`w-3 h-3 text-text-muted transition-transform ${stylesOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {stylesOpen && (
        <div className="space-y-3 p-2.5 rounded-md border border-border/50 bg-bg/20">
          <CaptionStyleControls
            kind="Headline"
            style={headlineStyle}
            onChange={updateHeadlineStyle}
            onReset={resetHeadlineStyle}
            defaultWeight={800}
          />
          <div className="border-t border-border/40" />
          <CaptionStyleControls
            kind="Label"
            style={labelStyle}
            onChange={updateLabelStyle}
            onReset={resetLabelStyle}
            defaultWeight={700}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Inline typography controls for one caption text (font / size scale / weight
 * / color). Compact 2-column grid + a row of color swatches. Each control
 * patches just its own field via onChange — leaving everything else inherited
 * from the theme.
 */
function CaptionStyleControls({
  kind,
  style,
  onChange,
  onReset,
  defaultWeight,
}: {
  kind: 'Headline' | 'Label';
  style: CaptionTextStyle | undefined;
  onChange: (patch: Partial<CaptionTextStyle>) => void;
  onReset: () => void;
  defaultWeight: number;
}) {
  const sizeScale = style?.fontSizeScale ?? 1;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] uppercase tracking-wider font-bold text-white">{kind}</span>
        {style && (
          <button
            type="button"
            onClick={onReset}
            className="text-[12px] text-text-muted hover:text-white px-1.5 py-0.5 rounded hover:bg-bg/80"
          >
            Reset
          </button>
        )}
      </div>

      {/* Font + Weight row */}
      <div className="grid grid-cols-2 gap-1.5">
        <div>
          <label className="text-[12px] uppercase tracking-wider font-semibold text-text-muted mb-0.5 block">
            Font
          </label>
          <select
            value={style?.fontFamily ?? ''}
            onChange={(e) => onChange({ fontFamily: e.target.value || undefined })}
            className="w-full appearance-none px-2 py-1 pr-6 rounded-md bg-bg border border-border text-white text-[12px] focus:outline-none focus:border-accent transition-colors cursor-pointer"
          >
            <option value="">Theme default</option>
            {FONT_FAMILIES.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[12px] uppercase tracking-wider font-semibold text-text-muted mb-0.5 block">
            Weight
          </label>
          <select
            value={style?.fontWeight ?? defaultWeight}
            onChange={(e) => onChange({ fontWeight: parseInt(e.target.value, 10) })}
            className="w-full appearance-none px-2 py-1 pr-6 rounded-md bg-bg border border-border text-white text-[12px] focus:outline-none focus:border-accent transition-colors cursor-pointer"
          >
            <option value={300}>Light 300</option>
            <option value={400}>Regular 400</option>
            <option value={500}>Medium 500</option>
            <option value={600}>Semibold 600</option>
            <option value={700}>Bold 700</option>
            <option value={800}>Extra 800</option>
            <option value={900}>Black 900</option>
          </select>
        </div>
      </div>

      {/* Size scale slider */}
      <div>
        <div className="flex items-center justify-between mb-0.5">
          <label className="text-[12px] uppercase tracking-wider font-semibold text-text-muted">
            Size
          </label>
          <span className="text-[12px] font-mono text-text-muted/70">
            {sizeScale.toFixed(2)}×
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.05"
          value={sizeScale}
          onChange={(e) => onChange({ fontSizeScale: parseFloat(e.target.value) })}
          className="brand-slider"
        />
      </div>

      {/* Color picker — small swatch row + hex input */}
      <div>
        <label className="text-[12px] uppercase tracking-wider font-semibold text-text-muted mb-0.5 block">
          Color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={style?.color ?? '#FFFFFF'}
            onChange={(e) => onChange({ color: e.target.value })}
            className="w-7 h-7 rounded-md border border-border bg-bg cursor-pointer"
            title="Pick color"
          />
          <input
            type="text"
            value={style?.color ?? ''}
            onChange={(e) => {
              const v = e.target.value.trim();
              onChange({ color: v || undefined });
            }}
            placeholder="Theme default"
            className="flex-1 px-2 py-1 rounded-md bg-bg border border-border text-white text-[12px] font-mono focus:outline-none focus:border-accent uppercase"
          />
        </div>
      </div>
    </div>
  );
}

// ── Images panel ────────────────────────────────────────────────

function ImagesPanel({
  slide,
  selectedLayer,
  onUploadScreenshot,
  onRemoveScreenshot,
  onAddImage,
  onSelect,
  onUpdateLayer,
  onDeleteLayer,
  onDeselect,
}: {
  slide: SlideState;
  selectedLayer: ImageLayer | null;
  onUploadScreenshot: () => void;
  onRemoveScreenshot: () => void;
  onAddImage: () => void;
  onSelect: (id: string) => void;
  onUpdateLayer: (id: string, patch: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onDeselect: () => void;
}) {
  const imageLayers = slide.layers.filter((l): l is ImageLayer => l.kind === 'image');

  if (selectedLayer) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={onDeselect}
          className="text-[13px] text-text-muted hover:text-white inline-flex items-center gap-1 font-semibold"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to all images
        </button>
        <LayerPropertiesPanel
          layer={selectedLayer}
          canvasWidth={RENDER_WIDTH}
          onUpdate={(patch) => onUpdateLayer(selectedLayer.id, patch as Partial<Layer>)}
          onDelete={() => onDeleteLayer(selectedLayer.id)}
          onClose={onDeselect}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Slide screenshot — single upload */}
      <div className="space-y-2">
        <h4 className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80">
          Phone screenshot
        </h4>
        <ScreenshotSlot
          label="Screenshot"
          src={slide.screenshotUrl}
          onUpload={onUploadScreenshot}
          onRemove={onRemoveScreenshot}
        />
      </div>

      {/* Custom image layers */}
      <div className="space-y-2 pt-3 border-t border-border">
        <h4 className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80">
          Image layers ({imageLayers.length})
        </h4>
        {imageLayers.length === 0 ? (
          <p className="text-[13px] text-text-muted/70 leading-relaxed py-1">
            No image layers yet. Add a logo, badge, or decoration to overlay on the slide.
          </p>
        ) : (
          <div className="space-y-1.5">
            {imageLayers.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-2 p-1.5 rounded-md border border-border bg-bg/50 hover:border-accent transition-colors group"
              >
                <button
                  type="button"
                  onClick={() => onSelect(l.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <div className="w-9 h-9 rounded border border-border bg-bg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img src={l.src} alt="" className="max-w-full max-h-full" />
                  </div>
                  <span className="text-[12px] text-white truncate flex-1">Image layer</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteLayer(l.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 text-[12px] px-1 transition-opacity"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={onAddImage}
          className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-dashed border-border hover:border-accent text-text-muted hover:text-accent text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add image layer
        </button>
      </div>
    </div>
  );
}

function ScreenshotSlot({
  label,
  src,
  onUpload,
  onRemove,
}: {
  label: string;
  src: string | null;
  onUpload: () => void;
  onRemove: () => void;
}) {
  if (!src) {
    return (
      <button
        type="button"
        onClick={onUpload}
        className="w-full aspect-[9/16] max-h-32 rounded-lg border-2 border-dashed border-border hover:border-accent text-text-muted hover:text-accent transition-colors flex flex-col items-center justify-center gap-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-[13px] font-semibold uppercase tracking-wider">{label}</span>
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2 p-1.5 rounded-md border border-border bg-bg/50 group">
      <div className="w-12 h-20 rounded border border-border bg-bg overflow-hidden flex-shrink-0">
        <img src={src} alt={label} className="w-full h-full object-cover object-top" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-white font-semibold">{label}</p>
        <div className="flex gap-1 mt-1">
          <button
            type="button"
            onClick={onUpload}
            className="text-[13px] px-2 py-0.5 rounded bg-bg border border-border text-text-muted hover:text-white hover:border-accent/40 transition-colors font-semibold"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-[13px] px-2 py-0.5 rounded bg-bg border border-border text-text-muted hover:text-red-400 hover:border-red-500/40 transition-colors font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Style panel (theme + headline + tips) ──────────────────────

function StylePanel({
  slide,
  tips,
  tipsExpanded,
  onToggleTips,
  onUpdate,
}: {
  slide: SlideState;
  tips: ReturnType<typeof runConversionChecks>;
  tipsExpanded: boolean;
  onToggleTips: () => void;
  onUpdate: (patch: Partial<SlideState>) => void;
}) {
  const failCount = tips.filter((t) => t.status === 'fail').length;
  const warnCount = tips.filter((t) => t.status === 'warn').length;
  const isClean = failCount === 0 && warnCount === 0;

  return (
    <div className="space-y-4">
      {/* Theme picker */}
      <div>
        <label className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80 mb-1.5 block">
          Theme
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onUpdate({ themeId: t.id })}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-md border transition-colors text-left ${
                slide.themeId === t.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-bg/40 hover:border-accent/40'
              }`}
            >
              <span
                className="w-7 h-7 rounded-md border border-border flex-shrink-0"
                style={{ background: bgToCss(t.background) }}
              />
              <span className={`text-[12px] font-semibold ${slide.themeId === t.id ? 'text-accent' : 'text-white'}`}>
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversion checks */}
      <div className="pt-3 border-t border-border">
        <button
          type="button"
          onClick={onToggleTips}
          className={`w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold border transition-colors ${
            isClean
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'
              : failCount > 0
                ? 'border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10'
                : 'border-amber-500/30 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10'
          }`}
        >
          <span>
            {isClean ? '✓ All checks pass' : `${failCount + warnCount} conversion ${failCount + warnCount === 1 ? 'tip' : 'tips'}`}
          </span>
          <svg
            className={`w-3 h-3 transition-transform ${tipsExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {tipsExpanded && (
          <div className="mt-2 space-y-1.5 max-h-[280px] overflow-y-auto">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className={`text-[12px] p-2 rounded-md border ${
                  tip.status === 'fail'
                    ? 'border-red-500/30 bg-red-500/5'
                    : tip.status === 'warn'
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-emerald-500/30 bg-emerald-500/5'
                }`}
              >
                <p className="font-semibold text-white mb-0.5">{tip.title}</p>
                <p className="text-text-muted leading-relaxed">{tip.message}</p>
                {tip.fix && (
                  <p className="text-text-muted/80 leading-relaxed mt-1 pl-1.5 border-l border-border">
                    <span className="font-semibold text-white">Fix: </span>
                    {tip.fix}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Export panel ────────────────────────────────────────────────

function ExportPanel({
  device,
  onDeviceChange,
  enabledSizes,
  onToggleSize,
  onExport,
  exportPhase,
  exportLabel,
  error,
  slidesCount,
}: {
  device: 'iphone' | 'ipad';
  onDeviceChange: (d: 'iphone' | 'ipad') => void;
  enabledSizes: Set<string>;
  onToggleSize: (id: string) => void;
  onExport: () => void;
  exportPhase: ExportPhase;
  exportLabel: string;
  error: string | null;
  slidesCount: number;
}) {
  const sizes = device === 'iphone' ? IPHONE_SIZES : IPAD_SIZES;

  return (
    <div className="space-y-3">
      <div>
        <label className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80 mb-1.5 block">
          Device
        </label>
        <div className="flex gap-1">
          {(['iphone', 'ipad'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDeviceChange(d)}
              className={`flex-1 text-[12px] px-2 py-2 rounded-md font-semibold transition-colors ${
                device === d
                  ? 'bg-accent text-white'
                  : 'bg-bg border border-border text-text-muted hover:text-white'
              }`}
            >
              {d === 'iphone' ? 'iPhone' : 'iPad'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80 mb-1.5 block">
          Sizes
        </label>
        <div className="space-y-1">
          {sizes.map((size) => (
            <label
              key={size.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-border bg-bg/40 text-[12px] text-text-muted hover:text-white cursor-pointer"
            >
              <input
                type="checkbox"
                checked={enabledSizes.has(size.id)}
                onChange={() => onToggleSize(size.id)}
                className="w-3.5 h-3.5 rounded border-border bg-bg text-accent"
              />
              <span className="flex-1">{size.label}</span>
              <span className="font-mono text-[12px] text-text-muted/60">
                {size.width}×{size.height}
              </span>
              {size.required && (
                <span className="text-[13px] px-1 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 font-bold">
                  REQ
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={onExport}
        disabled={exportPhase === 'exporting' || enabledSizes.size === 0}
        type="button"
        className="w-full px-3 py-2.5 rounded-lg gradient-brand text-white font-semibold text-[12px] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-transform inline-flex items-center justify-center gap-1.5"
      >
        {exportPhase === 'exporting' ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="truncate">{exportLabel || 'Exporting…'}</span>
          </>
        ) : exportPhase === 'done' ? (
          '✓ Downloaded'
        ) : (
          `Generate ${slidesCount} × ${enabledSizes.size} ZIP`
        )}
      </button>
      {error && <div className="text-[12px] text-red-400">{error}</div>}

      <p className="text-[12px] text-text-muted/60 leading-relaxed">
        Each slide is rendered at every selected size and bundled into a single ZIP, named so they
        sort in App Store upload order.
      </p>
    </div>
  );
}
