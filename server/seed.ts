import { get, run } from './db.ts';
import { hashPassword } from './auth.ts';
import { createInvitationData } from '../shared/defaults.ts';
import type { InvitationData } from '../shared/types.ts';
import { guestToken, uid } from './utils.ts';

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const demoEmail = 'demo@vellum.studio';
const existing = get<{ id: string }>('SELECT id FROM users WHERE email = ?', demoEmail);

if (existing) {
  console.log('Demo data already seeded — nothing to do.');
  process.exit(0);
}

const userId = uid('usr_');
run(
  'INSERT INTO users (id, email, name, password_hash, plan) VALUES (?, ?, ?, ?, ?)',
  userId,
  demoEmail,
  'The Vellum Studio',
  hashPassword('vellum1234'),
  'heirloom',
);

/* ------------------------------------------------------------------ */
/* Rosalind & Henry — a Cotswolds garden wedding                       */
/* ------------------------------------------------------------------ */

const rosalind: InvitationData = createInvitationData('maison');
rosalind.coupleA = 'Rosalind';
rosalind.coupleB = 'Henry';
rosalind.monogram = 'R&H';
rosalind.tagline = 'A marquee, a meadow, and the English weather';
rosalind.hashtag = '#RosalindAndHenry';
rosalind.weddingDate = daysFromNow(104);
rosalind.weddingTime = '14:00';
rosalind.location = 'Thornbury Hall, Gloucestershire';
rosalind.welcomeHeading = 'With the blessing of our families';
rosalind.welcomeNote =
  'We are getting married in the walled garden where Henry proposed, followed by dinner in a marquee that we have been assured will not leak. Please arrive in time for a drink before the ceremony.';
rosalind.storyIntro = 'A village fête, a lost dog, and a very slow beginning.';
rosalind.story = [
  {
    id: 'ch-1',
    title: 'The fête',
    body: 'Rosalind was judging the jam. Henry was holding a stolen spaniel. Neither of us was doing what we were supposed to be doing, which set the tone rather well.',
  },
  {
    id: 'ch-2',
    title: 'The walled garden',
    body: 'Four winters later, in the same garden, Henry produced a ring from a coat pocket and a speech from memory. Both survived.',
  },
  {
    id: 'ch-3',
    title: 'Now, with you',
    body: 'We are filling the garden with long tables, garden roses and every person we love. Bring a coat and your dancing shoes.',
  },
];
rosalind.events = [
  {
    id: 'ceremony',
    name: 'The Ceremony',
    subtitle: 'In the walled garden',
    date: daysFromNow(104),
    startTime: '14:00',
    endTime: '15:00',
    venue: 'Thornbury Hall',
    address: 'Thornbury, Gloucestershire GL12 8AB',
    mapUrl: 'https://maps.google.com/?q=Thornbury+Hall+Gloucestershire',
    description: 'Please be seated by 13:50. Confetti is provided and encouraged.',
    dressCode: 'Garden formal — linen, silk, and shoes that can handle grass.',
  },
  {
    id: 'dinner',
    name: 'Dinner & Dancing',
    subtitle: 'In the marquee',
    date: daysFromNow(104),
    startTime: '17:30',
    endTime: '01:00',
    venue: 'Thornbury Hall',
    address: 'Thornbury, Gloucestershire GL12 8AB',
    mapUrl: 'https://maps.google.com/?q=Thornbury+Hall+Gloucestershire',
    description: 'A three-course dinner, a band, and a cheese table at midnight.',
    dressCode: 'Garden formal',
  },
  {
    id: 'breakfast',
    name: 'Sunday Breakfast',
    subtitle: 'The recovery',
    date: daysFromNow(105),
    startTime: '10:30',
    endTime: '13:00',
    venue: 'The Apple Barn',
    address: 'Thornbury Hall, Gloucestershire GL12 8AB',
    mapUrl: 'https://maps.google.com/?q=Thornbury+Hall+Gloucestershire',
    description: 'Bacon baps, coffee and a walk to the river for anyone who would like one.',
    dressCode: 'Whatever you slept in — within reason.',
  },
];
rosalind.details = {
  venue: 'Thornbury Hall',
  address: 'Thornbury, Gloucestershire GL12 8AB',
  mapUrl: 'https://maps.google.com/?q=Thornbury+Hall+Gloucestershire',
  dressCode: 'Garden formal',
  dressCodeNote:
    'The ceremony is on grass and the marquee floor is boarded. A wrap or jacket will be welcome after dark.',
  travel:
    'Bristol Temple Meads is 35 minutes by car. There is parking on site, and a coach back to Bristol at midnight and at 01:00.',
  accommodation:
    'We have rooms held at The Fleece in Thornbury and at Thornbury Hall itself. Quote “Rosalind & Henry” before 1 May.',
  gifts:
    'Nothing, please. We have a house full of things and a honeymoon already paid for. A note in the guest book is more than enough.',
  additionalTitle: 'Children',
  additional:
    'Children are very welcome at the ceremony and dinner. There will be a film and a babysitter in the library from 20:30 for anyone who needs it.',
};
rosalind.music = { ...rosalind.music, trackId: 'garden', title: 'In the Garden' };
rosalind.settings.envelopeAnimation = 'ribbon';
rosalind.settings.rsvpDeadline = new Date(Date.now() + 60 * 86400000).toISOString();

