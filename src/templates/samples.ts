import { createInvitationData, type TemplateId } from '@shared/defaults';
import type { EventDetails, InvitationData } from '@shared/types';
import { getTemplate } from './registry';

function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

interface SampleMeta {
  a: string;
  b: string;
  monogram: string;
  tagline: string;
  hashtag: string;
  location: string;
  time: string;
  offset: number;
  welcomeHeading: string;
  welcomeNote: string;
  storyIntro: string;
  story: { title: string; body: string }[];
  events: {
    name: string;
    subtitle: string;
    offset: number;
    start: string;
    end?: string;
    venue: string;
    address: string;
    map: string;
    description: string;
    dressCode: string;
  }[];
  details: {
    venue: string;
    address: string;
    map: string;
    dressCode: string;
    note: string;
    travel: string;
    stay: string;
    gifts: string;
    extraTitle: string;
    extra: string;
  };
  track: string;
}

const SAMPLE_META: Record<TemplateId, SampleMeta> = {
  aurelia: {
    a: 'Clara',
    b: 'Julien',
    monogram: 'C&J',
    tagline: 'A garden, a long lunch, and everyone we love',
    hashtag: '#ClaraAndJulien',
    location: 'Villa Serena, Lake Como',
    time: '16:30',
    offset: 96,
    welcomeHeading: 'Together with our families',
    welcomeNote:
      'We are marrying in the place we first went on holiday together, and we would love you to be there for the whole of it. A ceremony at four, then dinner under the trees until the candles give out.',
    storyIntro: 'Three summers, one very long lunch, and a question asked badly in Italian.',
    story: [
      {
        title: 'A table for two, in the rain',
        body: 'We were seated next to each other at a friend’s supper club because there was nowhere else to sit. Julien ordered for both of us. Clara let him, which has never happened since.',
      },
      {
        title: 'The same lake, three years later',
        body: 'On the terrace where we spent our first holiday, with a ring bought in Hatton Garden and a speech practised for weeks, the answer came before the question did.',
      },
      {
        title: 'And now, with you',
        body: 'Our families have met, the menu has been argued over twice, and the only thing left is to have you there. Come for the weekend if you can.',
      },
    ],
    events: [
      {
        name: 'The Wedding',
        subtitle: 'Vows beneath the cypresses',
        offset: 96,
        start: '16:30',
        end: '23:30',
        venue: 'Villa Serena',
        address: 'Via Regina 14, Tremezzo, Lake Como',
        map: 'https://maps.google.com/?q=Tremezzo+Lake+Como',
        description: 'Drinks on the terrace at four, ceremony at half past, dinner at seven, dancing after.',
        dressCode: 'Black tie optional — long dresses, linen suits, comfortable heels for gravel.',
      },
      {
        name: 'The Long Lunch',
        subtitle: 'The day after, by the water',
        offset: 97,
        start: '12:30',
        end: '17:00',
        venue: 'Ristorante Aurora',
        address: 'Piazza Garibaldi 2, Menaggio',
        map: 'https://maps.google.com/?q=Menaggio+Lake+Como',
        description: 'No speeches, no schedule. Just pasta, wine and whoever is still standing.',
        dressCode: 'Whatever you wore yesterday, ideally.',
      },
    ],
    details: {
      venue: 'Villa Serena',
      address: 'Via Regina 14, Tremezzo, Lake Como, Italy',
      map: 'https://maps.google.com/?q=Tremezzo+Lake+Como',
      dressCode: 'Black tie optional',
      note: 'The ceremony is on grass and the terrace is gravel — block heels are a good idea. Evenings by the lake turn cool, so bring a wrap.',
      travel: 'Milan Malpensa is 75 minutes by car. We have two coaches leaving Terminal 1 at 13:00 on Saturday; email us to reserve a seat. Como San Giovanni is the nearest station, 20 minutes by taxi.',
      stay: 'We have held rooms at Villa Sereno and Hotel Aurora in Menaggio. Quote “Clara & Julien” before 1 May.',
      gifts: 'Your being there is the gift. If you would like to do something, we are saving for a small boat.',
      extraTitle: 'A note on the weekend',
      extra: 'Saturday is the wedding; Sunday is the recovery. Please tell us on the RSVP if you are staying for lunch so we can set the table.',
    },
    track: 'golden-hour',
  },
  maison: {
    a: 'Rosalind',
    b: 'Henry',
    monogram: 'R&H',
    tagline: 'A marquee, a meadow, and the English weather',
    hashtag: '#RosalindAndHenry',
    location: 'Thornbury Hall, Gloucestershire',
    time: '14:00',
    offset: 74,
    welcomeHeading: 'With the blessing of our families',
    welcomeNote:
      'We are getting married in the walled garden where Henry proposed, followed by dinner in a marquee that we have been assured will not leak. Please arrive in time for a drink before the ceremony.',
    storyIntro: 'A village fête, a lost dog, and a very slow beginning.',
    story: [
      {
        title: 'The fête',
        body: 'Rosalind was judging the jam. Henry was holding a stolen spaniel. Neither of us was doing what we were supposed to be doing, which set the tone rather well.',
      },
      {
        title: 'The walled garden',
        body: 'Four winters later, in the same garden, Henry produced a ring from a coat pocket and a speech from memory. Both survived.',
      },
      {
        title: 'Now, with you',
        body: 'We are filling the garden with long tables, garden roses and every person we love. Bring a coat and your dancing shoes.',
      },
    ],
    events: [
      {
        name: 'The Ceremony',
        subtitle: 'In the walled garden',
        offset: 74,
        start: '14:00',
        end: '15:00',
        venue: 'Thornbury Hall',
        address: 'Thornbury, Gloucestershire GL12 8AB',
        map: 'https://maps.google.com/?q=Thornbury+Hall+Gloucestershire',
        description: 'Please be seated by 13:50. Confetti is provided and encouraged.',
        dressCode: 'Garden formal — linen, silk, and shoes that can handle grass.',
      },
      {
        name: 'Dinner & Dancing',
        subtitle: 'In the marquee',
        offset: 74,
        start: '17:30',
        end: '01:00',
        venue: 'Thornbury Hall',
        address: 'Thornbury, Gloucestershire GL12 8AB',
        map: 'https://maps.google.com/?q=Thornbury+Hall+Gloucestershire',
        description: 'A three-course dinner, a band, and a cheese table at midnight.',
        dressCode: 'Garden formal',
      },
      {
        name: 'Sunday Breakfast',
        subtitle: 'The recovery',
        offset: 75,
        start: '10:30',
        end: '13:00',
        venue: 'The Apple Barn',
        address: 'Thornbury Hall, Gloucestershire GL12 8AB',
        map: 'https://maps.google.com/?q=Thornbury+Hall+Gloucestershire',
        description: 'Bacon baps, coffee and a walk to the river for anyone who would like one.',
        dressCode: 'Whatever you slept in — within reason.',
      },
    ],
    details: {
      venue: 'Thornbury Hall',
      address: 'Thornbury, Gloucestershire GL12 8AB',
      map: 'https://maps.google.com/?q=Thornbury+Hall+Gloucestershire',
      dressCode: 'Garden formal',
      note: 'The ceremony is on grass and the marquee floor is boarded. A wrap or jacket will be welcome after dark.',
      travel: 'Bristol Temple Meads is 35 minutes by car. There is parking on site, and a coach back to Bristol at midnight and at 01:00.',
      stay: 'We have rooms held at The Fleece in Thornbury and at Thornbury Hall itself. Quote “Rosalind & Henry” before 1 May.',
      gifts: 'Nothing, please. We have a house full of things and a honeymoon already paid for. A note in the guest book is more than enough.',
      extraTitle: 'Children',
      extra: 'Children are very welcome at the ceremony and dinner. There will be a film and a babysitter in the library from 20:30 for anyone who needs it.',
    },
    track: 'garden',
  },
  belgrave: {
    a: 'Freya',
    b: 'James',
    monogram: 'F&J',
    tagline: 'A registry office, a townhouse, and the park',
    hashtag: '#FreyaAndJames',
    location: 'Belgrave Square, London',
    time: '15:00',
    offset: 58,
    welcomeHeading: 'Together with our families',
    welcomeNote:
      'We are doing the small legal thing first, then dinner and dancing in a house on the square. Black tie, because it is nearly Christmas and we hardly get the chance.',
    storyIntro: 'A borrowed umbrella, a shared cab, and a very London beginning.',
    story: [
      {
        title: 'Outside the Royal Oak',
        body: 'Freya had no umbrella. James had two, for reasons he has never fully explained. They shared one to the tube, and then, slightly unnecessarily, all the way to Marylebone.',
      },
      {
        title: 'The second winter',
        body: 'A proposal on a freezing bench in St James’s Park, interrupted by a swan and a tourist asking for directions. It was, in every way, ours.',
      },
      {
        title: 'Now, with you',
        body: 'We have hired the house next to the one where we met, filled it with candles, and invited the people who made the last five years worth telling stories about.',
      },
    ],
    events: [
      {
        name: 'The Ceremony',
        subtitle: 'The small legal thing',
        offset: 58,
        start: '15:00',
        end: '15:30',
        venue: 'Westminster Register Office',
        address: '317 Harrow Road, London W9 3RB',
        map: 'https://maps.google.com/?q=Westminster+Register+Office',
        description: 'Please arrive by 14:40. The ceremony is short; the photographs are not.',
        dressCode: 'Black tie',
      },
      {
        name: 'Dinner & Dancing',
        subtitle: 'On the square',
        offset: 58,
        start: '18:00',
        end: '00:30',
        venue: 'No. 14 Belgrave Square',
        address: 'Belgrave Square, London SW1X 8PJ',
        map: 'https://maps.google.com/?q=Belgrave+Square+London',
        description: 'Champagne at six, dinner at seven, a band at ten, and martinis at midnight.',
        dressCode: 'Black tie — long dresses, velvet, and your best earrings.',
      },
      {
        name: 'Sunday Lunch',
        subtitle: 'The long goodbye',
        offset: 59,
        start: '13:00',
        end: '16:00',
        venue: 'The Pantechnicon',
        address: '10 Motcomb Street, London SW1X 8LA',
        map: 'https://maps.google.com/?q=The+Pantechnicon+Belgravia',
        description: 'A proper Sunday roast, for whoever is still in London.',
        dressCode: 'Whatever is clean.',
      },
    ],
    details: {
      venue: 'No. 14 Belgrave Square',
      address: 'Belgrave Square, London SW1X 8PJ',
      map: 'https://maps.google.com/?q=Belgrave+Square+London',
      dressCode: 'Black tie',
      note: 'The register office is a five-minute walk from the house. Central London is cold in December — a coat is part of the outfit.',
      travel: 'Hyde Park Corner and Knightsbridge are both a ten-minute walk. There is no parking on the square; please take a cab.',
      stay: 'We have rates at The Berkeley and The Lanesborough. Both are a short walk from the house. Quote “Freya & James” before 1 November.',
      gifts: 'No gifts. We are asking instead for a photograph, printed or digital, from the day.',
      extraTitle: 'After the ceremony',
      extra: 'There is a gap between the register office and dinner. The bar at the house opens at five — come and warm up.',
    },
    track: 'moonlit',
  },
  celeste: {
    a: 'Mira',
    b: 'Theo',
    monogram: 'M&T',
    tagline: 'A long way north, under a very good sky',
    hashtag: '#MiraAndTheo',
    location: 'Isle of Skye, Scotland',
    time: '17:00',
    offset: 128,
    welcomeHeading: 'Together, under the same sky',
    welcomeNote:
      'We are marrying at the edge of the island where we spent our first New Year, with a fire, a fiddler and as many of you as can make the journey. Bring boots.',
    storyIntro: 'A bothy, a power cut, and a sky with no light pollution.',
    story: [
      {
        title: 'The bothy',
        body: 'We booked it because it was cheap. It had no electricity, one pan, and a view that made both of us go quiet for a full minute.',
      },
      {
        title: 'New Year, minus four degrees',
        body: 'We stood outside at midnight with a flask and watched the whole of the Milky Way come out. Theo asked. Mira said yes, mostly to get back inside.',
      },
      {
        title: 'Now, with you',
        body: 'The same island, a proper fire, and a ceilidh band. We would love you to be there for the ceremony and stay for the whisky.',
      },
    ],
    events: [
      {
        name: 'The Ceremony',
        subtitle: 'At the old chapel',
        offset: 128,
        start: '17:00',
        end: '18:00',
        venue: 'St Columba’s Chapel',
        address: 'Skeabost, Isle of Skye IV51 9NP',
        map: 'https://maps.google.com/?q=Skeabost+Isle+of+Skye',
        description: 'Candles, a fiddler, and a short ceremony. Please arrive by 16:45.',
        dressCode: 'Black tie with boots — the lane is not paved.',
      },
      {
        name: 'Dinner & Ceilidh',
        subtitle: 'At the boathouse',
        offset: 128,
        start: '19:30',
        end: '01:00',
        venue: 'The Boathouse, Skeabost',
        address: 'Skeabost Bridge, Isle of Skye IV51 9NP',
        map: 'https://maps.google.com/?q=Skeabost+Bridge+Skye',
        description: 'A long table, local lamb and scallops, then a ceilidh that will not be dignified.',
        dressCode: 'Black tie with boots',
      },
      {
        name: 'The Morning After',
        subtitle: 'A walk and a fire',
        offset: 129,
        start: '11:00',
        end: '14:00',
        venue: 'The Boathouse',
        address: 'Skeabost Bridge, Isle of Skye IV51 9NP',
        map: 'https://maps.google.com/?q=Skeabost+Bridge+Skye',
        description: 'Soup, bread and a walk to the point for anyone who fancies it.',
        dressCode: 'Waterproofs.',
      },
    ],
    details: {
      venue: 'Skeabost, Isle of Skye',
      address: 'Skeabost Bridge, Isle of Skye IV51 9NP',
      map: 'https://maps.google.com/?q=Skeabost+Bridge+Skye',
      dressCode: 'Black tie with boots',
      note: 'It will be cold and possibly wet. A coat, a scarf and shoes that can handle a gravel lane will make the evening much better.',
      travel: 'Inverness is the nearest airport, two hours by car. We have a minibus from Inverness at 13:00 on the day — tell us if you would like a seat. The train to Kyle of Lochalsh is one of the best in Britain; taxis meet it.',
      stay: 'Rooms are held at Skeabost House and at three cottages in Bernisdale. Everything else is a drive, so book early.',
      gifts: 'If you would like to give something, the Skye Mountain Rescue team would be delighted.',
      extraTitle: 'Weather',
      extra: 'We are getting married whatever the sky does. There is a fire, a roof and a spare pair of wellies in every size.',
    },
    track: 'moonlit',
  },
  salento: {
    a: 'Lucia',
    b: 'Marco',
    monogram: 'L&M',
    tagline: 'Salt in the air, sand in your shoes',
    hashtag: '#LuciaAndMarco',
    location: 'Casa del Sole, Puglia',
    time: '18:00',
    offset: 110,
    welcomeHeading: 'With our families, in the heat',
    welcomeNote:
      'We were married legally in London in the spring. This is the celebration: a week in Puglia, a ceremony at sunset, and a table that stays out until the small hours.',
    storyIntro: 'An olive grove, a rented Fiat, and a heatwave.',
    story: [
      {
        title: 'The wrong turning',
        body: 'We got lost outside Ostuni and ended up at a farmhouse where a woman gave us water, olives and directions we did not follow. We stayed for three hours.',
      },
      {
        title: 'The same farmhouse',
        body: 'We went back every year. On the fourth, Marco asked the owner’s permission before he asked Lucia, which everyone agreed was the correct order.',
      },
      {
        title: 'Now, with you',
        body: 'The farmhouse, the olive grove, and one very long table. Wear something that can cope with heat and dancing.',
      },
    ],
    events: [
      {
        name: 'The Ceremony',
        subtitle: 'Sunset in the grove',
        offset: 110,
        start: '18:00',
        end: '19:00',
        venue: 'Casa del Sole',
        address: 'Contrada Lamacesare, Ostuni, Puglia',
        map: 'https://maps.google.com/?q=Ostuni+Puglia',
        description: 'Aperitivo from five, ceremony at six, dinner at eight.',
        dressCode: 'Summer formal — linen, silk, flat sandals for grass.',
      },
      {
        name: 'The Long Table',
        subtitle: 'Dinner under the olives',
        offset: 110,
        start: '20:00',
        end: '02:00',
        venue: 'Casa del Sole',
        address: 'Contrada Lamacesare, Ostuni, Puglia',
        map: 'https://maps.google.com/?q=Ostuni+Puglia',
        description: 'Burrata, sea bass, a ridiculous amount of wine, and a band at eleven.',
        dressCode: 'Summer formal',
      },
      {
        name: 'Beach Day',
        subtitle: 'The recovery',
        offset: 111,
        start: '11:00',
        end: '16:00',
        venue: 'Lido Morelli',
        address: 'Ostuni Marina, Puglia',
        map: 'https://maps.google.com/?q=Lido+Morelli+Ostuni',
        description: 'Sunbeds, fruit, and a very slow lunch. We have reserved an area.',
        dressCode: 'Swimming things.',
      },
    ],
    details: {
      venue: 'Casa del Sole',
      address: 'Contrada Lamacesare, Ostuni, Puglia, Italy',
      map: 'https://maps.google.com/?q=Ostuni+Puglia',
      dressCode: 'Summer formal',
      note: 'The ground is uneven and the ceremony is outdoors. Bring a light layer for later — the temperature drops quickly.',
      travel: 'Brindisi airport is 40 minutes away. We are running a coach from the airport at 15:00 on the day and back on Sunday morning.',
      stay: 'We have blocked rooms at Hotel Aurora in Ostuni and at the masseria itself. Quote “Lucia & Marco” before 1 June.',
      gifts: 'No gifts — come and eat. If you insist, a contribution to the olive tree we are planting would be lovely.',
      extraTitle: 'The week',
      extra: 'We will be at the beach from Wednesday. Message us if you are arriving early and we will save you a sunbed.',
    },
    track: 'golden-hour',
  },
  noir: {
    a: 'Inès',
    b: 'Alexander',
    monogram: 'I&A',
    tagline: 'Two colours, one flower, no noise',
    hashtag: '#InesAndAlexander',
    location: 'The Dorchester, London',
    time: '19:00',
    offset: 142,
    welcomeHeading: 'You are invited',
    welcomeNote:
      'A short ceremony, a long dinner, and a band. We have kept everything else deliberately simple: one room, one menu, one very good orchestra.',
    storyIntro: 'A gallery opening, a shared taxi, and a conversation that did not end.',
    story: [
      {
        title: 'The gallery',
        body: 'Inès was there for the paintings. Alexander was there for the wine. They left together at closing time, having spoken to almost nobody else.',
      },
      {
        title: 'The question',
        body: 'Asked in the same room, a year later, in front of the same painting. The gallery owner cried before either of them did.',
      },
      {
        title: 'Now, with you',
        body: 'Black tie, one calla lily per table, and a menu we have been arguing about for six months. We are so glad you are coming.',
      },
    ],
    events: [
      {
        name: 'The Ceremony',
        subtitle: 'The Orchid Room',
        offset: 142,
        start: '19:00',
        end: '19:30',
        venue: 'The Dorchester',
        address: 'Park Lane, London W1K 1QA',
        map: 'https://maps.google.com/?q=The+Dorchester+Park+Lane',
        description: 'Please arrive at 18:40. Champagne is served from six.',
        dressCode: 'Black tie, strictly',
      },
      {
        name: 'Dinner',
        subtitle: 'The Ballroom',
        offset: 142,
        start: '20:15',
        end: '23:00',
        venue: 'The Dorchester',
        address: 'Park Lane, London W1K 1QA',
        map: 'https://maps.google.com/?q=The+Dorchester+Park+Lane',
        description: 'Five courses, one wine pairing, no speeches longer than four minutes.',
        dressCode: 'Black tie, strictly',
      },
      {
        name: 'Dancing',
        subtitle: 'Until late',
        offset: 142,
        start: '23:00',
        end: '02:00',
        venue: 'The Dorchester',
        address: 'Park Lane, London W1K 1QA',
        map: 'https://maps.google.com/?q=The+Dorchester+Park+Lane',
        description: 'A twenty-piece orchestra, then a DJ who has been given very specific instructions.',
        dressCode: 'Black tie',
      },
    ],
    details: {
      venue: 'The Dorchester',
      address: 'Park Lane, London W1K 1QA',
      map: 'https://maps.google.com/?q=The+Dorchester+Park+Lane',
      dressCode: 'Black tie, strictly',
      note: 'Long gowns and dinner jackets. The ballroom is warm; the terrace is not.',
      travel: 'Hyde Park Corner is a four-minute walk. Valet parking is available from the Park Lane entrance.',
      stay: 'A block of rooms is held at The Dorchester and at The Connaught. Quote “Inès & Alexander” before 1 October.',
      gifts: 'We have everything we need. A bottle for the cellar, or a note for the book, would be perfect.',
      extraTitle: 'The timetable',
      extra: 'Drinks at six, ceremony at seven, dinner at quarter past eight. If you are running late, come anyway — we will still be there.',
    },
    track: 'moonlit',
  },
  heirloom: {
    a: 'Margaret',
    b: 'Henry',
    monogram: 'M&H',
    tagline: 'The things we keep',
    hashtag: '#MargaretAndHenry',
    location: 'Wren Cottage, Suffolk',
    time: '15:30',
    offset: 88,
    welcomeHeading: 'With the blessing of our families',
    welcomeNote:
      'We are marrying in the village church where Margaret’s parents married, followed by supper in the barn. Nothing fashionable, everything we love.',
    storyIntro: 'A bookshop, a shared umbrella, and forty years of good timing.',
    story: [
      {
        title: 'The bookshop',
        body: 'Margaret was looking for a first edition. Henry was looking for somewhere dry. They ended up in the poetry section for two hours and missed the train they had both intended to catch.',
      },
      {
        title: 'The second chapter',
        body: 'Neither of us thought we would do this again. A walk along the estuary, a very plain question, and a bottle of something older than both of us.',
      },
      {
        title: 'Now, with you',
        body: 'Our children are arranging the flowers, the dog is coming to the church, and the barn is full of long tables. Please come and help us make a noise.',
      },
    ],
    events: [
      {
        name: 'The Ceremony',
        subtitle: 'At St Mary’s',
        offset: 88,
        start: '15:30',
        end: '16:30',
        venue: 'St Mary’s Church',
        address: 'Church Lane, Wrentham, Suffolk NR34 7AA',
        map: 'https://maps.google.com/?q=Wrentham+Suffolk',
        description: 'The choir is the village choir. The bells are the village bells. Please be seated by 15:20.',
        dressCode: 'Country formal — tweed, silk, and shoes for a churchyard.',
      },
      {
        name: 'Supper in the Barn',
        subtitle: 'At Wren Cottage',
        offset: 88,
        start: '18:00',
        end: '23:30',
        venue: 'Wren Cottage',
        address: 'Wrentham, Suffolk NR34 7AA',
        map: 'https://maps.google.com/?q=Wrentham+Suffolk',
        description: 'A ham, a salmon, a great deal of pudding, and a piano.',
        dressCode: 'Country formal',
      },
      {
        name: 'Sunday Walk',
        subtitle: 'The coast path',
        offset: 89,
        start: '10:30',
        end: '13:00',
        venue: 'Covehithe Beach',
        address: 'Covehithe, Suffolk NR34 7TN',
        map: 'https://maps.google.com/?q=Covehithe+Beach',
        description: 'A walk to the ruined church and back, then soup at the cottage.',
        dressCode: 'Boots.',
      },
    ],
    details: {
      venue: 'Wren Cottage',
      address: 'Wrentham, Suffolk NR34 7AA',
      map: 'https://maps.google.com/?q=Wrentham+Suffolk',
      dressCode: 'Country formal',
      note: 'The churchyard path is gravel and the barn floor is old brick. A coat is essential after dark.',
      travel: 'Halesworth is the nearest station, 15 minutes by taxi. There is parking in the village hall field, signed from the church.',
      stay: 'Rooms are held at The Angel in Halesworth and at three cottages in Wrentham. Quote “Margaret & Henry” before 1 May.',
      gifts: 'Please do not. We are two households becoming one and we have far too much already. A book for the shelf would be lovely.',
      extraTitle: 'The dog',
      extra: 'Bramble will be at the church and would like it noted that she is very friendly and entirely untrained.',
    },
    track: 'garden',
  },
  miel: {
    a: 'Poppy',
    b: 'Sam',
    monogram: 'P&S',
    tagline: 'The long table, the louder band',
    hashtag: '#PoppyAndSam',
    location: 'The Fig Farm, Sussex',
    time: '16:00',
    offset: 66,
    welcomeHeading: 'Come and dance with us',
    welcomeNote:
      'A ceremony in the orchard, dinner at one very long table, and a band that starts before the pudding. Children, dogs and questionable dance moves all welcome.',
    storyIntro: 'A festival, a lost tent, and a shared breakfast.',
    story: [
      {
        title: 'The festival',
        body: 'Poppy’s tent blew away in the second night. Sam offered half of his, mostly out of politeness, and then talked for six hours about nothing in particular.',
      },
      {
        title: 'The same field, five years on',
        body: 'We went back every summer. Last year, in the rain, with a ring borrowed from Poppy’s grandmother, Sam asked. Poppy said yes and then made him carry the tent.',
      },
      {
        title: 'Now, with you',
        body: 'The same field, a much better tent, and every person who has ever danced with us. Wear something you can move in.',
      },
    ],
    events: [
      {
        name: 'The Ceremony',
        subtitle: 'In the orchard',
        offset: 66,
        start: '16:00',
        end: '16:45',
        venue: 'The Fig Farm',
        address: 'Mill Lane, West Chiltington, Sussex RH20 2PZ',
        map: 'https://maps.google.com/?q=West+Chiltington+Sussex',
        description: 'Confetti, a short ceremony, and a drink in the field afterwards.',
        dressCode: 'Colour, please. Comfortable shoes for grass.',
      },
      {
        name: 'Dinner & Dancing',
        subtitle: 'The long table',
        offset: 66,
        start: '18:30',
        end: '01:00',
        venue: 'The Fig Farm',
        address: 'Mill Lane, West Chiltington, Sussex RH20 2PZ',
        map: 'https://maps.google.com/?q=West+Chiltington+Sussex',
        description: 'Sharing plates, a lot of wine, and a band at nine.',
        dressCode: 'Colour, please.',
      },
      {
        name: 'Breakfast',
        subtitle: 'The morning after',
        offset: 67,
        start: '10:00',
        end: '12:30',
        venue: 'The Fig Farm',
        address: 'Mill Lane, West Chiltington, Sussex RH20 2PZ',
        map: 'https://maps.google.com/?q=West+Chiltington+Sussex',
        description: 'Pastries, coffee and a very slow game of rounders.',
        dressCode: 'Whatever you like.',
      },
    ],
    details: {
      venue: 'The Fig Farm',
      address: 'Mill Lane, West Chiltington, Sussex RH20 2PZ',
      map: 'https://maps.google.com/?q=West+Chiltington+Sussex',
      dressCode: 'Colour, please',
      note: 'The orchard is a field. Flats or wedges, and a layer for when the sun goes down.',
      travel: 'Pulborough is the nearest station, ten minutes by taxi. There is a field for parking and a minibus back to the village at midnight.',
      stay: 'We have held rooms at The Crown in Pulborough and at three cottages in West Chiltington. Quote “Poppy & Sam” before 1 June.',
      gifts: 'No gifts. Bring a song request for the band and a story for the album.',
      extraTitle: 'The important bit',
      extra: 'This is a party, not a performance. Wear what makes you happy, eat everything, dance badly.',
    },
    track: 'first-dance',
  },
};

