/**
 * Export pipeline: html-to-image (snapshot rendered slide DOM) → resize to
 * each target App Store size via Canvas → bundle as ZIP with sortable filenames.
 *
 * Uses the skill's recommended double-call trick: the first toPng() lazy-loads
 * fonts and images; the second produces a clean, complete snapshot. Without
 * this trick, exports occasionally come out blank or with missing assets.
 */

import { toPng } from 'html-to-image';
import {
  RENDER_WIDTH,
  RENDER_HEIGHT,
  type ExportSize,
  type SlideState,
} from '../../../lib/app-store-screenshot-types';

export interface ExportProgress {
  stage: 'preparing' | 'snapshotting' | 'resizing' | 'zipping' | 'done';
  current?: number;
  total?: number;
  label?: string;
}

export interface ExportOptions {
  slides: SlideState[];
  sizes: ExportSize[];
  /** Map of slide ID → DOM element to snapshot at full render size. */
  slideElements: Record<string, HTMLElement>;
  /** Optional progress callback for UI updates. */
  onProgress?: (p: ExportProgress) => void;
  /** Project name used in the ZIP filename. */
  projectName?: string;
}

/**
 * Generate a ZIP containing every slide × every selected export size.
 * Returns the ZIP as a Blob.
 */
export async function exportSlides(opts: ExportOptions): Promise<Blob> {
  const { slides, sizes, slideElements, onProgress } = opts;

  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  onProgress?.({ stage: 'preparing' });

  const totalImages = slides.length * sizes.length;
  let done = 0;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const slideEl = slideElements[slide.id];
    if (!slideEl) continue;

    onProgress?.({ stage: 'snapshotting', current: done, total: totalImages, label: `Slide ${i + 1}` });

    // Snapshot the slide at full render resolution (1320×2868), then resize
    // down to every selected App Store size.
    const snapshotDataUrl = await snapshotElement(slideEl);
    const numericPrefix = String(i + 1).padStart(2, '0');

    for (const size of sizes) {
      const resized = await resizeToBlob(snapshotDataUrl, size.width, size.height);
      const filename = `${numericPrefix}-${slugify(slide.headline)}-${size.id}-${size.width}x${size.height}.png`;
      const folder = zip.folder(size.id);
      folder?.file(filename, resized);
      done++;
      onProgress?.({ stage: 'resizing', current: done, total: totalImages, label: filename });
    }
  }

  onProgress?.({ stage: 'zipping' });

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  onProgress?.({ stage: 'done' });
  return blob;
}

/**
 * Snapshot a slide DOM element to a PNG data URL at its native render size.
 * Uses the double-call trick to ensure fonts + images are fully loaded.
 */
async function snapshotElement(el: HTMLElement): Promise<string> {
  const opts = {
    width: RENDER_WIDTH,
    height: RENDER_HEIGHT,
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: false,
  };

  // First call — warms up fonts & images. Output may be incomplete.
  await toPng(el, opts);

  // Tiny pause to let the browser settle
  await new Promise((r) => setTimeout(r, 100));

  // Second call — produces the clean snapshot we keep.
  const dataUrl = await toPng(el, opts);
  return dataUrl;
}

/**
 * Resize a PNG data URL to the target App Store dimensions, return as Blob.
 * Uses high-quality canvas downsampling.
 */
async function resizeToBlob(dataUrl: string, w: number, h: number): Promise<Blob> {
  const img = await loadDataUrl(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Encode failed.'))),
      'image/png',
      1
    );
  });
}

function loadDataUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load PNG data URL.'));
    img.src = url;
  });
}

/**
 * Convert headline text into a filename-safe slug.
 *   "Build better habits" → "build-better-habits"
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'slide';
}

/**
 * Trigger a browser download for a Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
