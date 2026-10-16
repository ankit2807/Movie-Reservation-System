// Shared BookMyShow-style theatre, showtime, seat layout, food menu, and poster fallback utilities

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
    <rect width="240" height="240" rx="120" fill="url(#av)"/>
    <circle cx="120" cy="88" r="38" fill="rgba(255,255,255,0.22)"/>
    <path d="M48 212 C56 158, 184 158, 192 212" fill="rgba(255,255,255,0.18)"/>
    <text x="120" y="132" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="700" letter-spacing="1">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const SEAT_TIERS = [
  {
    tier: 'RECLINER',
    label: 'RECLINER',
    price: 480,
    rows: ['A', 'B'],
    blocks: [2, 8, 2], // Left aisle block, Center block, Right aisle block (12 seats/row)
    isRecliner: true,
  },
  {
    tier: 'PRIME',
    label: 'PRIME',
    price: 280,
    rows: ['C', 'D', 'E', 'F', 'G'],
    blocks: [4, 10, 4], // 18 seats/row
    isRecliner: false,
  },
  {
    tier: 'CLASSIC',
    label: 'CLASSIC',
    price: 180,
    rows: ['H', 'J', 'K'],
    blocks: [4, 10, 4], // 18 seats/row
    isRecliner: false,
  },
];

export const getTierForSeat = (seatId) => {
  if (!seatId) return SEAT_TIERS[1];
  const row = seatId[0].toUpperCase();
  return SEAT_TIERS.find((t) => t.rows.includes(row)) || SEAT_TIERS[1];
};

export const getTotalColsForTier = (tier) =>
  (tier?.blocks || [4, 10, 4]).reduce((a, b) => a + b, 0);

