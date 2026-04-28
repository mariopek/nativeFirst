import { useEffect, useRef, useState } from 'react';
import TemplateRenderer from './TemplateRenderer';
import LayerRenderer, { type ResizeHandleDir } from './LayerRenderer';
import { RENDER_WIDTH, RENDER_HEIGHT, type SlideState } from '../../../lib/app-store-screenshot-types';

interface Props {
  slide: SlideState;
  /**
   * Pre-computed scale factor — when the parent already knows the tile's
   * pixel width it can pass `scale` directly and skip ResizeObserver. If
   * omitted, falls back to ResizeObserver-based measurement.
   */
  scale?: number;
  /** Optional aspect-ratio override container — keeps the box from collapsing. */
  className?: string;
  /** Click handler for thumbnail mode (switches active slide). */
  onClick?: () => void;
  /** When true, the preview becomes a click+drop target for screenshot upload. */
  editable?: boolean;
  /** Called when user picks a file via click or drop. Only invoked in editable mode. */
  onScreenshotChange?: (file: File) => void;
  /** Currently selected layer id (for highlight). */
  selectedLayerId?: string | null;
  /** Layer selection callback. */
  onLayerSelect?: (id: string) => void;
  /** Layer drag-start callback (passes scale so handler can convert pointer→canvas px). */
  onLayerPointerDown?: (id: string, e: React.PointerEvent, canvasScale: number) => void;
  /** Resize-handle pointer-down callback (same scale plumbing as drag). */
  onLayerResizePointerDown?: (id: string, e: React.PointerEvent, dir: ResizeHandleDir, canvasScale: number) => void;
  /** Click on empty canvas area = deselect layer. */
  onCanvasBackgroundClick?: () => void;
  /** Add text layer at canvas (x, y) — invoked by toolbar drag-drop OR double-click. */
  onAddTextAt?: (x: number, y: number) => void;
  /** Add image layer at canvas (x, y) from a File — invoked by toolbar drag or file drop. */
  onAddImageAt?: (file: File, x: number, y: number) => void;
}

/**
 * Renders a slide at its full logical size (1320×2868 for iPhone, or 2× width
 * for panorama), then scales it to fit the parent container via transform: scale.
 *
 * In editable mode: click anywhere to upload the slide's screenshot, or drag
 * and drop a file directly onto the canvas. Panorama templates use a single
 * screenshot covering the entire 2W canvas — there's no per-half slot, the
 * image is sliced down the middle at export time.
 */
