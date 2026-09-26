// Single source of truth for the site. Edit this file, then run: node _src/build.mjs
// Items marked "TBC" are placeholders that need confirming before launch.

export const SITE = {
  name: 'Marquee Goods',
  tagline: 'Shopfront advertising for small businesses',
  // Absolute URL of the live site, no trailing slash (e.g. https://marqueegoods.in). Enables canonical tags + sitemap.
  url: '',
  phone: '+919884028699',
  phoneDisplay: '+91 98840 28699',
  whatsapp: '919884028699',
  email: '', // TBC — add when ready; every email link on the site stays hidden while this is empty
  address: 'Pankha Road, Uttam Nagar, New Delhi',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pankha+Road+Uttam+Nagar+New+Delhi',
  hours: '9 AM – 10 PM',
  since: 2021,
  stats: {
    businesses: '500+',
    delivered: '2,000+', // TBC — confirm the real number of products delivered
  },
  // Google Apps Script web-app URL (see backend/README.md). Leads are logged to the console until this is set.
  leadEndpoint: '',
  comboDiscount: 0.10,
};

export const CATEGORIES = [
  { id: 'signage', name: 'Shopfront Signage', blurb: 'Be seen from the road, day and night.' },
  { id: 'promo', name: 'Promotions & Games', blurb: 'Pull people in and keep them talking.' },
  { id: 'display', name: 'Photo & Display', blurb: 'Give customers a reason to take a photo.' },
  { id: 'awards', name: 'Awards', blurb: 'Branded trophies and medals for events.' },
];

const LOGO_FIELD = { id: 'logo', type: 'file', label: 'Your logo or artwork', hint: 'PNG, JPG, SVG or PDF, up to 5 MB. No logo? Leave it — we can design one from your shop name.' };

