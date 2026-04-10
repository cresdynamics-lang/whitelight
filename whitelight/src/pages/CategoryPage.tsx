import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { useProductsByCategory } from "@/hooks/useProducts";
import { useSearch } from "@/context/SearchContext";
import type { ProductCategory } from "@/types/product";
import { siteConfig } from "@/config/site";
import { SEOHead } from "@/components/seo/SEOHead";
import { seoConfig } from "@/config/seo";

const categoryTitles: Record<ProductCategory, string> = {
  running: "Running Shoes in Nairobi — Kenya's Performance Running Store",
  trail: "Trail Running Shoes Kenya — Built for Karura, Ngong Hills & Beyond",
  gym: "Gym & Training Shoes in Nairobi — For Every Workout",
  training: "Training Shoes in Nairobi",
  basketball: "Basketball Shoes in Nairobi — Jordan, Nike & Court-Ready Kicks",
  tennis: "Tennis Shoes in Nairobi — Court-Ready Performance",
  accessories: "Accessories",
};

const categoryDescriptions: Record<ProductCategory, string> = {
  running:
    "Find performance running shoes in Nairobi for daily training, long runs and race day. We stock Nike, Adidas, HOKA and more for Kenyan roads.",
  trail:
    "Grip and protection for Kenya's trails. From Karura Forest and Ngong Hills to Kereita Forest, shop trail shoes built for real Kenyan terrain.",
  gym:
    "Gym and training shoes for Nairobi lifters and athletes. From women's gym shoes to CrossFit and HIIT trainers, get stable, grippy support.",
  training:
    "Multi-sport training shoes for drills, conditioning and speed work around Nairobi. Built for agility, comfort and all-day sessions.",
  basketball:
    "Court-ready basketball shoes for Nairobi players. Jordan, Nike and more with cushioning, grip and ankle support for street and indoor courts.",
  tennis:
    "Tennis shoes built for lateral cuts, quick stops and all-surface play. Shop court-ready models with grip and support for Nairobi clubs and outdoor courts.",
  accessories:
    "Complete your footwear experience with premium accessories, care products and comfort upgrades for your favourite pairs.",
};

