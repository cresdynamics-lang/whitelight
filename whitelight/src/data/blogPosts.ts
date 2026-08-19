export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  cover: string;
  coverAlt: string;
  body: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-choose-running-shoes-nairobi",
    title: "How to Choose Running Shoes in Nairobi",
    excerpt:
      "Road vs trail, cushion vs responsiveness, and what actually matters for Kenyan footpaths and CBD pavement.",
    date: "2026-07-10",
    category: "Buying guide",
    cover: "/couresel_images/running/running2.webp",
    coverAlt: "Running shoes display at Whitelight Store Nairobi",
    body: [
      "Nairobi runners put serious miles on pavements, tracks, and weekend trail loops. The right pair depends on surface more than brand hype.",
      "For daily road miles around the city, look for reliable cushioning and a secure midfoot. If you hop between gym sessions and short runs, a versatile trainer often beats a pure race shoe.",
      "Visit Whitelight Store on Luthuli Avenue for a quick fit check, or message us on WhatsApp with your usual size and preferred feel — soft, firm, or race-day light.",
    ],
  },
  {
    slug: "same-day-delivery-nairobi-cbd",
    title: "Same-Day Delivery Across Nairobi CBD",
    excerpt:
      "Order before cut-off and get your pair the same day in Nairobi and nearby estates — here’s how it works.",
    date: "2026-07-01",
    category: "Updates",
    cover: "/couresel_images/running/running1.webp",
    coverAlt: "Athletic footwear ready for Nairobi delivery",
    body: [
      "We offer same-day delivery in Nairobi CBD and nearby environs when stock is confirmed. Outside those zones, nationwide parcel delivery applies.",
      "Checkout with Ship or Pickup, or reserve via WhatsApp if you want us to confirm size availability first.",
      "M-Pesa Paybill and in-store pickup at Rware Building (Shop 410, 4th Floor) remain available for shoppers who prefer to see the pair in person.",
    ],
  },
  {
    slug: "new-season-gym-and-training",
    title: "New Season: Gym & Training Drops",
    excerpt:
      "Fresh training silhouettes for lifting, HIIT, and everyday wear — stable platforms and breathable uppers.",
    date: "2026-06-20",
    category: "New arrivals",
    cover: "/couresel_images/gym/gym1.webp",
    coverAlt: "Gym and training shoes at Whitelight Store",
    body: [
      "Training days need lateral support and a stable base more than maximal stack. Our gym and training edit focuses on pairs that stay planted under load.",
      "Browse the Gym and Training categories for current stock, or filter Sale for limited deals while they last.",
      "Not sure between two models? Send us your workout style on WhatsApp and we’ll point you to the better fit.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