export const PRODUCTS = [
  {
    slug: 'logo-projector',
    name: 'Logo Projector',
    cat: 'signage',
    featured: true,
    tagline: 'Your logo, lit up on the pavement every night.',
    summary: 'Projects your shop logo on the floor or wall outside. Visible from across the road after dark.',
    description: [
      'A logo projector (also called a gobo projector) shines your logo onto the pavement, entrance or wall outside your shop. Once the lights come on in the evening, it is the first thing people walking or driving past will notice.',
      'Send us your logo — or just your shop name — and we make the logo slide for you. You approve a preview on WhatsApp before we build it. The housing is all-weather, so it can stay outside all year.',
    ],
    images: [
      { id: 'assets/img/logo-projector-shopfront.jpg', alt: 'Logo projector shining a shop logo on the pavement outside the entrance' },
      { id: 'assets/img/logo-projector-wall.jpg', alt: 'Logo projector projecting a festive greeting onto a building wall at night' },
    ],
    sizeLabel: 'Logo size',
    sizes: [
      { label: '6 ft logo', detail: '27W · up to 20 ft throw', price: 3299 },
      { label: '10 ft logo', detail: '50W · up to 30 ft throw', price: 5499 }, // TBC
    ],
    fields: [
      LOGO_FIELD,
      { id: 'surface', type: 'select', label: 'Where should the logo appear?', choices: ['Floor / pavement', 'Wall', 'Not sure yet'] },
      { id: 'mount', type: 'select', label: 'Mounting', choices: ['Wall bracket', 'Ceiling', 'Pole', 'Not sure yet'] },
    ],
    specs: [['Output', '27W, 6,000 lumen (6 ft model)'], ['Logo size', 'Up to 6 ft'], ['Throw distance', 'Up to 20 ft'], ['Housing', 'All-weather'], ['Install', 'Wall or ceiling, minimal tools']],
    leadTime: '5–7 working days',
  },
  {
    slug: 'led-sign-board',
    name: '3D LED Sign Board',
    cat: 'signage',
    featured: true,
    tagline: 'Raised, lit letters that make your shop name readable at night.',
    summary: 'Raised 3D letters with LED backlight. Makes your shop name readable from far away, even at night.',
    description: [
      'A 3D LED sign board turns your shop name into raised, glowing letters. It looks sharper than a flex board by day and stays readable after dark, when flat boards disappear.',
      'Tell us your shop name, preferred colours and the wall size. We send a to-scale mock-up on WhatsApp before we start cutting.',
    ],
    images: [
      { id: 'assets/img/sign-board.jpg', alt: 'Round logo sign board mounted on a shop wall' },
    ],
    sizeLabel: 'Board size',
    sizes: [ // TBC — all prices
      { label: '2 × 1 ft', detail: 'Counters and small fronts', price: 4999 },
      { label: '3 × 1.5 ft', detail: 'Most shopfronts', price: 8499 },
      { label: '4 × 2 ft', detail: 'Wide fronts and showrooms', price: 13999 },
    ],
    fields: [
      LOGO_FIELD,
      { id: 'text', type: 'text', label: 'Text on the board', placeholder: 'e.g. Sharma Sweets' },
      { id: 'light', type: 'select', label: 'Light colour', choices: ['Warm white', 'Cool white', 'Match my logo colours'] },
      { id: 'place', type: 'select', label: 'Placement', choices: ['Outdoor', 'Indoor'] },
    ],
    specs: [['Letters', 'Raised 3D acrylic'], ['Lighting', 'LED backlit'], ['Use', 'Indoor and outdoor'], ['Artwork', 'Mock-up before production']],
    leadTime: '7–10 working days',
  },
  {
    slug: 'waving-standee',
    name: 'Waving Standee',
    cat: 'signage',
    featured: true,
    tagline: 'A life-size character that waves people into your shop.',
    summary: 'Life-size standee with a motorised waving arm. Movement catches the eye in a busy market.',
    description: [
      'Movement is the fastest way to catch someone’s eye in a busy market. This life-size standee has a motorised arm that waves all day, with artwork designed around your trade — a chef for a restaurant, a stylist for a salon, a mechanic for a service centre.',
      'It is weatherproof and we install it for you, so it is ready to work from day one.',
    ],
    images: [
      { id: 'assets/img/waving-standee.jpg', alt: 'Life-size waving standee of a branded character with a moving arm' },
    ],
    sizeLabel: 'Height',
    sizes: [
      { label: '5 ft', detail: 'Compact', price: 4699 },
      { label: '6.5 ft', detail: 'Standard', price: 7999 },
      { label: '7.5 ft', detail: 'Large', price: 12499 },
    ],
    fields: [
      LOGO_FIELD,
      { id: 'character', type: 'select', label: 'Character', choices: ['Designed for my trade', 'My own mascot', 'Photo of me / my staff'] },
      { id: 'text', type: 'text', label: 'Message on the board', placeholder: 'e.g. Flat 20% off today' },
    ],
    specs: [['Build', 'Weatherproof cut-out'], ['Motion', 'Motorised waving arm'], ['Artwork', 'Designed for your trade'], ['Install', 'On-site installation included']],
    leadTime: '7–10 working days',
  },
  {
    slug: 'feather-flag',
    name: 'Feather Flag',
    cat: 'signage',
    featured: true,
    tagline: 'A tall printed flag that tells the whole street you are open.',
    summary: 'Tall, wind-rated flag printed with your logo and offer. Seen from the end of the road.',
    description: [
      'Feather flags stand taller than parked cars and scooters, so your name is visible from the end of the street. Print your logo, your offer, or simply “Open”.',
      'The print is fade-resistant and the weighted base is wind-rated, so it stays upright and bright through the season.',
    ],
    images: [
      { id: 'assets/img/feather-flags.jpg', alt: 'Feather flags printed with a logo, Open and Sale', fit: 'contain' },
    ],
    sizeLabel: 'Height',
    sizes: [ // TBC — all prices
      { label: '6 ft', detail: '4 ft print area', price: 2499 },
      { label: '8 ft', detail: '6 ft print area', price: 3299 },
      { label: '10 ft', detail: '8 ft print area', price: 4499 },
    ],
    fields: [
      LOGO_FIELD,
      { id: 'text', type: 'text', label: 'Text on the flag', placeholder: 'e.g. Grand Opening · 20% off' },
      { id: 'base', type: 'select', label: 'Base', choices: ['Weighted base (hard floor)', 'Ground spike (soil / grass)', 'Not sure yet'] },
    ],
    specs: [['Height', '6 ft (4 ft print)'], ['Base', 'Wind-rated, weighted'], ['Print', 'Fade-resistant'], ['Use', 'Outdoor']],
    leadTime: '5–7 working days',
  },
  {
    slug: 'floor-spin-wheel',
    name: 'Floor-Standing Spin Wheel',
    cat: 'promo',
    featured: true,
    tagline: 'Spin-to-win that turns walk-ins into buyers.',
    summary: 'Full-height prize wheel with your logo and offers. Draws a crowd at sales, launches and festivals.',
    description: [
      'Nothing draws a crowd like a prize wheel. Put one near your entrance during a sale, launch or festival and watch people queue for a spin.',
      'We print your logo and your prizes on every segment. The reinforced base keeps it steady no matter how hard customers spin.',
    ],
    images: [
      { id: 'assets/img/floor-spin-wheel.jpg', alt: 'Floor-standing prize wheel on a tripod stand', fit: 'contain' },
    ],
    sizeLabel: 'Wheel size',
    sizes: [
      { label: '60 cm wheel', detail: '150 cm tall', price: 3999 },
      { label: '80 cm wheel', detail: '170 cm tall', price: 5499 }, // TBC
    ],
    fields: [
      LOGO_FIELD,
      { id: 'segments', type: 'select', label: 'Number of segments', choices: ['8', '10', '12'] },
      { id: 'prizes', type: 'text', label: 'Prizes on the wheel', placeholder: 'e.g. 10% off, free gift, try again' },
    ],
    specs: [['Wheel', '60 cm diameter'], ['Stand', '150 cm, freestanding'], ['Base', 'Reinforced'], ['Custom', 'Logo, colours and prizes']],
    leadTime: '5–7 working days',
  },
  {
    slug: 'tabletop-spin-wheel',
    name: 'Tabletop Spin Wheel',
    cat: 'promo',
    featured: true,
    tagline: 'A counter-top prize wheel for quick giveaways at billing.',
    summary: 'Compact prize wheel for your billing counter. Rewards customers and brings them back.',
    description: [
      'Put it next to the billing counter and let every customer spin for a small reward. It is a simple way to make people smile and come back.',
      'Small, portable and printed with your logo and prizes.',
    ],
    images: [
      { id: 'photo-1573788583106-acf6c8f3f0b5', alt: 'Colourful prize wheel close-up' },
      { id: 'photo-1752085777042-f70b4cf31d53', alt: 'Illuminated game wheel spinning' },
    ],
    sizeLabel: 'Wheel size',
    sizes: [{ label: '20 cm wheel', detail: '30 cm tall', price: 2499 }],
    fields: [
      LOGO_FIELD,
      { id: 'prizes', type: 'text', label: 'Prizes on the wheel', placeholder: 'e.g. 5% off, free sample' },
    ],
    specs: [['Wheel', '20 cm diameter'], ['Stand', '30 cm'], ['Use', 'Tabletop, portable'], ['Custom', 'Logo and prizes']],
    leadTime: '5–7 working days',
  },
  {
    slug: 'wall-spin-wheel',
    name: 'Wall-Mounted Spin Wheel',
    cat: 'promo',
    tagline: 'All the fun of a prize wheel, none of the floor space.',
    summary: 'Wall-mounted prize wheel for shops short on floor space. Bracket included.',
    description: [
      'Short on floor space? Mount the wheel on the wall behind your counter. Customers still get to spin, and your aisle stays clear.',
      'Comes with a wall bracket and your logo, colours and prizes printed on.',
    ],
    images: [
      { id: 'photo-1638064742425-d71d92cdc470', alt: 'Wall-mounted lit prize wheel' },
      { id: 'photo-1752085777042-f70b4cf31d53', alt: 'Close-up of a spinning prize wheel' },
    ],
    sizeLabel: 'Size',
    sizes: [{ label: 'Standard', detail: 'Wall bracket included', price: 3699 }],
    fields: [
      LOGO_FIELD,
      { id: 'prizes', type: 'text', label: 'Prizes on the wheel', placeholder: 'e.g. 10% off, free gift' },
    ],
    specs: [['Mounting', 'Wall bracket included'], ['Footprint', 'Zero floor space'], ['Custom', 'Segments, colours and logo']],
    leadTime: '5–7 working days',
  },
  {
    slug: 'wall-audio-box',
    name: 'Wall-Mount Audio Box',
    cat: 'promo',
    tagline: 'Announce offers to everyone walking past.',
    summary: '60W weatherproof speaker box for shopfront announcements and music. Lit at night.',
    description: [
      'Play your offers, festival greetings or music to everyone passing your shop. The 60W speaker box mounts outside and is built to handle weather.',
      'Connect by Bluetooth, USB, SD card or AUX. Built-in lighting keeps it visible after dark.',
    ],
    images: [
      { id: 'photo-1507878566509-a0dbe19677a5', alt: 'Outdoor speaker box' },
      { id: 'photo-1547052178-7f2c5a20c332', alt: 'Compact speaker on a table' },
    ],
    sizeLabel: 'Size',
    sizes: [{ label: '3.5 × 2 ft', detail: '60W, built-in amp', price: 12000 }],
    fields: [
      LOGO_FIELD,
      { id: 'use', type: 'select', label: 'Mainly for', choices: ['Offer announcements', 'Music', 'Both'] },
    ],
    specs: [['Size', '3.5 × 2 ft × 8 in'], ['Audio', '60W built-in amp and speakers'], ['Inputs', 'Bluetooth, SD, USB, AUX'], ['Lighting', 'Built-in night lighting']],
    leadTime: '7–10 working days',
  },
  {
    slug: 'cycle-audio-box',
    name: 'Cycle-Mount Audio Box',
    cat: 'promo',
    tagline: 'Take your announcement to the streets.',
    summary: 'Battery-powered speaker rig for street promotions. Six hours per charge.',
    description: [
      'Take your promotion to the neighbourhood. This battery-powered speaker rig clips onto a cycle and plays your announcement for up to six hours.',
      'Branded with your logo, so people know who is talking.',
    ],
    images: [
      { id: 'photo-1674303324806-7018a739ed11', alt: 'Rugged portable speaker' },
      { id: 'photo-1507878566509-a0dbe19677a5', alt: 'Speaker box for street promotions' },
    ],
    sizeLabel: 'Size',
    sizes: [{ label: '2.5 × 2 × 2 ft', detail: '6-hour battery', price: null }],
    fields: [LOGO_FIELD],
    specs: [['Size', '2.5 × 2 × 2 ft'], ['Battery', 'Up to 6 hours'], ['Inputs', 'Bluetooth, SD, USB'], ['Mounting', 'Quick-release cycle mount']],
    leadTime: '7–10 working days',
  },
  {
    slug: 'photo-booth',
    name: 'Branded Photo Booth',
    cat: 'display',
    featured: true,
    tagline: 'An Instagram-style photo frame that puts your name in every customer’s gallery.',
    summary: 'Life-size Instagram-style frame with your name and handle. Every photo is free advertising.',
    description: [
      'Guests step into a life-size Instagram post with your business name, handle and caption, and share the photo straight to their status and feed. It works for launches, anniversaries, weddings, festivals and busy weekends.',
      'Printed with your logo and wording on a freestanding frame that is easy to set up and move.',
    ],
    images: [
      { id: 'assets/img/photo-booth.jpg', alt: 'Life-size Instagram-style photo booth frame printed with a business name at an event' },
    ],
    sizeLabel: 'Frame size',
    sizes: [
      { label: '8 × 3 ft', detail: 'Standard', price: 5499 },
      { label: '8 × 6 ft', detail: 'Wide, for groups', price: 8999 }, // TBC
    ],
    fields: [
      LOGO_FIELD,
      { id: 'handle', type: 'text', label: 'Name or handle on the frame', placeholder: 'e.g. @sharmasweets' },
      { id: 'text', type: 'text', label: 'Caption', placeholder: 'e.g. Celebrating 10 years with you!' },
    ],
    specs: [['Material', 'MDF'], ['Frame', '8 × 3 ft (standard)'], ['Custom', 'Text and wording'], ['Assembly', 'Easy, portable']],
    leadTime: '5–7 working days',
  },
  {
    slug: 'selfie-mirror',
    name: 'Selfie Mirror',
    cat: 'display',
    featured: true,
    tagline: 'A glowing Instagram-style mirror customers can’t walk past without a selfie.',
    summary: 'Full-length mirror designed like an Instagram post, with a soft LED glow. Made for salons, boutiques and cafés.',
    description: [
      'Customers see themselves inside an Instagram post with your business name on it — and they take the photo. Place it at your entrance, trial room or waiting area and let customers share your name for you.',
      'The soft LED backlight gives flattering light for photos. Your name, handle and caption are printed on the frame.',
    ],
    images: [
      { id: 'assets/img/selfie-mirror.jpg', alt: 'Full-length Instagram-style selfie mirror with a glowing LED edge in a salon' },
    ],
    sizeLabel: 'Size',
    sizes: [
      { label: 'Standard', detail: 'Wall or tabletop', price: 3599 },
      { label: 'Large', detail: 'Full length', price: 7199 },
    ],
    fields: [
      LOGO_FIELD,
      { id: 'handle', type: 'text', label: 'Name or handle on the mirror', placeholder: 'e.g. @glamstudio' },
    ],
    specs: [['Design', 'Instagram-style frame'], ['Lighting', 'Soft LED backlight'], ['Custom', 'Name, handle and caption'], ['Best for', 'Salons, boutiques, cafés, events']],
    leadTime: '5–7 working days',
  },
  {
    slug: 'dress-display-frame',
    name: 'Dress Display Frame',
    cat: 'display',
    tagline: 'Show fabric the way it will look as a finished outfit.',
    summary: 'Wood-and-acrylic frame that shows fabric as a finished garment. Made for boutiques.',
    description: [
      'Customers find it hard to picture an outfit from a roll of fabric. This frame shows the fabric through a garment-shaped window, so they can see the finished look straight away.',
      'Solid wood with an acrylic cut-out. Swap the fabric behind it in seconds.',
    ],
    images: [
      { id: 'photo-1783309239659-8e362412cd21', alt: 'Colourful dresses on display in a boutique' },
      { id: 'photo-1541941702428-22609a10cb9e', alt: 'Dress form with outfit' },
    ],
    sizeLabel: 'Size',
    sizes: [{ label: 'Standard', detail: 'Garment-shaped window', price: 2499 }],
    fields: [LOGO_FIELD],
    specs: [['Build', 'Solid wood and acrylic'], ['Display', 'Garment-shaped window'], ['Backing', 'Interchangeable fabric'], ['Best for', 'Boutiques and fabric stores']],
    leadTime: '5–7 working days',
  },
  {
    slug: 'acrylic-trophy-set',
    name: 'Acrylic Trophy Set',
    cat: 'awards',
    tagline: 'Laser-cut trophies with your logo, ready for your event.',
    summary: '10 laser-cut acrylic trophies with your logo and text. For events, schools and teams.',
    description: [
      'A set of ten laser-cut acrylic trophies, finished with your logo and the award names. Ideal for school events, sports days, dealer meets and staff awards.',
    ],
    images: [
      { id: 'photo-1665680674724-3a3b3368e036', alt: 'Row of trophies' },
      { id: 'photo-1578269174936-2709b6aeb913', alt: 'Single trophy' },
    ],
    sizeLabel: 'Set',
    sizes: [{ label: '10-piece set', detail: 'Clear acrylic', price: 2499 }],
    fields: [
      LOGO_FIELD,
      { id: 'text', type: 'text', label: 'Award names / text', placeholder: 'e.g. Best Performer 2026' },
    ],
    specs: [['Material', 'Clear acrylic'], ['Set', '10 pieces'], ['Custom', 'Logo, text, shape and size'], ['Finish', 'Laser-cut edges']],
    leadTime: '5–7 working days',
  },
  {
    slug: 'acrylic-medal-pack',
    name: 'Acrylic Medal Pack',
    cat: 'awards',
    tagline: 'Engraved medals for competitions, races and school events.',
    summary: '25 engraved acrylic medals with ribbons. Your shape, logo and text.',
    description: [
      'Twenty-five laser-engraved acrylic medals with ribbons, made to your shape, logo and colours.',
    ],
    images: [
      { id: 'photo-1706374503312-7a4a4c030d2d', alt: 'Gold medals with red ribbons' },
      { id: 'photo-1558514974-2bcf0b1d2877', alt: 'Medals hanging on a rack' },
    ],
    sizeLabel: 'Set',
    sizes: [{ label: '25-piece set', detail: 'With ribbons', price: null }],
    fields: [
      LOGO_FIELD,
      { id: 'text', type: 'text', label: 'Text on the medal', placeholder: 'e.g. Annual Sports Meet 2026' },
    ],
    specs: [['Material', 'Premium acrylic'], ['Set', '25 pieces'], ['Custom', 'Shape, logo, text and colour'], ['Finish', 'Laser-engraved']],
    leadTime: '5–7 working days',
  },
];

