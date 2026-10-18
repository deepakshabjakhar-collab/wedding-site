export function uploadPhoto(slug, file, opts) {
    return new Promise((resolve) => {
        const form = new FormData();
        form.append('photo', file);
        if (opts.token)
            form.append('token', opts.token);
        if (opts.author)
            form.append('author', opts.author);
        const request = new XMLHttpRequest();
        request.open('POST', `/api/public/invitations/${encodeURIComponent(slug)}/photos`);
        request.withCredentials = true;
        request.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                opts.onProgress?.(Math.round((event.loaded / event.total) * 100));
            }
        });
        request.addEventListener('load', () => {
            let payload = {};
            try {
                payload = JSON.parse(request.responseText);
            }
            catch {
                payload = {};
            }
            if (request.status >= 200 && request.status < 300 && payload.photo) {
                opts.onProgress?.(100);
                resolve({ photo: payload.photo });
            }
            else {
                resolve({
                    error: typeof payload.error === 'string'
                        ? payload.error
                        : `Upload failed (${request.status}). Please try again.`,
                });
            }
        });
        request.addEventListener('error', () => resolve({ error: 'Upload failed. Please check your connection.' }));
        request.addEventListener('abort', () => resolve({ error: 'Upload cancelled.' }));
        request.send(form);
    });
}
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export function validatePhoto(file) {
    if (!file.type.startsWith('image/'))
        return 'Only photographs can be added (JPEG, PNG, WebP).';
    if (file.size > MAX_PHOTO_BYTES)
        return 'That photograph is larger than 15 MB.';
    if (file.size < 1024)
        return 'That file looks empty.';
    return null;
}
