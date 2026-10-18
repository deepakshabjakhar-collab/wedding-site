import express from 'express';
import cookieParser from 'cookie-parser';
import fs from 'node:fs';
import path from 'node:path';
import { attachUser } from './auth.ts';
import { UPLOAD_DIR, get } from './db.ts';
import { authRouter } from './routes/auth.ts';
import { dashboardRouter } from './routes/dashboard.ts';
import { publicRouter } from './routes/public.ts';
import { slugify } from '../shared/defaults.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 8787;
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '3mb' }));
app.use(cookieParser());
app.use(attachUser);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProd) {
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "media-src 'self' blob:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
      ].join('; '),
    );
  }
  next();
});

app.use(
  '/uploads',
  express.static(UPLOAD_DIR, {
    index: false,
    dotfiles: 'deny',
    maxAge: '30d',
    immutable: true,
    fallthrough: false,
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: isProd ? 'production' : 'development' });
});

app.use('/api/auth', authRouter);
app.use('/api/invitations', dashboardRouter);
app.use('/api/public', publicRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

app.use('/api', (err: Error & { status?: number; type?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API error:', err.message);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'That request was too large.' });
  }
  res.status(err.status && err.status < 500 ? err.status : 500).json({
    error: err.status && err.status < 500 ? err.message : 'Something went wrong on our side.',
  });
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectMeta(html: string, slug: string): string {
  const row = get<{ data: string; status: string; template_id: string }>(
    'SELECT data, status, template_id FROM invitations WHERE slug = ? AND status = \'published\'',
    slug,
  );
  if (!row) return html;
  let data: { coupleA?: string; coupleB?: string; weddingDate?: string; location?: string } = {};
  try {
    data = JSON.parse(row.data);
  } catch {
    return html;
  }
  const names = `${data.coupleA ?? 'Our'} & ${data.coupleB ?? 'wedding'}`;
  const title = `${names} — A wedding invitation`;
  const description = `${slugify(names).replace(/-/g, ' ')} · ${data.location ?? 'A celebration to remember'}. Open the invitation.`;
  const tags = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ]
    .filter(Boolean)
    .join('\n    ');
  return html
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace('<!-- OG_META -->', tags);
}

if (fs.existsSync(path.join(DIST, 'index.html'))) {
  app.use(express.static(DIST, { index: false, maxAge: '1h', setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
    if (/\.(woff2|webp|mp3)$/.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/uploads') || req.path.startsWith('/api')) return next();
    let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
    const match = /^\/i\/([^/]+)/.exec(req.path);
    if (match) html = injectMeta(html, decodeURIComponent(match[1]));
    res.setHeader('Cache-Control', 'no-cache');
    res.type('html').send(html);
  });
} else {
  app.get('/', (_req, res) => {
    res.type('text').send(
      'Vellum API is running. Start the client with `npm run dev` (http://localhost:5173).',
    );
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Vellum API  ·  http://127.0.0.1:${PORT}  ·  ${isProd ? 'production' : 'development'}\n`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 4000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
