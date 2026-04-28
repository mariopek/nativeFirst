interface Props {
  src: string | null;
  alt?: string;
  width?: string;
  rotate?: string;
  shadow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * iPad mockup — CSS-only frame (no PNG asset needed).
 * Aspect ratio 770/1000 so the inner screen area matches iPad's 3:4.
 *
 * Reference: skill recipe (app-store-screenshots), CSS-only iPad section.
 */
export default function IPad({
  src,
  alt = 'iPad screenshot',
  width = '100%',
  rotate,
  shadow = true,
  className = '',
  style,
}: Props) {
  const transform = rotate ? `rotate(${rotate})` : undefined;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        aspectRatio: '770 / 1000',
        transform,
        ...style,
      }}
    >
      {/* iPad frame */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '5% / 3.6%',
          background: 'linear-gradient(180deg, #2C2C2E 0%, #1C1C1E 100%)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: shadow
            ? 'inset 0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.6)'
            : 'inset 0 0 0 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Front camera dot */}
        <div
          style={{
            position: 'absolute',
            top: '1.2%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0.9%',
            height: '0.65%',
            borderRadius: '50%',
            background: '#111113',
            border: '1px solid rgba(255,255,255,0.08)',
            zIndex: 20,
          }}
        />
        {/* Bezel highlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '5% / 3.6%',
            border: '1px solid rgba(255,255,255,0.06)',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        />
        {/* Screen area */}
        <div
          style={{
            position: 'absolute',
            left: '4%',
            top: '2.8%',
            width: '92%',
            height: '94.4%',
            borderRadius: '2.2% / 1.6%',
            overflow: 'hidden',
            background: '#000',
          }}
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
              }}
              draggable={false}
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 text-xs">
              (Drop a screenshot)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
