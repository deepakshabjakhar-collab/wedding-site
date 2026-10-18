import type { Request, Response, NextFunction } from 'express';
import { clientIp } from './utils.ts';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

function sweep(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

/** Simple fixed-window limiter. Good enough for a single-process deployment. */
export function rateLimit(options: { windowMs: number; max: number; key?: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    sweep(now);
    const key = `${options.key ?? req.path}:${clientIp(req)}`;
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > options.max) {
      const retry = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(1, retry)));
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    next();
  };
}