// Category-specific images from local folders
const categoryImages: Record<ProductCategory, string[]> = {
  running: [
    "/couresel_images/running/running2.png",
    "/couresel_images/running/running3.jpg",
    "/couresel_images/running/running4.jpg",
    "/couresel_images/running/running5.jpg",
    "/couresel_images/running/running6.jpg",
  ],
  trail: [
    "/couresel_images/trail/trail1.png",
    "/couresel_images/trail/trail2.png",
    "/couresel_images/trail/trail3.png",
    "/couresel_images/trail/trail4.png",
  ],
  gym: [
    "/couresel_images/gym/gym.png",
    "/couresel_images/gym/gym1.jpg",
    "/couresel_images/gym/gym3.png",
    "/couresel_images/gym/gym4.png",
    "/couresel_images/gym/gym5.png",
    "/couresel_images/gym/gym6.png",
  ],
  basketball: [
    "/couresel_images/basketball/bk1.png",
    "/couresel_images/basketball/bk2.png",
    "/couresel_images/basketball/bk3.jpg",
    "/couresel_images/basketball/bk5.jpg",
  ],
  tennis: [
    "/couresel_images/basketball/bk2.png",
    "/couresel_images/basketball/bk3.jpg",
    "/couresel_images/gym/gym.png",
    "/couresel_images/running/running2.png",
  ],
  training: [
    "/couresel_images/gym/gym.png",
    "/couresel_images/gym/gym1.jpg",
    "/couresel_images/gym/gym3.png",
    "/couresel_images/gym/gym4.png",
  ],
  accessories: [
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800",
    "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  ],
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const validCategory = category as ProductCategory;
  const { searchQuery, filteredProducts, isSearching } = useSearch();
  
  const { data: products = [], isLoading } = useProductsByCategory(validCategory);
  
  // Use filtered products if searching, otherwise use category products
  const displayProducts = isSearching && searchQuery
    ? filteredProducts.filter(
        (p) =>
          p.category === validCategory ||
          (Array.isArray(p.categories) && p.categories.includes(validCategory))
      )
    : products;
  
  const title = categoryTitles[validCategory] || "Products";
  const description = categoryDescriptions[validCategory] || "";
  const backgroundImages = categoryImages[validCategory] || [];
  
  const carouselImages = backgroundImages.map((url, index) => ({
    url,
    alt_text: `${title} ${index + 1}`
  }));

  const categorySEO = seoConfig.pages[validCategory as keyof typeof seoConfig.pages] || seoConfig.pages.running;
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={categorySEO.title}
        description={categorySEO.description}
        keywords={categorySEO.keywords}
        canonical={`https://whitelightstore.co.ke/category/${validCategory}`}
        ogImage={backgroundImages[0] || "/whitelight_logo.jpeg"}
        category={validCategory}
      />
      <Header />
      
      <main className="flex-1">
        {/* Category Header with Carousel Background */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <ImageCarousel 
              images={carouselImages}
              className="w-full h-full"
              showControls={false}
              showDots={true}
              autoPlay={true}
              interval={5000}
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
          </div>
          <div className="container relative z-10 text-center">
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
              {title.toUpperCase()}
            </h1>
            <p className="text-white/90 font-body text-xl md:text-2xl max-w-2xl mx-auto font-semibold">
              {description}
            </p>
            {isSearching && searchQuery && (
              <p className="text-white/80 text-lg mt-4">
                Showing results for "{searchQuery}" in {title}
              </p>
            )}
          </div>
        </section>

        {/* SEO body copy per category */}
        <section className="bg-background">
          <div className="container py-10 md:py-12 max-w-4xl">
            {validCategory === "running" && (
              <div className="space-y-6 text-left">
                <p className="text-sm md:text-base text-muted-foreground">
                  White Light Store is Nairobi&apos;s performance running shoe hub for everyday runners,
                  marathon chasers and weekend joggers. We stock Nike, Adidas, HOKA and more in the
                  right cushioning and support for Kenyan roads and paths, so you get the comfort and
                  confidence you need from CBD loops to long runs out of town.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Road Running Shoes
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Browse cushioned daily trainers and responsive tempo shoes built for tarmac in
                  Nairobi. From soft long-distance models to snappy tempo pairs, we help you match
                  shoe to pace and distance so your runs on Thika Road, Lang&apos;ata Road or the CBD stay
                  smooth and supported.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Trail Running Shoes
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  When you move from the city to the trails, you need grip and stability. Our trail
                  selections balance lugs, rock protection and cushioning so you can handle mud,
                  roots and rocks on Karura Forest loops, Ngong Hills climbs and weekend trail runs
                  outside Nairobi.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Running Shoes by Brand
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Shop Nike, Adidas, HOKA, ASICS and New Balance running shoes curated for Kenyan
                  runners. Whether you prefer classic Nike Pegasus, HOKA max-cushion or responsive
                  Adidas trainers, we guide you to models that match your stride, mileage and budget
                  in Nairobi.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  How to Choose Running Shoes
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Not sure where to start? We look at your surface, distance, weekly mileage and
                  past injuries to recommend the right running shoes. Visit our Nairobi CBD shop or
                  chat on WhatsApp to get personalised fitting advice before you order anywhere in
                  Kenya.
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  White Light Store delivers running shoes Nairobi-wide with same-day options in the
                  CBD and quick courier shipping to the rest of Kenya. Order online or message us on
                  WhatsApp to confirm sizes, stock and delivery times.
                </p>
              </div>
            )}

            {validCategory === "trail" && (
              <div className="space-y-6 text-left">
                <p className="text-sm md:text-base text-muted-foreground">
                  Trail running in Kenya demands grip, protection and confidence on mixed terrain.
                  Our trail running shoes are chosen for Karura Forest loops, Ngong Hills climbs,
                  Kereita Forest adventures and the red-dirt tracks outside Nairobi, with brands
                  like Nike, HOKA and Salomon ready for real Kenyan conditions.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Trail Shoes for Kenyan Terrain
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Kenyan trails shift from dusty descents to slick mud in a single run. We focus on
                  lug depth, outsole rubber and rock protection plates so your shoes bite into the
                  ground on Karura, Ngong and Kereita, while still feeling comfortable on the roads
                  back into Nairobi.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Trail Shoes by Brand
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Explore Nike, HOKA and Salomon trail running shoes designed for technical
                  singletrack, forest loops and mountain routes. We help you pick between softer
                  HOKA cushioning, precise Salomon fit and versatile Nike trail options depending on
                  your weekly terrain in Kenya.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Beginner vs Advanced Trail Runners
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  New to trail? We recommend forgiving, protective models that keep you stable as
                  you learn Karura and Ngong. More advanced runners can move into lighter, more
                  aggressive designs for racing and vertical metres, still tuned for Kenyan rock and
                  dust.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Nairobi Trail Guide Support
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Not sure which shoes suit Karura Forest vs Ngong Hills or Kereita Forest?
                  Message us on WhatsApp with where you train and your weekly mileage. We&apos;ll help
                  you match trail shoes to your favourite Nairobi and Kenyan routes before you
                  order.
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  White Light Store ships trail running shoes across Kenya with same-day Nairobi
                  delivery options. Order directly from this page or talk to our team on WhatsApp to
                  confirm sizes and stock before your next trail session.
                </p>
              </div>
            )}

            {validCategory === "basketball" && (
              <div className="space-y-6 text-left">
                <p className="text-sm md:text-base text-muted-foreground">
                  Our basketball shoes are picked for Nairobi courts, outdoor tarmac and indoor
                  leagues. From Air Jordan to Nike and Puma, you get cushioning, grip and support
                  tuned for crossovers, landings and quick cuts on Kenyan courts.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Jordan Brand Kenya
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Explore Air Jordan models brought into Nairobi for serious hoopers and sneaker
                  fans. Whether you want classic Jordan silhouettes or newer performance-first
                  releases, we focus on real-court comfort and support, not just style photos.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Nike Performance Basketball
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Nike basketball shoes combine responsive Zoom cushioning, supportive uppers and
                  sticky outsoles for Kenyan courts. We pick models that work on outdoor Nairobi
                  tarmac as well as indoor floors so you don&apos;t have to compromise on grip.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  High Tops vs Low Tops
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Unsure between high tops and low tops? We help you decide based on ankle history,
                  playing position and court type. Guards often lean to lighter low tops while
                  forwards and centres may prefer more collar support around the ankle.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Nairobi Court Shoes
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Nairobi courts can be dusty and uneven, so grip and durability matter. Our court
                  shoes are chosen to handle outdoor pickup games, league nights and training
                  sessions while still looking sharp off-court around the city.
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Order basketball shoes Nairobi-wide with same-day delivery in the CBD and quick
                  courier options across Kenya. Chat with us on WhatsApp if you want help choosing
                  the right pair before your next game.
                </p>
              </div>
            )}

            {validCategory === "tennis" && (
              <div className="space-y-6 text-left">
                <p className="text-sm md:text-base text-muted-foreground">
                  Tennis in Kenya means hard courts, hot afternoons and quick direction changes.
                  Our tennis shoes focus on lateral support, durable outsoles and breathable uppers
                  so you can train and compete with confidence in Nairobi and beyond.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  All-court & club-ready
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Whether you play social doubles or weekly league, we help you pick shoes with the
                  right grip and stability. Message us on WhatsApp to confirm sizes and stock before
                  you order.
                </p>
              </div>
            )}

            {validCategory === "gym" && (
              <div className="space-y-6 text-left">
                <p className="text-sm md:text-base text-muted-foreground">
                  White Light Store fits Nairobi lifters, functional athletes and studio members
                  with gym shoes that feel stable under the bar and secure during HIIT. We stock
                  Nike, Adidas, Reebok and more for Kenyan gyms and training spaces.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Women&apos;s Gym Shoes Nairobi
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Women in Nairobi need gym shoes that balance support, fit and style. We curate
                  women&apos;s gym and training shoes for classes, strength training and treadmill
                  sessions, with options suited to narrow, regular and wider feet.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  CrossFit & Functional Training
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  For CrossFit and functional training, you need grip for burpees and box jumps but
                  enough stability for barbell work. Our trainers blend low, firm platforms with
                  tough uppers built to survive Kenyan gym floors and rope climbs.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Weightlifting Shoes
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Squats and Olympic lifts demand a stable base. We help Nairobi lifters choose
                  between flat training shoes and raised-heel weightlifting models, depending on
                  ankle mobility, squat depth and the movements you train most.
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold">
                  Training Shoes by Brand
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Compare Nike, Adidas, Reebok and other gym shoe brands in one Nairobi store. We
                  talk you through fit, cushioning and heel-to-toe drop so you get a pair that feels
                  locked in from warm-up to last set.
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  We deliver gym shoes Nairobi-wide with same-day options for CBD orders and fast
                  shipping across Kenya. Message us on WhatsApp to confirm your size, training
                  style and stock before you order.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Products */}
        {isLoading ? (
          <div className="container py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-secondary rounded-lg mb-3" />
                  <div className="h-4 bg-secondary rounded w-1/3 mb-2" />
                  <div className="h-5 bg-secondary rounded w-2/3 mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/4" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ProductGrid 
            products={displayProducts} 
            columns={4} 
            title={isSearching && searchQuery ? `Search Results in ${title}` : undefined}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
