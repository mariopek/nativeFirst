import HeroBenefit from './templates/HeroBenefit';
import SplitScreen from './templates/SplitScreen';
import BoldMetric from './templates/BoldMetric';
import LiquidGlassHero from './templates/LiquidGlassHero';
import { getTheme, type SlideState } from '../../../lib/app-store-screenshot-types';

interface Props {
  slide: SlideState;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Dispatches to the right template component based on slide.templateId.
 * One place to wire up new templates.
 */
export default function TemplateRenderer({
  slide,
  canvasWidth,
  canvasHeight,
}: Props) {
  const theme = getTheme(slide.themeId);

  switch (slide.templateId) {
    case 'hero-benefit':
      return <HeroBenefit slide={slide} theme={theme} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />;
    case 'split-screen':
      return <SplitScreen slide={slide} theme={theme} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />;
    case 'bold-metric':
      return <BoldMetric slide={slide} theme={theme} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />;
    case 'liquid-glass-hero':
      return <LiquidGlassHero slide={slide} theme={theme} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />;
    default:
      return <HeroBenefit slide={slide} theme={theme} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />;
  }
}
