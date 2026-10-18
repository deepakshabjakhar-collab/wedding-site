export function formatDate(iso, opts) {
    if (!iso)
        return '';
    const date = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(date.getTime()))
        return iso;
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...opts,
    }).format(date);
}
export function formatDateShort(iso, opts) {
    if (!iso)
        return '';
    const date = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(date.getTime()))
        return iso;
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        ...opts,
    }).format(date);
}
export function formatDayMonth(iso) {
    if (!iso)
        return { day: '', month: '', weekday: '' };
    const date = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(date.getTime()))
        return { day: '', month: '', weekday: '' };
    return {
        day: new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date),
        month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date),
        weekday: new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(date),
    };
}
export function formatTime(time) {
    if (!time || !/^\d{2}:\d{2}$/.test(time))
        return time;
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'pm' : 'am';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''} ${suffix}`;
}
export function formatDateTime(iso) {
    if (!iso)
        return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime()))
        return iso;
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
export function relativeTime(iso) {
    if (!iso)
        return '';
    const date = new Date(iso.endsWith('Z') || iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`);
    const delta = Date.now() - date.getTime();
    const minutes = Math.round(delta / 60000);
    if (minutes < 1)
        return 'just now';
    if (minutes < 60)
        return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 14)
        return `${days}d ago`;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
}
export function timeLeft(target, time = '00:00') {
    const d = new Date(`${target}T${time || '00:00'}:00`);
    const diff = d.getTime() - Date.now();
    if (Number.isNaN(d.getTime()))
        return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
    const clamped = Math.max(0, diff);
    return {
        days: Math.floor(clamped / 86400000),
        hours: Math.floor((clamped / 3600000) % 24),
        minutes: Math.floor((clamped / 60000) % 60),
        seconds: Math.floor((clamped / 1000) % 60),
        past: diff <= 0,
    };
}
export function money(amount, currency = 'GBP') {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
}
export function plural(count, singular, pluralWord) {
    return count === 1 ? singular : pluralWord ?? `${singular}s`;
}
export function initials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}
export function truncate(value, max = 90) {
    if (value.length <= max)
        return value;
    return `${value.slice(0, max - 1).trimEnd()}…`;
}
export function groupEventsByDate(events) {
    const map = new Map();
    for (const event of [...events].sort((a, b) => a.date.localeCompare(b.date) || a.date.localeCompare(b.date))) {
        const list = map.get(event.date) ?? [];
        list.push(event);
        map.set(event.date, list);
    }
    return [...map.entries()].map(([date, list]) => ({ date, events: list }));
}
