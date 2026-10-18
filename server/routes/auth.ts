import { Router } from 'express';
import { get, run } from '../db.ts';
import {
  clearSessionCookie,
  createSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
  type AuthedRequest,
} from '../auth.ts';
import { isValidEmail, uid } from '../utils.ts';
import { rateLimit } from '../rate-limit.ts';
import { str } from '../validation.ts';

export const authRouter = Router();

const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 30, key: 'auth' });

authRouter.post('/signup', authLimiter, (req, res) => {
  const name = str(req.body?.name, 80);
  const email = str(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (name.length < 2) return res.status(400).json({ error: 'Please tell us your name.' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Choose a password of at least 8 characters.' });
  if (get('SELECT id FROM users WHERE email = ?', email))
    return res.status(409).json({ error: 'An account with this email already exists. Try signing in.' });

  const id = uid('usr_');
  run(
    'INSERT INTO users (id, email, name, password_hash, plan) VALUES (?, ?, ?, ?, ?)',
    id,
    email,
    name,
    hashPassword(password),
    'studio',
  );
  const { token, expires } = createSession(id);
  setSessionCookie(res, token, expires);
  res.status(201).json({ user: { id, email, name, plan: 'studio' } });
});

authRouter.post('/login', authLimiter, (req, res) => {
  const email = str(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const user = get<{
    id: string;
    email: string;
    name: string;
    plan: string;
    password_hash: string;
  }>('SELECT id, email, name, plan, password_hash FROM users WHERE email = ?', email);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'That email and password do not match.' });
  }
  const { token, expires } = createSession(user.id);
  setSessionCookie(res, token, expires);
  res.json({ user: { id: user.id, email: user.email, name: user.name, plan: user.plan } });
});

authRouter.post('/logout', (req, res) => {
  const token = req.cookies?.vellum_session;
  if (typeof token === 'string') run('DELETE FROM sessions WHERE token = ?', token);
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', (req: AuthedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not signed in.' });
  res.json({ user: req.user });
});
