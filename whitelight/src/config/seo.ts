// SEO — Nairobi-first. Primary market: Nairobi CBD; Kenya delivery secondary.

import {
  getCategoryMetaDescription,
  aboutSeoContent,
  buyingGuideSeoContent,
} from "./categorySeoContent";

export const seoConfig = {
  defaultMeta: {
    title: "Best Running, Trail & Gym Shoes Nairobi | Whitelight Store",
    description:
      "Nairobi's most trusted specialist for running, trail, gym, training shoes and accessories. Authentic brands, expert fitting at Luthuli Avenue CBD. Same-day Nairobi delivery.",
    keywords:
      "best running shoes Nairobi, best trail shoes Nairobi, best gym shoes Nairobi, best training shoes Nairobi, trusted shoe store Nairobi, best shoe accessories Nairobi, athletic footwear Nairobi CBD, Whitelight Store Nairobi",
    author: "Whitelight Store Kenya",
    robots: "index, follow",
    canonical: "https://whitelightstore.co.ke/",
    ogType: "website",
    ogImage: "https://whitelightstore.co.ke/whitelight_logo.webp",
    twitterCard: "summary_large_image",
    geo: {
      region: "KE-30",
      placename: "Nairobi, Kenya",
      position: "-1.2840719;36.8219473",
    },
    business: {
      name: "Whitelight Store",
      address: "Rware Building, Luthuli Avenue, Shop 410, Fourth Floor",
      city: "Nairobi",
      country: "Kenya",
      phone: "+254708749473",
      email: "hello@whitelightstore.co.ke",
      hours: "Monday-Saturday: 8am-7pm",
    },
  },

  pages: {
    home: {
      title: "Best Running, Trail & Gym Shoes Nairobi | Whitelight Store",
      description:
        "Nairobi's trusted store for the best running, trail, gym, training shoes and accessories. Nike, Adidas, HOKA & more. Same-day CBD delivery. Shop Whitelight Store, Luthuli Avenue.",
      keywords:
        "best running shoes Nairobi, best trail shoes Nairobi, best gym shoes Nairobi, best training shoes Nairobi, best accessories Nairobi, trusted shoe seller Nairobi, athletic shoes Nairobi CBD, Whitelight Store Nairobi",
    },

    running: {
      title: "Best Running Shoes Nairobi | Whitelight Store",
      description: getCategoryMetaDescription("running"),
      keywords:
        "best running shoes Nairobi, running shoes Nairobi CBD, buy running shoes Nairobi, trusted running shoe store Nairobi, Nike running Nairobi, Adidas running Nairobi, marathon shoes Nairobi",
    },

    trail: {
      title: "Best Trail Shoes Nairobi | Whitelight Store",
      description: getCategoryMetaDescription("trail"),
      keywords:
        "best trail shoes Nairobi, trail running shoes Nairobi, trail shoes Nairobi CBD, Karura trail shoes Nairobi, Ngong Hills shoes Nairobi, trusted trail footwear Nairobi",
    },

    gym: {
      title: "Best Gym Shoes Nairobi | Whitelight Store",
      description: getCategoryMetaDescription("gym"),
      keywords:
        "best gym shoes Nairobi, gym shoes Nairobi CBD, training shoes Nairobi, CrossFit shoes Nairobi, women's gym shoes Nairobi, trusted gym footwear Nairobi",
    },

    basketball: {
      title: "Best Basketball Shoes Nairobi | Whitelight Store",
      description: getCategoryMetaDescription("basketball"),
      keywords:
        "best basketball shoes Nairobi, basketball shoes Nairobi CBD, Jordan shoes Nairobi, Nike basketball Nairobi, court shoes Nairobi, trusted basketball footwear Nairobi",
    },

    tennis: {
      title: "Best Tennis Shoes Nairobi | Whitelight Store",
      description: getCategoryMetaDescription("tennis"),
      keywords:
        "best tennis shoes Nairobi, tennis shoes Nairobi CBD, court shoes Nairobi, tennis footwear Nairobi, trusted tennis shoes Nairobi",
    },

    training: {
      title: "Best Training Shoes Nairobi | Whitelight Store",
      description: getCategoryMetaDescription("training"),
      keywords:
        "best training shoes Nairobi, training shoes Nairobi CBD, drills shoes Nairobi, conditioning shoes Nairobi, multi-sport training Nairobi, trusted training footwear Nairobi",
    },

    accessories: {
      title: "Best Shoe Accessories Nairobi | Whitelight Store",
      description: getCategoryMetaDescription("accessories"),
      keywords:
        "best shoe accessories Nairobi, shoe care Nairobi CBD, footwear accessories Nairobi, trusted shoe accessories Nairobi, athletic accessories Nairobi",
    },

    buyingGuide: {
      title: "Shoe Buying Guide Nairobi | Whitelight Store",
      description: buyingGuideSeoContent.intro,
      keywords:
        "shoe buying guide Nairobi, shoe fitting Nairobi CBD, size guide Nairobi, trusted shoe advice Nairobi, footwear guide Nairobi",
    },

    about: {
      title: "Trusted Shoe Store Nairobi | About Whitelight Store",
      description: aboutSeoContent.intro,
      keywords:
        "trusted shoe store Nairobi, about Whitelight Nairobi, best footwear shop Nairobi CBD, athletic shoe experts Nairobi",
    },

    contact: {
      title: "Visit Whitelight Store Nairobi CBD | Contact",
      description:
        "Contact Whitelight Store in Nairobi CBD — Rware Building, Luthuli Avenue, Shop 410. Call +254 708 749473. Same-day Nairobi delivery. Open Mon–Sat 8am–7pm.",
      keywords:
        "Whitelight Store Nairobi contact, shoe shop Luthuli Avenue, Nairobi CBD footwear, trusted shoe store location Nairobi",
    },

    newArrivals: {
      title: "New Arrivals Nairobi | Best Athletic Shoes | Whitelight",
      description:
        "Latest running, trail, gym and training shoes in Nairobi. New arrivals at the city's trusted athletic footwear store. Same-day Nairobi CBD delivery.",
      keywords:
        "new shoes Nairobi, new running shoes Nairobi, latest gym shoes Nairobi, new arrivals Nairobi CBD, Whitelight Store new stock",
    },

    terms: {
      title: "Terms of Service | Whitelight Store Nairobi",
      description:
        "Terms of service for Whitelight Store Nairobi. Transparent policies for Kenya's trusted athletic footwear retailer at Luthuli Avenue CBD.",
      keywords: "Whitelight terms Nairobi, shoe store policies Nairobi",
    },
  },
} as const;

