import {
  getFontStack,
  type Layer,
  type TextLayer,
  type ImageLayer,
} from '../../../lib/app-store-screenshot-types';

/**
 * Direction of a resize handle. Names follow compass convention so the math
 * in the parent's resize handler can derive Δx/Δy meaning from the string.
 *   nw n ne
 *    w     e
 *   sw s se
 */
export type ResizeHandleDir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface Props {
  layers: Layer[];
  /** ID of the currently selected layer (renders selection outline) */
  selectedId?: string | null;
  /** When true, layers receive interactive event handlers (drag-to-move). */
  interactive?: boolean;
  /** Click handler for layer selection. */
  onSelect?: (id: string) => void;
  /** Pointer-down handler used to start a drag. Receives layer + initial pointer event. */
  onPointerDown?: (id: string, e: React.PointerEvent) => void;
  /** Pointer-down handler used to start a resize. Receives the handle direction. */
  onResizePointerDown?: (id: string, e: React.PointerEvent, dir: ResizeHandleDir) => void;
  /** Click on empty area = deselect */
  onBackgroundClick?: () => void;
}

/**
 * Renders the array of custom text + image layers stacked on top of a slide template.
 * Used by SlidePreview both for the editor canvas and the offscreen export buffer.
 *
 * In editor mode (interactive=true), each layer is wrapped in a clickable + draggable
 * surface. Selected layers get resize handles (corners for images, side edges for
 * text). In export mode, layers render as static visuals with no event handlers
 * (so html-to-image snapshots them clean).
 */
export default function LayerRenderer({
  layers,
  selectedId,
  interactive = false,
  onSelect,
  onPointerDown,
  onResizePointerDown,
  onBackgroundClick,
}: Props) {
  return (
    <div
      className="absolute inset-0 z-20"
      onClick={(e) => {
        // Click on background (not a layer) = deselect
        if (interactive && e.target === e.currentTarget) {
          onBackgroundClick?.();
        }
      }}
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
    >
      {layers.map((layer) => {
        const isSelected = layer.id === selectedId;
        return (
          <div
            key={layer.id}
            data-layer-id={layer.id}
            onClick={(e) => {
              if (!interactive) return;
              e.stopPropagation();
              onSelect?.(layer.id);
            }}
            onPointerDown={(e) => {
              if (!interactive || layer.locked) return;
              // Don't start a drag when the pointer lands on a resize handle.
              if ((e.target as HTMLElement).closest('[data-resize-handle]')) return;
              e.stopPropagation();
              onPointerDown?.(layer.id, e);
            }}
            style={{
              position: 'absolute',
              left: `${layer.x}px`,
              top: `${layer.y}px`,
              width: `${layer.width}px`,
              height: layer.height > 0 ? `${layer.height}px` : 'auto',
              transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
              opacity: layer.opacity ?? 1,
              cursor: interactive ? (layer.locked ? 'not-allowed' : 'move') : 'default',
              outline: isSelected && interactive ? '2px solid #FF6E00' : undefined,
              outlineOffset: isSelected && interactive ? '4px' : undefined,
              userSelect: 'none',
            }}
          >
            {layer.kind === 'text' ? (
              <TextLayerView layer={layer} />
            ) : (
              <ImageLayerView layer={layer} />
            )}

            {/* Resize handles — only when selected, in editor mode, not locked.
                Image layers get corner handles (aspect-locked resize). Text
                layers get east/west edge handles (width only — height is
                auto-derived from the wrapped text content). */}
            {isSelected && interactive && !layer.locked && (
              <>
                {layer.kind === 'image' ? (
                  <>
                    <ResizeHandle dir="nw" onPointerDown={(e) => onResizePointerDown?.(layer.id, e, 'nw')} />
                    <ResizeHandle dir="ne" onPointerDown={(e) => onResizePointerDown?.(layer.id, e, 'ne')} />
                    <ResizeHandle dir="se" onPointerDown={(e) => onResizePointerDown?.(layer.id, e, 'se')} />
                    <ResizeHandle dir="sw" onPointerDown={(e) => onResizePointerDown?.(layer.id, e, 'sw')} />
                  </>
                ) : (
                  <>
                    <ResizeHandle dir="e" onPointerDown={(e) => onResizePointerDown?.(layer.id, e, 'e')} />
                    <ResizeHandle dir="w" onPointerDown={(e) => onResizePointerDown?.(layer.id, e, 'w')} />
                  </>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * One resize grab-handle. Sized in canvas px (the parent canvas is scaled, so
 * 80px ≈ 16px on screen at typical scale). Big enough to grab, small enough
 * not to overwhelm the layer.
 */
function ResizeHandle({
  dir,
  onPointerDown,
}: {
  dir: ResizeHandleDir;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  // Position the handle on the matching edge/corner.
  const SIZE = 80; // canvas px
  const HALF = SIZE / 2;
  const pos: React.CSSProperties = {
    position: 'absolute',
    width: `${SIZE}px`,
    height: `${SIZE}px`,
    background: '#FFFFFF',
    border: '12px solid #FF6E00',
    borderRadius: '50%',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    boxSizing: 'border-box',
    zIndex: 30,
  };

  // Center the handle over the corner / edge midpoint.
  switch (dir) {
    case 'nw': pos.left = `-${HALF}px`; pos.top = `-${HALF}px`; pos.cursor = 'nwse-resize'; break;
    case 'n':  pos.left = `calc(50% - ${HALF}px)`; pos.top = `-${HALF}px`; pos.cursor = 'ns-resize'; break;
    case 'ne': pos.right = `-${HALF}px`; pos.top = `-${HALF}px`; pos.cursor = 'nesw-resize'; break;
    case 'e':  pos.right = `-${HALF}px`; pos.top = `calc(50% - ${HALF}px)`; pos.cursor = 'ew-resize'; break;
    case 'se': pos.right = `-${HALF}px`; pos.bottom = `-${HALF}px`; pos.cursor = 'nwse-resize'; break;
    case 's':  pos.left = `calc(50% - ${HALF}px)`; pos.bottom = `-${HALF}px`; pos.cursor = 'ns-resize'; break;
    case 'sw': pos.left = `-${HALF}px`; pos.bottom = `-${HALF}px`; pos.cursor = 'nesw-resize'; break;
    case 'w':  pos.left = `-${HALF}px`; pos.top = `calc(50% - ${HALF}px)`; pos.cursor = 'ew-resize'; break;
  }

  return (
    <div
      data-resize-handle={dir}
      style={pos}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown(e);
      }}
    />
  );
}

function TextLayerView({ layer }: { layer: TextLayer }) {
  return (
    <div
      style={{
        fontFamily: getFontStack(layer.fontFamily),
        fontSize: `${layer.fontSize}px`,
        fontWeight: layer.fontWeight,
        color: layer.color,
        textAlign: layer.align,
        lineHeight: layer.lineHeight,
        letterSpacing: `${layer.letterSpacing}px`,
        textTransform: layer.uppercase ? 'uppercase' : undefined,
        textShadow: layer.shadow ? '0 4px 30px rgba(0,0,0,0.45)' : undefined,
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        width: '100%',
      }}
    >
      {layer.content}
    </div>
  );
}

function ImageLayerView({ layer }: { layer: ImageLayer }) {
  return (
    <img
      src={layer.src}
      alt=""
      draggable={false}
      crossOrigin="anonymous"
      style={{
        width: '100%',
        height: '100%',
        objectFit: layer.fit,
        borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
        filter: layer.shadow ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' : undefined,
        pointerEvents: 'none', // let parent handle clicks/drags
      }}
    />
  );
}
