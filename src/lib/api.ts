import type {
  GuestMessage,
  GuestRecord,
  InvitationRecord,
  InvitationSummary,
  PhotoRecord,
  PublicInvitationPayload,
  RsvpRecord,
  SeatingTable,
  SessionUser,
} from '@shared/types';

export class ApiError extends Error {
  status: number;
  payload: Record<string, unknown>;

  constructor(message: string, status: number, payload: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const isForm = init.body instanceof FormData;
  if (!isForm && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    ...init,
    headers,
  });
  let data: Record<string, unknown> = {};
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = { error: text.slice(0, 200) };
    }
  }
  if (!res.ok) {
    throw new ApiError(
      typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.',
      res.status,
      data,
    );
  }
  return data as T;
}

function json(body: unknown): RequestInit {
  return { method: 'POST', body: JSON.stringify(body) };
}

export const api = {
  async me(): Promise<SessionUser | null> {
    try {
      const data = await request<{ user: SessionUser }>('/auth/me');
      return data.user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  async login(email: string, password: string) {
    return request<{ user: SessionUser }>('/auth/login', json({ email, password }));
  },
  async signup(name: string, email: string, password: string) {
    return request<{ user: SessionUser }>('/auth/signup', json({ name, email, password }));
  },
  async logout() {
    return request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
  },

  invitations: {
    list: () => request<{ invitations: InvitationSummary[] }>('/invitations'),
    create: (templateId: string, data?: unknown) =>
      request<{ invitation: InvitationRecord }>('/invitations', json({ templateId, data })),
    get: (id: string) => request<{ invitation: InvitationRecord }>(`/invitations/${id}`),
    update: (id: string, body: { data: unknown; templateId?: string; slug?: string }) =>
      request<{ invitation: InvitationRecord }>(`/invitations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    setStatus: (id: string, status: 'draft' | 'published') =>
      request<{ invitation: InvitationRecord }>(`/invitations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    remove: (id: string) =>
      request<{ ok: boolean }>(`/invitations/${id}`, { method: 'DELETE' }),
    uploadImage: (id: string, file: File) => {
      const form = new FormData();
      form.append('image', file);
      return request<{ url: string; thumbUrl: string; width: number; height: number }>(
        `/invitations/${id}/upload/image`,
        { method: 'POST', body: form },
      );
    },
    uploadAudio: (id: string, file: File) => {
      const form = new FormData();
      form.append('audio', file);
      return request<{ url: string }>(`/invitations/${id}/upload/audio`, {
        method: 'POST',
        body: form,
      });
    },
  },

  guests: {
    list: (invitationId: string) =>
      request<{ guests: GuestRecord[]; groups: { group_name: string; n: number }[] }>(
        `/invitations/${invitationId}/guests`,
      ),
    create: (
      invitationId: string,
      body: {
        name: string;
        email?: string;
        phone?: string;
        groupName?: string;
        partySize?: number;
        invitedEventIds?: string[];
        notes?: string;
      },
    ) => request<{ guest: GuestRecord }>(`/invitations/${invitationId}/guests`, json(body)),
    update: (invitationId: string, guestId: string, body: Partial<GuestRecord>) =>
      request<{ guest: GuestRecord }>(`/invitations/${invitationId}/guests/${guestId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (invitationId: string, guestId: string) =>
      request<{ ok: boolean }>(`/invitations/${invitationId}/guests/${guestId}`, {
        method: 'DELETE',
      }),
    importRows: (
      invitationId: string,
      rows: { name: string; email?: string; groupName?: string; partySize?: number }[],
    ) =>
      request<{ added: number }>(`/invitations/${invitationId}/guests/import`, json({ rows })),
  },

  rsvps: {
    list: (invitationId: string) =>
      request<{
        guests: GuestRecord[];
        summary: {
          total: number;
          attending: number;
          declined: number;
          pending: number;
          headcount: number;
          meals: Record<string, number>;
        };
      }>(`/invitations/${invitationId}/rsvps`),
  },

  messages: {
    list: (invitationId: string) =>
      request<{ messages: GuestMessage[] }>(`/invitations/${invitationId}/messages`),
    setHidden: (invitationId: string, messageId: string, hidden: boolean) =>
      request<{ ok: boolean }>(`/invitations/${invitationId}/messages/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ hidden }),
      }),
    remove: (invitationId: string, messageId: string) =>
      request<{ ok: boolean }>(`/invitations/${invitationId}/messages/${messageId}`, {
        method: 'DELETE',
      }),
  },

  photos: {
    list: (invitationId: string) =>
      request<{ photos: PhotoRecord[] }>(`/invitations/${invitationId}/photos`),
    remove: (invitationId: string, photoId: string) =>
      request<{ ok: boolean }>(`/invitations/${invitationId}/photos/${photoId}`, {
        method: 'DELETE',
      }),
  },

  seating: {
    get: (invitationId: string) =>
      request<{ tables: SeatingTable[]; guests: GuestRecord[] }>(
        `/invitations/${invitationId}/seating`,
      ),
    addTable: (invitationId: string, name: string, capacity: number, x = 0, y = 0) =>
      request<{ table: SeatingTable }>(
        `/invitations/${invitationId}/seating/tables`,
        json({ name, capacity, x, y }),
      ),
    updateTable: (
      invitationId: string,
      tableId: string,
      body: { name?: string; capacity?: number },
    ) =>
      request<{ ok: boolean }>(`/invitations/${invitationId}/seating/tables/${tableId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    removeTable: (invitationId: string, tableId: string) =>
      request<{ ok: boolean }>(`/invitations/${invitationId}/seating/tables/${tableId}`, {
        method: 'DELETE',
      }),
    assign: (invitationId: string, guestId: string, tableId: string | null) =>
      request<{ ok: boolean }>(`/invitations/${invitationId}/seating/assign`, json({ guestId, tableId })),
    auto: (invitationId: string) =>
      request<{ assigned: number; remaining: number }>(
        `/invitations/${invitationId}/seating/auto`,
        { method: 'POST' },
      ),
  },

  public: {
    get: (slug: string, token?: string) =>
      request<PublicInvitationPayload>(
        `/public/invitations/${encodeURIComponent(slug)}${token ? `?token=${encodeURIComponent(token)}` : ''}`,
      ),
    rsvp: (slug: string, body: Record<string, unknown>) =>
      request<{ ok: boolean; token: string; rsvp: RsvpRecord }>(
        `/public/invitations/${encodeURIComponent(slug)}/rsvp`,
        json(body),
      ),
    message: (slug: string, body: { token?: string; author?: string; text: string }) =>
      request<{ message: GuestMessage }>(
        `/public/invitations/${encodeURIComponent(slug)}/messages`,
        json(body),
      ),
    uploadPhoto: (slug: string, file: File, opts: { token?: string; author?: string }) => {
      const form = new FormData();
      form.append('photo', file);
      if (opts.token) form.append('token', opts.token);
      if (opts.author) form.append('author', opts.author);
      return request<{ photo: PhotoRecord }>(
        `/public/invitations/${encodeURIComponent(slug)}/photos`,
        { method: 'POST', body: form },
      );
    },
    preview: (id: string) => request<PublicInvitationPayload>(`/public/preview/${id}`),
  },
};

export function shareUrl(slug: string, token?: string): string {
  const base = `${window.location.origin}/i/${slug}`;
  return token ? `${base}/g/${token}` : base;
}

export function albumUrl(slug: string, token?: string): string {
  const base = `${window.location.origin}/i/${slug}/album`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

export function whatsappUrl(url: string, message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
}

export function fullUrl(path: string): string {
  return `${window.location.origin}${path}`;
}
