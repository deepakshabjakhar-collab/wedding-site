import { Router } from 'express';
import multer from 'multer';
import { all, get, jsonArray, run } from '../db.ts';
import type { AuthedRequest } from '../auth.ts';
import type {
  EventDetails,
  GuestMessage,
  InvitationData,
  InvitationRecord,
  PhotoRecord,
  RsvpRecord,
} from '../../shared/types.ts';
import { createInvitationData } from '../../shared/defaults.ts';
import { rateLimit } from '../rate-limit.ts';
import { isValidEmail, guestToken, uid } from '../utils.ts';
import { isSupportedImage, saveImage } from '../uploads.ts';
import { sanitizeRsvp, str } from '../validation.ts';
import { requireUser } from '../auth.ts';

export const publicRouter = Router();

interface PublicInvitationRow {
  id: string;
  user_id: string;
  slug: string;
  template_id: string;
  status: string;
  data: string;
  created_at: string;
  updated_at: string;
}

function findInvitation(rawSlug: string | string[]): InvitationRecord | null {
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const row = get<PublicInvitationRow>('SELECT * FROM invitations WHERE slug = ?', slug);
  if (!row || row.status !== 'published') return null;
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
    status: 'published',
    data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function guestByToken(invitationId: string, token: unknown) {
  if (typeof token !== 'string' || !token) return undefined;
  return get<Record<string, unknown>>(
    'SELECT * FROM guests WHERE invitation_id = ? AND token = ?',
    invitationId,
    token,
  );
}

function mapGuestIdentity(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    partySize: Number(row.party_size),
    invitedEventIds: jsonArray(row.invited_event_ids),
    groupName: String(row.group_name),
    token: String(row.token),
  };
}

function rsvpFor(guestId: string): RsvpRecord | null {
  const row = get<Record<string, unknown>>('SELECT * FROM rsvps WHERE guest_id = ?', guestId);
  if (!row) return null;
  return {
    id: String(row.id),
    invitationId: String(row.invitation_id),
    guestId: String(row.guest_id),
    attending: Boolean(row.attending),
    eventIds: jsonArray(row.event_ids),
    meal: (row.meal as string) ?? null,
    dietary: (row.dietary as string) ?? null,
    accessibility: (row.accessibility as string) ?? null,
    children: (row.children as string) ?? null,
    songRequest: (row.song_request as string) ?? null,
    note: (row.note as string) ?? null,
    updatedAt: String(row.updated_at),
  };
}

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, isSupportedImage(file.mimetype)),
});

publicRouter.get('/invitations/:slug', (req, res) => {
  const invitation = findInvitation(req.params.slug);
  if (!invitation) return res.status(404).json({ error: 'This invitation was not found.' });

  const guestRow = guestByToken(invitation.id, req.query.token);
  if (invitation.data.settings.visibility === 'unlisted' && !guestRow) {
    return res.status(403).json({
      error: 'This invitation is private. Please use the personal link you received.',
      requiresToken: true,
    });
  }

  const messages = all<GuestMessage>(
    `SELECT id, invitation_id AS invitationId, guest_id AS guestId, author, text,
            hidden, created_at AS createdAt
       FROM messages WHERE invitation_id = ? AND hidden = 0
      ORDER BY created_at DESC LIMIT 200`,
    invitation.id,
  ).map((m) => ({ ...m, hidden: false }));

  const photos = invitation.data.settings.albumEnabled
    ? all(
        'SELECT * FROM photos WHERE invitation_id = ? ORDER BY created_at DESC LIMIT 500',
        invitation.id,
      ).map(
        (row): PhotoRecord => ({
          id: String(row.id),
          invitationId: String(row.invitation_id),
          guestId: (row.guest_id as string) ?? null,
          url: String(row.url),
          thumbUrl: String(row.thumb_url ?? row.url),
          width: Number(row.width),
          height: Number(row.height),
          uploadedBy: String(row.uploaded_by),
          createdAt: String(row.created_at),
        }),
      )
    : [];

  res.json({
    invitation,
    demo: invitation.slug.startsWith('anaya-rohan') || invitation.slug.startsWith('clara-julien'),
    personalization: guestRow
      ? {
          guest: mapGuestIdentity(guestRow),
          existingRsvp: rsvpFor(String(guestRow.id)),
        }
      : null,
    messages,
    photos,
  });
});

