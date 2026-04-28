import Background from '../Background';
import Caption from '../Caption';
import Phone from '../Phone';
import type { SlideState, Theme } from '../../../../lib/app-store-screenshot-types';

interface Props {
  slide: SlideState;
  theme: Theme;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Liquid Glass Hero — frosted glass caption panel floats over a colorful background.
 *
 * iOS 26 differentiator. Uses CSS backdrop-filter: blur() + saturate() to produce
 * the actual frosted glass effect that mirrors how iOS 26 renders system surfaces.
 * No competing tool ships this aesthetic for App Store screenshots yet.
 */
export default function LiquidGlassHero({
  slide,
  theme,
  canvasWidth: W,
  canvasHeight: H,
}: Props) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Background theme={theme} override={slide.customBackground} decorations={true} />

      {/* Phone — placed FIRST so the frosted caption can sit over it visually */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: `${H * -0.04}px`,
          transform: 'translateX(-50%)',
          width: `${W * 0.86}px`,
        }}
      >
        <Phone src={slide.screenshotUrl} alt={slide.headline} width="100%" />
      </div>

      {/* Frosted glass caption panel — floats over background + top of phone */}
      <div
        className="absolute"
        style={{
          left: `${W * 0.06}px`,
          right: `${W * 0.06}px`,
          top: `${H * 0.06}px`,
        }}
      >
        <Caption
          headline={slide.headline}
          label={slide.label}
          headlineStyle={slide.headlineStyle}
          labelStyle={slide.labelStyle}
          theme={theme}
          canvasWidth={W}
          align="center"
          frosted={true}
        />
      </div>
    </div>
  );
}
