/** Rich Nairobi-first SEO body sections — used below product grids on category pages */

export type SeoContentSection = {
  heading: string;
  body: string;
};

export type PageSeoContent = {
  intro: string;
  sections: SeoContentSection[];
  footer?: string;
};

export const categorySeoContent: Record<string, PageSeoContent> = {
  running: {
    intro:
      "White Light Store is Nairobi's performance running shoe hub for everyday runners, marathon chasers and weekend joggers. We stock Nike, Adidas, HOKA and more in the right cushioning and support for Kenyan roads and paths, so you get the comfort and confidence you need from CBD loops to long runs out of town.",
    sections: [
      {
        heading: "Road Running Shoes",
        body: "Browse cushioned daily trainers and responsive tempo shoes built for tarmac in Nairobi. From soft long-distance models to snappy tempo pairs, we help you match shoe to pace and distance so your runs on Thika Road, Lang'ata Road or the CBD stay smooth and supported.",
      },
      {
        heading: "Trail Running Shoes",
        body: "When you move from the city to the trails, you need grip and stability. Our trail selections balance lugs, rock protection and cushioning so you can handle mud, roots and rocks on Karura Forest loops, Ngong Hills climbs and weekend trail runs outside Nairobi.",
      },
      {
        heading: "Running Shoes by Brand",
        body: "Shop Nike, Adidas, HOKA, ASICS and New Balance running shoes curated for Kenyan runners. Whether you prefer classic Nike Pegasus, HOKA max-cushion or responsive Adidas trainers, we guide you to models that match your stride, mileage and budget in Nairobi.",
      },
      {
        heading: "How to Choose Running Shoes",
        body: "Not sure where to start? We look at your surface, distance, weekly mileage and past injuries to recommend the right running shoes. Visit our Nairobi CBD shop or chat on WhatsApp to get personalised fitting advice before you order anywhere in Kenya.",
      },
    ],
    footer:
      "White Light Store delivers running shoes Nairobi-wide with same-day options in the CBD and quick courier shipping to the rest of Kenya. Order online or message us on WhatsApp to confirm sizes, stock and delivery times.",
  },

  trail: {
    intro:
      "White Light Store is Nairobi's trusted trail shoe specialist for Karura Forest loops, Ngong Hills climbs, Kereita Forest adventures and red-dirt tracks beyond the city. We stock Nike, HOKA, Salomon and more with real grip for Kenyan terrain—not just road shoes rebranded for trails.",
    sections: [
      {
        heading: "Trail Shoes for Kenyan Terrain",
        body: "Kenyan trails shift from dusty descents to slick mud in a single run. We focus on lug depth, outsole rubber and rock protection plates so your shoes bite on Karura, Ngong and Kereita while still feeling comfortable on the roads back into Nairobi.",
      },
      {
        heading: "Karura, Ngong & Weekend Trail Runs",
        body: "Whether you train in Karura on weekday evenings or head to Ngong Hills on Saturday, we match shoes to your routes. Lighter, protective options for beginners; more aggressive lug patterns for experienced runners chasing vertical metres and technical singletrack.",
      },
      {
        heading: "Trail Shoes by Brand",
        body: "Explore Nike, HOKA and Salomon trail running shoes for forest loops and mountain routes. We help you choose between softer HOKA cushioning, precise Salomon fit and versatile Nike trail options based on your weekly terrain around Nairobi.",
      },
      {
        heading: "How to Choose Trail Shoes in Nairobi",
        body: "Message us on WhatsApp with where you train, your weekly mileage and any ankle or knee history. We recommend trail shoes for Nairobi routes before you order—so you are not guessing between models online.",
      },
    ],
    footer:
      "Order trail shoes with same-day Nairobi CBD delivery or fast courier across Kenya. Confirm sizes and stock on WhatsApp before your next trail session.",
  },

  gym: {
    intro:
      "White Light Store is Nairobi's trusted gym shoe destination for lifters, HIIT athletes and studio members. We fit you with stable, grippy trainers from Nike, Adidas, Reebok and more—built for Kenyan gym floors, platforms and functional training spaces across the city.",
    sections: [
      {
        heading: "Women's Gym Shoes Nairobi",
        body: "Women in Nairobi need gym shoes that balance support, fit and style. We curate women's training shoes for classes, strength sessions and treadmill work—with options for narrow, regular and wider feet.",
      },
      {
        heading: "CrossFit & Functional Training",
        body: "For CrossFit and functional training you need grip for burpees and box jumps plus stability for barbell work. Our trainers use low, firm platforms and tough uppers that survive rope climbs and daily sessions in Nairobi gyms.",
      },
      {
        heading: "Weightlifting & Strength Training",
        body: "Squats and Olympic lifts demand a stable base. We help Nairobi lifters choose flat training shoes or raised-heel weightlifting models based on ankle mobility, squat depth and how you train most often.",
      },
      {
        heading: "Gym Shoes by Brand",
        body: "Compare Nike, Adidas, Reebok and more in one Nairobi store. We explain fit, cushioning and heel-to-toe drop so your pair feels locked in from warm-up to your last set.",
      },
    ],
    footer:
      "Gym shoes delivered Nairobi-wide with same-day CBD options. WhatsApp us to confirm size, training style and stock before you order.",
  },

  training: {
    intro:
      "White Light Store is Nairobi's home for the best training shoes—built for drills, conditioning, agility work and multi-sport sessions. From school athletes to weekend warriors, we stock responsive, supportive trainers that keep up with Nairobi's fast-paced training culture.",
    sections: [
      {
        heading: "Drills & Conditioning Shoes",
        body: "Training shoes for sprints, ladders, plyometrics and court-style movement need flexible forefoots and stable heels. We pick models that handle direction changes on tarmac, turf and indoor surfaces common in Nairobi facilities.",
      },
      {
        heading: "Multi-Sport Training in Nairobi",
        body: "If you mix running, gym work and sport in one week, you need a versatile trainer—not a pure running or pure lifting shoe. We guide you to balanced cushioning and durability for mixed schedules.",
      },
      {
        heading: "Training Shoes by Brand",
        body: "Shop Nike, Adidas, Puma and more training lines chosen for Kenyan athletes. We match brand technologies to how you train: speed days, strength days or all-round conditioning.",
      },
      {
        heading: "How to Choose Training Shoes",
        body: "Tell us your sports, weekly sessions and surfaces on WhatsApp. Visit our Luthuli Avenue CBD shop for fitting advice so your training shoes support—not slow—your progress in Nairobi.",
      },
    ],
    footer:
      "Training shoes with same-day Nairobi CBD delivery and Kenya-wide shipping. Order online or message us to confirm stock.",
  },

  basketball: {
    intro:
      "White Light Store is Nairobi's trusted basketball shoe shop for outdoor tarmac, indoor leagues and streetball. From Air Jordan to Nike and Puma, we stock cushioning, grip and support tuned for crossovers, landings and quick cuts on Kenyan courts.",
    sections: [
      {
        heading: "Jordan Brand in Nairobi",
        body: "Explore Air Jordan models for serious hoopers and collectors in Nairobi. We focus on court comfort and support—not just style—so your pair works on game night, not only in photos.",
      },
      {
        heading: "Nike Performance Basketball",
        body: "Nike basketball shoes bring responsive Zoom cushioning, supportive uppers and sticky outsoles. We select models that perform on dusty outdoor Nairobi courts and indoor floors alike.",
      },
      {
        heading: "High Tops vs Low Tops",
        body: "Guards often prefer lighter low tops; forwards and centres may want more collar support. We help you decide based on ankle history, position and where you play in Nairobi.",
      },
      {
        heading: "Nairobi Court & Streetball",
        body: "Nairobi courts can be uneven and dusty—grip and durability matter. Our picks handle pickup games, league nights and training while still looking sharp off-court around the city.",
      },
    ],
    footer:
      "Basketball shoes with same-day Nairobi CBD delivery. Chat on WhatsApp before your next game for sizing help.",
  },

  tennis: {
    intro:
      "White Light Store is Nairobi's trusted tennis shoe specialist for hard courts, club sessions and competitive league play. Hot afternoons and quick direction changes demand lateral support, durable outsoles and breathable uppers—we stock court-ready models for Nairobi players.",
    sections: [
      {
        heading: "All-Court Tennis Shoes Nairobi",
        body: "Whether you play social doubles or weekly league, you need grip for stops, starts and slides. We match shoes to hard-court surfaces common in Nairobi clubs and outdoor facilities.",
      },
      {
        heading: "Lateral Support & Durability",
        body: "Tennis wears down outsoles faster than running shoes. We prioritise reinforced toe areas, stable midfoot shanks and rubber compounds that last through Nairobi's abrasive courts.",
      },
      {
        heading: "Tennis Shoes by Brand",
        body: "Shop leading tennis lines with cushioning and support for long matches. We help you compare fit and drop so you move confidently through three-set matches in Nairobi heat.",
      },
      {
        heading: "How to Choose Tennis Shoes",
        body: "Share your play frequency, court surface and foot width on WhatsApp. Visit our CBD store or order online with sizing guidance from Nairobi's trusted footwear team.",
      },
    ],
    footer:
      "Tennis shoes delivered across Nairobi with same-day CBD options. Confirm sizes and stock before you order.",
  },

  accessories: {
    intro:
      "White Light Store is Nairobi's trusted source for shoe accessories—care products, comfort upgrades and essentials that extend the life of your trainers. From insoles to cleaning kits, we help Nairobi runners and gym-goers protect their investment in quality footwear.",
    sections: [
      {
        heading: "Shoe Care & Maintenance",
        body: "Keep trainers fresh after muddy Karura runs or dusty CBD commutes. We stock cleaners, brushes and protectants suited to mesh, leather and synthetic uppers common in performance shoes.",
      },
      {
        heading: "Comfort & Performance Add-Ons",
        body: "Insoles, laces and grip socks can transform an almost-right fit into a confident one. We recommend accessories based on your shoes and how you use them in Nairobi.",
      },
      {
        heading: "Socks & Training Essentials",
        body: "Breathable socks and training extras reduce blisters and hot spots on long Nairobi runs. Pair the right accessories with your running, trail or gym shoes for all-day comfort.",
      },
      {
        heading: "Why Buy Accessories in Nairobi",
        body: "Buying locally means you can ask questions, compare feel and collect same-day from Luthuli Avenue CBD. Message us on WhatsApp for bundle advice with your next shoe order.",
      },
    ],
    footer:
      "Accessories shipped Nairobi-wide with fast CBD collection options. Order alongside shoes for one convenient delivery.",
  },
};