export default function SlidePreview({
  slide,
  scale: scaleProp,
  className = '',
  onClick,
  editable = false,
  onScreenshotChange,
  selectedLayerId = null,
  onLayerSelect,
  onLayerPointerDown,
  onLayerResizePointerDown,
  onCanvasBackgroundClick,
  onAddTextAt,
  onAddImageAt,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [measuredScale, setMeasuredScale] = useState(0.2);
  const [isDragging, setIsDragging] = useState(false);

  const logicalWidth = RENDER_WIDTH;
  const logicalHeight = RENDER_HEIGHT;
  const hasScreenshot = !!slide.screenshotUrl;

  // Prefer parent-supplied scale (deterministic). Only measure when omitted.
  const scale = scaleProp ?? measuredScale;
  const useMeasurement = scaleProp === undefined;

  useEffect(() => {
    if (!useMeasurement) return;
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const sx = rect.width / logicalWidth;
      const sy = rect.height / logicalHeight;
      setMeasuredScale(Math.min(sx, sy));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [logicalWidth, logicalHeight, useMeasurement]);

  const handleClick = (e: React.MouseEvent) => {
    if (!editable) {
      onClick?.();
      return;
    }

    const target = e.target as HTMLElement;

    // Click on a layer → ignore here (LayerRenderer handles its own clicks).
    if (target.closest('[data-layer-id]')) return;

    // Click on the phone / panorama image region → open file picker.
    if (target.closest('[data-phone-region]')) {
      fileInputRef.current?.click();
      return;
    }

    // Empty-state slide (no screenshot yet, no phone region rendered) →
    // the whole canvas acts as the upload zone so the user has somewhere
    // obvious to click.
    if (!hasScreenshot) {
      fileInputRef.current?.click();
      return;
    }

    // Click on empty background of an already-populated slide → just
    // clear selection (handled via onCanvasBackgroundClick wired through
    // LayerRenderer). No panel auto-opens.
    onCanvasBackgroundClick?.();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    onScreenshotChange?.(f);
    e.target.value = '';
  };

  /** Convert a pointer event to canvas coordinates (logical pixels). */
  const eventToCanvasPos = (e: React.MouseEvent | React.DragEvent): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!editable) return;

    // Toolbar text-tool drag → add text layer at drop position
    if (e.dataTransfer.types.includes('application/x-add-text')) {
      const { x, y } = eventToCanvasPos(e);
      onAddTextAt?.(x, y);
      return;
    }

    // Toolbar image-tool drag → file picker handled in toolbar
    if (e.dataTransfer.types.includes('application/x-add-image')) {
      return;
    }

    // File drop with image → replace this slide's screenshot
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    onScreenshotChange?.(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!editable) return;
    e.preventDefault();
    setIsDragging(true);
  };

  /** Double-click on empty canvas → add text at click position (Figma pattern). */
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!editable || !onAddTextAt) return;
    if ((e.target as HTMLElement).closest('[data-layer-id]')) return;
    const { x, y } = eventToCanvasPos(e);
    onAddTextAt(x, y);
  };

  const cursorClass = editable ? 'cursor-pointer' : onClick ? 'cursor-pointer' : '';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-zinc-900 w-full h-full ${cursorClass} ${className}`}
      // No aspectRatio here on purpose — the parent is expected to set explicit
      // width + aspectRatio. Keeping aspectRatio here too caused flex children
      // to fall back to the intrinsic 1320px content width, which made tiles
      // overflow into neighbouring slides.
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
    >
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* Scaled slide content */}
      <div
        style={{
          width: `${logicalWidth}px`,
          height: `${logicalHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <TemplateRenderer
          slide={slide}
          canvasWidth={RENDER_WIDTH}
          canvasHeight={RENDER_HEIGHT}
        />
        {slide.layers.length > 0 && (
          <LayerRenderer
            layers={slide.layers}
            selectedId={selectedLayerId}
            interactive={editable}
            onSelect={onLayerSelect}
            onPointerDown={(id, e) => onLayerPointerDown?.(id, e, scale)}
            onResizePointerDown={(id, e, dir) => onLayerResizePointerDown?.(id, e, dir, scale)}
            onBackgroundClick={onCanvasBackgroundClick}
          />
        )}
      </div>

      {/* Editable overlay — empty-state CTA + drag highlight. */}
      {editable && (
        <UploadOverlay
          hasScreenshot={hasScreenshot}
          isDragging={isDragging}
        />
      )}
    </div>
  );
}

function UploadOverlay({
  hasScreenshot,
  isDragging,
}: {
  hasScreenshot: boolean;
  isDragging: boolean;
}) {
  // Filled state: subtle hover-to-replace hint.
  if (hasScreenshot && !isDragging) {
    return (
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none flex items-end justify-center pb-6">
        <div className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-xl">
          Click to replace
        </div>
      </div>
    );
  }

  // Empty state or dragging: prominent CTA.
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all ${
        isDragging
          ? 'bg-accent/30 border-2 border-dashed border-accent backdrop-blur-sm'
          : !hasScreenshot
            ? 'bg-black/50 backdrop-blur-[2px]'
            : ''
      }`}
    >
      {!hasScreenshot && (
        <div className="text-center px-4 pointer-events-none">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/30 backdrop-blur-md border border-accent/50 flex items-center justify-center mb-3 shadow-2xl">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-white text-sm font-display font-bold mb-1 drop-shadow-lg">
            Click or drop screenshot
          </p>
          <p className="text-white/70 text-xs drop-shadow-md max-w-[260px]">
            PNG, JPEG, or WebP — iPhone resolution recommended
          </p>
        </div>
      )}
    </div>
  );
}