const CITY_THEATRE_TEMPLATES = {
  Noida: [
    {
      id: 'pvr-logix-noida',
      name: 'PVR: Logix City Centre Mall, Noida',
      address: 'Plot BW-58, Sector 32, Near Noida City Centre Metro, Noida',
      tags: ['M-Ticket', 'Food & Beverage'],
      cancellable: true,
      facilities: ['Dolby Atmos', '4K Laser', 'Recliner', 'Parking'],
    },
    {
      id: 'inox-galleria-noida',
      name: 'INOX: Gardens Galleria Mall, Noida',
      address: 'Sector 38A, Entertainment City, Noida',
      tags: ['M-Ticket', 'Food & Beverage'],
      cancellable: true,
      facilities: ['INSIGNIA', 'Dolby 7.1', 'Food Court'],
    },
    {
      id: 'cinepolis-dlf-noida',
      name: 'Cinépolis: DLF Mall of India, Noida',
      address: 'Plot M-03, Sector 18, Noida, Uttar Pradesh',
      tags: ['M-Ticket', 'Food & Beverage', 'Recliner'],
      cancellable: true,
      facilities: ['IMAX with Laser', '4DX', 'VIP Lounge'],
    },
    {
      id: 'pvr-superplex-noida',
      name: 'PVR: Superplex Logix IMAX, Noida',
      address: '4th Floor, Logix City Centre, Sector 32, Noida',
      tags: ['M-Ticket', 'Food & Beverage', 'Recliner'],
      cancellable: false,
      facilities: ['IMAX', '4DX', 'P[XL]', 'Playhouse'],
    },
    {
      id: 'wave-sec18-noida',
      name: 'Wave Cinemas: Sector 18, Noida',
      address: 'Wave Silver Tower, Pocket J, Sector 18, Noida',
      tags: ['M-Ticket', 'Food & Beverage'],
      cancellable: true,
      facilities: ['Dolby Atmos', 'Gold Class'],
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
      { time: '09:45 AM', format: '2D', screen: 'AUDI 02', status: 'AVAILABLE', basePrice: 180 },
      { time: '01:15 PM', format: '4K DOLBY ATMOS', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 280 },
      { time: '04:30 PM', format: 'IMAX 2D', screen: 'IMAX AUDI', status: 'FAST_FILLING', basePrice: 380 },
      { time: '07:45 PM', format: '4K DOLBY ATMOS', screen: 'AUDI 01', status: 'FAST_FILLING', basePrice: 320 },
      { time: '10:45 PM', format: '2D', screen: 'AUDI 03', status: 'AVAILABLE', basePrice: 220 },
    ],
    [
      { time: '10:30 AM', format: '2D', screen: 'AUDI 04', status: 'AVAILABLE', basePrice: 190 },
      { time: '02:00 PM', format: '3D', screen: 'AUDI 02', status: 'AVAILABLE', basePrice: 260 },
      { time: '05:15 PM', format: 'INSIGNIA 2D', screen: 'INSIGNIA 01', status: 'FAST_FILLING', basePrice: 450 },
      { time: '08:15 PM', format: '2D ATMOS', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 290 },
      { time: '11:00 PM', format: '2D', screen: 'AUDI 04', status: 'AVAILABLE', basePrice: 200 },
    ],
    [
      { time: '11:00 AM', format: '4DX', screen: '4DX AUDI', status: 'AVAILABLE', basePrice: 420 },
      { time: '01:45 PM', format: 'IMAX 2D', screen: 'IMAX AUDI', status: 'AVAILABLE', basePrice: 390 },
      { time: '06:00 PM', format: '2D', screen: 'AUDI 05', status: 'FAST_FILLING', basePrice: 280 },
      { time: '09:00 PM', format: 'IMAX 2D', screen: 'IMAX AUDI', status: 'ALMOST_FULL', basePrice: 440 },
    ],
    [
      { time: '10:15 AM', format: '2D', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 180 },
      { time: '01:30 PM', format: '2D', screen: 'AUDI 02', status: 'AVAILABLE', basePrice: 240 },
      { time: '04:45 PM', format: '4DX', screen: '4DX AUDI', status: 'AVAILABLE', basePrice: 420 },
      { time: '07:30 PM', format: 'ICE 2D', screen: 'P[XL] AUDI', status: 'FAST_FILLING', basePrice: 360 },
      { time: '10:30 PM', format: '2D', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 210 },
    ],
    [
      { time: '11:30 AM', format: '2D', screen: 'AUDI 03', status: 'AVAILABLE', basePrice: 170 },
      { time: '03:15 PM', format: '2D ATMOS', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 250 },
      { time: '06:45 PM', format: '2D', screen: 'AUDI 02', status: 'FAST_FILLING', basePrice: 270 },
      { time: '09:50 PM', format: '2D ATMOS', screen: 'AUDI 01', status: 'AVAILABLE', basePrice: 280 },
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
        { label: 'RECLINER', price: 480, status: slot.status === 'ALMOST_FULL' ? 'FILLING FAST' : 'AVAILABLE' },
        { label: 'PRIME', price: 280, status: 'AVAILABLE' },
        { label: 'CLASSIC', price: 180, status: 'AVAILABLE' },
      ],
    }));

    return {
      ...theatre,
      shows: slots,
    };
  });
};

export const buildShowKey = (movieId, theatreId, dateStr, timeStr) => {
  const cleanTime = String(timeStr || '07:30 PM').replace(/\s+/g, '');
  return `${movieId || 'movie'}__${theatreId || 'pvr-logix-noida'}__${dateStr || 'today'}__${cleanTime}`;
};

// Deterministic realistic occupied seats per showKey so the seat map looks authentic and stays consistent
export const generateBaselineOccupiedSeats = (showKey = 'default') => {
  let hash = 2166136261;
  for (let i = 0; i < showKey.length; i++) {
    hash ^= showKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const nextRand = () => {
    hash += 0x6d2b79f5;
    let t = hash;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const occupied = new Set();
  SEAT_TIERS.forEach((tier) => {
    const totalCols = getTotalColsForTier(tier);
    tier.rows.forEach((row) => {
      for (let col = 1; col <= totalCols; col++) {
        // Center seats have slightly higher chance of being pre-booked, booked in pairs
        const isCenter = col >= 5 && col <= totalCols - 4;
        const threshold = isCenter ? 0.16 : 0.08;
        if (nextRand() < threshold) {
          occupied.add(`${row}${col}`);
          if (col + 1 <= totalCols && nextRand() < 0.75) {
            occupied.add(`${row}${col + 1}`);
            col++;
          }
        }
      }
    });
  });

  return Array.from(occupied);
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