export const aboutSeoContent: PageSeoContent = {
  intro:
    "White Light Store is Nairobi's most trusted specialist for running, trail, gym, training, basketball, tennis shoes and accessories. Based at Rware Building, Luthuli Avenue, Shop 410, we help athletes, commuters and weekend warriors find authentic performance footwear with honest advice—not hard sales.",
  sections: [
    {
      heading: "Nairobi's Performance Shoe Hub",
      body: "From CBD lunch-break runs to Ngong Hills weekends and evening gym sessions, Nairobi moves fast—and your shoes should keep up. We curate Nike, Adidas, HOKA, ASICS, New Balance and more for Kenyan roads, trails and courts.",
    },
    {
      heading: "Trusted Running & Trail Expertise",
      body: "Our team understands Nairobi surfaces: tarmac on Thika and Lang'ata roads, red dirt on trails, and dusty outdoor basketball courts. We match cushioning, grip and support to how you actually train—not generic online charts.",
    },
    {
      heading: "Gym, Training & Court Shoes",
      body: "Lifters, CrossFit athletes, tennis players and basketball crews visit us for stable, grippy footwear. We explain heel drop, plate stiffness and court rubber so you buy once and buy right.",
    },
    {
      heading: "Visit Us or Order on WhatsApp",
      body: "Stop by our Nairobi CBD shop for fitting advice, or order online with same-day delivery in the CBD and courier service across Kenya. WhatsApp +254 708 749473 for sizes, stock and delivery times.",
    },
  ],
  footer:
    "Whitelight Store — best trusted athletic footwear in Nairobi. Open Monday–Saturday, 8am–7pm, Luthuli Avenue.",
};

