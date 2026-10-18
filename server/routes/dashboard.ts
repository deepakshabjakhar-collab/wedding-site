import { Router } from 'express';
import multer from 'multer';
import archiver from 'archiver';
import fs from 'node:fs';
import { all, get, jsonArray, run } from '../db.ts';
import { requireUser, type AuthedRequest } from '../auth.ts';
import { createInvitationData, TEMPLATE_IDS } from '../../shared/defaults.ts';
import type {
  GuestMessage,
  GuestRecord,
  InvitationData,
  InvitationRecord,
  PhotoRecord,
  RsvpRecord,
  SeatingTable,
} from '../../shared/types.ts';
import {
  sanitizeGuestInput,
  sanitizeInvitationData,
  str,
} from '../validation.ts';
import {
  clampPage,
  csv,
  guestToken,
  sendCsv,
  uid,
  uniqueSlug,
} from '../utils.ts';
import {
  audioExtension,
  isSupportedImage,
  removeUpload,
  saveAudio,
  saveImage,
  uploadPath,
} from '../uploads.ts';

export const dashboardRouter = Router();
dashboardRouter.use(requireUser);

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, isSupportedImage(file.mimetype)),
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, Boolean(audioExtension(file.mimetype))),
});

interface InvitationRow {
  id: string;
  user_id: string;
  slug: string;
  template_id: string;
  status: string;
  data: string;
  created_at: string;
  updated_at: string;
}

function mapInvitation(row: InvitationRow): InvitationRecord {
  let data: InvitationData;
  try {
    data = JSON.parse(row.data) as InvitationData;
  } catch {
    data = createInvitationData(row.template_id);
  }
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    templateId: row.template_id,
    status: row.status === 'published' ? 'published' : 'draft',
    data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function ownedInvitation(req: AuthedRequest, rawId: string | string[]): InvitationRecord | null {
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const row = get<InvitationRow>(
    'SELECT * FROM invitations WHERE id = ? AND user_id = ?',
    id,
    req.user!.id,
  );
  return row ? mapInvitation(row) : null;
}

function mapGuest(row: Record<string, unknown>): GuestRecord {
  const rsvp = row.rsvp_id
    ? ({
        id: row.rsvp_id,
        invitationId: row.invitation_id,
        guestId: row.id,
        attending: Boolean(row.attending),
        eventIds: jsonArray(row.rsvp_event_ids),
        meal: row.meal ?? null,
        dietary: row.dietary ?? null,
        accessibility: row.accessibility ?? null,
        children: row.children ?? null,
        songRequest: row.song_request ?? null,
        note: row.note ?? null,
        updatedAt: row.rsvp_updated_at,
      } as RsvpRecord)
    : null;
  return {
    id: String(row.id),
    invitationId: String(row.invitation_id),
    name: String(row.name),
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    groupName: String(row.group_name),
    token: String(row.token),
    partySize: Number(row.party_size),
    invitedEventIds: jsonArray(row.invited_event_ids),
    notes: (row.notes as string) ?? null,
    tableId: (row.table_id as string) ?? null,
    createdAt: String(row.created_at),
    rsvp,
  };
}

const GUEST_SELECT = `
  SELECT g.*, t.table_id AS table_id,
         r.id AS rsvp_id, r.attending, r.event_ids AS rsvp_event_ids, r.meal, r.dietary,
         r.accessibility, r.children, r.song_request, r.note, r.updated_at AS rsvp_updated_at
    FROM guests g
    LEFT JOIN seating_assignments t ON t.guest_id = g.id
    LEFT JOIN rsvps r ON r.guest_id = g.id
`;

/* ------------------------------------------------------------------ */
/* Invitations                                                         */
/* ------------------------------------------------------------------ */

dashboardRouter.get('/', (req: AuthedRequest, res) => {
  const rows = all<InvitationRow>(
    'SELECT * FROM invitations WHERE user_id = ? ORDER BY updated_at DESC',
    req.user!.id,
  );
  const invitations = rows.map((row) => {
    const invitation = mapInvitation(row);
    const counts = get<{
      guests: number;
      attending: number;
      declined: number;
      pending: number;
    }>(
      `SELECT COUNT(*) AS guests,
              SUM(CASE WHEN r.attending = 1 THEN 1 ELSE 0 END) AS attending,
              SUM(CASE WHEN r.attending = 0 THEN 1 ELSE 0 END) AS declined,
              SUM(CASE WHEN r.id IS NULL THEN 1 ELSE 0 END) AS pending
         FROM guests g LEFT JOIN rsvps r ON r.guest_id = g.id
        WHERE g.invitation_id = ?`,
      invitation.id,
    )!;
    const messages = get<{ n: number }>(
      'SELECT COUNT(*) AS n FROM messages WHERE invitation_id = ? AND hidden = 0',
      invitation.id,
    )!;
    const photos = get<{ n: number }>(
      'SELECT COUNT(*) AS n FROM photos WHERE invitation_id = ?',
      invitation.id,
    )!;
    return {
      ...invitation,
      counts: {
        guests: counts.guests ?? 0,
        attending: counts.attending ?? 0,
        declined: counts.declined ?? 0,
        pending: counts.pending ?? 0,
        messages: messages.n ?? 0,
        photos: photos.n ?? 0,
      },
    };
  });
  res.json({ invitations });
});

dashboardRouter.post('/', (req: AuthedRequest, res) => {
  const templateId = str(req.body?.templateId, 40);
  if (!TEMPLATE_IDS.includes(templateId as never)) {
    return res.status(400).json({ error: 'Choose a template to begin.' });
  }
  const data = req.body?.data
    ? sanitizeInvitationData(req.body.data, templateId)
    : createInvitationData(templateId);
  const id = uid('inv_');
  const slug = uniqueSlug(`${data.coupleA}-${data.coupleB}`);
  run(
    `INSERT INTO invitations (id, user_id, slug, template_id, status, data)
     VALUES (?, ?, ?, ?, 'draft', ?)`,
    id,
    req.user!.id,
    slug,
    templateId,
    JSON.stringify(data),
  );
  run(
    `INSERT INTO seating_tables (id, invitation_id, name, capacity, x, y)
     VALUES (?, ?, 'Table One', 8, 0, 0), (?, ?, 'Table Two', 8, 1, 0)`,
    uid('tbl_'),
    id,
    uid('tbl_'),
    id,
  );
  const row = get<InvitationRow>('SELECT * FROM invitations WHERE id = ?', id)!;
  res.status(201).json({ invitation: mapInvitation(row) });
});

dashboardRouter.get('/:id', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  res.json({ invitation });
});