// Kits: every product in the kit must stay in the cart for the discount to apply.
export const COMBOS = [
  {
    id: 'shopfront-kit',
    name: 'Shopfront Starter Kit',
    pitch: 'Get noticed day and night: a standee that waves people in, a flag seen from the corner, and your logo on the pavement after dark.',
    items: ['waving-standee', 'feather-flag', 'logo-projector'],
  },
  {
    id: 'night-kit',
    name: 'After-Dark Kit',
    pitch: 'Most flex boards disappear at night. Your lit name above the door and your logo on the pavement below keep you visible.',
    items: ['led-sign-board', 'logo-projector'],
  },
  {
    id: 'opening-kit',
    name: 'Grand Opening Kit',
    pitch: 'Everything for a launch day that people remember: a flag to announce it, a prize wheel to draw a crowd, a booth for the photos.',
    items: ['feather-flag', 'floor-spin-wheel', 'photo-booth'],
  },
  {
    id: 'selfie-kit',
    name: 'Selfie Corner Kit',
    pitch: 'A glowing selfie mirror and an Instagram-style photo booth turn a corner of your shop into the spot everyone photographs.',
    items: ['selfie-mirror', 'photo-booth'],
  },
  {
    id: 'street-kit',
    name: 'Street Promo Kit',
    pitch: 'Take the offer to the street: a cycle speaker to announce it, a flag and a waving standee to show where to go.',
    items: ['cycle-audio-box', 'feather-flag', 'waving-standee'],
  },
  {
    id: 'counter-kit',
    name: 'Counter Rewards Kit',
    pitch: 'Two ways to reward customers at billing — a wheel on the counter and one on the wall.',
    items: ['tabletop-spin-wheel', 'wall-spin-wheel'],
  },
];