export const buyingGuideSeoContent: PageSeoContent = {
  intro:
    "White Light Store's buying guide helps Nairobi shoppers choose the right running, trail, gym, training and court shoes. Use this guide for sizing, category basics and fitting tips—then shop with confidence or visit our Luthuli Avenue CBD store for personalised advice.",
  sections: [
    {
      heading: "How to Measure Your Size in Nairobi",
      body: "Measure feet in the evening when they are largest. Stand on paper, mark heel and longest toe, and compare length in cm to our size chart. Between sizes? Visit our CBD shop or WhatsApp us—we recommend up or down based on brand and width.",
    },
    {
      heading: "Running Shoes — Roads & Races",
      body: "Road runners in Nairobi need cushioning for tarmac and responsiveness for tempo days. Match weekly mileage and pace: soft daily trainers for high volume, lighter shoes for speed work. Trail runners need grip for Karura and Ngong—not the same shoe as CBD loops.",
    },
    {
      heading: "Gym & Training Shoes",
      body: "Lifting favours a stable, low platform; HIIT and functional training need grip and flexibility. Tell us your main movements—we steer you away from running shoes that feel soft but wobble under a barbell.",
    },
    {
      heading: "Basketball, Tennis & Accessories",
      body: "Court shoes need lateral support and durable rubber. Basketball players should consider ankle support and outdoor vs indoor grip. Accessories—care kits, insoles, socks—extend shoe life after muddy or dusty Nairobi sessions.",
    },
    {
      heading: "Get Personal Advice",
      body: "Not sure after reading the guide? Message us on WhatsApp with your sport, weekly schedule and any injury history. We are Nairobi's trusted fitting partner before you spend on the wrong pair online.",
    },
  ],
  footer:
    "Shop the best athletic footwear in Nairobi at Whitelight Store — same-day CBD delivery available.",
};

/** Meta descriptions aligned with intro copy for Google snippets */
export function getCategoryMetaDescription(category: string): string {
  const content = categorySeoContent[category];
  if (!content) {
    return `Best ${category} shoes in Nairobi at Whitelight Store — trusted specialist, Luthuli Avenue CBD, same-day delivery.`;
  }
  const max = 320;
  const base = content.intro;
  if (base.length <= max) return base;
  return `${base.slice(0, max - 3)}...`;
}
