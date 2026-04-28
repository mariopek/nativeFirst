import Background from '../Background';
import Caption from '../Caption';
import Phone from '../Phone';
import type { SlideState, Theme } from '../../../../lib/app-store-screenshot-types';

interface Props {
  slide: SlideState;
  theme: Theme;
  canvasWidth: number;
  canvasHeight: number;
  /** Phone position. Default 'right'. */
  phoneSide?: 'left' | 'right';
}

/**
 * Split Screen — magazine spread: caption on one side, phone on the other.
 *
 * One screenshot, vertically centered caption, phone bottom-anchored on the
 * opposite side and tilted slightly off the canvas for drama. Use for
 * single-feature explainers where you want both prose and a phone visible.
 */
export default function SplitScreen({
  slide,
  theme,
  canvasWidth: W,
  canvasHeight: H,
  phoneSide = 'right',
}: Props) {
  const captionLeft = phoneSide === 'right';

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Background theme={theme} override={slide.customBackground} />

      {/* Caption — vertically centered, opposite side from phone */}
      <div
        className="absolute"
        style={{
          [captionLeft ? 'left' : 'right']: `${W * 0.07}px`,
          width: `${W * 0.42}px`,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <Caption
          headline={slide.headline}
          label={slide.label}
          headlineStyle={slide.headlineStyle}
          labelStyle={slide.labelStyle}
          theme={theme}
          canvasWidth={W}
          align={captionLeft ? 'left' : 'right'}
        />
      </div>

      {/* Phone — bottom-anchored on chosen side, partially off-screen for
          drama. Width bumped to 80% (was 62%) so the device dominates the
          composition the way the App Store thumbnail expects. */}
      <div
        className="absolute"
        style={{
          [phoneSide]: `${W * -0.12}px`,
          bottom: `${H * 0.04}px`,
          width: `${W * 0.80}px`,
          transform: phoneSide === 'right' ? 'rotate(2deg)' : 'rotate(-2deg)',
        }}
      >
        <Phone src={slide.screenshotUrl} alt={slide.headline} width="100%" />
      </div>
    </div>
  );
}
