/** Shared domain model used by both the API and the React client. */
export const SECTION_LABELS = {
    welcome: { label: 'Welcome note', hint: 'A short, warm greeting for your guests' },
    story: { label: 'Your story', hint: 'Chapters of how you came to be here' },
    countdown: { label: 'Countdown', hint: 'A live countdown to the first ceremony' },
    schedule: { label: 'Celebrations', hint: 'Every ceremony, in order' },
    gallery: { label: 'Gallery', hint: 'Portraits and moments, with a full-screen viewer' },
    details: { label: 'Guest details', hint: 'Dress code, travel, stays and gifts' },
    rsvp: { label: 'RSVP', hint: 'Attendance, meals and accessibility' },
    messages: { label: 'Blessings', hint: 'A wall of notes from your guests' },
    album: { label: 'Shared album', hint: 'Guests upload photographs; you download them' },
    closing: { label: 'Closing', hint: 'A final thank-you and monogram' },
};
export const EMPTY_PALETTE = {
    bg: '#f7f2e9',
    surface: '#fffdf8',
    ink: '#241f1a',
    muted: '#76695c',
    accent: '#a97c50',
    accentSoft: '#e8d7c1',
    line: '#d9cbb8',
    deep: '#2a2119',
    deepInk: '#f7f0e4',
};
export function sectionOrder(data) {
    const base = data.settings.sectionsOrder?.length
        ? data.settings.sectionsOrder
        : Object.keys(SECTION_LABELS);
    return base.filter((s) => !data.settings.hiddenSections.includes(s));
}
export function primaryEvent(data) {
    return [...data.events].sort((a, b) => a.date.localeCompare(b.date))[0];
}
export function fullNames(data) {
    return `${data.coupleA} & ${data.coupleB}`;
}
