import { IPHONE_MOCKUP } from '../../../lib/app-store-screenshot-types';

interface Props {
  /** Source URL or data URL of the screenshot to render inside the device. */
  src: string | null;
  alt?: string;
  /** Width as a CSS value (e.g. "82%", "600px"). Height auto from aspect ratio. */
  width?: string;
  /** Optional CSS rotation, e.g. "-3deg" */
  rotate?: string;
  /** Optional drop shadow toggle (default: true) */
  shadow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * iPhone mockup with a screenshot rendered inside the screen area.
 * Uses pre-measured coordinates from the skill's mockup.png.
 *
 * Pure HTML/CSS — html-to-image can serialize this faithfully.
 */
export default function Phone({
  src,
  alt = 'App screenshot',
  width = '100%',
  rotate,
  shadow = true,
  className = '',
  style,
}: Props) {
  const aspectRatio = `${IPHONE_MOCKUP.imageWidth} / ${IPHONE_MOCKUP.imageHeight}`;
  const transform = rotate ? `rotate(${rotate})` : undefined;

  return (
    <div
      className={`relative ${className}`}
      // The data-* attribute is the click-target marker. SlidePreview's click
      // handler walks up from the click target to detect "did the user click
      // on the phone region?" — if yes, it opens the file picker; if no, the
      // click just selects the slide. Lets us keep the phone clickable for
      // upload without making the entire canvas a giant upload zone.
      data-phone-region="1"
      style={{
        width,
        aspectRatio,
        transform,
        filter: shadow ? 'drop-shadow(0 40px 60px rgba(0,0,0,0.35))' : undefined,
        ...style,
      }}
    >
      {/* iPhone frame — base layer, fills the container */}
      <img
        src={IPHONE_MOCKUP.imageUrl}
        alt=""
        className="block w-full h-full pointer-events-none"
        draggable={false}
        crossOrigin="anonymous"
      />

      {/* Screenshot positioned over the screen cutout via z-10 so it sits in front of the bezel area */}
      <div
        className="absolute overflow-hidden z-10"
        style={{
          left: `${IPHONE_MOCKUP.screenLeftPct * 100}%`,
          top: `${IPHONE_MOCKUP.screenTopPct * 100}%`,
          width: `${IPHONE_MOCKUP.screenWidthPct * 100}%`,
          height: `${IPHONE_MOCKUP.screenHeightPct * 100}%`,
          borderRadius: `${IPHONE_MOCKUP.screenBorderRadiusXPct * 100}% / ${IPHONE_MOCKUP.screenBorderRadiusYPct * 100}%`,
          background: '#000',
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="block w-full h-full"
            style={{ objectFit: 'cover', objectPosition: 'top' }}
            draggable={false}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-[8px]">
            screenshot
          </div>
        )}
      </div>
    </div>
  );
}
