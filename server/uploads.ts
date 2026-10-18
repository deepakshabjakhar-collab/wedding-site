import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { UPLOAD_DIR } from './db.ts';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic']);
const AUDIO_TYPES: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/ogg': 'ogg',
};

export function isSupportedImage(mimetype: string): boolean {
  return IMAGE_TYPES.has(mimetype);
}

export function audioExtension(mimetype: string): string | null {
  return AUDIO_TYPES[mimetype] ?? null;
}

export interface ProcessedImage {
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
}

export async function saveImage(buffer: Buffer, prefix = 'img'): Promise<ProcessedImage> {
  const id = crypto.randomUUID();
  const filename = `${prefix}_${id}.webp`;
  const thumbName = `${prefix}_${id}_thumb.webp`;

  const full = await sharp(buffer)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  await sharp(buffer)
    .rotate()
    .resize({ width: 760, height: 760, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 76, effort: 4 })
    .toFile(path.join(UPLOAD_DIR, thumbName));

  await fs.writeFile(path.join(UPLOAD_DIR, filename), full.data);

  return {
    url: `/uploads/${filename}`,
    thumbUrl: `/uploads/${thumbName}`,
    width: full.info.width,
    height: full.info.height,
  };
}

export async function saveAudio(buffer: Buffer, ext: string): Promise<string> {
  const filename = `audio_${crypto.randomUUID()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function removeUpload(url: string) {
  if (!url.startsWith('/uploads/')) return;
  const name = path.basename(url);
  if (!name || name.includes('..')) return;
  await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
}

export function uploadPath(url: string): string | null {
  if (!url.startsWith('/uploads/')) return null;
  const name = path.basename(url);
  if (!name || name.includes('..')) return null;
  return path.join(UPLOAD_DIR, name);
}