/* ------------------------------------------------------------------ */
/* Clara & Julien — Lake Como, for a British guest list                */
/* ------------------------------------------------------------------ */

const clara: InvitationData = createInvitationData('aurelia');
clara.coupleA = 'Clara';
clara.coupleB = 'Julien';
clara.monogram = 'C&J';
clara.tagline = 'A garden, a lake, and everyone we love';
clara.hashtag = '#ClaraAndJulien';
clara.weddingDate = daysFromNow(96);
clara.weddingTime = '16:30';
clara.location = 'Villa Serena, Lake Como';
clara.welcomeHeading = 'Together with our families';
clara.welcomeNote =
  'We are marrying in the place we first went on holiday together, and we would love you to be there for the whole of it. A ceremony at four, then dinner under the trees until the candles give out.';
clara.storyIntro = 'Three summers, one very long lunch, and a question asked badly in Italian.';
clara.story = [
  {
    id: 'ch-1',
    title: 'A table for two, in the rain',
    body: 'We were seated next to each other at a friend’s supper club because there was nowhere else to sit. Julien ordered for both of us. Clara let him, which has never happened since.',
  },
  {
    id: 'ch-2',
    title: 'The same lake, three years later',
    body: 'On the terrace where we spent our first holiday, with a ring bought in Hatton Garden and a speech practised for weeks, the answer came before the question did.',
  },
  {
    id: 'ch-3',
    title: 'And now, with you',
    body: 'Our families have met, the menu has been argued over twice, and the only thing left is to have you there. Come for the weekend if you can.',
  },
];
clara.events = [
  {
    id: 'wedding',
    name: 'The Wedding',
    subtitle: 'Vows beneath the cypresses',
    date: daysFromNow(96),
    startTime: '16:30',
    endTime: '23:30',
    venue: 'Villa Serena',
    address: 'Via Regina 14, Tremezzo, Lake Como',
    mapUrl: 'https://maps.google.com/?q=Tremezzo+Lake+Como',
    description: 'Drinks on the terrace at four, ceremony at half past, dinner at seven, dancing after.',
    dressCode: 'Black tie optional — long dresses, linen suits, comfortable heels for gravel.',
  },
  {
    id: 'lunch',
    name: 'The Long Lunch',
    subtitle: 'The day after, by the water',
    date: daysFromNow(97),
    startTime: '12:30',
    endTime: '17:00',
    venue: 'Ristorante Aurora',
    address: 'Piazza Garibaldi 2, Menaggio',
    mapUrl: 'https://maps.google.com/?q=Menaggio+Lake+Como',
    description: 'No speeches, no schedule. Just pasta, wine and whoever is still standing.',
    dressCode: 'Whatever you wore yesterday, ideally.',
  },
];
clara.details = {
  venue: 'Villa Serena',
  address: 'Via Regina 14, Tremezzo, Lake Como, Italy',
  mapUrl: 'https://maps.google.com/?q=Tremezzo+Lake+Como',
  dressCode: 'Black tie optional',
  dressCodeNote:
    'The ceremony is on grass and the terrace is gravel — block heels are a good idea. Evenings by the lake turn cool, so bring a wrap.',
  travel:
    'Milan Malpensa is 75 minutes by car. We have two coaches leaving Terminal 1 at 13:00 on Saturday; email us to reserve a seat. Como San Giovanni is the nearest station, 20 minutes by taxi.',
  accommodation:
    'We have held rooms at Villa Sereno and Hotel Aurora in Menaggio. Quote “Clara & Julien” before 1 May.',
  gifts: 'Your being there is the gift. If you would like to do something, we are saving for a small boat.',
  additionalTitle: 'A note on the weekend',
  additional:
    'Saturday is the wedding; Sunday is the recovery. Please tell us on the RSVP if you are staying for lunch so we can set the table.',
};
clara.music = { ...clara.music, trackId: 'golden-hour', title: 'Golden Hour' };
clara.settings.envelopeAnimation = 'seal';
clara.settings.rsvpDeadline = new Date(Date.now() + 55 * 86400000).toISOString();