/** Visible H1 copy — direct, Nairobi-first (matches page intent for SEO) */
export const categoryPageH1: Record<string, string> = {
  running: "Best Running Shoes in Nairobi",
  trail: "Best Trail Shoes in Nairobi",
  gym: "Best Gym Shoes in Nairobi",
  training: "Best Training Shoes in Nairobi",
  basketball: "Best Basketball Shoes in Nairobi",
  tennis: "Best Tennis Shoes in Nairobi",
  accessories: "Best Shoe Accessories in Nairobi",
};

export const categoryPageSubtext: Record<string, string> = {
  running:
    "Nairobi's trusted running shoe specialist — road, race and daily trainers from leading brands.",
  trail:
    "Nairobi's trusted trail shoes for Karura, Ngong Hills and Kenyan terrain — grip you can rely on.",
  gym:
    "Nairobi's trusted gym and workout shoes — lifting, HIIT and studio sessions.",
  training:
    "Nairobi's trusted training shoes for drills, conditioning and multi-sport work.",
  basketball:
    "Nairobi's trusted basketball shoes — court grip, cushioning and style.",
  tennis:
    "Nairobi's trusted tennis shoes for club and court performance.",
  accessories:
    "Nairobi's trusted shoe accessories — care, comfort and performance essentials.",
};
