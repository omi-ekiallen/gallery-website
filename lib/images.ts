import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { getFilePath } from './storage';

export type DerivativeMode = 'preview' | 'locked';

const DERIVED_DIR = path.join(process.cwd(), 'storage', 'derived');

/**
 * Renderings served to the browser. Originals never leave the server outside the
 * download route:
 *  - `preview` is a downscaled, re-encoded copy for clients who have already paid
 *    (or for open galleries) and for the photographer's own dashboard.
 *  - `locked` is destroyed on purpose — shrunk to a thumbnail, blurred, blown back
 *    up and stamped with a repeating watermark — so a gated gallery can be sensed
 *    but never read, printed or passed off as the delivered work.
 *
 * This is what makes devtools irrelevant. Whatever a visitor digs out of the
 * network tab is the same useless rendering the page is showing them.
 */
const RECIPES: Record<DerivativeMode, { width: number; quality: number }> = {
  preview: { width: 1600, quality: 78 },
  locked: { width: 900, quality: 40 },
};

const sha1 = (value: string) => crypto.createHash('sha1').update(value).digest('hex');

/** storage/derived/<mode>-<file key>-<label key>.jpg */
function derivedPath(mode: DerivativeMode, filename: string, label: string): string {
  return path.join(DERIVED_DIR, `${derivedPrefix(mode, filename)}${sha1(label).slice(0, 8)}.jpg`);
}

function derivedPrefix(mode: DerivativeMode, filename: string): string {
  return `${mode}-${sha1(filename).slice(0, 16)}-`;
}

/** Escapes text going into the SVG watermark. */
function escapeXml(text: string): string {
  return text.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string
  );
}

/** A tiled, rotated wordmark laid across the whole frame. */
function watermarkSvg(width: number, height: number, label: string): Buffer {
  const text = escapeXml(label.toUpperCase());
  const rows: string[] = [];
  const stepY = 120;
  const stepX = 420;

  for (let y = -height; y < height * 2; y += stepY) {
    for (let x = -width; x < width * 2; x += stepX) {
      rows.push(
        `<text x="${x}" y="${y}" font-family="Georgia, serif" font-size="26" fill="#ffffff" fill-opacity="0.38">${text}</text>`
      );
    }
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
       <g transform="rotate(-30 ${width / 2} ${height / 2})">${rows.join('')}</g>
     </svg>`
  );
}

/**
 * Returns the path to a cached JPEG derivative, rendering it on first request.
 * `label` stamps locked frames — pass the studio name so a screenshot of a gated
 * gallery still carries its origin. Returns null for anything that is not a
 * still image.
 */
export async function getDerivative(
  filename: string,
  mimeType: string,
  mode: DerivativeMode,
  label = 'Preview'
): Promise<string | null> {
  if (!mimeType.startsWith('image/')) return null;

  const source = getFilePath(filename);
  if (!fs.existsSync(source)) return null;

  const cacheLabel = mode === 'locked' ? label : '';
  const target = derivedPath(mode, filename, cacheLabel);
  if (fs.existsSync(target)) return target;

  await fs.promises.mkdir(DERIVED_DIR, { recursive: true });

  const recipe = RECIPES[mode];
  const pipeline = sharp(source, { failOn: 'none' }).rotate();

  if (mode === 'locked') {
    // Detail is thrown away at 32px wide and cannot be recovered by upscaling;
    // the second blur softens the enlarged edges so the frame reads as out of
    // focus rather than as a crisp low-resolution copy.
    pipeline
      .resize({ width: 32, withoutEnlargement: false })
      .blur(2)
      .resize({ width: recipe.width, kernel: 'cubic' })
      .blur(12);

    const { info } = await pipeline
      .clone()
      .jpeg({ quality: recipe.quality })
      .toBuffer({ resolveWithObject: true });

    await pipeline
      .composite([{ input: watermarkSvg(info.width, info.height, label), top: 0, left: 0 }])
      .jpeg({ quality: recipe.quality, mozjpeg: true })
      .toFile(target);

    return target;
  }

  await pipeline
    .resize({ width: recipe.width, withoutEnlargement: true })
    .jpeg({ quality: recipe.quality, mozjpeg: true })
    .toFile(target);

  return target;
}

/** Drops cached derivatives for a file, e.g. when the photographer deletes it. */
export async function deleteDerivatives(filename: string): Promise<void> {
  if (!fs.existsSync(DERIVED_DIR)) return;

  const prefixes = (['preview', 'locked'] as DerivativeMode[]).map((mode) =>
    derivedPrefix(mode, filename)
  );

  for (const entry of await fs.promises.readdir(DERIVED_DIR)) {
    if (!prefixes.some((prefix) => entry.startsWith(prefix))) continue;
    try {
      await fs.promises.unlink(path.join(DERIVED_DIR, entry));
    } catch (error) {
      console.error(`Failed to remove derivative for ${filename}:`, error);
    }
  }
}