/* ------------------------------------------------------------------ */
/* Freya & James — Belgravia, draft                                    */
/* ------------------------------------------------------------------ */

const freya: InvitationData = createInvitationData('belgrave');
freya.coupleA = 'Freya';
freya.coupleB = 'James';
freya.monogram = 'F&J';
freya.tagline = 'A registry office, a townhouse, and the park';
freya.hashtag = '#FreyaAndJames';
freya.weddingDate = daysFromNow(58);
freya.weddingTime = '15:00';
freya.location = 'Belgrave Square, London';
freya.welcomeHeading = 'Together with our families';
freya.welcomeNote =
  'We are doing the small legal thing first, then dinner and dancing in a house on the square. Black tie, because it is nearly Christmas and we hardly get the chance.';
freya.storyIntro = 'A borrowed umbrella, a shared cab, and a very London beginning.';
freya.story = [
  {
    id: 'ch-1',
    title: 'Outside the Royal Oak',
    body: 'Freya had no umbrella. James had two, for reasons he has never fully explained. They shared one to the tube, and then, slightly unnecessarily, all the way to Marylebone.',
  },
  {
    id: 'ch-2',
    title: 'The second winter',
    body: 'A proposal on a freezing bench in St James’s Park, interrupted by a swan and a tourist asking for directions. It was, in every way, ours.',
  },
  {
    id: 'ch-3',
    title: 'Now, with you',
    body: 'We have hired the house next to the one where we met, filled it with candles, and invited the people who made the last five years worth telling stories about.',
  },
];
freya.events = [
  {
    id: 'ceremony',
    name: 'The Ceremony',
    subtitle: 'The small legal thing',
    date: daysFromNow(58),
    startTime: '15:00',
    endTime: '15:30',
    venue: 'Westminster Register Office',
    address: '317 Harrow Road, London W9 3RB',
    mapUrl: 'https://maps.google.com/?q=Westminster+Register+Office',
    description: 'Please arrive by 14:40. The ceremony is short; the photographs are not.',
    dressCode: 'Black tie',
  },
  {
    id: 'dinner',
    name: 'Dinner & Dancing',
    subtitle: 'On the square',
    date: daysFromNow(58),
    startTime: '18:00',
    endTime: '00:30',
    venue: 'No. 14 Belgrave Square',
    address: 'Belgrave Square, London SW1X 8PJ',
    mapUrl: 'https://maps.google.com/?q=Belgrave+Square+London',
    description: 'Champagne at six, dinner at seven, a band at ten, and martinis at midnight.',
    dressCode: 'Black tie — long dresses, velvet, and your best earrings.',
  },
];
freya.details = {
  venue: 'No. 14 Belgrave Square',
  address: 'Belgrave Square, London SW1X 8PJ',
  mapUrl: 'https://maps.google.com/?q=Belgrave+Square+London',
  dressCode: 'Black tie',
  dressCodeNote:
    'The register office is a five-minute walk from the house. Central London is cold in December — a coat is part of the outfit.',
  travel: 'Hyde Park Corner and Knightsbridge are both a ten-minute walk. There is no parking on the square; please take a cab.',
  accommodation:
    'We have rates at The Berkeley and The Lanesborough. Both are a short walk from the house. Quote “Freya & James” before 1 November.',
  gifts: 'No gifts. We are asking instead for a photograph, printed or digital, from the day.',
  additionalTitle: 'After the ceremony',
  additional: 'There is a gap between the register office and dinner. The bar at the house opens at five — come and warm up.',
};
freya.settings.envelopeAnimation = 'curtain';
freya.settings.rsvpDeadline = new Date(Date.now() + 30 * 86400000).toISOString();

