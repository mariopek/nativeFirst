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
 * Hero Benefit — the conversion-tested classic.
 * Big headline at top, phone centered at bottom.
 *
 * Use for: slide #1, your main app benefit.
 */
export default function HeroBenefit({ slide, theme, canvasWidth: W, canvasHeight: H }: Props) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <Background theme={theme} override={slide.customBackground} />

      {/* Caption — top center */}
      <div
        className="absolute"
        style={{
          left: `${W * 0.07}px`,
          right: `${W * 0.07}px`,
          top: `${H * 0.08}px`,
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
        />
      </div>

      {/* Phone — centered, bottom-anchored, mostly visible */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: `${H * -0.06}px`,
          transform: 'translateX(-50%)',
          width: `${W * 0.85}px`,
        }}
      >
        <Phone src={slide.screenshotUrl} alt={slide.headline} width="100%" />
      </div>
    </div>
  );
}
