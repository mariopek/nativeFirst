import { useState, useEffect, useRef } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import {
  FONT_FAMILIES,
  type TextLayer,
} from '../../../lib/app-store-screenshot-types';

interface Props {
  layer: TextLayer;
  /** Anchor rect of the layer in screen coordinates (used to position popup nearby) */
  anchorRect: { left: number; top: number; width: number; height: number };
  onUpdate: (patch: Partial<TextLayer>) => void;
  onClose: () => void;
  /** Open the full sidebar properties panel for power-user editing. */
  onOpenFullEdit: () => void;
  onDelete: () => void;
}

/**
 * Floating "quick toolbar" that appears next to a selected text layer.
 * Provides the most-used controls (size slider, font, color) without
 * forcing the user to scan the sidebar. Power-user controls (line height,
 * letter spacing, position, rotation) live in the full sidebar panel —
 * accessible via the "More" button.
 *
 * Anchored to the layer's screen position; auto-flips above/below to
 * stay within the viewport.
 */
export default function FloatingTextToolbar({
  layer,
  anchorRect,
  onUpdate,
  onClose,
  onOpenFullEdit,
  onDelete,
}: Props) {
  const [showColor, setShowColor] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const POPUP_WIDTH = 320;
  const POPUP_HEIGHT = showColor ? 360 : 200;

  // Compute popup position — prefer below the layer, flip above if no room
  const [position, setPosition] = useState<{ left: number; top: number }>(() => ({
    left: 0,
    top: 0,
  }));

  useEffect(() => {
    const padding = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = anchorRect.left + anchorRect.width / 2 - POPUP_WIDTH / 2;
    left = Math.max(padding, Math.min(left, vw - POPUP_WIDTH - padding));

    let top = anchorRect.top + anchorRect.height + 12;
    if (top + POPUP_HEIGHT > vh - padding) {
      // Not enough room below → place above the layer
      top = anchorRect.top - POPUP_HEIGHT - 12;
    }
    top = Math.max(padding, top);

    setPosition({ left, top });
  }, [anchorRect, POPUP_HEIGHT]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        // Don't close if clicking inside the original layer (handled by select logic)
        // Just close on any other outside click
        onClose();
      }
    };
    // Defer attachment to avoid catching the same click that opened us
    const t = setTimeout(() => window.addEventListener('mousedown', onMouseDown), 0);
    return () => {
      clearTimeout(t);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="fixed z-[100] rounded-xl border border-border bg-surface shadow-2xl shadow-black/60 backdrop-blur-md"
      style={{
        left: position.left,
        top: position.top,
        width: POPUP_WIDTH,
      }}
    >
      <div className="p-3 space-y-3">
        {/* Header — quick actions */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border">
          <span className="text-[14px] uppercase tracking-wider font-bold text-accent">
            Text · quick edit
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenFullEdit}
              type="button"
              title="Open full properties panel"
              className="text-[14px] px-1.5 py-0.5 rounded text-text-muted hover:text-white hover:bg-bg transition-colors font-semibold"
            >
              More
            </button>
            <button
              onClick={onDelete}
              type="button"
              title="Delete layer"
              className="text-[14px] px-1.5 py-0.5 rounded text-red-400 hover:bg-red-500/10 transition-colors font-semibold"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              type="button"
              title="Close (Esc)"
              className="text-[14px] w-5 h-5 flex items-center justify-center rounded text-text-muted hover:text-white hover:bg-bg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Font family dropdown */}
        <div>
          <Label>Font</Label>
          <select
            value={layer.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full appearance-none px-2.5 py-1.5 pr-7 rounded-md bg-bg border border-border text-white text-xs focus:outline-none focus:border-accent transition-colors cursor-pointer"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Size slider + numeric input */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>Size</Label>
            <span className="text-[14px] font-mono text-text-muted">{Math.round(layer.fontSize)}px</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="12"
              max="240"
              value={layer.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
              className="flex-1 brand-slider"
            />
            <FontSizeInput
              value={Math.round(layer.fontSize)}
              onChange={(v) => onUpdate({ fontSize: v })}
              min={8}
            />
          </div>
        </div>

        {/* Weight + Align row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Weight</Label>
            <select
              value={layer.fontWeight}
              onChange={(e) => onUpdate({ fontWeight: parseInt(e.target.value) })}
              className="w-full appearance-none px-2.5 py-1.5 pr-7 rounded-md bg-bg border border-border text-white text-xs focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              <option value={300}>Light</option>
              <option value={400}>Regular</option>
              <option value={500}>Medium</option>
              <option value={600}>Semibold</option>
              <option value={700}>Bold</option>
              <option value={800}>Extra Bold</option>
              <option value={900}>Black</option>
            </select>
          </div>
          <div>
            <Label>Align</Label>
            <div className="grid grid-cols-3 gap-0.5">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => onUpdate({ align: a })}
                  className={`py-1 rounded-md text-[14px] font-bold transition-colors border ${
                    layer.align === a
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-bg text-text-muted hover:text-white'
                  }`}
                  title={a}
                >
                  {a === 'left' ? '⫷' : a === 'center' ? '☰' : '⫸'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Color */}
        <div>
          <Label>Color</Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowColor((v) => !v)}
              className="w-9 h-9 rounded-md border-2 border-border flex-shrink-0 cursor-pointer"
              style={{ backgroundColor: layer.color }}
              title="Toggle color picker"
            />
            <HexColorInput
              color={layer.color}
              onChange={(c) => onUpdate({ color: c })}
              prefixed
              className="flex-1 px-2.5 py-2 rounded-md bg-bg border border-border text-white text-xs font-mono focus:outline-none focus:border-accent transition-colors uppercase"
            />
          </div>
          {showColor && (
            <div className="mt-2 p-2 rounded-md border border-border bg-bg">
              <HexColorPicker
                color={layer.color}
                onChange={(c) => onUpdate({ color: c })}
                style={{ width: '100%', height: 140 }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[13px] uppercase tracking-wider font-bold text-text-muted/80 mb-1">
      {children}
    </div>
  );
}

/**
 * Free-typing number input — same pattern as LayerPropertiesPanel's NumInput.
 * Allows the user to clear the field while typing without it snapping back
 * to the minimum on every keystroke.
 */
function FontSizeInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const [text, setText] = useState<string>(() => String(value));

  useEffect(() => {
    const parsed = parseFloat(text);
    if (Number.isFinite(parsed) && parsed === value) return;
    setText(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return;
    let clamped = n;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    onChange(clamped);
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        commit(e.target.value);
      }}
      onBlur={() => {
        const n = parseFloat(text);
        if (!Number.isFinite(n)) {
          setText(String(value));
          return;
        }
        let clamped = n;
        if (min !== undefined) clamped = Math.max(min, clamped);
        if (max !== undefined) clamped = Math.min(max, clamped);
        setText(String(clamped));
        if (clamped !== value) onChange(clamped);
      }}
      className="w-16 px-2 py-1 rounded-md bg-bg border border-border text-white text-xs font-mono focus:outline-none focus:border-accent transition-colors"
    />
  );
}
