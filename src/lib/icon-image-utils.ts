/**
 * Browser-side image processing for the App Icon Generator.
 *
 * Pure functions, no React, no DOM dependencies beyond Canvas + Image.
 * Used by AppIconGenerator.tsx to produce all the resized / tinted /
 * darkened PNG buffers that go into the output ZIP.
 */

import type { Appearance } from './app-icon-data';

/**
 * Decode a user-uploaded File (PNG, JPEG, SVG) into a HTMLImageElement
 * we can draw onto a Canvas. SVGs render vector-quality at any size.
 */
export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImageFromUrl(url);
    return img;
  } finally {
    // Don't revoke until the caller is done — they hold a reference.
    // We delay revocation by 1s to be safe.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to decode image.'));
    img.src = url;
  });
}

/**
 * Validate the source image — it should be at least 1024×1024 for
 * App Store quality. Returns warnings, not errors — let the user
 * proceed if they want to.
 */
export interface SourceValidation {
  width: number;
  height: number;
  aspectRatioOk: boolean;
  isLargeEnough: boolean;
  isSquareOrClose: boolean;
  warnings: string[];
}

export function validateSource(img: HTMLImageElement): SourceValidation {
  const warnings: string[] = [];
  const isSquareOrClose = Math.abs(img.width - img.height) <= 4;
  const aspectRatioOk = isSquareOrClose;
  const isLargeEnough = img.width >= 1024 && img.height >= 1024;

  if (!isSquareOrClose) {
    warnings.push(
      `Image is not square (${img.width}×${img.height}). Apple icons must be square — your output will be stretched. Crop to a square first.`
    );
  }
  if (!isLargeEnough) {
    warnings.push(
      `Image is ${img.width}×${img.height}. Apple requires 1024×1024 minimum for the App Store icon. Smaller sources will look blurry when scaled up.`
    );
  }

  return {
    width: img.width,
    height: img.height,
    aspectRatioOk,
    isLargeEnough,
    isSquareOrClose,
    warnings,
  };
}

/**
 * Resize an image to a square of `targetSize` pixels. Uses high-quality
 * downscaling via Canvas with imageSmoothingQuality = 'high'.
 *
 * Returns a Blob (PNG) — ready to write into a ZIP.
 */
export async function resizeToBlob(
  img: HTMLImageElement,
  targetSize: number,
  transform?: (ctx: CanvasRenderingContext2D, size: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d', { willReadFrequently: !!transform });
  if (!ctx) throw new Error('Canvas 2D context unavailable.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetSize, targetSize);

  if (transform) {
    transform(ctx, targetSize);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode PNG.'));
      },
      'image/png',
      1 // Maximum quality (lossless for PNG)
    );
  });
}

/**
 * iOS 26 Liquid Glass "Tinted" variant.
 *
 * The system tint variant is a monochrome luminance-based representation
 * that the OS then applies the user's accent color to at runtime.
 * Apple's spec: the tinted variant should be near-white pixels with
 * alpha proportional to the perceived luminance of the source.
 *
 * Algorithm: per pixel, compute Rec. 709 luminance, output white pixel
 * with alpha = luminance * source alpha. Dark areas become transparent;
 * bright areas stay solid. The system colors the result.
 */
export function applyTintTransform(
  ctx: CanvasRenderingContext2D,
  size: number
): void {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Rec. 709 luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Normalize 0..255 → 0..1
    const lum = luminance / 255;

    // White pixel, alpha proportional to luminance × source alpha
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = Math.round(lum * a);
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Auto-darken transform for the "Dark" variant when the user doesn't
 * supply a separate dark-mode source. Multiplies RGB by 0.55 and
 * preserves alpha. Good enough for most icons; designers should still
 * supply a hand-crafted dark variant for production use.
 */
export function applyAutoDarkenTransform(
  ctx: CanvasRenderingContext2D,
  size: number
): void {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * 0.55);
    data[i + 1] = Math.round(data[i + 1] * 0.55);
    data[i + 2] = Math.round(data[i + 2] * 0.55);
    // alpha unchanged
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Pick the appropriate transform function for an appearance.
 * Returns undefined for "any" (no transform — render as-is).
 */
export function transformFor(
  appearance: Appearance
): ((ctx: CanvasRenderingContext2D, size: number) => void) | undefined {
  if (appearance === 'tinted') return applyTintTransform;
  if (appearance === 'dark') return applyAutoDarkenTransform;
  return undefined;
}

/**
 * Generate a small data URL preview of the source image at a given size.
 * Used in the UI to show the icon at multiple display sizes without
 * generating + downloading the full PNG.
 */
export async function previewDataUrl(
  img: HTMLImageElement,
  size: number,
  appearance: Appearance = 'any'
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, size, size);

  const transform = transformFor(appearance);
  if (transform) transform(ctx, size);

  return canvas.toDataURL('image/png');
}
