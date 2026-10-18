export class ApiError extends Error {
    status;
    payload;
    constructor(message, status, payload = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}
async function request(path, init = {}) {
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
    let data = {};
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        }
        catch {
            data = { error: text.slice(0, 200) };
        }
    }
    if (!res.ok) {
        throw new ApiError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.', res.status, data);
    }
    return data;
}
function json(body) {
    return { method: 'POST', body: JSON.stringify(body) };
}
export const api = {
    async me() {
        try {
            const data = await request('/auth/me');
            return data.user;
        }
        catch (error) {
            if (error instanceof ApiError && error.status === 401)
                return null;
            throw error;
        }
    },
    async login(email, password) {
        return request('/auth/login', json({ email, password }));
    },
    async signup(name, email, password) {
        return request('/auth/signup', json({ name, email, password }));
    },
    async logout() {
        return request('/auth/logout', { method: 'POST' });
    },
    invitations: {
        list: () => request('/invitations'),
        create: (templateId, data) => request('/invitations', json({ templateId, data })),
        get: (id) => request(`/invitations/${id}`),
        update: (id, body) => request(`/invitations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        }),
        setStatus: (id, status) => request(`/invitations/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        remove: (id) => request(`/invitations/${id}`, { method: 'DELETE' }),
        uploadImage: (id, file) => {
            const form = new FormData();
            form.append('image', file);
            return request(`/invitations/${id}/upload/image`, { method: 'POST', body: form });
        },
        uploadAudio: (id, file) => {
            const form = new FormData();
            form.append('audio', file);
            return request(`/invitations/${id}/upload/audio`, {
                method: 'POST',
                body: form,
            });
        },
    },
    guests: {
        list: (invitationId) => request(`/invitations/${invitationId}/guests`),
        create: (invitationId, body) => request(`/invitations/${invitationId}/guests`, json(body)),
        update: (invitationId, guestId, body) => request(`/invitations/${invitationId}/guests/${guestId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),
        remove: (invitationId, guestId) => request(`/invitations/${invitationId}/guests/${guestId}`, {
            method: 'DELETE',
        }),
        importRows: (invitationId, rows) => request(`/invitations/${invitationId}/guests/import`, json({ rows })),
    },
    rsvps: {
        list: (invitationId) => request(`/invitations/${invitationId}/rsvps`),
    },
    messages: {
        list: (invitationId) => request(`/invitations/${invitationId}/messages`),
        setHidden: (invitationId, messageId, hidden) => request(`/invitations/${invitationId}/messages/${messageId}`, {
            method: 'PATCH',
            body: JSON.stringify({ hidden }),
        }),
        remove: (invitationId, messageId) => request(`/invitations/${invitationId}/messages/${messageId}`, {
            method: 'DELETE',
        }),
    },
    photos: {
        list: (invitationId) => request(`/invitations/${invitationId}/photos`),
        remove: (invitationId, photoId) => request(`/invitations/${invitationId}/photos/${photoId}`, {
            method: 'DELETE',
        }),
    },
    seating: {
        get: (invitationId) => request(`/invitations/${invitationId}/seating`),
        addTable: (invitationId, name, capacity, x = 0, y = 0) => request(`/invitations/${invitationId}/seating/tables`, json({ name, capacity, x, y })),
        updateTable: (invitationId, tableId, body) => request(`/invitations/${invitationId}/seating/tables/${tableId}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),
        removeTable: (invitationId, tableId) => request(`/invitations/${invitationId}/seating/tables/${tableId}`, {
            method: 'DELETE',
        }),
        assign: (invitationId, guestId, tableId) => request(`/invitations/${invitationId}/seating/assign`, json({ guestId, tableId })),
        auto: (invitationId) => request(`/invitations/${invitationId}/seating/auto`, { method: 'POST' }),
    },
    public: {
        get: (slug, token) => request(`/public/invitations/${encodeURIComponent(slug)}${token ? `?token=${encodeURIComponent(token)}` : ''}`),
        rsvp: (slug, body) => request(`/public/invitations/${encodeURIComponent(slug)}/rsvp`, json(body)),
        message: (slug, body) => request(`/public/invitations/${encodeURIComponent(slug)}/messages`, json(body)),
        uploadPhoto: (slug, file, opts) => {
            const form = new FormData();
            form.append('photo', file);
            if (opts.token)
                form.append('token', opts.token);
            if (opts.author)
                form.append('author', opts.author);
            return request(`/public/invitations/${encodeURIComponent(slug)}/photos`, { method: 'POST', body: form });
        },
        preview: (id) => request(`/public/preview/${id}`),
    },
};
export function shareUrl(slug, token) {
    const base = `${window.location.origin}/i/${slug}`;
    return token ? `${base}/g/${token}` : base;
}
export function albumUrl(slug, token) {
    const base = `${window.location.origin}/i/${slug}/album`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}
export function whatsappUrl(url, message) {
    return `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
}
export function fullUrl(path) {
    return `${window.location.origin}${path}`;
}
