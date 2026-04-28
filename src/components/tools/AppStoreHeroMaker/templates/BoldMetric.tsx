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
 * Bold Metric — massive headline (number, stat, level), phone below.
 * For games, finance apps, social proof, anything with a big number worth shouting.
 *
 * Tip: write headlines like "LEVEL 47", "$2.3M EARNED", "1M+ PHOTOS",
 * "47 DAY STREAK". The bigger and shorter, the better.
 */
export default function BoldMetric({ slide, theme, canvasWidth: W, canvasHeight: H }: Props) {
  // Extra-large hero typography for this template
  const heroSize = W * 0.18;
  const labelSize = W * 0.030;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Background theme={theme} override={slide.customBackground} />

      {/* Optional small label above metric */}
      {slide.label && (
        <div
          className="absolute text-center"
          style={{
            left: 0,
            right: 0,
            top: `${H * 0.07}px`,
          }}
        >
          <span
            style={{
              fontSize: `${labelSize}px`,
              fontWeight: 700,
              color: theme.accentColor,
              textTransform: 'uppercase',
              letterSpacing: `${W * 0.003}px`,
            }}
          >
            {slide.label}
          </span>
        </div>
      )}

      {/* Massive headline — center top */}
      <div
        className="absolute text-center"
        style={{
          left: `${W * 0.04}px`,
          right: `${W * 0.04}px`,
          top: slide.label ? `${H * 0.12}px` : `${H * 0.08}px`,
        }}
      >
        <div
          style={{
            fontSize: `${heroSize}px`,
            fontWeight: 900,
            color: theme.textColor,
            lineHeight: 0.95,
            letterSpacing: `${W * -0.005}px`,
            textTransform: 'uppercase',
            whiteSpace: 'pre-wrap',
          }}
        >
          {slide.headline}
        </div>
      </div>

      {/* Phone — center bottom */}
      <div
        className="absolute"
        style={{
          left: '50%',
          bottom: `${H * -0.05}px`,
          transform: 'translateX(-50%)',
          width: `${W * 0.78}px`,
        }}
      >
        <Phone src={slide.screenshotUrl} alt={slide.headline} width="100%" />
      </div>
    </div>
  );
}