export function sampleInvitation(templateId: TemplateId): InvitationData {
  const meta = SAMPLE_META[templateId] ?? SAMPLE_META.aurelia;
  const template = getTemplate(templateId);
  const base = createInvitationData(templateId);
  const eventIds = meta.events.map((_, i) => `sample-event-${i + 1}`);

  const events: EventDetails[] = meta.events.map((event, i) => ({
    id: eventIds[i],
    name: event.name,
    subtitle: event.subtitle,
    date: inDays(event.offset),
    startTime: event.start,
    endTime: event.end ?? '',
    venue: event.venue,
    address: event.address,
    mapUrl: event.map,
    description: event.description,
    dressCode: event.dressCode,
  }));

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + Math.max(20, meta.offset - 30));

  return {
    ...base,
    coupleA: meta.a,
    coupleB: meta.b,
    monogram: meta.monogram,
    tagline: meta.tagline,
    hashtag: meta.hashtag,
    weddingDate: inDays(meta.offset),
    weddingTime: meta.time,
    location: meta.location,
    welcomeHeading: meta.welcomeHeading,
    welcomeNote: meta.welcomeNote,
    storyIntro: meta.storyIntro,
    story: meta.story.map((chapter, i) => ({
      id: `sample-chapter-${i + 1}`,
      title: chapter.title,
      body: chapter.body,
    })),
    events,
    gallery: [],
    music: {
      ...base.music,
      trackId: meta.track,
      title: meta.track
        .split('-')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' '),
      artist: 'The Vellum Ensemble',
      enabled: true,
      startOnOpen: true,
      style: 'pill',
    },
    details: {
      venue: meta.details.venue,
      address: meta.details.address,
      mapUrl: meta.details.map,
      dressCode: meta.details.dressCode,
      dressCodeNote: meta.details.note,
      travel: meta.details.travel,
      accommodation: meta.details.stay,
      gifts: meta.details.gifts,
      additionalTitle: meta.details.extraTitle,
      additional: meta.details.extra,
    },
    settings: {
      ...base.settings,
      rsvpDeadline: deadline.toISOString(),
      envelopeAnimation: template.envelope,
      monogramStyle: template.monogramStyle,
      visibility: 'public',
    },
    theme: {
      palette: {},
      fontPair: '',
      scriptFont: '',
    },
  };
}
