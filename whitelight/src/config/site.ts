// Site configuration - Single source of truth for brand info
// This can be replaced with environment variables or API calls later

export const siteConfig = {
  name: "WHITELIGHT STORE",
  logo: "/whitelight_logo.jpeg",
  tagline: "Step Into Style",
  description: "Premium footwear for every occasion",
  currency: "KSh",
  promotions: {
    freeSocks: {
      enabled: true,
      text: "🧦 FREE SOCKS with every purchase!",
      description: "Get a complimentary pair of premium socks with any shoe purchase"
    }
  },
  contact: {
    email: "hello@whitelight.com",
    phone: "+254 708 749473",
    whatsapp: "+254708749473",
    tillNumber: "5684680",
    address: "Luthuli Avenue, Rware Building Shop 410, Fourth Floor",
    city: "Nairobi, Kenya"
  },
  social: {
    instagram: "https://www.instagram.com/whitelightstores_kenya",
    tiktok: "https://www.tiktok.com/@viatukenya",
    facebook: "https://www.facebook.com/share/14GNCxbDJ4J/?mibextid=wwXIfr",
    twitter: "https://x.com/viatuKe",
  },
  navigation: [
    { label: "Home", href: "/" },
    { label: "Running", href: "/category/running" },
    { label: "Trail", href: "/category/trail" },
    { label: "Gym", href: "/category/gym" },
    { label: "Training", href: "/category/training" },
    { label: "Basketball", href: "/category/basketball" },
    { label: "Accessories", href: "/category/accessories" },
    { label: "Buying Guide", href: "/buying-guide" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  categories: [
    { id: "running", label: "Running Shoes", href: "/category/running" },
    { id: "trail", label: "Trail Shoes", href: "/category/trail" },
    { id: "gym", label: "Gym Shoes", href: "/category/gym" },
    { id: "training", label: "Training Shoes", href: "/category/training" },
    { id: "basketball", label: "Basketball Shoes", href: "/category/basketball" },
    { id: "accessories", label: "Accessories", href: "/category/accessories" },
  ],
  services: {
    sameDayDelivery: "Same day delivery in Nairobi and its environs",
    nationwideDelivery: "Nationwide delivery - parcel charges apply",
    codNairobi: "Payment on delivery within Nairobi CBD",
    location: "Rware Building, Luthuli Avenue"
  },
} as const;

export type SiteConfig = typeof siteConfig;