dashboardRouter.put('/:id', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });

  const templateId =
    typeof req.body?.templateId === 'string' &&
    TEMPLATE_IDS.includes(req.body.templateId as never)
      ? (req.body.templateId as string)
      : invitation.templateId;

  const data = sanitizeInvitationData(req.body?.data, templateId);

  let slug = invitation.slug;
  if (typeof req.body?.slug === 'string' && req.body.slug.trim()) {
    slug = uniqueSlug(str(req.body.slug, 60), invitation.id);
  }
  const status = req.body?.status === 'published' ? 'published' : invitation.status;

  run(
    `UPDATE invitations SET data = ?, template_id = ?, slug = ?, status = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?`,
    JSON.stringify(data),
    templateId,
    slug,
    status,
    invitation.id,
    req.user!.id,
  );
  const row = get<InvitationRow>('SELECT * FROM invitations WHERE id = ?', invitation.id)!;
  res.json({ invitation: mapInvitation(row) });
});

dashboardRouter.patch('/:id/status', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const status = req.body?.status === 'published' ? 'published' : 'draft';
  run(
    `UPDATE invitations SET status = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
    status,
    invitation.id,
    req.user!.id,
  );
  const row = get<InvitationRow>('SELECT * FROM invitations WHERE id = ?', invitation.id)!;
  res.json({ invitation: mapInvitation(row) });
});

dashboardRouter.delete('/:id', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  run('DELETE FROM invitations WHERE id = ? AND user_id = ?', invitation.id, req.user!.id);
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* Uploads                                                             */
/* ------------------------------------------------------------------ */

dashboardRouter.post('/:id/upload/image', imageUpload.single('image'), async (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  if (!req.file) return res.status(400).json({ error: 'Choose a JPEG, PNG or WebP image.' });
  try {
    const processed = await saveImage(req.file.buffer, 'img');
    res.status(201).json(processed);
  } catch (error) {
    console.error('image upload failed', error);
    res.status(400).json({ error: 'That image could not be processed.' });
  }
});

dashboardRouter.post('/:id/upload/audio', audioUpload.single('audio'), async (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  if (!req.file) return res.status(400).json({ error: 'Choose an MP3, M4A, WAV or OGG file.' });
  const ext = audioExtension(req.file.mimetype);
  if (!ext) return res.status(400).json({ error: 'That audio format is not supported.' });
  try {
    const url = await saveAudio(req.file.buffer, ext);
    res.status(201).json({ url });
  } catch (error) {
    console.error('audio upload failed', error);
    res.status(500).json({ error: 'That audio file could not be saved.' });
  }
});

/* ------------------------------------------------------------------ */
/* Guests                                                              */
/* ------------------------------------------------------------------ */

dashboardRouter.get('/:id/guests', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const rows = all(
    `${GUEST_SELECT} WHERE g.invitation_id = ? ORDER BY g.group_name COLLATE NOCASE, g.name COLLATE NOCASE`,
    invitation.id,
  );
  const groups = all<{ group_name: string; n: number }>(
    'SELECT group_name, COUNT(*) AS n FROM guests WHERE invitation_id = ? GROUP BY group_name ORDER BY group_name',
    invitation.id,
  );
  res.json({ guests: rows.map(mapGuest), groups });
});

dashboardRouter.post('/:id/guests', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const input = sanitizeGuestInput(req.body);
  if (!input.name) return res.status(400).json({ error: 'A guest name is required.' });
  const id = uid('gst_');
  const token = guestToken();
  run(
    `INSERT INTO guests (id, invitation_id, name, email, phone, group_name, token, party_size, invited_event_ids, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    invitation.id,
    input.name,
    input.email || null,
    input.phone || null,
    input.groupName,
    token,
    input.partySize,
    JSON.stringify(input.invitedEventIds),
    input.notes || null,
  );
  const row = get(`${GUEST_SELECT} WHERE g.id = ?`, id)!;
  res.status(201).json({ guest: mapGuest(row) });
});