/* ------------------------------------------------------------------ */

function insertInvitation(data: InvitationData, templateId: string, slug: string, status: 'draft' | 'published') {
  const id = uid('inv_');
  run(
    'INSERT INTO invitations (id, user_id, slug, template_id, status, data) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    userId,
    slug,
    templateId,
    status,
    JSON.stringify(data),
  );
  return id;
}

const rosalindId = insertInvitation(rosalind, 'maison', 'rosalind-henry', 'published');
const claraId = insertInvitation(clara, 'aurelia', 'clara-julien', 'published');
insertInvitation(freya, 'belgrave', 'freya-james', 'draft');

interface GuestSeed {
  name: string;
  email?: string;
  group: string;
  party: number;
  events?: string[];
  attending?: boolean | null;
  meal?: string;
  dietary?: string;
  accessibility?: string;
  children?: string;
  song?: string;
  note?: string;
}

const rosalindGuests: GuestSeed[] = [
  { name: 'The Whitfield Family', email: 'whitfield@example.com', group: 'Family', party: 4, attending: true, meal: 'Slow-braised beef', dietary: 'One gluten-free plate, please.', children: 'Two children, ages 6 and 9.', song: 'September', note: 'We would not miss it for the world.' },
  { name: 'Nana & Grandpa Pike', email: 'pike@example.com', group: 'Family', party: 2, attending: true, meal: 'Sea bass', accessibility: 'Ground-floor seating, please. Grandpa uses a walking stick.' },
  { name: 'Charlotte & Edward', email: 'charlotte@example.com', group: 'Family', party: 2, attending: true, meal: 'Heritage vegetarian', song: 'Dancing Queen' },
  { name: 'The Bennett Family', email: 'bennett@example.com', group: 'Family', party: 3, attending: false, note: 'Heartbroken to miss it — sending all our love from Edinburgh.' },
  { name: 'Beatrice Hale', email: 'beatrice@example.com', group: 'Friends', party: 1, events: ['ceremony', 'dinner'], attending: true, meal: 'Vegan', dietary: 'Dairy-free.', song: 'Dreams' },
  { name: 'Tom & Imogen', email: 'tom@example.com', group: 'Friends', party: 2, events: ['ceremony', 'dinner'], attending: true, meal: 'Slow-braised beef', song: 'Levitating' },
  { name: 'Harriet Cole', email: 'harriet@example.com', group: 'Friends', party: 1, attending: null },
  { name: 'The Ashworths', email: 'ashworth@example.com', group: 'Friends', party: 4, attending: true, meal: 'Heritage vegetarian', dietary: 'Two vegan, two vegetarian.', song: 'Kala Chashma' },
  { name: 'Oliver Reed', email: 'oliver@example.com', group: 'Colleagues', party: 1, attending: null },
  { name: 'Sofia & Marcus', email: 'sofia@example.com', group: 'Colleagues', party: 2, attending: true, meal: 'Sea bass' },
  { name: 'Rupert Lloyd', email: 'rupert@example.com', group: 'Colleagues', party: 1, attending: false },
  { name: 'The Fitzgerald Family', email: 'fitzgerald@example.com', group: 'Family', party: 4, attending: null },
];