export const INDUSTRIES = [
  { name: 'Cafés & restaurants', use: 'Logo projector at the door, feather flag on the road', img: 'photo-1682778418768-16081e4470a1' },
  { name: 'Sweet shops & bakeries', use: '3D LED sign board and a festive spin wheel', img: 'photo-1760263217153-ef719ca2da19' },
  { name: 'Salons & beauty parlours', use: 'Selfie mirror and a waving standee', img: 'photo-1637777277337-f114350fb088' },
  { name: 'Boutiques & fashion', use: 'Dress display frame and a branded photo booth', img: 'photo-1771695399549-ac7d25432e7d' },
  { name: 'Jewellery stores', use: '3D LED sign board and a logo projector', img: 'photo-1758790340631-1457263afd28' },
  { name: 'Mobile & electronics', use: 'Spin wheel at billing and an audio box outside', img: 'photo-1697545806245-9795b6056141' },
  { name: 'Gyms & fitness studios', use: 'Feather flags and a logo projector', img: 'photo-1671970922029-0430d2ae122c' },
  { name: 'Clinics & diagnostic centres', use: 'Logo projector and a 3D LED sign board', img: 'photo-1519494026892-80bbd2d6fd0d' },
];

export const MORE_INDUSTRIES = ['Opticians', 'Pet stores', 'Schools & coaching centres', 'Footwear', 'Furniture showrooms', 'Supermarkets & kiranas', 'Two- & four-wheeler dealers', 'Car & bike service centres', 'Real-estate sites', 'Event organisers'];

