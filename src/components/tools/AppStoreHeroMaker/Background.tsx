import type { BackgroundSpec, Theme } from '../../../lib/app-store-screenshot-types';

interface Props {
  theme: Theme;
  /** Optional override — when set, replaces the theme's default background. */
  override?: BackgroundSpec;
  /** Render decorative blobs over the background. */
  decorations?: boolean;
}

/**
 * Renders a slide background — solid, linear gradient, or radial gradient,
 * plus optional soft decorative blobs from the theme palette.
 *
 * Absolutely positioned, fills the parent (which should be the slide canvas).
 */
export default function Background({ theme, override, decorations = true }: Props) {
  const activeBg = override ?? theme.background;
  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: bgToCss(activeBg) }}
      />
      {decorations && theme.decorations?.blobColors?.map((color, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            // Distribute blobs across the canvas, varying sizes
            width: i === 0 ? '60%' : '50%',
            height: i === 0 ? '60%' : '50%',
            top: i === 0 ? '-15%' : 'auto',
            bottom: i === 1 ? '-10%' : 'auto',
            left: i === 0 ? '-15%' : 'auto',
            right: i === 1 ? '-10%' : 'auto',
            background: color,
          }}
        />
      ))}
    </>
  );
}

export function bgToCss(spec: BackgroundSpec): string {
  switch (spec.kind) {
    case 'solid':
      return spec.color;
    case 'linearGradient':
      return `linear-gradient(${spec.angleDeg}deg, ${spec.colors.join(', ')})`;
    case 'radialGradient':
      return `radial-gradient(circle at ${spec.center[0]}% ${spec.center[1]}%, ${spec.colors.join(', ')})`;
  }
}
