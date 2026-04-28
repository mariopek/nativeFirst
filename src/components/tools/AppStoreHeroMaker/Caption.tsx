import {
  FONT_FAMILIES,
  type Theme,
  type CaptionTextStyle,
} from '../../../lib/app-store-screenshot-types';

interface Props {
  /** Big bold headline (1-3 lines, 3-5 words per line) */
  headline: string;
  /** Optional small label/eyebrow above the headline */
  label?: string;
  theme: Theme;
  /** Canvas width in px — used to compute resolution-independent font sizes */
  canvasWidth: number;
  /** Text alignment within the caption block */
  align?: 'left' | 'center' | 'right';
  /** Frosted glass background for the caption (Liquid Glass aesthetic) */
  frosted?: boolean;
  /** Per-slide typography overrides (font, size, color, weight) */
  headlineStyle?: CaptionTextStyle;
  labelStyle?: CaptionTextStyle;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Caption block — label (small uppercase) + headline (big bold).
 * All sizing relative to canvasWidth so it scales correctly across export sizes.
 *
 * Theme-driven by default. Per-slide `headlineStyle` / `labelStyle` overrides
 * (font/size/color/weight) layer on top so users can dial in a specific look
 * without rebuilding the whole template.
 */
export default function Caption({
  headline,
  label,
  theme,
  canvasWidth: W,
  align = 'left',
  frosted = false,
  headlineStyle,
  labelStyle,
  className = '',
  style,
}: Props) {
  // Resolution-independent typography (per skill recipe). The *Scale fields
  // multiply the base size — keeps proportions correct across export sizes.
  const labelBaseSize = W * 0.026;
  const headlineBaseSize = W * 0.082;
  const labelLetterSpacing = W * 0.002;

  const headlineSize = headlineBaseSize * (headlineStyle?.fontSizeScale ?? 1);
  const labelSize = labelBaseSize * (labelStyle?.fontSizeScale ?? 1);

  const padding = frosted ? `${W * 0.04}px ${W * 0.05}px` : undefined;
  const borderRadius = frosted ? `${W * 0.025}px` : undefined;

  return (
    <div
      className={className}
      style={{
        textAlign: align,
        padding,
        borderRadius,
        background: frosted ? 'rgba(255,255,255,0.12)' : undefined,
        backdropFilter: frosted ? 'blur(40px) saturate(180%)' : undefined,
        WebkitBackdropFilter: frosted ? 'blur(40px) saturate(180%)' : undefined,
        border: frosted ? '1px solid rgba(255,255,255,0.18)' : undefined,
        boxShadow: frosted ? 'inset 0 1px 0 0 rgba(255,255,255,0.18), 0 20px 50px rgba(0,0,0,0.25)' : undefined,
        ...style,
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: resolveFontFamily(labelStyle?.fontFamily),
            fontSize: `${labelSize}px`,
            fontWeight: labelStyle?.fontWeight ?? 700,
            color: labelStyle?.color ?? theme.accentColor,
            textTransform: 'uppercase',
            letterSpacing: `${labelLetterSpacing}px`,
            marginBottom: `${W * 0.018}px`,
            lineHeight: 1,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          fontFamily: resolveFontFamily(headlineStyle?.fontFamily),
          fontSize: `${headlineSize}px`,
          fontWeight: headlineStyle?.fontWeight ?? 800,
          color: headlineStyle?.color ?? theme.textColor,
          lineHeight: 1.05,
          letterSpacing: `${W * -0.001}px`,
          // Preserve user's manual line breaks via white-space
          whiteSpace: 'pre-wrap',
        }}
      >
        {headline}
      </div>
    </div>
  );
}

/**
 * Map a font family id (e.g. 'sf-pro') to its CSS font-family stack.
 * Falls back to undefined (theme default) when the id isn't found, so an
 * empty/unset selection just inherits.
 */
function resolveFontFamily(id: string | undefined): string | undefined {
  if (!id) return undefined;
  return FONT_FAMILIES.find((f) => f.id === id)?.stack;
}
