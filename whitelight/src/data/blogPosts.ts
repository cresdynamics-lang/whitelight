export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { type: "links"; items: { label: string; href: string }[] }
  | { type: "map"; title: string; src: string }
  | { type: "printGuide"; title: string; steps: string[] };

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  date: string;
  updatedAt: string;
  author: string;
  category: string;
  cover: string;
  coverAlt: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  answerFirst: string;
  blocks: BlogBlock[];
  faqs: BlogFaq[];
  categoryLinks: { label: string; href: string }[];
};

const STORE_FACT =
  "Whitelight Store is a Nairobi athletic footwear store on Luthuli Avenue (Rware Building, Shop 410, 4th Floor) selling running, trail, gym, and training shoes, with same-day CBD delivery.";

export const blogPosts: BlogPost[] = [
  {
    slug: "best-running-shoes-nairobi",
    title: "Best Running Shoes in Nairobi: How to Choose the Right Pair for Your Run",
    metaTitle: "Best Running Shoes Nairobi | Choose Right Pair",
    metaDescription:
      "Match distance, foot shape and surface to pick the best running shoes in Nairobi. Beginner to marathon guide from Whitelight Store, Luthuli Avenue.",
    excerpt:
      "A practical Nairobi guide to choosing running shoes by distance, foot needs, cushioning, support and drop — with links to shop each type.",
    date: "2026-10-05",
    updatedAt: "2026-10-05",
    author: "Whitelight Store Team",
    category: "Buying guide",
    cover: "/couresel_images/running/running2.webp",
    coverAlt: "best-running-shoes-nairobi-whitelight-store-display",
    primaryKeyword: "best running shoes Nairobi",
    secondaryKeywords: [
      "running shoes for beginners Kenya",
      "road running shoes",
      "how to choose running shoes",
    ],
    answerFirst:
      "The best running shoes in Nairobi match your distance, your foot, and where you run — CBD pavement, track, or weekend trails. Soft cushioning suits beginners and recovery miles; firmer, snappier shoes suit tempo and race work. Get fitted at Whitelight Store on Luthuli Avenue before race season.",
    categoryLinks: [
      { label: "Shop running shoes", href: "/category/running" },
      { label: "Shop trail shoes", href: "/category/trail" },
      { label: "Shop gym shoes", href: "/category/gym" },
      { label: "Shop training shoes", href: "/category/training" },
    ],
    blocks: [
      {
        type: "p",
        text: `${STORE_FACT} This guide answers how to choose the best running shoes Nairobi runners actually need — not hype pairs that look good but feel wrong after 5 km.`,
      },
      {
        type: "h2",
        text: "How do I choose the best running shoes in Nairobi?",
      },
      {
        type: "p",
        text: "Start with three facts: weekly distance, foot width/arch feel, and surface. Road shoes cushion CBD concrete and estate loops. Trail shoes add grip for Karura and Ngong. Beginners usually want more cushion and a stable ride; race-focused runners often prefer a lighter, more responsive shoe once form is solid.",
      },
      {
        type: "h2",
        text: "Best running shoes by runner type",
      },
      {
        type: "h3",
        text: "Beginners",
      },
      {
        type: "p",
        text: "If you are new to running shoes for beginners Kenya shoppers often ask about, pick a daily trainer with soft cushioning, a secure midfoot, and room in the toe box. Walk a full day in them before your first long jog. Browse our running category for forgiving daily trainers.",
      },
      {
        type: "h3",
        text: "Daily joggers",
      },
      {
        type: "p",
        text: "For 3–5 runs a week on Nairobi roads, a durable road running shoe with balanced cushion beats a race shoe. Look for outsoles that survive rough pavement and a ride that still feels fresh after 8–10 km.",
      },
      {
        type: "h3",
        text: "10K and half marathon",
      },
      {
        type: "p",
        text: "You want a shoe that stays responsive past 10 km without punishing your calves. Moderate stack, reliable midsole, and a lock-down lace system matter more than carbon-plate marketing if you are still building volume.",
      },
      {
        type: "h3",
        text: "Marathon",
      },
      {
        type: "p",
        text: "Long-run trainers for weekday kilometres, plus a race-day shoe you have already tested in a long run. Never debut a brand-new pair on race morning in Nairobi heat.",
      },
      {
        type: "h2",
        text: "Cushioning, support and drop — plain language",
      },
      {
        type: "ul",
        items: [
          "Cushioning: how soft the midsole feels. More cushion helps beginners and recovery days; less can feel faster for short efforts.",
          "Support: how stable the shoe feels under your arch and heel. Useful if you feel your foot roll in, especially on tired late-run miles.",
          "Drop: the height difference from heel to toe. Higher drop often feels more protective for heel strikers; lower drop can feel more natural if you land midfoot.",
        ],
      },
      {
        type: "table",
        caption: "Runner type vs shoe feel",
        headers: ["Runner type", "Shoe feel", "Best for"],
        rows: [
          ["Beginner", "Soft cushion, stable base", "Easy jogs, building consistency"],
          ["Daily jogger", "Balanced cushion + durable outsole", "Road loops around Nairobi estates"],
          ["10K / half", "Responsive midsole, secure fit", "Tempo work and race prep"],
          ["Marathon", "Protective long-run cushion + tested race pair", "High weekly mileage and race day"],
        ],
      },
      {
        type: "h2",
        text: "Race season tip for Nairobi runners",
      },
      {
        type: "p",
        text: "Buy and break in new shoes weeks before race day — not the week of. Do at least two runs of 8–12 km in the race pair so hot spots show up early. Whitelight Store stocks current running models so you can compare fit in person at Luthuli Avenue.",
      },
      {
        type: "h2",
        text: "Shop by shoe type",
      },
      {
        type: "links",
        items: [
          { label: "Running shoes in Nairobi", href: "/category/running" },
          { label: "Trail running shoes", href: "/category/trail" },
          { label: "Gym shoes", href: "/category/gym" },
          { label: "Training shoes", href: "/category/training" },
          { label: "Luthuli Avenue buying guide", href: "/blog/buy-running-shoes-nairobi-cbd-luthuli-avenue" },
          { label: "Price & authenticity guide", href: "/blog/running-shoes-price-kenya" },
        ],
      },
      {
        type: "p",
        text: "Need a quick recommendation? WhatsApp Whitelight Store with your usual size, weekly distance, and preferred feel (soft, firm, or race-light).",
      },
    ],
    faqs: [
      {
        question: "What are the best running shoes in Nairobi for beginners?",
        answer:
          "A cushioned daily trainer with a stable ride and roomy toe box. Visit Whitelight Store on Luthuli Avenue for a fit check, or browse /category/running and message us your size on WhatsApp.",
      },
      {
        question: "Should I buy road or trail shoes in Nairobi?",
        answer:
          "Road shoes for CBD pavement and estate loops; trail shoes for Karura, Ngong Hills, and muddy paths. Many Nairobi runners keep one of each.",
      },
      {
        question: "How soon before a race should I buy new running shoes?",
        answer:
          "At least 2–3 weeks before race day, with several break-in runs. Do not race in a brand-new pair the week of the event.",
      },
      {
        question: "Where can I buy original running shoes in Nairobi CBD?",
        answer:
          "Whitelight Store, Rware Building, Luthuli Avenue, Shop 410, 4th Floor. Open Monday–Saturday, 8am–7pm, with same-day CBD delivery.",
      },
      {
        question: "Do you help with sizing online?",
        answer:
          "Yes. Send your usual brand size and a photo of your foot length on WhatsApp (+254 708 749473). See our size guide for step-by-step measuring.",
      },
    ],
  },
  {
    slug: "buy-running-shoes-nairobi-cbd-luthuli-avenue",
    title: "Where to Buy Original Running Shoes in Nairobi CBD: A Luthuli Avenue Guide",
    metaTitle: "Running Shoes Nairobi CBD | Luthuli Avenue",
    metaDescription:
      "Buy original running shoes in Nairobi CBD at Whitelight Store, Rware Building Shop 410 on Luthuli Avenue. Hours, same-day delivery and safe shopping tips.",
    excerpt:
      "Exact address, hours, stock and same-day CBD delivery details for buying original running shoes on Luthuli Avenue.",
    date: "2026-10-04",
    updatedAt: "2026-10-05",
    author: "Whitelight Store Team",
    category: "Local guide",
    cover: "/couresel_images/running/running1.webp",
    coverAlt: "running-shoes-nairobi-cbd-luthuli-avenue-whitelight-store",
    primaryKeyword: "running shoes Nairobi CBD",
    secondaryKeywords: [
      "Luthuli Avenue shoes",
      "sports shoes shop Nairobi",
      "same day shoe delivery Nairobi",
    ],
    answerFirst:
      "Whitelight Store sells original running, trail, gym and training shoes in Nairobi CBD at Rware Building, Luthuli Avenue, Shop 410, 4th Floor. Open Monday–Saturday, 8am–7pm. Order for same-day CBD delivery or pick up in store after a fit check.",
    categoryLinks: [
      { label: "Shop running", href: "/category/running" },
      { label: "Contact / WhatsApp", href: "/contact" },
      { label: "Visit about page", href: "/about" },
    ],
    blocks: [
      {
        type: "p",
        text: `${STORE_FACT} If you are searching for running shoes Nairobi CBD shoppers trust, start here — not with random street stalls.`,
      },
      {
        type: "h2",
        text: "Who we are and where to find us",
      },
      {
        type: "ul",
        items: [
          "Store: Whitelight Store Kenya",
          "Address: Rware Building, Luthuli Avenue, Shop 410, Fourth Floor, Nairobi CBD",
          "Hours: Monday–Saturday, 8:00am–7:00pm",
          "Phone / WhatsApp: +254 708 749473",
          "Stock: running, trail, gym, training, basketball, tennis shoes and accessories",
        ],
      },
      {
        type: "h2",
        text: "What we stock on Luthuli Avenue",
      },
      {
        type: "p",
        text: "We specialise in athletic footwear — road running shoes, trail pairs for Kenyan hills, gym and training shoes for HIIT and lifting, plus court styles. This is a sports shoes shop Nairobi runners use for authentic stock and honest sizing advice, not fashion replicas.",
      },
      {
        type: "h2",
        text: "Same-day shoe delivery Nairobi CBD",
      },
      {
        type: "ul",
        items: [
          "Cut-off: order by mid-afternoon (confirm on WhatsApp the same day) while stock is available.",
          "Areas: Nairobi CBD and nearby environs for same-day; other Nairobi estates and nationwide by courier.",
          "Cost: CBD same-day rates confirmed at checkout or on WhatsApp before dispatch; nationwide parcels are charged separately.",
          "Payment: M-Pesa Paybill and in-store options available.",
        ],
      },
      {
        type: "h2",
        text: "How to shop safely for shoes in the CBD",
      },
      {
        type: "ol",
        items: [
          "Check the box labelling and model codes against the shoe tongue/labels.",
          "Inspect stitching, glue lines and logo alignment — messy work is a red flag.",
          "Feel the midsole: originals have consistent cushion; many fakes feel dead or uneven.",
          "Always ask for a receipt and keep WhatsApp order confirmation.",
          "Prefer a known store address you can return to — like Shop 410, Rware Building.",
        ],
      },
      {
        type: "h2",
        text: "Map to Whitelight Store on Luthuli Avenue",
      },
      {
        type: "map",
        title: "Whitelight Store — Rware Building, Luthuli Avenue",
        src: "https://maps.google.com/maps?q=Rware+Building+Luthuli+Avenue+Nairobi&z=16&output=embed",
      },
      {
        type: "p",
        text: "Find us on Google Business Profile as Whitelight Store Kenya and read recent customer reviews before you visit. Then compare pairs in person or order via WhatsApp for same-day CBD delivery.",
      },
      {
        type: "links",
        items: [
          { label: "Best running shoes guide", href: "/blog/best-running-shoes-nairobi" },
          { label: "Price & fake-spotting guide", href: "/blog/running-shoes-price-kenya" },
          { label: "Shop all running shoes", href: "/category/running" },
        ],
      },
    ],
    faqs: [
      {
        question: "Where is Whitelight Store in Nairobi CBD?",
        answer:
          "Rware Building, Luthuli Avenue, Shop 410, Fourth Floor. Open Monday–Saturday, 8am–7pm.",
      },
      {
        question: "Do you offer same-day shoe delivery in Nairobi?",
        answer:
          "Yes — same-day delivery in Nairobi CBD and nearby environs when stock is confirmed. Message WhatsApp +254 708 749473 for cut-off and cost.",
      },
      {
        question: "Are your Luthuli Avenue shoes original?",
        answer:
          "Yes. We sell authentic athletic footwear with receipts, proper labelling and in-store inspection before you pay.",
      },
      {
        question: "Can I pick up after ordering on WhatsApp?",
        answer:
          "Yes. Confirm size and model on WhatsApp, pay as advised, and collect at Shop 410 or request CBD delivery.",
      },
      {
        question: "What should I check to avoid fakes in the CBD?",
        answer:
          "Box labels, stitching, midsole feel, and a real receipt from a fixed shop address. See our authenticity checklist in the price guide.",
      },
    ],
  },
  {
    slug: "running-shoes-price-kenya",
    title: "How Much Do Running Shoes Cost in Kenya? Price Guide and How to Spot Fakes",
    metaTitle: "Running Shoes Price Kenya | Spot Fakes",
    metaDescription:
      "Running shoes in Kenya at Whitelight Store typically start around KSh 4,800. See price ranges by type and a checklist to spot fake sneakers.",
    excerpt:
      "Real Whitelight Store price ranges for daily trainers, trail, gym and premium pairs — plus how to spot fakes in Kenya.",
    date: "2026-10-03",
    updatedAt: "2026-10-05",
    author: "Whitelight Store Team",
    category: "Price guide",
    cover: "/couresel_images/running/running2.webp",
    coverAlt: "running-shoes-price-kenya-authentic-stock-nairobi",
    primaryKeyword: "running shoes price in Kenya",
    secondaryKeywords: [
      "original vs fake sneakers Kenya",
      "how to spot fake running shoes",
      "cheap running shoes Nairobi",
    ],
    answerFirst:
      "At Whitelight Store, running shoes in Kenya typically start around KSh 4,800, with most performance pairs between KSh 5,500 and KSh 8,500 depending on category and model. Trail and premium race-ready shoes sit toward the higher end. Price alone is not proof of quality — use the authenticity checks below.",
    categoryLinks: [
      { label: "Shop running", href: "/category/running" },
      { label: "Shop sale", href: "/sale" },
      { label: "Shop trail", href: "/category/trail" },
    ],
    blocks: [
      {
        type: "p",
        text: `${STORE_FACT} Below are real store ranges from our current Nairobi catalogue so you can budget before you buy.`,
      },
      {
        type: "h2",
        text: "How much do running shoes cost in Kenya right now?",
      },
      {
        type: "p",
        text: "Expect authentic running shoes price in Kenya at Whitelight Store to start near KSh 4,800 for entry daily trainers, with many solid road shoes between KSh 5,500 and KSh 7,500, and premium options up to about KSh 8,500. Accessories such as socks start much lower (from about KSh 500).",
      },
      {
        type: "table",
        caption: "Typical Whitelight Store price bands (KES)",
        headers: ["Shoe type", "Typical price (KES)", "Who it suits"],
        rows: [
          ["Daily trainer (road)", "4,800 – 7,500", "Beginners and everyday Nairobi joggers"],
          ["Trail shoes", "5,800 – 8,500", "Karura, Ngong Hills, muddy paths"],
          ["Gym / training", "5,500 – 7,000", "HIIT, weights, studio classes"],
          ["Premium / top models", "7,500 – 8,500", "High-mileage or race-focused runners"],
        ],
      },
      {
        type: "h2",
        text: "Why originals cost what they do",
      },
      {
        type: "ul",
        items: [
          "Cushioning tech that keeps its bounce past a few weeks of CBD pavement.",
          "Durable outsoles and uppers built for Kenyan heat, dust and rough concrete.",
          "Injury protection through stable geometry and consistent sizing — cheap fakes often fail here first.",
        ],
      },
      {
        type: "h2",
        text: "Cheap running shoes Nairobi buyers should be careful with",
      },
      {
        type: "p",
        text: "Ultra-low street prices can mean replicas. A fair deal on sale at a trusted shop is different from a “same model” at half the normal Kenya price with no receipt. When in doubt, compare in our store or on WhatsApp before paying.",
      },
      {
        type: "h2",
        text: "How to spot fake running shoes (checklist)",
      },
      {
        type: "ol",
        items: [
          "Smell and box: strong chemical smell or mismatched box codes are warning signs.",
          "Labels: tongue and insole print should be sharp; spelling errors are common on fakes.",
          "Stitching: uneven seams or glue overflow around the midsole.",
          "Weight and cushion: press the midsole — originals rebound more evenly.",
          "Receipt and seller: buy from a fixed CBD address (Whitelight Store, Shop 410) and keep proof of purchase.",
        ],
      },
      {
        type: "p",
        text: "Original vs fake sneakers Kenya shoppers worry about most when buying online — that is why we encourage WhatsApp photos of the exact pair in stock, plus in-store inspection when you can visit Luthuli Avenue.",
      },
      {
        type: "links",
        items: [
          { label: "Luthuli Avenue store guide", href: "/blog/buy-running-shoes-nairobi-cbd-luthuli-avenue" },
          { label: "Best running shoes guide", href: "/blog/best-running-shoes-nairobi" },
          { label: "Browse current running stock", href: "/category/running" },
        ],
      },
    ],
    faqs: [
      {
        question: "What is the average running shoes price in Kenya at Whitelight Store?",
        answer:
          "Most authentic pairs we sell sit roughly between KSh 5,500 and KSh 8,500, with some daily trainers from about KSh 4,800. Check live product pages for exact prices.",
      },
      {
        question: "Why are original running shoes more expensive than street pairs?",
        answer:
          "You pay for real cushioning compounds, durable outsoles, consistent sizing and injury-friendly support — not just a logo print.",
      },
      {
        question: "How can I spot fake running shoes in Kenya?",
        answer:
          "Check box codes, label print quality, stitching, midsole bounce and insist on a receipt from a verifiable shop address.",
      },
      {
        question: "Do you sell cheap running shoes in Nairobi that are still original?",
        answer:
          "Yes — watch our Sale category and ask on WhatsApp for current entry-level trainers in your size.",
      },
      {
        question: "Can I confirm authenticity before paying?",
        answer:
          "Yes. Visit Shop 410 on Luthuli Avenue or request clear stock photos and model details on WhatsApp +254 708 749473.",
      },
    ],
  },
  {
    slug: "trail-running-shoes-kenya",
    title: "Trail Running Shoes in Kenya: Road vs Trail Shoes, and What to Wear on Karura and Ngong Hills",
    metaTitle: "Trail Running Shoes Kenya | Karura & Ngong",
    metaDescription:
      "Trail running shoes in Kenya need grip and tougher uppers for mud and rocks. Compare road vs trail shoes for Karura Forest and Ngong Hills.",
    excerpt:
      "Lug depth, rock protection and local advice for Karura Forest and Ngong Hills — plus when road shoes are not enough.",
    date: "2026-10-02",
    updatedAt: "2026-10-05",
    author: "Whitelight Store Team",
    category: "Trail guide",
    cover: "/trailshoes.webp",
    coverAlt: "trail-running-shoes-karura-forest-nairobi",
    primaryKeyword: "trail running shoes Kenya",
    secondaryKeywords: [
      "trail vs road running shoes",
      "shoes for Ngong Hills",
      "hiking vs trail shoes",
      "Karura Forest running shoes",
    ],
    answerFirst:
      "Trail running shoes Kenya athletes need have grippier outsoles and tougher uppers for mud, rocks and loose dirt. Road shoes are smoother and softer for pavement. For Karura Forest and Ngong Hills, choose trail lugs and rock protection — especially in rainy season.",
    categoryLinks: [
      { label: "Shop trail shoes", href: "/category/trail" },
      { label: "Shop running shoes", href: "/category/running" },
    ],
    blocks: [
      {
        type: "p",
        text: `${STORE_FACT} Use this page to decide between trail vs road running shoes before your next Karura loop.`,
      },
      {
        type: "h2",
        text: "What makes a trail shoe different?",
      },
      {
        type: "ul",
        items: [
          "Lug depth: deeper, spaced lugs bite into mud and loose soil; road shoes have flatter rubber.",
          "Rock protection: firmer plates or denser midsoles reduce bruise risk on sharp stones.",
          "Uppers: tougher overlays and better debris resistance than lightweight road mesh.",
          "Waterproofing: helpful in long wet grass, but can feel warmer; many Nairobi runners prefer quick-drain mesh unless they run deep mud weekly.",
        ],
      },
      {
        type: "h2",
        text: "Karura Forest running shoes",
      },
      {
        type: "p",
        text: "Karura mixes packed dirt, roots and occasional mud. A moderate-lug trail shoe is ideal. Pure road shoes can work on dry, hard sections but get slippery when the forest floor is wet.",
      },
      {
        type: "h2",
        text: "Shoes for Ngong Hills",
      },
      {
        type: "p",
        text: "Ngong Hills adds steeper gradients, looser gravel and wind exposure. Prioritise grip and a locked heel. Hiking boots are heavier and slower if your goal is running; dedicated trail runners beat hiking shoes for pace, while hiking footwear wins for heavy backpacks and slow scrambles.",
      },
      {
        type: "h2",
        text: "Rainy-season mud tips",
      },
      {
        type: "ol",
        items: [
          "Choose deeper lugs and a shoe you can rinse after the run.",
          "Avoid smooth road outsoles on red clay — they skate.",
          "Pack a dry pair of road shoes for the drive home if you are coming into CBD afterwards.",
        ],
      },
      {
        type: "h2",
        text: "Can I use road shoes on trails?",
      },
      {
        type: "p",
        text: "Short, dry, mild trails — sometimes. Technical, muddy or rocky routes — no. You lose grip and rock protection, which raises slip and bruise risk. If you only buy one trail pair in Kenya, make it a true trail shoe from our trail category and keep road shoes for city miles.",
      },
      {
        type: "links",
        items: [
          { label: "Shop trail running shoes", href: "/category/trail" },
          { label: "Best running shoes Nairobi", href: "/blog/best-running-shoes-nairobi" },
          { label: "Running vs gym shoes", href: "/blog/running-shoes-vs-gym-shoes-kenya" },
        ],
      },
    ],
    faqs: [
      {
        question: "What are the best trail running shoes in Kenya for beginners?",
        answer:
          "A moderate-lug trail shoe with a secure fit and decent cushion. Visit Whitelight Store to compare grip patterns, or WhatsApp your usual size.",
      },
      {
        question: "Are hiking shoes the same as trail running shoes?",
        answer:
          "No. Hiking shoes are heavier and built for walking with load. Trail running shoes are lighter and designed for running pace on uneven ground.",
      },
      {
        question: "Can I wear road shoes in Karura Forest?",
        answer:
          "On dry, easy paths maybe; on wet or rooty sections a trail shoe is safer. Many Nairobi runners keep a dedicated Karura pair.",
      },
      {
        question: "Do I need waterproof trail shoes for Ngong Hills?",
        answer:
          "Only if you regularly hit deep wet grass or puddles. Otherwise breathable trail mesh often feels better in Kenyan warmth.",
      },
      {
        question: "Where can I buy trail shoes in Nairobi CBD?",
        answer:
          "Whitelight Store, Rware Building, Luthuli Avenue, Shop 410 — or order via WhatsApp with same-day CBD delivery options.",
      },
    ],
  },
  {
    slug: "running-shoes-vs-gym-shoes-kenya",
    title: "Running Shoes vs Gym Shoes: What to Wear for Gym, HIIT and Training",
    metaTitle: "Gym Shoes Kenya | Running vs Training",
    metaDescription:
      "Running shoes vs gym shoes in Kenya: running pairs excel at forward motion; training shoes handle side-to-side HIIT and lifting. Shop Whitelight Store.",
    excerpt:
      "Clear comparison of cushioning, stability and flexibility for treadmill, weights, HIIT and class workouts — plus a one-pair budget tip.",
    date: "2026-10-01",
    updatedAt: "2026-10-05",
    author: "Whitelight Store Team",
    category: "Training guide",
    cover: "/gymshoes.webp",
    coverAlt: "gym-shoes-kenya-training-shoes-whitelight-store",
    primaryKeyword: "gym shoes Kenya",
    secondaryKeywords: [
      "training shoes vs running shoes",
      "best shoes for gym workouts",
      "shoes for HIIT",
      "can I lift in running shoes",
    ],
    answerFirst:
      "Running shoes are built for forward motion; gym and training shoes are built for stability and side-to-side movement. For HIIT, classes and lifting, a flatter, more stable trainer is safer. For treadmill runs, a running shoe is the better tool.",
    categoryLinks: [
      { label: "Shop gym shoes", href: "/category/gym" },
      { label: "Shop training shoes", href: "/category/training" },
      { label: "Shop running shoes", href: "/category/running" },
    ],
    blocks: [
      {
        type: "p",
        text: `${STORE_FACT} If you are choosing gym shoes Kenya trainers will actually use 4–5 days a week, match the shoe to the movement pattern.`,
      },
      {
        type: "h2",
        text: "Running shoes vs gym shoes — quick comparison",
      },
      {
        type: "table",
        caption: "Training shoes vs running shoes",
        headers: ["Feature", "Running shoes", "Gym / training shoes"],
        rows: [
          ["Cushioning", "Higher stack for pavement impact", "Lower to moderate for ground feel"],
          ["Stability", "Optimised front-to-back", "Better lateral (side-to-side) stability"],
          ["Flexibility", "Forefoot flex for stride", "Multi-directional flexibility"],
          ["Best for", "Road runs, treadmill endurance", "HIIT, circuits, gym floor work"],
        ],
      },
      {
        type: "h2",
        text: "What to wear for common gym cases",
      },
      {
        type: "ul",
        items: [
          "Treadmill runs: running shoes.",
          "Weights / lifting: flatter training shoes; tall soft runners can feel tippy under a barbell.",
          "HIIT and agility: training or gym shoes with lateral grip.",
          "Group classes (mixed cardio + strength): versatile training shoes beat maximal cushion runners.",
        ],
      },
      {
        type: "h2",
        text: "Can I lift in running shoes?",
      },
      {
        type: "p",
        text: "You can for light dumbbell work, but soft, high-stack running shoes are not ideal for heavy squats or deadlifts because the midsole compresses and reduces balance. If lifting is half your week, get a training pair.",
      },
      {
        type: "h2",
        text: "One pair or two on a budget?",
      },
      {
        type: "p",
        text: "If your budget allows only one pair and you mostly run, buy running shoes. If you mostly do gym HIIT with short jogs, buy training shoes. Ideal setup for Nairobi athletes: one road runner + one gym trainer. Ask us on WhatsApp which current models fit your split.",
      },
      {
        type: "links",
        items: [
          { label: "Shop gym shoes", href: "/category/gym" },
          { label: "Shop training shoes", href: "/category/training" },
          { label: "Size & fit guide", href: "/blog/running-shoe-size-fit-guide-kenya" },
          { label: "Trail shoe guide", href: "/blog/trail-running-shoes-kenya" },
        ],
      },
    ],
    faqs: [
      {
        question: "What are the best shoes for gym workouts in Kenya?",
        answer:
          "Stable gym or training shoes with lateral support. Shop /category/gym and /category/training at Whitelight Store.",
      },
      {
        question: "Are training shoes different from running shoes?",
        answer:
          "Yes. Training shoes prioritise side-to-side stability; running shoes prioritise forward cushioning and stride.",
      },
      {
        question: "What shoes are best for HIIT?",
        answer:
          "Low-to-moderate stack trainers with grip for jumps, cuts and floor work — not maximal cushion race runners.",
      },
      {
        question: "Can I wear running shoes to the gym every day?",
        answer:
          "For treadmill-focused days yes; for lifting and HIIT a training shoe is safer and more stable.",
      },
      {
        question: "Do you stock both gym and running shoes in Nairobi CBD?",
        answer:
          "Yes — Whitelight Store on Luthuli Avenue stocks running, gym and training categories with same-day CBD delivery options.",
      },
    ],
  },
  {
    slug: "running-shoe-size-fit-guide-kenya",
    title: "How to Choose the Right Shoe Size and Fit When You Order Online",
    metaTitle: "Running Shoe Size Guide Kenya | Fit Tips",
    metaDescription:
      "Measure your foot, leave a thumb’s width at the toe, and use our Kenya running shoe size guide before you order. Clear Whitelight exchange policy included.",
    excerpt:
      "Step-by-step measuring, brand size conversion tips, exchange policy, and a printable foot-measuring guide for online orders.",
    date: "2026-09-30",
    updatedAt: "2026-10-05",
    author: "Whitelight Store Team",
    category: "Sizing guide",
    cover: "/couresel_images/running/running1.webp",
    coverAlt: "running-shoe-size-guide-kenya-foot-measure",
    primaryKeyword: "running shoe size guide",
    secondaryKeywords: [
      "how to measure foot size",
      "what size running shoe should I buy",
      "shoe size chart Kenya",
    ],
    answerFirst:
      "Measure your foot at home, leave about a thumb’s width of space at the toe, and shop in the afternoon when feet are slightly larger. Brand sizing differs, so confirm with Whitelight Store on WhatsApp before you pay. Size exchanges are available within 3 days if shoes are unused.",
    categoryLinks: [
      { label: "Shop running", href: "/category/running" },
      { label: "Contact us", href: "/contact" },
      { label: "Terms / exchange policy", href: "/terms" },
    ],
    blocks: [
      {
        type: "p",
        text: `${STORE_FACT} This running shoe size guide is written for Kenya online orders so you can buy with fewer fit surprises.`,
      },
      {
        type: "h2",
        text: "How to measure foot size before you order",
      },
      {
        type: "ol",
        items: [
          "Place a paper against a wall on a hard floor.",
          "Stand with your heel touching the wall; mark the longest toe.",
          "Measure heel-to-mark in centimetres for both feet; use the longer foot.",
          "Leave about a thumb’s width (roughly 1–1.5 cm) of spare length in the shoe.",
          "Measure in the afternoon — feet swell slightly during the day.",
        ],
      },
      {
        type: "h2",
        text: "What size running shoe should I buy?",
      },
      {
        type: "p",
        text: "Start from your measured length, then adjust for brand fit. Some brands run small; others are wider in the toe box. If you are between sizes, most runners size up for long runs. Send us your cm length and a brand you already own on WhatsApp for a model-specific suggestion.",
      },
      {
        type: "table",
        caption: "Approximate men’s US to CM guide (confirm per brand)",
        headers: ["US Men", "UK", "EU", "Foot length (cm)"],
        rows: [
          ["7", "6", "40", "25.0"],
          ["8", "7", "41", "26.0"],
          ["9", "8", "42.5", "27.0"],
          ["10", "9", "44", "28.0"],
          ["11", "10", "45", "29.0"],
          ["12", "11", "46", "30.0"],
        ],
      },
      {
        type: "p",
        text: "Women’s sizing often converts about 1.5 US sizes down from men’s for the same centimetre length — always check the product page and ask us if the model is unisex. Shoe size chart Kenya shoppers share online can disagree by brand, so treat charts as a starting point only.",
      },
      {
        type: "h2",
        text: "Whitelight Store exchange policy (fit insurance)",
      },
      {
        type: "ul",
        items: [
          "Exchanges accepted within 3 days after pickup or delivery.",
          "Same model only — size exchange, not a different design.",
          "Shoes must be unused, unworn, in original packaging, with no damage.",
          "Refunds are not offered; size exchange under these conditions is the remedy.",
        ],
      },
      {
        type: "printGuide",
        title: "Printable foot-measuring guide",
        steps: [
          "Print this page at 100% scale (do not “fit to page”).",
          "Tape paper to the floor against a wall.",
          "Trace or mark both feet in the afternoon while wearing running socks.",
          "Record the longer foot in centimetres.",
          "WhatsApp the cm length + your usual brand size to +254 708 749473 with the product link.",
        ],
      },
      {
        type: "links",
        items: [
          { label: "Best running shoes Nairobi", href: "/blog/best-running-shoes-nairobi" },
          { label: "Gym vs running shoes", href: "/blog/running-shoes-vs-gym-shoes-kenya" },
          { label: "Shop all shoes", href: "/products" },
        ],
      },
    ],
    faqs: [
      {
        question: "How do I measure my foot size for running shoes?",
        answer:
          "Stand on paper against a wall, mark the longest toe, measure both feet in centimetres, and use the longer measurement with about a thumb’s width of spare room.",
      },
      {
        question: "Should running shoes be a size bigger?",
        answer:
          "Often slightly roomier than casual shoes, especially for long runs. Do not go so large that your heel slips.",
      },
      {
        question: "Do brands size the same in Kenya?",
        answer:
          "No. Sizing differs by brand and model. Use centimetres plus our WhatsApp advice for the exact pair in stock.",
      },
      {
        question: "What if the size is wrong when I order online?",
        answer:
          "Unused shoes can be exchanged for a different size of the same model within 3 days of pickup/delivery under our terms.",
      },
      {
        question: "Can you help me choose a size on WhatsApp?",
        answer:
          "Yes. Send foot length in cm, the product link, and any brand size you already wear to +254 708 749473.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}
