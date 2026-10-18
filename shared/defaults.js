export const TEMPLATE_IDS = [
    'aurelia',
    'maison',
    'belgrave',
    'celeste',
    'salento',
    'noir',
    'heirloom',
    'miel',
];
export const BUILT_IN_TRACKS = [
    {
        id: 'golden-hour',
        title: 'Golden Hour',
        artist: 'The Vellum Ensemble',
        src: '/audio/golden-hour.mp3',
        mood: 'Harp, warm strings, a slow waltz',
    },
    {
        id: 'moonlit',
        title: 'Moonlit Vows',
        artist: 'The Vellum Ensemble',
        src: '/audio/moonlit.mp3',
        mood: 'Celestial pads and felt piano',
    },
    {
        id: 'garden',
        title: 'In the Garden',
        artist: 'The Vellum Ensemble',
        src: '/audio/garden.mp3',
        mood: 'Nylon guitar and birdsong air',
    },
    {
        id: 'first-dance',
        title: 'First Dance',
        artist: 'The Vellum Ensemble',
        src: '/audio/first-dance.mp3',
        mood: 'A tender, unhurried piano theme',
    },
];
export const MEAL_OPTIONS_DEFAULT = [
    'Heritage vegetarian',
    'Sea bass',
    'Slow-braised beef',
    'Vegan',
    'Children’s plate',
];
export const defaultSettings = {
    sectionsOrder: [
        'welcome',
        'story',
        'countdown',
        'schedule',
        'gallery',
        'details',
        'rsvp',
        'messages',
        'album',
        'closing',
    ],
    hiddenSections: [],
    countdown: true,
    rsvpDeadline: null,
    questions: {
        meal: true,
        dietary: true,
        accessibility: true,
        children: true,
        songRequest: true,
    },
    mealOptions: MEAL_OPTIONS_DEFAULT,
    messagesEnabled: true,
    albumEnabled: true,
    albumPublic: true,
    allowPublicRsvp: true,
    visibility: 'public',
    envelopeAnimation: 'seal',
    showGuestName: true,
    language: 'en',
    monogramStyle: 'script',
    shareTitle: '',
    shareDescription: '',
};
export const IVORY_PALETTE = {
    bg: '#f6f1e7',
    surface: '#fffdf7',
    ink: '#221d18',
    muted: '#7a6b5c',
    accent: '#a9835b',
    accentSoft: '#e9dcc9',
    line: '#d8c9b5',
    deep: '#241d16',
    deepInk: '#f8f1e5',
};
function inDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}
/** A complete, valid invitation, used for new projects and template previews. */
export function createInvitationData(_templateId = 'aurelia', overrides = {}) {
    const date = inDays(210);
    const base = {
        coupleA: 'Amara',
        coupleB: 'Elias',
        monogram: 'A&E',
        tagline: 'Together is a beautiful place to be',
        hashtag: '#AmaraAndElias',
        weddingDate: date,
        weddingTime: '16:30',
        timeZone: 'Europe/Rome',
        location: 'Villa Serena, Lake Como',
        welcomeHeading: 'Together with our families',
        welcomeNote: 'We would be honoured by your presence as we exchange vows and begin our life together. Come for the vows, stay for the dancing, and bring a story to tell.',
        storyIntro: 'A few chapters from the road that brought us here.',
        story: [
            {
                id: 'chapter-1',
                title: 'A table for two, by accident',
                body: 'A crowded bookshop in Trastevere, one last copy of the same novel, and a waiter who took pity on us both. We stayed until the candles burned out.',
                image: '',
            },
            {
                id: 'chapter-2',
                title: 'The long way home',
                body: 'Three years of trains, letters and long walks later, we returned to that little square. This time, one of us was carrying a ring.',
                image: '',
            },
            {
                id: 'chapter-3',
                title: 'And now, this',
                body: 'We are gathering the people we love in one garden for one evening. It would not be the same without you.',
                image: '',
            },
        ],
        events: [
            {
                id: 'event-1',
                name: 'The Welcome Dinner',
                subtitle: 'An evening of aperitivi',
                date,
                startTime: '19:00',
                venue: 'Ristorante Lago',
                address: 'Via del Porto 12, Como',
                mapUrl: 'https://maps.google.com/?q=Como+Italy',
                description: 'A relaxed dinner on the water for those arriving early. Come as you are.',
                dressCode: 'Linen and loose ties',
            },
            {
                id: 'event-2',
                name: 'The Ceremony',
                subtitle: 'Vows in the garden',
                date,
                startTime: '16:30',
                endTime: '17:15',
                venue: 'Villa Serena',
                address: 'Via dei Cipressi 4, Lake Como',
                mapUrl: 'https://maps.google.com/?q=Lake+Como+Italy',
                description: 'Please be seated by 16:15. Champagne and photographs follow in the orangery.',
                dressCode: 'Black tie optional',
            },
        ],
        gallery: [],
        music: {
            trackId: 'golden-hour',
            customSrc: null,
            title: 'Golden Hour',
            artist: 'The Vellum Ensemble',
            enabled: true,
            startOnOpen: true,
            style: 'pill',
        },
        details: {
            venue: 'Villa Serena',
            address: 'Via dei Cipressi 4, 22012 Cernobbio, Lake Como, Italy',
            mapUrl: 'https://maps.google.com/?q=Villa+Serena+Lake+Como',
            dressCode: 'Black tie optional',
            dressCodeNote: 'Long dresses or dark suits. The ceremony is on grass — consider block heels. The evening turns cool by the lake, so bring a wrap.',
            travel: 'Milan Malpensa is 55 minutes by car. A shuttle leaves the villa at 15:15. Water taxis can be arranged through the concierge.',
            accommodation: 'We have held rooms at Hotel Belvedere and Casa Valle. Mention our names when booking before 1 May.',
            gifts: 'Your presence is the gift. If you would like to mark the day, we are saving for a garden of our own.',
            additionalTitle: 'A note on the day',
            additional: 'The ceremony begins promptly at 16:30. Unplugged, please — we have a photographer, and we would love to see your faces rather than your phones.',
        },
        settings: defaultSettings,
        theme: {
            palette: {},
            fontPair: '',
            scriptFont: '',
        },
        ...overrides,
    };
    return { ...base, ...overrides, settings: { ...defaultSettings, ...(overrides.settings ?? {}) } };
}
export function slugify(value) {
    const slug = value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);
    return slug || 'our-wedding';
}
export function formatEventDate(iso, opts) {
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