publicRouter.post(
  '/invitations/:slug/rsvp',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 20, key: 'rsvp' }),
  (req, res) => {
    const invitation = findInvitation(req.params.slug);
    if (!invitation) return res.status(404).json({ error: 'This invitation was not found.' });
    const settings = invitation.data.settings;
    const submitted = sanitizeRsvp(req.body);
    const guestRow = guestByToken(invitation.id, submitted.token);

    if (settings.visibility === 'unlisted' && !guestRow) {
      return res.status(403).json({ error: 'Please use the personal link you received to respond.' });
    }
    if (!guestRow && !settings.allowPublicRsvp) {
      return res.status(403).json({ error: 'Please respond using the personal link in your invitation.' });
    }
    if (settings.rsvpDeadline && new Date(settings.rsvpDeadline).getTime() < Date.now()) {
      return res.status(400).json({ error: 'RSVPs for this celebration have now closed.' });
    }

    let guestId: string;
    let token: string;
    if (guestRow) {
      guestId = String(guestRow.id);
      token = String(guestRow.token);
    } else {
      if (!submitted.name) return res.status(400).json({ error: 'Please tell us your name.' });
      if (submitted.email && !isValidEmail(submitted.email)) {
        return res.status(400).json({ error: 'Please check the email address you entered.' });
      }
      const duplicate = get<{ token: string }>(
        `SELECT g.token FROM guests g
           JOIN rsvps r ON r.guest_id = g.id
          WHERE g.invitation_id = ?
            AND (lower(g.name) = lower(?) ${submitted.email ? 'OR lower(g.email) = lower(?)' : ''})
          LIMIT 1`,
        ...(submitted.email
          ? [invitation.id, submitted.name, submitted.email]
          : [invitation.id, submitted.name]),
      );
      if (duplicate) {
        return res.status(409).json({
          error:
            'We already have a response under that name. Please use the personal link in your invitation to make changes.',
        });
      }
      guestId = uid('gst_');
      token = guestToken();
      run(
        `INSERT INTO guests (id, invitation_id, name, email, group_name, token, party_size, invited_event_ids)
         VALUES (?, ?, ?, ?, 'Guests', ?, 1, '[]')`,
        guestId,
        invitation.id,
        submitted.name,
        submitted.email || null,
        token,
      );
    }

    const allowedEvents = guestRow
      ? jsonArray(guestRow.invited_event_ids)
      : [];
    const eventIds =
      allowedEvents.length > 0
        ? submitted.eventIds.filter((id) => allowedEvents.includes(id))
        : submitted.eventIds.filter((id) =>
            invitation.data.events.some((e: EventDetails) => e.id === id),
          );

    const existing = get<{ id: string }>('SELECT id FROM rsvps WHERE guest_id = ?', guestId);
    if (existing) {
      run(
        `UPDATE rsvps SET attending = ?, event_ids = ?, meal = ?, dietary = ?, accessibility = ?,
             children = ?, song_request = ?, note = ?, updated_at = datetime('now')
         WHERE guest_id = ?`,
        submitted.attending ? 1 : 0,
        JSON.stringify(eventIds),
        submitted.meal || null,
        submitted.dietary || null,
        submitted.accessibility || null,
        submitted.children || null,
        submitted.songRequest || null,
        submitted.note || null,
        guestId,
      );
    } else {
      run(
        `INSERT INTO rsvps (id, invitation_id, guest_id, attending, event_ids, meal, dietary,
                            accessibility, children, song_request, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        uid('rsvp_'),
        invitation.id,
        guestId,
        submitted.attending ? 1 : 0,
        JSON.stringify(eventIds),
        submitted.meal || null,
        submitted.dietary || null,
        submitted.accessibility || null,
        submitted.children || null,
        submitted.songRequest || null,
        submitted.note || null,
      );
    }

    res.json({
      ok: true,
      token,
      rsvp: rsvpFor(guestId),
    });
  },
);

publicRouter.post(
  '/invitations/:slug/messages',
  rateLimit({ windowMs: 10 * 60 * 1000, max: 15, key: 'message' }),
  (req, res) => {
    const invitation = findInvitation(req.params.slug);
    if (!invitation) return res.status(404).json({ error: 'This invitation was not found.' });
    if (!invitation.data.settings.messagesEnabled) {
      return res.status(403).json({ error: 'The blessing wall is closed.' });
    }
    const token = str(req.body?.token, 80);
    const guestRow = guestByToken(invitation.id, token);
    if (invitation.data.settings.visibility === 'unlisted' && !guestRow) {
      return res.status(403).json({ error: 'Please use your personal link to leave a message.' });
    }
    const author = guestRow ? String(guestRow.name) : str(req.body?.author, 80);
    const text = str(req.body?.text, 800, true);
    if (!author) return res.status(400).json({ error: 'Please add your name.' });
    if (!text) return res.status(400).json({ error: 'Please write a short message.' });

    const id = uid('msg_');
    run(
      `INSERT INTO messages (id, invitation_id, guest_id, author, text) VALUES (?, ?, ?, ?, ?)`,
      id,
      invitation.id,
      guestRow ? String(guestRow.id) : null,
      author,
      text,
    );
    res.status(201).json({
      message: {
        id,
        invitationId: invitation.id,
        guestId: guestRow ? String(guestRow.id) : null,
        author,
        text,
        hidden: false,
        createdAt: new Date().toISOString(),
      },
    });
  },
);

publicRouter.post(
  '/invitations/:slug/photos',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 80, key: 'photo' }),
  imageUpload.single('photo'),
  async (req, res) => {
    const invitation = findInvitation(req.params.slug);
    if (!invitation) return res.status(404).json({ error: 'This invitation was not found.' });
    if (!invitation.data.settings.albumEnabled || !invitation.data.settings.albumPublic) {
      return res.status(403).json({ error: 'The shared album is not open.' });
    }
    const token = str(req.body?.token, 80);
    const guestRow = guestByToken(invitation.id, token);
    if (invitation.data.settings.visibility === 'unlisted' && !guestRow) {
      return res.status(403).json({ error: 'Please use your personal link to add photographs.' });
    }
    if (!req.file) return res.status(400).json({ error: 'Choose a JPEG, PNG or WebP photograph.' });
    if (req.file.size < 1024) return res.status(400).json({ error: 'That file appears to be empty.' });

    try {
      const processed = await saveImage(req.file.buffer, 'photo');
      const id = uid('pho_');
      const uploadedBy = guestRow ? String(guestRow.name) : str(req.body?.author, 80) || 'A guest';
      run(
        `INSERT INTO photos (id, invitation_id, guest_id, url, thumb_url, width, height, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        invitation.id,
        guestRow ? String(guestRow.id) : null,
        processed.url,
        processed.thumbUrl,
        processed.width,
        processed.height,
        uploadedBy,
      );
      res.status(201).json({
        photo: {
          id,
          invitationId: invitation.id,
          guestId: guestRow ? String(guestRow.id) : null,
          ...processed,
          uploadedBy,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('guest photo upload failed', error);
      res.status(400).json({ error: 'That photograph could not be processed.' });
    }
  },
);

/** Owner-only preview of drafts, so the studio can open a true guest view. */
publicRouter.get('/preview/:id', requireUser, (req: AuthedRequest, res) => {
  const row = get<PublicInvitationRow>(
    'SELECT * FROM invitations WHERE id = ? AND user_id = ?',
    req.params.id,
    req.user!.id,
  );
  if (!row) return res.status(404).json({ error: 'Invitation not found.' });
  let data: InvitationData;
  try {
    data = JSON.parse(row.data) as InvitationData;
  } catch {
    data = createInvitationData(row.template_id);
  }
  const messages = all<GuestMessage>(
    `SELECT id, invitation_id AS invitationId, guest_id AS guestId, author, text,
            hidden, created_at AS createdAt
       FROM messages WHERE invitation_id = ? AND hidden = 0 ORDER BY created_at DESC LIMIT 200`,
    row.id,
  ).map((m) => ({ ...m, hidden: false }));
  const photos = all('SELECT * FROM photos WHERE invitation_id = ? ORDER BY created_at DESC', row.id).map(
    (p): PhotoRecord => ({
      id: String(p.id),
      invitationId: String(p.invitation_id),
      guestId: (p.guest_id as string) ?? null,
      url: String(p.url),
      thumbUrl: String(p.thumb_url ?? p.url),
      width: Number(p.width),
      height: Number(p.height),
      uploadedBy: String(p.uploaded_by),
      createdAt: String(p.created_at),
    }),
  );
  res.json({
    invitation: {
      id: row.id,
      userId: row.user_id,
      slug: row.slug,
      templateId: row.template_id,
      status: row.status === 'published' ? 'published' : 'draft',
      data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    demo: false,
    personalization: null,
    messages,
    photos,
  });
});