dashboardRouter.post('/:id/guests/import', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const rows = Array.isArray(req.body?.rows) ? req.body.rows.slice(0, 500) : [];
  let added = 0;
  for (const raw of rows) {
    const input = sanitizeGuestInput(raw);
    if (!input.name) continue;
    run(
      `INSERT INTO guests (id, invitation_id, name, email, phone, group_name, token, party_size, invited_event_ids, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      uid('gst_'),
      invitation.id,
      input.name,
      input.email || null,
      input.phone || null,
      input.groupName,
      guestToken(),
      input.partySize,
      JSON.stringify(input.invitedEventIds),
      input.notes || null,
    );
    added += 1;
  }
  res.status(201).json({ added });
});

dashboardRouter.patch('/:id/guests/:guestId', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const existing = get<Record<string, unknown>>(
    'SELECT * FROM guests WHERE id = ? AND invitation_id = ?',
    req.params.guestId,
    invitation.id,
  );
  if (!existing) return res.status(404).json({ error: 'Guest not found.' });
  const input = sanitizeGuestInput({
    name: req.body?.name ?? existing.name,
    email: req.body?.email ?? existing.email,
    phone: req.body?.phone ?? existing.phone,
    groupName: req.body?.groupName ?? existing.group_name,
    partySize: req.body?.partySize ?? existing.party_size,
    invitedEventIds:
      req.body?.invitedEventIds ?? jsonArray(existing.invited_event_ids),
    notes: req.body?.notes ?? existing.notes,
  });
  if (!input.name) return res.status(400).json({ error: 'A guest name is required.' });
  run(
    `UPDATE guests SET name = ?, email = ?, phone = ?, group_name = ?, party_size = ?, invited_event_ids = ?, notes = ?
      WHERE id = ? AND invitation_id = ?`,
    input.name,
    input.email || null,
    input.phone || null,
    input.groupName,
    input.partySize,
    JSON.stringify(input.invitedEventIds),
    input.notes || null,
    req.params.guestId,
    invitation.id,
  );
  const row = get(`${GUEST_SELECT} WHERE g.id = ?`, req.params.guestId)!;
  res.json({ guest: mapGuest(row) });
});

dashboardRouter.delete('/:id/guests/:guestId', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  run(
    'DELETE FROM guests WHERE id = ? AND invitation_id = ?',
    req.params.guestId,
    invitation.id,
  );
  res.json({ ok: true });
});

dashboardRouter.get('/:id/guests.csv', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const rows = all(`${GUEST_SELECT} WHERE g.invitation_id = ? ORDER BY g.name COLLATE NOCASE`, invitation.id);
  const guests = rows.map(mapGuest);
  const header = ['Name', 'Household / group', 'Email', 'Phone', 'Party size', 'RSVP', 'Table', 'Personal link'];
  const body = guests.map((g) => [
    g.name,
    g.groupName,
    g.email ?? '',
    g.phone ?? '',
    g.partySize,
    g.rsvp ? (g.rsvp.attending ? 'Attending' : 'Declined') : 'Pending',
    g.tableId ?? '',
    `/i/${invitation.slug}/g/${g.token}`,
  ]);
  sendCsv(res, `${invitation.slug}-guests.csv`, csv([header, ...body]));
});

/* ------------------------------------------------------------------ */
/* RSVPs                                                               */
/* ------------------------------------------------------------------ */

dashboardRouter.get('/:id/rsvps', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const rows = all(
    `${GUEST_SELECT} WHERE g.invitation_id = ? ORDER BY r.updated_at DESC`,
    invitation.id,
  );
  const guests = rows.map(mapGuest);
  res.json({
    guests,
    summary: {
      total: guests.length,
      attending: guests.filter((g) => g.rsvp?.attending).length,
      declined: guests.filter((g) => g.rsvp && !g.rsvp.attending).length,
      pending: guests.filter((g) => !g.rsvp).length,
      headcount: guests
        .filter((g) => g.rsvp?.attending)
        .reduce((sum, g) => sum + (g.partySize || 1), 0),
      meals: guests.reduce<Record<string, number>>((acc, g) => {
        if (g.rsvp?.attending && g.rsvp.meal) acc[g.rsvp.meal] = (acc[g.rsvp.meal] ?? 0) + 1;
        return acc;
      }, {}),
    },
  });
});

dashboardRouter.get('/:id/rsvps.csv', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const rows = all(`${GUEST_SELECT} WHERE g.invitation_id = ? ORDER BY g.name COLLATE NOCASE`, invitation.id);
  const guests = rows.map(mapGuest);
  const eventNames = new Map(invitation.data.events.map((e) => [e.id, e.name]));
  const header = [
    'Name',
    'Email',
    'Response',
    'Party size',
    'Events',
    'Meal',
    'Dietary',
    'Accessibility',
    'Children',
    'Song request',
    'Note',
    'Responded at',
  ];
  const body = guests.map((g) => [
    g.name,
    g.email ?? '',
    g.rsvp ? (g.rsvp.attending ? 'Attending' : 'Declined') : 'Pending',
    g.partySize,
    (g.rsvp?.eventIds ?? []).map((id) => eventNames.get(id) ?? id).join('; '),
    g.rsvp?.meal ?? '',
    g.rsvp?.dietary ?? '',
    g.rsvp?.accessibility ?? '',
    g.rsvp?.children ?? '',
    g.rsvp?.songRequest ?? '',
    g.rsvp?.note ?? '',
    g.rsvp?.updatedAt ?? '',
  ]);
  sendCsv(res, `${invitation.slug}-rsvps.csv`, csv([header, ...body]));
});

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

dashboardRouter.get('/:id/messages', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const messages = all<GuestMessage>(
    `SELECT id, invitation_id AS invitationId, guest_id AS guestId, author, text,
            hidden, created_at AS createdAt
       FROM messages WHERE invitation_id = ? ORDER BY created_at DESC`,
    invitation.id,
  ).map((m) => ({ ...m, hidden: Boolean(m.hidden) }));
  res.json({ messages });
});

dashboardRouter.patch('/:id/messages/:messageId', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  run(
    'UPDATE messages SET hidden = ? WHERE id = ? AND invitation_id = ?',
    req.body?.hidden ? 1 : 0,
    req.params.messageId,
    invitation.id,
  );
  res.json({ ok: true });
});

dashboardRouter.delete('/:id/messages/:messageId', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  run(
    'DELETE FROM messages WHERE id = ? AND invitation_id = ?',
    req.params.messageId,
    invitation.id,
  );
  res.json({ ok: true });
});

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

function mapPhoto(row: Record<string, unknown>): PhotoRecord {
  return {
    id: String(row.id),
    invitationId: String(row.invitation_id),
    guestId: (row.guest_id as string) ?? null,
    url: String(row.url),
    thumbUrl: String(row.thumb_url ?? row.url),
    width: Number(row.width),
    height: Number(row.height),
    uploadedBy: String(row.uploaded_by),
    createdAt: String(row.created_at),
  };
}

dashboardRouter.get('/:id/photos', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const photos = all('SELECT * FROM photos WHERE invitation_id = ? ORDER BY created_at DESC', invitation.id).map(mapPhoto);
  res.json({ photos });
});

dashboardRouter.delete('/:id/photos/:photoId', async (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const photo = get<Record<string, unknown>>(
    'SELECT * FROM photos WHERE id = ? AND invitation_id = ?',
    req.params.photoId,
    invitation.id,
  );
  if (!photo) return res.status(404).json({ error: 'Photo not found.' });
  await removeUpload(String(photo.url));
  await removeUpload(String(photo.thumb_url));
  run('DELETE FROM photos WHERE id = ? AND invitation_id = ?', req.params.photoId, invitation.id);
  res.json({ ok: true });
});

dashboardRouter.get('/:id/photos/archive', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const photos = all('SELECT * FROM photos WHERE invitation_id = ?', invitation.id);
  if (!photos.length) return res.status(404).json({ error: 'There are no photographs yet.' });
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${invitation.slug}-album.zip"`);
  const archive = archiver('zip', { zlib: { level: 8 } });
  archive.on('warning', (err) => console.warn('archive warning', err));
  archive.on('error', (err) => {
    console.error('archive error', err);
    res.destroy();
  });
  archive.pipe(res);
  let index = 1;
  for (const photo of photos) {
    const filePath = uploadPath(String(photo.url));
    if (filePath && fs.existsSync(filePath)) {
      const safeAuthor = String(photo.uploaded_by).replace(/[^\w -]/g, '').slice(0, 40);
      const ext = filePath.slice(filePath.lastIndexOf('.'));
      archive.file(filePath, { name: `${String(index).padStart(2, '0')}-${safeAuthor || 'guest'}${ext}` });
      index += 1;
    }
  }
  void archive.finalize();
});

