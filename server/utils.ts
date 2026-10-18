import crypto from 'node:crypto';
import type { Response } from 'express';
import { get } from './db.ts';
import { slugify } from '../shared/defaults.ts';

export function uid(prefix = ''): string {
  return prefix + crypto.randomUUID();
}

export function guestToken(): string {
  return crypto.randomBytes(9).toString('base64url');
}

export function uniqueSlug(desired: string, ignoreId = ''): string {
  const base = slugify(desired);
  let candidate = base;
  let i = 2;
  while (
    get('SELECT id FROM invitations WHERE slug = ? AND id != ?', candidate, ignoreId)
  ) {
    candidate = `${base}-${i}`;
    i += 1;
    if (i > 500) {
      candidate = `${base}-${crypto.randomBytes(3).toString('hex')}`;
      break;
    }
  }
  return candidate;
}

export function csvCell(value: unknown): string {
  const raw = value == null ? '' : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

export function csv(rows: unknown[][]): string {
  // Prepend BOM so Excel opens UTF-8 correctly.
  return '\ufeff' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export function sendCsv(res: Response, filename: string, body: string) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(body);
}

export function clientIp(req: { ip?: string; socket?: { remoteAddress?: string } }): string {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function clampPage(value: unknown, max = 200): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(1, Math.floor(n))) : 60;
}
