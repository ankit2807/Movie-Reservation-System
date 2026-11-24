// Shared MovieBook-style theatre, showtime, seat layout, food menu, and poster fallback utilities

export const createPosterFallback = (title = 'MovieBook', subtitle = 'In Cinemas') => {
  const safeTitle = String(title).replace(/[<>&"']/g, '').slice(0, 26);
  const safeSub = String(subtitle).replace(/[<>&"']/g, '').slice(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1f2533"/>
        <stop offset="55%" stop-color="#2b3148"/>
        <stop offset="100%" stop-color="#f84464"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#bg)"/>
    <circle cx="340" cy="80" r="110" fill="rgba(255,255,255,0.05)"/>
    <circle cx="60" cy="520" r="140" fill="rgba(0,0,0,0.2)"/>
    <rect x="32" y="36" width="108" height="28" rx="6" fill="#f84464"/>
    <text x="86" y="55" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1">MOVIEBOOK</text>
    <text x="200" y="290" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800">${safeTitle}</text>
    <text x="200" y="330" text-anchor="middle" fill="rgba(255,255,255,0.75)" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="500">${safeSub}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const createAvatarFallback = (name = 'Artist', index = 0) => {
  const safeName = String(name).replace(/[<>&"']/g, '').trim();
  const parts = safeName.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase()
      : (safeName.slice(0, 2) || 'MB').toUpperCase();

  const palettes = [
    ['#1e293b', '#475569'],
    ['#312e81', '#4f46e5'],
    ['#881337', '#f43f5e'],
    ['#14532d', '#16a34a'],
    ['#7c2d12', '#ea580c'],
    ['#1e3a8a', '#2563eb'],
    ['#581c87', '#9333ea'],
    ['#134e4a', '#0d9488'],
  ];
  const [c1, c2] = palettes[Math.abs(index) % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
    <defs>
      <linearGradient id="av" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="240" height="240" rx="24" fill="url(#av)"/>
    <circle cx="120" cy="88" r="38" fill="rgba(255,255,255,0.22)"/>
    <path d="M48 212 C56 158, 184 158, 192 212" fill="rgba(255,255,255,0.18)"/>
    <text x="120" y="132" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="700" letter-spacing="1">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const SEAT_TIERS = [
  {
    tier: 'MAX RECLINER',
    label: 'MAX RECLINER',
    price: 1400,
    rows: ['A'],
    blocks: [15], // Seats 15 down to 01
    isRecliner: false,
  },
  {
    tier: 'EXECUTIVE',
    label: 'EXECUTIVE',
    price: 520,
    rows: ['B', 'C', 'D'],
    blocks: [3, 14], // Left block (17, 16, 15) + Main block (14..01)
    isRecliner: false,
  },
  {
    tier: 'PRIME',
    label: 'PRIME',
    price: 520,
    rows: ['E', 'F', 'G', 'H', 'I', 'J'],
    blocks: [2, 14], // Left block (16, 15) + Main block (14..01)
    isRecliner: false,
  },
  {
    tier: 'CLUB',
    label: 'CLUB',
    price: 500,
    rows: ['K', 'L'],
    blocks: [2, 14], // Left block (16, 15) + Main block (14..01)
    isRecliner: false,
  },
];

export const getTierForSeat = (seatId) => {
  if (!seatId) return SEAT_TIERS[2];
  const row = seatId[0].toUpperCase();
  return SEAT_TIERS.find((t) => t.rows.includes(row)) || SEAT_TIERS[2];
};

export const getTotalColsForTier = (tier) =>
  (tier?.blocks || [2, 14]).reduce((a, b) => a + b, 0);

const CITY_THEATRE_TEMPLATES = {
  Noida: [
    {
      id: 'moviemax-gulshan-noida',
      chain: 'MOVIEMAX',
      name: 'MovieMax Laserplex: Gulshan One 29 Mall, Noida',
      address: 'Plot 29, Sector 143, Noida Expressway, Noida',
      tags: ['Food & Beverage', 'M-Ticket'],
      cancellable: true,
      facilities: ['Laser & 7.1', 'M-Ticket', 'Food & Beverage', 'Parking'],
    },
    {
      id: 'miraj-tgip-noida',
      chain: 'MIRAJ',
      name: 'Miraj Cinemas: TGIP, Noida',
      address: 'The Great India Place Mall, Sector 38A, Noida',
      tags: ['Food & Beverage', 'M-Ticket'],
      cancellable: true,
      facilities: ['Dolby 7.1', 'M-Ticket', 'Food & Beverage', 'Recliner'],
    },
    {
      id: 'pvr-logix-noida',
      chain: 'PVR',
      name: 'PVR: Logix City Centre Mall, Noida',
      address: 'Plot BW-58, Sector 32, Near Noida City Centre Metro, Noida',
      tags: ['M-Ticket', 'Food & Beverage'],
      cancellable: true,
      facilities: ['Dolby Atmos', '4K Laser', 'IMAX', 'Recliner', 'Parking'],
    },
    {
      id: 'pvr-directors-dlf-noida',
      chain: 'PVR',
      name: 'PVR Directors Cut, DLF Mall Of India: Noida',
      address: '4th Floor, DLF Mall of India, Sector 18, Noida',
      tags: ['Food & Beverage', 'M-Ticket'],
      cancellable: true,
      facilities: ['LUXE', 'Gourmet Dining', 'Recliner'],
    },
    {
      id: 'inox-galleria-noida',
      chain: 'INOX',
      name: 'INOX: Gardens Galleria Mall, Noida',
      address: 'Sector 38A, Entertainment City, Noida',
      tags: ['M-Ticket', 'Food & Beverage'],
      cancellable: true,
      facilities: ['INSIGNIA', 'Dolby 7.1', 'Food Court'],
    },
    {
      id: 'cinepolis-dlf-noida',
      chain: 'CINEPOLIS',
      name: 'Cinépolis: DLF Mall of India, Noida',
      address: 'Plot M-03, Sector 18, Noida, Uttar Pradesh',
      tags: ['M-Ticket', 'Food & Beverage', 'Recliner'],
      cancellable: true,
      facilities: ['IMAX with Laser', '4DX', 'VIP Lounge'],
    },
  ],
};

export const getTheatresForCity = (city = 'Noida', movie = {}) => {
  const cleanCity = city || 'Noida';
  const baseTemplates = CITY_THEATRE_TEMPLATES[cleanCity] || [
    {
      id: `pvr-icon-${cleanCity.toLowerCase()}`,
      name: `PVR ICON: Phoenix Citadel, ${cleanCity}`,
      address: `Central Mall Road, Downtown ${cleanCity}`,
      tags: ['M-Ticket', 'Food & Beverage', 'Recliner'],
      cancellable: true,
      facilities: ['IMAX', 'Dolby Atmos', 'LUXE'],
    },
    {
      id: `inox-megaplex-${cleanCity.toLowerCase()}`,
      name: `INOX Megaplex: Nexus Mall, ${cleanCity}`,
      address: `3rd Floor, Nexus City Centre, ${cleanCity}`,
      tags: ['M-Ticket', 'Food & Beverage'],
      cancellable: true,
      facilities: ['INSIGNIA', '4K Laser', 'MX4D'],
    },
    {
      id: `cinepolis-vip-${cleanCity.toLowerCase()}`,
      name: `Cinépolis VIP: Grand Galleria, ${cleanCity}`,
      address: `MG Road, Phase 2, ${cleanCity}`,
      tags: ['M-Ticket', 'Food & Beverage', 'Recliner'],
      cancellable: true,
      facilities: ['4DX', 'Dolby 7.1', 'VIP Recliner'],
    },
    {
      id: `pvr-directors-${cleanCity.toLowerCase()}`,
      name: `PVR Director's Cut: Ambience, ${cleanCity}`,
      address: `Express Highway, ${cleanCity}`,
      tags: ['M-Ticket', 'Food & Beverage'],
      cancellable: false,
      facilities: ['ICE', 'Gourmet Dining', 'Recliner'],
    },
  ];

  const primaryLang =
    Array.isArray(movie?.languages) && movie.languages.length > 0
      ? movie.languages[0]
      : 'Hindi';

  const slotSets = [
    [
      { time: '03:45 PM', format: 'Laser & 7.1', screen: 'AUDI 02', status: 'AVAILABLE', basePrice: 500 },
      { time: '05:15 PM', format: 'Laser & 7.1', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 500 },
      { time: '11:30 PM', format: 'Laser & 7.1', screen: 'AUDI 03', status: 'AVAILABLE', basePrice: 500 },
    ],
    [
      { time: '10:30 AM', format: 'Dolby 7.1', screen: 'AUDI 04', status: 'AVAILABLE', basePrice: 500 },
      { time: '02:00 PM', format: 'Dolby 7.1', screen: 'AUDI 02', status: 'AVAILABLE', basePrice: 520 },
      { time: '05:15 PM', format: 'INSIGNIA 2D', screen: 'INSIGNIA 01', status: 'FAST_FILLING', basePrice: 520 },
      { time: '08:15 PM', format: '2D ATMOS', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 520 },
      { time: '11:00 PM', format: 'Dolby 7.1', screen: 'AUDI 04', status: 'AVAILABLE', basePrice: 500 },
    ],
    [
      { time: '11:00 AM', format: '4DX', screen: '4DX AUDI', status: 'AVAILABLE', basePrice: 520 },
      { time: '01:45 PM', format: 'IMAX 2D', screen: 'IMAX AUDI', status: 'AVAILABLE', basePrice: 520 },
      { time: '06:00 PM', format: 'Laser & 7.1', screen: 'AUDI 05', status: 'FAST_FILLING', basePrice: 520 },
      { time: '09:00 PM', format: 'IMAX 2D', screen: 'IMAX AUDI', status: 'ALMOST_FULL', basePrice: 520 },
    ],
    [
      { time: '10:15 AM', format: 'Laser & 7.1', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 500 },
      { time: '01:30 PM', format: 'Laser & 7.1', screen: 'AUDI 02', status: 'AVAILABLE', basePrice: 520 },
      { time: '04:45 PM', format: '4DX', screen: '4DX AUDI', status: 'AVAILABLE', basePrice: 520 },
      { time: '07:30 PM', format: 'ICE 2D', screen: 'P[XL] AUDI', status: 'FAST_FILLING', basePrice: 520 },
      { time: '10:30 PM', format: 'Laser & 7.1', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 500 },
    ],
    [
      { time: '11:30 AM', format: '2D ATMOS', screen: 'AUDI 03', status: 'AVAILABLE', basePrice: 500 },
      { time: '03:15 PM', format: '2D ATMOS', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 520 },
      { time: '06:45 PM', format: 'Laser & 7.1', screen: 'AUDI 02', status: 'FAST_FILLING', basePrice: 520 },
      { time: '09:50 PM', format: '2D ATMOS', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 520 },
    ],
  ];

  const movieId = movie?._id || 'movie';

  return baseTemplates.map((theatre, idx) => {
    const slots = slotSets[idx % slotSets.length].map((slot, sIdx) => ({
      _id: `bms__${movieId}__${theatre.id}__${sIdx}`,
      time: slot.time,
      startAt: slot.time,
      format: slot.format,
      language: primaryLang,
      screen: slot.screen,
      status: slot.status,
      price: slot.basePrice,
      tiers: [
        { label: 'MAX RECLINER', price: 1400, status: slot.status === 'ALMOST_FULL' ? 'FILLING FAST' : 'Available' },
        { label: 'EXECUTIVE', price: 520, status: 'Available' },
        { label: 'PRIME', price: 520, status: 'Available' },
        { label: 'CLUB', price: 500, status: 'Available' },
      ],
    }));

    return {
      ...theatre,
      shows: slots,
    };
  });
};

export const buildShowKey = (movieId, theatreId, dateStr, timeStr) => {
  const cleanTime = String(timeStr || '03:45 PM').replace(/\s+/g, '');
  return `${movieId || 'movie'}__${theatreId || 'moviemax-gulshan-noida'}__${dateStr || 'today'}__${cleanTime}`;
};

// Deterministic realistic occupied seats matching MovieBook's seat layout
export const generateBaselineOccupiedSeats = (showKey = 'default') => {
  const fixedSold = [
    'B14', 'B13', 'B12', 'B11', 'B10', 'B9', 'B5',
    'C11', 'C10', 'C9', 'C8',
    'D11', 'D10', 'D9', 'D8',
  ];
  let hash = 0;
  for (let i = 0; i < showKey.length; i++) {
    hash = (hash * 31 + showKey.charCodeAt(i)) >>> 0;
  }
  const extraPool = ['E8', 'E9', 'F7', 'F8', 'G9', 'G10', 'H6', 'H7'];
  const extra1 = extraPool[hash % extraPool.length];
  const extra2 = extraPool[(hash + 3) % extraPool.length];
  return Array.from(new Set([...fixedSold, extra1, extra2]));
};

export const FOOD_MENU = [
  {
    id: 'combo-couple',
    name: 'Couple Popcorn + 2 Pepsi Combo',
    desc: '1 Large Salted/Cheese Popcorn + 2 Regular Pepsi (300ml)',
    price: 490,
    originalPrice: 580,
    category: 'Combos',
    veg: true,
    bestseller: true,
    image: '/food/combo.jpg',
  },
  {
    id: 'popcorn-caramel',
    name: 'Large Caramel & Cheese Gourmet Tub',
    desc: 'Freshly popped signature duo popcorn tub (180g)',
    price: 340,
    originalPrice: 390,
    category: 'Popcorn',
    veg: true,
    bestseller: true,
    image: '/food/popcorn.jpg',
  },
  {
    id: 'nachos-cheese',
    name: 'Loaded Jalapeño Nachos with Dip',
    desc: 'Crispy tortilla chips served with warm cheese & tangy salsa',
    price: 290,
    originalPrice: 330,
    category: 'Snacks',
    veg: true,
    bestseller: false,
    image: '/food/nachos.jpg',
  },
  {
    id: 'pepsi-large',
    name: 'Chilled Pepsi / Pepsi Black (450ml)',
    desc: 'Ice-cold fountain beverage',
    price: 180,
    originalPrice: 210,
    category: 'Beverages',
    veg: true,
    bestseller: false,
    image: '/food/cola.jpg',
  },
  {
    id: 'cold-coffee',
    name: 'Signature Iced Cold Coffee Frappe',
    desc: 'Rich espresso blended with creamy milk & cocoa dust',
    price: 220,
    originalPrice: 250,
    category: 'Beverages',
    veg: true,
    bestseller: false,
    image: '/food/coffee.jpg',
  },
  {
    id: 'paneer-hotdog',
    name: 'Smoky Paneer Tikka Roll / Hotdog',
    desc: 'Toasted brioche bun loaded with spiced paneer & mint mayo',
    price: 260,
    originalPrice: 300,
    category: 'Snacks',
    veg: true,
    bestseller: false,
    image: '/food/hotdog.jpg',
  },
];

// Official YouTube trailer IDs per movie title (matches live MovieBook /multimedia page)
const MOVIE_TRAILERS_MAP = {
  'ramayana: rise of a legend': [
    {
      videoId: 'bw6NMTNS1ao',
      title: 'Ramayana: Rise of a Legend | Official Box Office Promo',
      language: 'Hindi',
    },
    {
      videoId: 'goXqZKvxEu8',
      title: 'Ramayana: Rise of a Legend | Hans Zimmer & A. R. Rahman Score Teaser',
      language: 'English',
    },
  ],
  'the hunger games: sunrise on the reaping': [
    {
      videoId: 'DBOaOb4CNcc',
      title: 'The Hunger Games: Sunrise on the Reaping | Official Trailer',
      language: 'English',
    },
    {
      videoId: 'Yp4pY9CgdMk',
      title: 'The Hunger Games: Sunrise on the Reaping | Official Teaser',
      language: 'English',
    },
  ],
  'godzilla minus zero': [
    {
      videoId: 'Pu0pH5BuCPM',
      title: 'Godzilla Minus Zero | Official Trailer [Subtitled]',
      language: 'English',
    },
    {
      videoId: 'pWJjYoqVSjQ',
      title: 'Godzilla Minus Zero | Official Teaser Trailer',
      language: 'Japanese',
    },
  ],
  'avengers: doomsday': [
    {
      videoId: 'UKAq31cLPfk',
      title: 'Avengers: Doomsday | Official Teaser | Marvel Studios',
      language: 'English',
    },
    {
      videoId: '0r56zgXq940',
      title: 'Avengers: Doomsday | Special Look',
      language: 'English',
    },
  ],
  king: [
    {
      videoId: 'Uu2QK9Z9X5E',
      title: 'King | Official Title Reveal | Shah Rukh Khan, Siddharth Anand',
      language: 'Hindi',
    },
  ],
  'dune: part three': [
    {
      videoId: 'KFqe2evmkz8',
      title: 'Dune: Part Three | Official Trailer | Denis Villeneuve',
      language: 'English',
    },
    {
      videoId: 'OAUnScp6fYA',
      title: 'Dune: Part Three | Official Teaser',
      language: 'English',
    },
  ],
  ebenezer: [
    {
      videoId: 'LqZjdZ_UE-8',
      title: 'Ebenezer | Official Trailer | Johnny Depp',
      language: 'English',
    },
    {
      videoId: 'BmYmv1JrzQ4',
      title: 'Ebenezer | Official Holiday Teaser',
      language: 'English',
    },
  ],
  'drishyam: the conclusion': [
    {
      videoId: 'MFQFxsDWbA8',
      title: 'Drishyam: The Conclusion | Official Trailer | Ajay Devgn, Tabu',
      language: 'Hindi',
    },
  ],
  'jailer 2': [
    {
      videoId: '3vkHWYL2JmA',
      title: 'Jailer 2 | Official Trailer | Rajinikanth, Anirudh',
      language: 'Tamil',
    },
  ],
  'jumanji: open world': [
    {
      videoId: 'NFrRSNtzfpI',
      title: 'Jumanji: Open World | Official Trailer',
      language: 'English',
    },
    {
      videoId: 'RfVHb05uHV0',
      title: 'Jumanji: Open World | Official Teaser',
      language: 'English',
    },
  ],
  'the cat in the hat': [
    {
      videoId: 'hAsobRSRCLc',
      title: 'The Cat in the Hat | Official Trailer | Warner Bros.',
      language: 'English',
    },
    {
      videoId: 'ySBhKFPISgw',
      title: 'The Cat in the Hat | Official Teaser',
      language: 'English',
    },
  ],
  madden: [
    {
      videoId: 'xzh7HzLXXpk',
      title: 'Madden | Official Trailer | Nicolas Cage, Christian Bale',
      language: 'English',
    },
    {
      videoId: 'KjOL6n0F0T8',
      title: 'Madden | Official Teaser',
      language: 'English',
    },
  ],
  'spider-man: brand new day': [
    {
      videoId: 'Atn6k882WAo',
      title: 'Spider-Man: Brand New Day | Official Trailer | Tom Holland',
      language: 'English',
    },
    {
      videoId: 'lS6TdzVVusY',
      title: 'Spider-Man: Brand New Day | Official Teaser',
      language: 'English',
    },
  ],
  'the odyssey': [
    {
      videoId: '2mfqNJTC1QU',
      title: 'The Odyssey | Official Trailer | Christopher Nolan',
      language: 'English',
    },
    {
      videoId: 'aUWTVfwdm-c',
      title: 'The Odyssey | IMAX Special Featurette',
      language: 'English',
    },
  ],
  'project hail mary': [
    {
      videoId: 'Q2UjkMU_ZWQ',
      title: 'Project Hail Mary | Official Trailer | Ryan Gosling',
      language: 'English',
    },
    {
      videoId: 'eSGTui-T-4Q',
      title: 'Project Hail Mary | Official Teaser',
      language: 'English',
    },
  ],
  'dhurandhar: the revenge': [
    {
      videoId: 'NHk7scrb_9I',
      title: 'Dhurandhar: The Revenge | Official Trailer | Ranveer Singh',
      language: 'Hindi',
    },
    {
      videoId: 'CN0lNff-zm0',
      title: 'Dhurandhar: The Revenge | Official Teaser',
      language: 'Hindi',
    },
  ],
  toxic: [
    {
      videoId: 'EfluEyQ5QIA',
      title: 'Toxic | Official Trailer | Yash',
      language: 'Kannada',
    },
    {
      videoId: 'JQ7pytcXahw',
      title: 'Toxic | Official Teaser',
      language: 'English',
    },
  ],
  'toy story 5': [
    {
      videoId: 'xo_Cwmdcu2Y',
      title: 'Toy Story 5 | Official Trailer | Pixar',
      language: 'English',
    },
    {
      videoId: '5TeG_J1mBwU',
      title: 'Toy Story 5 | Official Teaser',
      language: 'English',
    },
  ],
  'the super mario galaxy movie': [
    {
      videoId: '-LLhj6QYQi8',
      title: 'The Super Mario Galaxy Movie | Official Trailer',
      language: 'English',
    },
    {
      videoId: 'RjqUFNywK14',
      title: 'The Super Mario Galaxy Movie | Official Teaser',
      language: 'English',
    },
  ],
  'disclosure day': [
    {
      videoId: '4Lkjgpk1ss4',
      title: 'Disclosure Day | Official Trailer | Steven Spielberg',
      language: 'English',
    },
    {
      videoId: 'T1fg57UfR9s',
      title: 'Disclosure Day | Official Teaser',
      language: 'English',
    },
  ],
  'street fighter': [
    {
      videoId: 'U6sbm1OaJb8',
      title: 'Street Fighter | New Trailer (2026 Movie)',
      language: 'English',
    },
    {
      videoId: 'Xt4X4FvXk2A',
      title: 'Street Fighter | Official Teaser Trailer',
      language: 'English',
    },
  ],
};

export const getTrailersForMovie = (movie) => {
  const key = (movie?.title || '').trim().toLowerCase();
  if (MOVIE_TRAILERS_MAP[key]) {
    return MOVIE_TRAILERS_MAP[key];
  }
  const primaryLang = movie?.languages?.[0] || 'English';
  return [
    {
      videoId: 'U6sbm1OaJb8',
      title: `${movie?.title || 'Official'} | New Trailer (2026 Movie)`,
      language: primaryLang,
    },
    {
      videoId: 'Xt4X4FvXk2A',
      title: `${movie?.title || 'Official'} | Official Theatrical Trailer`,
      language: primaryLang,
    },
  ];
};

export const MOVIEBOOK_OFFERS = [
  {
    id: 'bandhan-debit',
    title: 'Enjoy B1G1 Ticket Free!* with Bandhan Bank Legacy Debit Cards',
    shortTitle: 'Enjoy B1G1 Ticket Free!* with Bandhan Bank...',
    subtitle: 'Tap to view details',
    code: 'FIRSTSHOW',
    logo: 'https://in.bmscdn.com/offers/offerlogo/bandhan-bank-avni-debit-card-offer-bandhan824.jpg?28042026194202',
    description:
      'Get 1 free movie ticket (up to ₹500) on booking a minimum of 2 movie tickets using Bandhan Bank Legacy Debit Cards on MovieBook.',
    terms: [
      'Valid on minimum purchase of 2 movie tickets per transaction.',
      'Maximum discount of ₹500 per ticket, twice a calendar month.',
      'Apply promo code FIRSTSHOW at checkout to avail instant discount.',
    ],
  },
  {
    id: 'bandhan-credit',
    title: 'Get up to ₹1000 off per calendar month with Bandhan Bank credit cards',
    shortTitle: 'Get up to ₹1000 off per calendar month with...',
    subtitle: 'Tap to view details',
    code: 'PAYTM150',
    logo: 'https://in.bmscdn.com/offers/offerlogo/bandhan-bank-avni-debit-card-offer-bandhan824.jpg?22092026180000',
    description:
      'Save up to ₹1000 every month on movie and live event bookings when paying with eligible Bandhan Bank Credit Cards.',
    terms: [
      'Applicable on all days of the week across all cinemas in India.',
      'Apply promo code PAYTM150 during checkout.',
    ],
  },
  {
    id: 'yes-private-debit',
    title: 'YES Private Debit Card Offer',
    shortTitle: 'YES Private Debit Card Offer',
    subtitle: 'Tap to view details',
    code: 'RUPAY25',
    logo: 'https://in.bmscdn.com/offers/offerlogo/bandhan-bank-avni-debit-card-offer-bandhan824.jpg?28042026194202',
    description:
      'Complimentary movie tickets up to ₹1000 every month with YES Private Debit Cards on MovieBook.',
    terms: [
      'Valid on IMAX, 4DX, ICE, and Recliner formats.',
      'Use code RUPAY25 at payment screen.',
    ],
  },
  {
    id: 'yes-private-credit',
    title: 'Buy 1 get 1 movie ticket free + 50% off on non movie tickets with Yes Private Credit Card',
    shortTitle: 'Buy 1 get 1 movie ticket free + 50% off on...',
    subtitle: 'Tap to view details',
    code: 'FIRSTSHOW',
    logo: 'https://in.bmscdn.com/offers/offerlogo/bandhan-bank-avni-debit-card-offer-bandhan824.jpg?22092026180000',
    description:
      'Buy 1 Get 1 free on movie tickets plus 50% off on Plays, Concerts, and Sports bookings every month.',
    terms: [
      'No minimum ticket price restriction.',
      'Instant discount applied at checkout.',
    ],
  },
];

export const DEFAULT_BMS_REVIEWS = [
  {
    _id: 'bms-rev-1',
    user: { name: 'Biswajeet' },
    rating: 10,
    hashtags: '#Blockbuster #SuperDirection',
    comment:
      'Mind-blowing theatrical experience! Visually stunning from the opening frame to the climax, with thunderous sound design and goosebumps-inducing action sequences.',
    likes: 94,
    timeAgo: '1 Day ago',
  },
  {
    _id: 'bms-rev-2',
    user: { name: 'Aarav' },
    rating: 10,
    hashtags: '#SuperDirection #GreatActing #WowMusic #AwesomeStory #Blockbuster',
    comment:
      'Incredible big-screen spectacle in IMAX! Every sequence feels larger than life and the background score elevates every dramatic moment.',
    likes: 51,
    timeAgo: '2 Days ago',
  },
  {
    _id: 'bms-rev-3',
    user: { name: 'Riya' },
    rating: 9,
    hashtags: '#Rocking #Wellmade',
    comment:
      'Nailed the casting and pacing! Watching it in 4DX with friends made it double the fun—easily one of the most entertaining releases of the season.',
    likes: 23,
    timeAgo: '1 Day ago',
  },
  {
    _id: 'bms-rev-4',
    user: { name: 'Sourav' },
    rating: 10,
    hashtags: '#GreatActing #WowMusic #Blockbuster #MustWatch',
    comment:
      'Powerhouse performances across the entire ensemble cast and top-tier cinematography. Worth watching on the biggest screen near you!',
    likes: 17,
    timeAgo: '1 Day ago',
  },
];