const claraGuests: GuestSeed[] = [
  { name: 'Maman & Papa Laurent', email: 'laurent@example.com', group: 'Family', party: 2, attending: true, meal: 'Slow-braised beef', song: 'La Vie en Rose' },
  { name: 'Sophie & Marc', email: 'sophie@example.com', group: 'Family', party: 2, attending: true, meal: 'Sea bass', dietary: 'Sophie is gluten-free.' },
  { name: 'The Whitfield Family', email: 'whitfield@example.com', group: 'Family', party: 4, attending: true, meal: 'Children’s plate', children: 'Two children, ages 4 and 7.', accessibility: 'Please seat us near an exit — our youngest is a flight risk.' },
  { name: 'Élodie Rousseau', email: 'elodie@example.com', group: 'Friends', party: 1, attending: true, meal: 'Vegan', song: 'Dancing Queen' },
  { name: 'Tom & Priya', email: 'tom@example.com', group: 'Friends', party: 2, attending: null },
  { name: 'The Okonkwo Family', email: 'okonkwo@example.com', group: 'Friends', party: 3, attending: false, note: 'So sorry to miss it. We will raise a glass from Lagos.' },
  { name: 'James Whitfield', email: 'james@example.com', group: 'Friends', party: 1, attending: true, meal: 'Slow-braised beef', song: 'September' },
  { name: 'Ana & Luis', email: 'ana@example.com', group: 'Friends', party: 2, attending: null },
  { name: 'Camille Dubois', email: 'camille@example.com', group: 'Colleagues', party: 1, attending: true, meal: 'Heritage vegetarian' },
  { name: 'Henrik Sørensen', email: 'henrik@example.com', group: 'Colleagues', party: 1, attending: null },
];

function insertGuest(invitationId: string, seed: GuestSeed, eventIds: string[]): string {
  const id = uid('gst_');
  const token = guestToken();
  run(
    `INSERT INTO guests (id, invitation_id, name, email, group_name, token, party_size, invited_event_ids)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    invitationId,
    seed.name,
    seed.email ?? null,
    seed.group,
    token,
    seed.party,
    JSON.stringify(seed.events?.length ? seed.events : eventIds),
  );
  if (seed.attending !== null && seed.attending !== undefined) {
    run(
      `INSERT INTO rsvps (id, invitation_id, guest_id, attending, event_ids, meal, dietary, accessibility, children, song_request, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      uid('rsvp_'),
      invitationId,
      id,
      seed.attending ? 1 : 0,
      JSON.stringify(seed.attending ? (seed.events?.length ? seed.events : eventIds) : []),
      seed.meal ?? null,
      seed.dietary ?? null,
      seed.accessibility ?? null,
      seed.children ?? null,
      seed.song ?? null,
      seed.note ?? null,
    );
  }
  return id;
}

const rosalindEventIds = rosalind.events.map((e) => e.id);
const claraEventIds = clara.events.map((e) => e.id);

const rosalindGuestIds = rosalindGuests.map((g) => insertGuest(rosalindId, g, rosalindEventIds));
const claraGuestIds = claraGuests.map((g) => insertGuest(claraId, g, claraEventIds));