/* ------------------------------------------------------------------ */
/* Seating                                                             */
/* ------------------------------------------------------------------ */

dashboardRouter.get('/:id/seating', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const tables = all<SeatingTable>(
    `SELECT id, invitation_id AS invitationId, name, capacity, x, y
       FROM seating_tables WHERE invitation_id = ? ORDER BY rowid`,
    invitation.id,
  );
  const rows = all(`${GUEST_SELECT} WHERE g.invitation_id = ? AND r.attending = 1 ORDER BY g.name COLLATE NOCASE`, invitation.id);
  res.json({ tables, guests: rows.map(mapGuest) });
});

dashboardRouter.post('/:id/seating/tables', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const name = str(req.body?.name, 60) || `Table ${Date.now() % 100}`;
  const capacity = Math.min(24, Math.max(1, Number(req.body?.capacity) || 8));
  const id = uid('tbl_');
  run(
    'INSERT INTO seating_tables (id, invitation_id, name, capacity, x, y) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    invitation.id,
    name,
    capacity,
    Number(req.body?.x) || 0,
    Number(req.body?.y) || 0,
  );
  res.status(201).json({ table: { id, invitationId: invitation.id, name, capacity, x: Number(req.body?.x) || 0, y: Number(req.body?.y) || 0 } });
});

