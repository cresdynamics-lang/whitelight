// Site configuration - Single source of truth for brand info

export const siteConfig = {
  name: "THE WHITELIGHT",
  logo: "/whitelight_logo.webp",
  tagline: "The right shoe, seen from every angle.",
  description: "Running, trail, training and court shoes in Nairobi CBD",
  currency: "KSh",
  delivery: {
    sameDayCutoffHour: 15,
    sameDayLabel: "Same-day delivery in Nairobi CBD",
    exchangeDays: 3,
    cbdFeeNote: "Confirm CBD fee on WhatsApp before dispatch",
  },
  hours: {
    weekdays: { open: "08:00", close: "19:00" },
    sunday: null as null | { open: string; close: string },
    label: "Mon–Sat 8am–7pm",
  },
  promotions: {
    freeSocks: {
      enabled: true,
      text: "FREE SOCKS with every purchase!",
      description: "Get a complimentary pair of premium socks with any shoe purchase",
    },
  },
  contact: {
    email: "hello@whitelight.com",
    phone: "+254 708 749473",
    whatsapp: "+254708749473",
    tillNumber: "",
    paybillNumber: "247247",
    paybillAccount: "0708749473",
    address: "Luthuli Avenue, Rware Building Shop 410, Fourth Floor",
    city: "Nairobi, Kenya",
    landmark: "Near Kencom / Tom Mboya Street, Nairobi CBD",
  },
  social: {
    instagram: "https://www.instagram.com/whitelightstores_kenya",
    instagramHandle: "@whitelightstores_kenya",
    tiktok: "https://www.tiktok.com/@viatukenya",
    facebook: "https://www.facebook.com/share/14GNCxbDJ4J/?mibextid=wwXIfr",
    twitter: "https://x.com/viatuKe",
  },
  /** Blueprint primary nav — category bar */
  navigation: [
    { label: "New In", href: "/new", live: true },
    { label: "Running", href: "/running" },
    { label: "Trail", href: "/trail" },
    { label: "Training & Gym", href: "/training" },
    { label: "Basketball", href: "/basketball" },
    { label: "Tennis", href: "/tennis" },
    { label: "Accessories", href: "/accessories" },
    { label: "Sale", href: "/sale", sale: true },
  ],
  secondaryNav: [
    { label: "Size guide", href: "/size-guide" },
    { label: "Delivery", href: "/delivery" },
    { label: "Store & contact", href: "/store" },
    { label: "Journal", href: "/journal" },
    { label: "About", href: "/about" },
  ],
  categories: [
    { id: "running", label: "Running", href: "/running", blurb: "Race day · daily · long run" },
    { id: "trail", label: "Trail", href: "/trail", blurb: "Grip · waterproof" },
    { id: "training", label: "Training & Gym", href: "/training", blurb: "Lift · HIIT · all-day" },
    { id: "gym", label: "Gym", href: "/gym", blurb: "Stable under load" },
    { id: "basketball", label: "Basketball", href: "/basketball", blurb: "Court shoes, colourways" },
    { id: "tennis", label: "Tennis", href: "/tennis", blurb: "Court shoes" },
    { id: "accessories", label: "Accessories", href: "/accessories", blurb: "Mats · bands · bags" },
  ],
  /** Brand strip / mega menu — Nike, Asics, Adidas only */
  brands: ["Nike", "Asics", "Adidas"],
  purposes: [
    { id: "race_day", label: "Race day & speed", href: "/running?purpose=race_day" },
    { id: "daily", label: "Daily trainers", href: "/running?purpose=daily" },
    { id: "long_run", label: "Long run & marathon", href: "/running?purpose=long_run" },
    { id: "trail", label: "Trail & grip", href: "/trail" },
    { id: "gym", label: "Gym & training", href: "/training" },
    { id: "court", label: "Court", href: "/basketball" },
  ],
  services: {
    sameDayDelivery: "Same day delivery in Nairobi CBD",
    nationwideDelivery: "Nationwide delivery - parcel charges apply",
    codNairobi: "Payment on delivery within Nairobi CBD",
    location: "Rware Building, Luthuli Avenue",
  },
  faqs: [
    {
      q: "Is the size I want in stock?",
      a: "Every size you can tap is in stock right now. Crossed-out sizes are sold out; message us on WhatsApp and we will tell you if it is coming back.",
    },
    {
      q: "Are the photos of the actual pair?",
      a: "Yes. Photos are of the pair in stock. We show side, sole and detail views so you can inspect before you buy.",
    },
    {
      q: "Where do your shoes come from?",
      a: "We sell authentic athletic footwear from our Luthuli Avenue shop. Ask us on WhatsApp for sourcing notes on any model.",
    },
    {
      q: "How fast is delivery, and what does it cost?",
      a: "Same-day in Nairobi CBD when you order before mid-afternoon and stock is confirmed. Elsewhere in Nairobi and Kenya by courier — fees confirmed before dispatch.",
    },
    {
      q: "What if the size is wrong?",
      a: "Exchange for a different size of the same model within 3 days, unworn, in the original box. Refunds are not offered.",
    },
    {
      q: "How do I pay with M-Pesa?",
      a: "Checkout sends an M-Pesa prompt to your phone, or use our Paybill. Card and cash on delivery (Nairobi) are also available.",
    },
    {
      q: "Can I come and try them on?",
      a: "Yes — visit Rware Building, Luthuli Avenue, Shop 410, 4th Floor. Open Monday–Saturday, 8am–7pm.",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