export const FAQS = [
  {
    q: 'What is a logo projector and how does it work?',
    a: 'A logo projector (also called a gobo projector) shines your shop’s logo onto the floor, pavement or wall outside your shop using a small printed glass slide and a bright LED. It is one of the cheapest ways to make a shopfront stand out at night.',
  },
  {
    q: 'How much does a logo projector for a shop cost?',
    a: 'Our logo projector starts at ₹3,299 for a 6 ft logo, including the custom logo slide. Bigger logos and longer throw distances cost more — you can see every size and price on the product page.',
  },
  {
    q: 'I don’t have a logo. Can you design one?',
    a: 'Yes. Send us your shop name and any colours you like and we will prepare the artwork. You see a preview on WhatsApp and nothing is made until you approve it.',
  },
  {
    q: 'Which advertising product is best for a small shop?',
    a: 'It depends on your street. For evening footfall, a logo projector or 3D LED sign board works best. For daytime markets, a waving standee or feather flag is more eye-catching. Not sure? Send us a photo of your shopfront on WhatsApp and we will suggest what to put where.',
  },
  {
    q: 'Can I order a custom size?',
    a: 'Yes. Every product page has a “Custom size” option. Enter the size you need and we will send you a price on WhatsApp.',
  },
  {
    q: 'Are the products suitable for outdoor use?',
    a: 'Our logo projectors have all-weather housing, feather flags use fade-resistant print on a wind-rated base, and waving standees are weatherproof. Each product page lists where it can be used.',
  },
  {
    q: 'Do you deliver across India?',
    a: 'Yes. We are based in Uttam Nagar, New Delhi and deliver pan-India. Your quote includes the delivery charge to your pincode.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard products are made and dispatched in 5–10 working days. Fully custom sizes and sign boards get a firm date when we confirm your order.',
  },
  {
    q: 'Do you install the products?',
    a: 'Waving standees include on-site installation. Projectors, flags and signs come ready to mount with simple instructions, and we can guide you over a WhatsApp video call. Ask us about on-site installation for your area.',
  },
  {
    q: 'How do I place an order?',
    a: 'Choose a product, pick a size and share your requirement. We confirm the final price on WhatsApp and you book your order with a small token amount. We then send a design preview, and production starts only after you approve it.',
  },
  {
    q: 'What payment options do you accept?',
    a: 'UPI, bank transfer, and cash on delivery on eligible orders. You book your order with a small token amount once the price is confirmed; nothing is made until you approve the design.',
  },
  {
    q: 'Do you offer discounts on combos or bulk orders?',
    a: 'Yes. Order any 2 or more products together as a kit and get 10% off — start from one of our kits, like the Shopfront Starter Kit, or build your own on any product page. For multiple branches, franchises or dealer networks, message us for bulk pricing.',
  },
  {
    q: 'What if something arrives damaged?',
    a: 'Send us photos on WhatsApp within 48 hours of delivery and we will repair or replace it free of charge.',
  },
];

export const STEPS = [
  { t: 'Pick a product', d: 'Choose a size, or enter a custom one.' },
  { t: 'Share your requirement and order with a token amount', d: 'Upload your logo, confirm the price on WhatsApp and book with a small token amount.' },
  { t: 'Approve the design', d: 'We send you a design preview. Production starts only after you approve it.' },
  { t: 'We will deliver', d: 'Dispatched in 5–10 working days, anywhere in India.' },
];