dashboardRouter.patch('/:id/seating/tables/:tableId', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const existing = get<Record<string, unknown>>(
    'SELECT * FROM seating_tables WHERE id = ? AND invitation_id = ?',
    req.params.tableId,
    invitation.id,
  );
  if (!existing) return res.status(404).json({ error: 'Table not found.' });
  const name = req.body?.name !== undefined ? str(req.body.name, 60) : String(existing.name);
  const capacity =
    req.body?.capacity !== undefined
      ? Math.min(24, Math.max(1, Number(req.body.capacity) || 8))
      : Number(existing.capacity);
  run(
    'UPDATE seating_tables SET name = ?, capacity = ? WHERE id = ? AND invitation_id = ?',
    name,
    capacity,
    req.params.tableId,
    invitation.id,
  );
  res.json({ ok: true });
});

dashboardRouter.delete('/:id/seating/tables/:tableId', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  run(
    'DELETE FROM seating_tables WHERE id = ? AND invitation_id = ?',
    req.params.tableId,
    invitation.id,
  );
  res.json({ ok: true });
});

dashboardRouter.post('/:id/seating/assign', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const guestId = str(req.body?.guestId, 60);
  const tableId = req.body?.tableId ? str(req.body.tableId, 60) : null;
  const guest = get<Record<string, unknown>>(
    'SELECT * FROM guests WHERE id = ? AND invitation_id = ?',
    guestId,
    invitation.id,
  );
  if (!guest) return res.status(404).json({ error: 'Guest not found.' });

  if (tableId) {
    const table = get<Record<string, unknown>>(
      'SELECT * FROM seating_tables WHERE id = ? AND invitation_id = ?',
      tableId,
      invitation.id,
    );
    if (!table) return res.status(404).json({ error: 'Table not found.' });
    const seated = get<{ n: number }>(
      'SELECT COUNT(*) AS n FROM seating_assignments WHERE table_id = ?',
      tableId,
    )!;
    if ((seated.n ?? 0) >= Number(table.capacity)) {
      return res.status(409).json({ error: 'That table is already at capacity.' });
    }
    run(
      `INSERT INTO seating_assignments (invitation_id, guest_id, table_id) VALUES (?, ?, ?)
       ON CONFLICT(guest_id) DO UPDATE SET table_id = excluded.table_id`,
      invitation.id,
      guestId,
      tableId,
    );
  } else {
    run('DELETE FROM seating_assignments WHERE guest_id = ? AND invitation_id = ?', guestId, invitation.id);
  }
  res.json({ ok: true });
});