/* Blessings */
const rosalindMessages: [string, string][] = [
  ['Nana', 'My darling girl, I have waited for this day since the moment you were born. May your home always smell of tea and laughter.'],
  ['Charlotte', 'Rosalind and Henry, the way you look at each other makes the rest of us believe in the good kind of love. Cannot wait for the marquee.'],
  ['Beatrice', 'I have already started practising my ceilidh steps. Fair warning: I am taking this very seriously.'],
  ['Tom', 'From university kitchens to this. So proud of you, and so happy for you both.'],
  ['The Ashworths', 'Wishing you a lifetime of joy, patience, and excellent food. See you under the marquee.'],
  ['Sofia', 'Save us a dance, and a plate of the beef. All our love from Bristol.'],
];
for (const [author, text] of rosalindMessages) {
  const guest = get<{ id: string }>(
    'SELECT id FROM guests WHERE invitation_id = ? AND (name = ? OR name LIKE ?) LIMIT 1',
    rosalindId,
    author,
    `${author.split(' ')[0]}%`,
  );
  run(
    'INSERT INTO messages (id, invitation_id, guest_id, author, text) VALUES (?, ?, ?, ?, ?)',
    uid('msg_'),
    rosalindId,
    guest?.id ?? null,
    author,
    text,
  );
}

const claraMessages: [string, string][] = [
  ['Sophie', 'Clara, I still remember you telling me you would never get married. Julien, thank you for proving her wrong so beautifully.'],
  ['Maman', 'My dear ones, the garden is ready, the candles are ordered, and your father has already chosen a tie. We love you.'],
  ['Élodie', 'The lake, the long table, the two of you. It is going to be perfect.'],
  ['James', 'Best news of the year. Save me a seat near the band.'],
];
for (const [author, text] of claraMessages) {
  const guest = get<{ id: string }>(
    'SELECT id FROM guests WHERE invitation_id = ? AND (name = ? OR name LIKE ?) LIMIT 1',
    claraId,
    author,
    `%${author.split(' ')[0]}%`,
  );
  run(
    'INSERT INTO messages (id, invitation_id, guest_id, author, text) VALUES (?, ?, ?, ?, ?)',
    uid('msg_'),
    claraId,
    guest?.id ?? null,
    author,
    text,
  );
}

/* Seating */
function makeTable(invitationId: string, name: string, capacity: number, x: number, y: number): string {
  const id = uid('tbl_');
  run(
    'INSERT INTO seating_tables (id, invitation_id, name, capacity, x, y) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    invitationId,
    name,
    capacity,
    x,
    y,
  );
  return id;
}

const oak = makeTable(rosalindId, 'Oak', 8, 0, 0);
const elm = makeTable(rosalindId, 'Elm', 8, 1, 0);
const birch = makeTable(rosalindId, 'Birch', 6, 0, 1);
makeTable(rosalindId, 'Lime', 6, 1, 1);
for (const [i, guestId] of rosalindGuestIds.slice(0, 8).entries()) {
  run(
    'INSERT OR IGNORE INTO seating_assignments (invitation_id, guest_id, table_id) VALUES (?, ?, ?)',
    rosalindId,
    guestId,
    i < 4 ? oak : elm,
  );
}
for (const [i, guestId] of rosalindGuestIds.slice(8, 11).entries()) {
  run(
    'INSERT OR IGNORE INTO seating_assignments (invitation_id, guest_id, table_id) VALUES (?, ?, ?)',
    rosalindId,
    guestId,
    i === 0 ? birch : elm,
  );
}

const lavender = makeTable(claraId, 'Lavender', 8, 0, 0);
const olive = makeTable(claraId, 'Olive', 8, 1, 0);
for (const [i, guestId] of claraGuestIds.slice(0, 6).entries()) {
  run(
    'INSERT OR IGNORE INTO seating_assignments (invitation_id, guest_id, table_id) VALUES (?, ?, ?)',
    claraId,
    guestId,
    i < 4 ? lavender : olive,
  );
}

console.log(`✓ Seeded demo account ${demoEmail} / vellum1234`);
console.log(`✓ 3 UK invitations, ${rosalindGuests.length + claraGuests.length} guest households`);
console.log('✓ Typographic templates, no stock photography');
