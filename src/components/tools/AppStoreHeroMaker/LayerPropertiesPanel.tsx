import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useState, useEffect } from 'react';
import {
  FONT_FAMILIES,
  type Layer,
  type TextLayer,
  type ImageLayer,
} from '../../../lib/app-store-screenshot-types';

// ── Collapsible section helper ──────────────────────────────────

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-bg/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-[13px] uppercase tracking-wider font-bold text-text-muted hover:text-white transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-3 pb-3 pt-1 space-y-3">{children}</div>}
    </div>
  );
}

interface Props {
  layer: Layer;
  /** Patch the layer in place. */
  onUpdate: (patch: Partial<Layer>) => void;
  onDelete: () => void;
  onClose: () => void;
  /** Logical canvas width (so we know the natural max for inputs). */
  canvasWidth: number;
}

/**
 * Properties panel for the currently selected layer.
 * Shows different fields for text vs image, but they share the
 * common Position / Opacity / Rotation block at the bottom.
 */
export default function LayerPropertiesPanel({
  layer,
  onUpdate,
  onDelete,
  onClose,
  canvasWidth,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-[13px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
            {layer.kind === 'text' ? 'Text Layer' : 'Image Layer'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onDelete}
            type="button"
            className="text-[12px] px-2 py-1 rounded-md border border-border bg-bg text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors font-semibold"
            title="Delete layer"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            type="button"
            className="text-[12px] px-2 py-1 rounded-md border border-border bg-bg text-text-muted hover:text-white transition-colors"
            title="Close (deselect)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Type-specific fields */}
      {layer.kind === 'text' ? (
        <TextLayerFields layer={layer} onUpdate={onUpdate as (p: Partial<TextLayer>) => void} />
      ) : (
        <ImageLayerFields layer={layer} onUpdate={onUpdate as (p: Partial<ImageLayer>) => void} canvasWidth={canvasWidth} />
      )}

      {/* Common: Position + size */}
      <CommonPositionFields layer={layer} onUpdate={onUpdate} canvasWidth={canvasWidth} />
    </div>
  );
}

// ── Text layer fields ────────────────────────────────────────────

function TextLayerFields({
  layer,
  onUpdate,
}: {
  layer: TextLayer;
  onUpdate: (p: Partial<TextLayer>) => void;
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="space-y-3">
      {/* Text content — always visible at top, no collapsible wrapper */}
      <textarea
        value={layer.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        rows={2}
        className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-white text-sm focus:outline-none focus:border-accent resize-y transition-colors"
        placeholder="Type something…"
      />

      {/* Typography (Font + Size + Weight) */}
      <Section title="Typography">
        <div>
          <Label>Font</Label>
          <SelectInput
            value={layer.fontFamily}
            onChange={(v) => onUpdate({ fontFamily: v })}
            options={FONT_FAMILIES.map((f) => ({ value: f.id, label: f.label }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Size</Label>
            <NumInput
              value={Math.round(layer.fontSize)}
              onChange={(v) => onUpdate({ fontSize: Math.max(8, v) })}
            />
          </div>
          <div>
            <Label>Weight</Label>
            <SelectInput
              value={String(layer.fontWeight)}
              onChange={(v) => onUpdate({ fontWeight: parseInt(v) })}
              options={[
                { value: '300', label: 'Light' },
                { value: '400', label: 'Regular' },
                { value: '500', label: 'Medium' },
                { value: '600', label: 'Semibold' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Extra Bold' },
                { value: '900', label: 'Black' },
              ]}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Line ht</Label>
            <NumInput
              step={0.05}
              value={layer.lineHeight}
              onChange={(v) => onUpdate({ lineHeight: Math.max(0.5, v) })}
            />
          </div>
          <div>
            <Label>Spacing</Label>
            <NumInput
              value={layer.letterSpacing}
              onChange={(v) => onUpdate({ letterSpacing: v })}
            />
          </div>
        </div>
      </Section>

      {/* Color */}
      <Section title="Color">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowColorPicker((v) => !v)}
            className="w-9 h-9 rounded-md border-2 border-border flex-shrink-0 cursor-pointer"
            style={{ backgroundColor: layer.color }}
            title="Toggle color picker"
          />
          <HexColorInput
            color={layer.color}
            onChange={(c) => onUpdate({ color: c })}
            prefixed
            className="flex-1 px-2.5 py-2 rounded-md bg-bg border border-border text-white text-[12px] font-mono focus:outline-none focus:border-accent transition-colors uppercase"
          />
        </div>
        {showColorPicker && (
          <div className="mt-2 p-2 rounded-md border border-border bg-bg">
            <HexColorPicker color={layer.color} onChange={(c) => onUpdate({ color: c })} style={{ width: '100%', height: 120 }} />
          </div>
        )}
      </Section>

      {/* Alignment + Style */}
      <Section title="Alignment & Style">
        <div>
          <Label>Align</Label>
          <div className="grid grid-cols-3 gap-1">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onUpdate({ align: a })}
                className={`py-1.5 rounded-md text-[12px] font-semibold transition-colors border capitalize ${
                  layer.align === a
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-bg text-text-muted hover:text-white'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Toggle label="UPPERCASE" active={!!layer.uppercase} onClick={() => onUpdate({ uppercase: !layer.uppercase })} />
          <Toggle label="Shadow" active={!!layer.shadow} onClick={() => onUpdate({ shadow: !layer.shadow })} />
        </div>
      </Section>
    </div>
  );
}

// ── Compact input primitives (used by collapsed sections) ────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] uppercase tracking-wider font-semibold text-text-muted/80 mb-1">
      {children}
    </div>
  );
}

/**
 * Number input that lets the user type freely — including transient invalid
 * states like "" while clearing the field — instead of snapping back to the
 * minimum on every keystroke.
 *
 * Two-tier model:
 *   - Local string `text` mirrors what's in the input box. Free-form, no
 *     mid-edit clamping. So the user can blank it and retype.
 *   - The committed numeric value is only sent to the parent when the text
 *     parses to a finite number. On blur we clamp + sync the display so the
 *     field always lands on a valid value.
 *
 * This fixes the "can't delete the last digit" bug — `parseFloat("") || 0`
 * was instantly setting the value back to the minimum, making the field
 * appear non-editable.
 */
function NumInput({
  value,
  onChange,
  step,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  const [text, setText] = useState<string>(() => String(value));

  // External value changed (e.g. drag updated x/y) — refresh display.
  // Skip if the user is mid-edit on a value that already parses to the
  // same number (avoids clobbering "1." while they're typing "1.5").
  useEffect(() => {
    const parsed = parseFloat(text);
    if (Number.isFinite(parsed) && parsed === value) return;
    setText(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return; // empty / "-" / "." → don't commit yet
    let clamped = n;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    onChange(clamped);
  };

  return (
    <input
      type="number"
      value={text}
      step={step}
      min={min}
      max={max}
      onChange={(e) => {
        setText(e.target.value);
        commit(e.target.value);
      }}
      onBlur={() => {
        const n = parseFloat(text);
        if (!Number.isFinite(n)) {
          // Empty / invalid on blur → revert to last good external value.
          setText(String(value));
          return;
        }
        let clamped = n;
        if (min !== undefined) clamped = Math.max(min, clamped);
        if (max !== undefined) clamped = Math.min(max, clamped);
        setText(String(clamped));
        if (clamped !== value) onChange(clamped);
      }}
      className="w-full px-2.5 py-1.5 rounded-md bg-bg border border-border text-white text-[12px] focus:outline-none focus:border-accent transition-colors"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-2.5 py-1.5 pr-7 rounded-md bg-bg border border-border text-white text-[12px] focus:outline-none focus:border-accent transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </div>
  );
}

// ── Image layer fields ──────────────────────────────────────────

function ImageLayerFields({
  layer,
  onUpdate,
}: {
  layer: ImageLayer;
  onUpdate: (p: Partial<ImageLayer>) => void;
  canvasWidth?: number;
}) {
  return (
    <div className="space-y-3">
      {/* Compact thumbnail + name row at top — no big preview */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-bg/50">
        <div
          className="w-12 h-12 rounded-md border border-border bg-bg overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{ checkerboard: 'true' }}
        >
          <img src={layer.src} alt="" className="max-w-full max-h-full block" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-white truncate">Image layer</p>
          <p className="text-[13px] text-text-muted/70">
            {Math.round(layer.width)} × {Math.round(layer.height)}px
          </p>
        </div>
      </div>

      <Section title="Display">
        <div>
          <Label>Fit</Label>
          <div className="grid grid-cols-2 gap-1">
            {(['contain', 'cover'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onUpdate({ fit: f })}
                className={`py-1.5 rounded-md text-[12px] font-semibold transition-colors border capitalize ${
                  layer.fit === f
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-bg text-text-muted hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Border radius (px)</Label>
          <NumInput
            value={layer.borderRadius || 0}
            min={0}
            onChange={(v) => onUpdate({ borderRadius: Math.max(0, v) })}
          />
        </div>
        <Toggle
          label="Drop shadow"
          active={!!layer.shadow}
          onClick={() => onUpdate({ shadow: !layer.shadow })}
        />
      </Section>
    </div>
  );
}

// ── Common position + size ─────────────────────────────────────

function CommonPositionFields({
  layer,
  onUpdate,
  canvasWidth,
}: {
  layer: Layer;
  onUpdate: (p: Partial<Layer>) => void;
  canvasWidth: number;
}) {
  return (
    <Section title="Position & Size" defaultOpen={false}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>X</Label>
          <NumInput value={Math.round(layer.x)} onChange={(v) => onUpdate({ x: v })} />
        </div>
        <div>
          <Label>Y</Label>
          <NumInput value={Math.round(layer.y)} onChange={(v) => onUpdate({ y: v })} />
        </div>
        <div>
          <Label>Width</Label>
          <NumInput
            value={Math.round(layer.width)}
            onChange={(v) => onUpdate({ width: Math.max(20, v) })}
          />
        </div>
        <div>
          <Label>Height</Label>
          <NumInput
            value={Math.round(layer.height)}
            onChange={(v) => onUpdate({ height: Math.max(0, v) })}
          />
        </div>
        <div>
          <Label>Rotation°</Label>
          <NumInput
            value={layer.rotation || 0}
            onChange={(v) => onUpdate({ rotation: v })}
          />
        </div>
        <div>
          <Label>Opacity</Label>
          <NumInput
            min={0}
            max={1}
            step={0.05}
            value={layer.opacity ?? 1}
            onChange={(v) => onUpdate({ opacity: Math.min(1, Math.max(0, v)) })}
          />
        </div>
      </div>
      <Toggle
        label={layer.locked ? 'Locked' : 'Lock position'}
        active={!!layer.locked}
        onClick={() => onUpdate({ locked: !layer.locked })}
      />
    </Section>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[12px] uppercase tracking-wider font-semibold text-text-muted mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors border ${
        active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-border bg-bg text-text-muted hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