dashboardRouter.post('/:id/seating/auto', (req: AuthedRequest, res) => {
  const invitation = ownedInvitation(req, req.params.id);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found.' });
  const tables = all<{ id: string; capacity: number }>(
    'SELECT id, capacity FROM seating_tables WHERE invitation_id = ? ORDER BY rowid',
    invitation.id,
  );
  if (!tables.length) return res.status(400).json({ error: 'Add a table first.' });
  const unseated = all<{ id: string; group_name: string; party_size: number }>(
    `SELECT g.id, g.group_name, g.party_size FROM guests g
       LEFT JOIN seating_assignments a ON a.guest_id = g.id
       JOIN rsvps r ON r.guest_id = g.id AND r.attending = 1
      WHERE g.invitation_id = ? AND a.guest_id IS NULL
      ORDER BY g.group_name, g.name`,
    invitation.id,
  );
  const counts = new Map<string, number>();
  for (const t of tables) {
    const row = get<{ n: number }>('SELECT COUNT(*) AS n FROM seating_assignments WHERE table_id = ?', t.id)!;
    counts.set(t.id, row.n ?? 0);
  }
  let assigned = 0;
  for (const guest of unseated) {
    const table = tables.find((t) => (counts.get(t.id) ?? 0) < t.capacity);
    if (!table) break;
    run(
      `INSERT INTO seating_assignments (invitation_id, guest_id, table_id) VALUES (?, ?, ?)
       ON CONFLICT(guest_id) DO UPDATE SET table_id = excluded.table_id`,
      invitation.id,
      guest.id,
      table.id,
    );
    counts.set(table.id, (counts.get(table.id) ?? 0) + 1);
    assigned += 1;
  }
  res.json({ assigned, remaining: unseated.length - assigned });
});
