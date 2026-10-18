import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { get, run } from './db.ts';
import type { SessionUser } from '../shared/types.ts';

const SESSION_DAYS = 30;
const COOKIE = 'vellum_session';

export interface AuthedRequest extends Request {
  user?: SessionUser;
  sessionToken?: string;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

export function createSession(userId: string): { token: string; expires: Date } {
  const token = crypto.randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  run(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
    token,
    userId,
    expires.toISOString(),
  );
  return { token, expires };
}

export function setSessionCookie(res: Response, token: string, expires: Date) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    expires,
    path: '/',
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE, { path: '/' });
}

export function getSessionUser(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const row = get<{
    id: string;
    email: string;
    name: string;
    plan: string;
    expires_at: string;
  }>(
    `SELECT u.id, u.email, u.name, u.plan, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ?`,
    token,
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    run('DELETE FROM sessions WHERE token = ?', token);
    return null;
  }
  return { id: row.id, email: row.email, name: row.name, plan: row.plan };
}

/** Attaches req.user when a valid session cookie exists. Never blocks. */
export function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE];
  if (typeof token === 'string') {
    req.sessionToken = token;
    req.user = getSessionUser(token) ?? undefined;
  }
  next();
}

export function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Please sign in to continue.' });
    return;
  }
  next();
}

export function optionalUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  next();
}
