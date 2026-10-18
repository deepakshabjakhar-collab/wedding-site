import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
export const DATA_DIR = process.env.VELLUM_DATA_DIR || path.join(ROOT, 'data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
export const TMP_DIR = path.join(DATA_DIR, 'tmp');

for (const dir of [DATA_DIR, UPLOAD_DIR, TMP_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new DatabaseSync(path.join(DATA_DIR, 'vellum.db'));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'studio',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  template_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  group_name TEXT NOT NULL DEFAULT 'Friends',
  token TEXT NOT NULL UNIQUE,
  party_size INTEGER NOT NULL DEFAULT 1,
  invited_event_ids TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
  attending INTEGER NOT NULL,
  event_ids TEXT NOT NULL DEFAULT '[]',
  meal TEXT,
  dietary TEXT,
  accessibility TEXT,
  children TEXT,
  song_request TEXT,
  note TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id TEXT REFERENCES guests(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id TEXT REFERENCES guests(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS seating_tables (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 8,
  x REAL NOT NULL DEFAULT 0,
  y REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seating_assignments (
  invitation_id TEXT NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
  table_id TEXT NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
  PRIMARY KEY (guest_id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_user ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_invitation ON guests(invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON rsvps(invitation_id);
CREATE INDEX IF NOT EXISTS idx_messages_invitation ON messages(invitation_id);
CREATE INDEX IF NOT EXISTS idx_photos_invitation ON photos(invitation_id);
CREATE INDEX IF NOT EXISTS idx_tables_invitation ON seating_tables(invitation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`);

export type DbRow = Record<string, unknown>;

export function all<T = DbRow>(sql: string, ...params: unknown[]): T[] {
  return db.prepare(sql).all(...(params as never[])) as T[];
}

export function get<T = DbRow>(sql: string, ...params: unknown[]): T | undefined {
  return db.prepare(sql).get(...(params as never[])) as T | undefined;
}

export function run(sql: string, ...params: unknown[]) {
  return db.prepare(sql).run(...(params as never[]));
}

export function jsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
    } catch {
      return [];
    }
  }
  return [];
}
