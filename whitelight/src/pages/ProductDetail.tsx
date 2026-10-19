import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useProduct } from "@/hooks/useProducts";
import { useCatalog } from "@/hooks/useCatalog";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { useCart } from "@/context/CartContext";
import { SEOHead } from "@/components/seo/SEOHead";
import { FastImage } from "@/components/ui/FastImage";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getDetailThumbUrl } from "@/lib/imageUtils";
import { trackViewContent } from "@/lib/analytics/events";
import { openWhatsAppOrderMessage } from "@/lib/whatsapp";
import {
  defaultHotspots,
  enrichProduct,
  FIT_NOTE_LABELS,
  PURPOSE_LABELS,
} from "@/lib/productBlueprint";
import { useSizePreference } from "@/context/SizePreferenceContext";

const FEEL_KEYS = ["cushion", "response", "weight", "grip", "durability"] as const;

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: catalog = [] } = useCatalog();
  const { addToCart } = useCart();
  const { preferredSize, setPreferredSize } = useSizePreference();
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const tracked = useRef<string | null>(null);

  const enriched = useMemo(
    () => (product ? enrichProduct(product) : null),
    [product]
  );

  useEffect(() => {
    if (product?.id && tracked.current !== product.id) {
      tracked.current = product.id;
      trackViewContent(product);
    }
  }, [product]);

  useEffect(() => {
    setSelectedSize(preferredSize);
    setImgIdx(0);
  }, [slug, preferredSize]);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enriched]);

  const related = useMemo(() => {
    if (!enriched) return [];
    return catalog
      .filter((p) => p.id !== enriched.id && p.category === enriched.category)
      .slice(0, 4);
  }, [catalog, enriched]);

  const accessories = useMemo(
    () => catalog.filter((p) => p.category === "accessories").slice(0, 4),
    [catalog]
  );

  const cutoffLeft = useMemo(() => {
    const now = new Date();
    const hour = (now.getUTCHours() + 3) % 24;
    const mins = now.getUTCMinutes();
    const target = siteConfig.delivery.sameDayCutoffHour;
    let remain = (target - hour) * 60 - mins;
    if (remain < 0) remain = 0;
    const h = Math.floor(remain / 60);
    const m = remain % 60;
    return { h, m, active: remain > 0 };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container py-20 animate-pulse">
          <div className="h-96 bg-secondary rounded-xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!enriched) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="font-heading text-2xl font-semibold">Product not found</h1>
          <Link to="/products" className="mt-4 inline-block text-primary font-semibold">
            Browse all shoes
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const images = Array.isArray(enriched.images) && enriched.images.length
    ? enriched.images
    : [{ id: "1", url: "/whitelight_logo.webp", alt: enriched.name }];
  const feel = enriched.feel || {};
  const hotspots = defaultHotspots(enriched);
  const variants = Array.isArray(enriched.variants) ? enriched.variants : [];
  const inStockCount = variants.filter((v) => v.inStock).length;
  const brandSlug = (enriched.brand || "nike").toLowerCase().replace(/\s+/g, "-");
  const purposeLabel =
    PURPOSE_LABELS[enriched.purpose || "daily"] || PURPOSE_LABELS.daily;
  const fitLabel =
    FIT_NOTE_LABELS[enriched.fitNote || "true_to_size"] || FIT_NOTE_LABELS.true_to_size;

  const pickSize = (size: number | string) => {
    setSelectedSize(size);
    if (typeof size === "number") setPreferredSize(size);
  };

  const add = () => {
    if (selectedSize == null) return;
    addToCart(enriched, selectedSize, 1);
  };

  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-0">
      <SEOHead
        title={`${enriched.brand} ${enriched.name} | The Whitelight Nairobi`}
        description={
          enriched.seo_description ||
          `${enriched.forWhom || enriched.name} KSh ${enriched.price}. ${fitLabel}. Same-day CBD delivery.`
        }
        canonical={`https://whitelightstore.co.ke/shoes/${enriched.slug}`}
        ogImage={images[0]?.url}
        ogType="product"
        product={enriched}
        category={enriched.category}
      />
      <Header />

      <main className="flex-1">
        <div className="container py-6 md:py-10">
          <p className="text-xs text-muted-foreground font-ui mb-4">
            <Link to="/">Home</Link> ›{" "}
            <Link to={`/${enriched.category}`}>{enriched.category}</Link> ›{" "}
            <Link to={`/brand/${brandSlug}`}>{enriched.brand || "Brand"}</Link> ›{" "}
            {enriched.name}
          </p>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-paper">
                <FastImage
                  src={images[imgIdx]?.url}
                  alt={images[imgIdx]?.alt || enriched.name}
                  variant="detail"
                  priority
                  className="h-full w-full"
                />
                {hotspots.slice(0, 2).map((h) => (
                  <span
                    key={h.id}
                    title={`${h.label}: ${h.body}`}
                    className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf ring-4 ring-leaf/25"
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  />
                ))}
                <span className="absolute left-3 top-3 rounded bg-card/90 px-2 py-1 text-[10px] font-bold uppercase font-ui">
                  Photos of the actual pair
                </span>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.id || i}
                    type="button"
                    onClick={() => setImgIdx(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                      imgIdx === i ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={getDetailThumbUrl(img.url)}
                      alt=""
                      className="h-full w-full object-contain bg-paper"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div ref={buyRef}>
              <p className="text-xs uppercase tracking-wider text-moss font-ui">
                {enriched.brand} · {purposeLabel}
              </p>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold text-forest mt-1">
                {enriched.name}
              </h1>
              <p className="mt-3 text-base text-muted-foreground font-ui leading-relaxed">
                {enriched.forWhom}
              </p>
              <p className="mt-4 text-2xl font-semibold font-ui text-forest">
                {formatPrice(enriched.price)}
                {enriched.originalPrice && enriched.originalPrice > enriched.price && (
                  <span className="ml-2 text-base text-muted-foreground line-through">
                    {formatPrice(enriched.originalPrice)}
                  </span>
                )}
              </p>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wider font-ui">
                    Size (EU) · {inStockCount} in stock
                  </p>
                  <Link to="/size-guide" className="text-xs font-semibold text-primary font-ui">
                    Size guide
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id || String(v.size)}
                      type="button"
                      disabled={!v.inStock}
                      onClick={() => pickSize(v.size)}
                      className={`h-11 min-w-11 rounded-md border px-2 text-sm font-semibold font-ui ${
                        !v.inStock
                          ? "line-through text-muted-foreground/40 border-transparent"
                          : selectedSize != null && String(selectedSize) === String(v.size)
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-card hover:border-primary"
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground font-ui">
                  {selectedSize != null
                    ? `✓ Size ${selectedSize} in stock · ${fitLabel}`
                    : fitLabel}
                </p>
              </div>

              <p className="mt-4 rounded-lg bg-sage/50 px-3 py-2 text-sm font-ui text-forest">
                {cutoffLeft.active
                  ? `Order in the next ${cutoffLeft.h}h ${cutoffLeft.m}m for same-day delivery in the CBD.`
                  : "Same-day CBD cut-off passed today — order for next-day / courier."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={selectedSize == null}
                  onClick={add}
                  className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-white font-ui disabled:opacity-40"
                >
                  {selectedSize != null
                    ? `Add size ${selectedSize} to bag`
                    : "Choose a size"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openWhatsAppOrderMessage({
                      productName: enriched.name,
                      productPrice: enriched.price,
                      imageUrl: images[0]?.url || "",
                      productUrl: `${window.location.origin}/shoes/${enriched.slug}`,
                      currency: siteConfig.currency,
                      quantity: 1,
                      sizeLabel: selectedSize != null ? String(selectedSize) : undefined,
                    })
                  }
                  className="h-12 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-semibold text-white font-ui"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Ask about this pair on WhatsApp
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-ui">
                <div className="rounded-lg border border-border p-3">
                  <p className="font-semibold">M-Pesa</p>
                  <p className="text-muted-foreground">or card, COD</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="font-semibold">Swap size</p>
                  <p className="text-muted-foreground">
                    {siteConfig.delivery.exchangeDays} days
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="font-semibold">Try in store</p>
                  <p className="text-muted-foreground">Luthuli Ave</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-forest">Who it is for</h2>
              <p className="mt-3 text-muted-foreground font-ui leading-relaxed">
                {enriched.forWhom}
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-sage/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-leaf font-ui">
                    Choose it if
                  </p>
                  <p className="mt-1 text-sm font-ui">{enriched.forWhom}</p>
                </div>
                <div className="rounded-lg bg-paper p-4 border border-border">
                  <p className="text-xs font-bold uppercase tracking-wider text-sale font-ui">
                    Skip it if
                  </p>
                  <p className="mt-1 text-sm font-ui">{enriched.skipIf}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-forest mb-4">
                How it feels
              </h2>
              <div className="space-y-3">
                {FEEL_KEYS.map((key) => {
                  const val = Number(feel[key] || 3);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs font-ui mb-1 capitalize">
                        <span>{key}</span>
                        <span>{val}/5</span>
                      </div>
                      <div className="h-2 rounded-full bg-sage">
                        <div
                          className="h-2 rounded-full bg-leaf"
                          style={{ width: `${(val / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <table className="mt-6 w-full text-sm font-ui">
                <tbody>
                  {[
                    ["Brand", enriched.brand],
                    ["Use", `${enriched.category} · ${purposeLabel}`],
                    ["Fit", fitLabel],
                    ["Sizes", variants.map((v) => v.size).join(", ") || "Ask on WhatsApp"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-b border-border">
                      <td className="py-2 text-muted-foreground">{k}</td>
                      <td className="py-2 font-medium">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {accessories.length > 0 && (
            <div className="mt-14">
              <h2 className="font-heading text-2xl font-semibold text-forest mb-4">
                Pairs well with
              </h2>
              <ProductGrid products={accessories} columns={4} className="py-0" />
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="font-heading text-2xl font-semibold text-forest mb-4">
                You may also like
              </h2>
              <ProductGrid products={related} columns={4} className="py-0" />
            </div>
          )}
        </div>
      </main>

      {showSticky && (
        <div className="fixed inset-x-0 bottom-14 lg:bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
          <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="font-heading font-semibold truncate">
                {enriched.brand} {enriched.name}
              </p>
              <p className="text-sm font-ui text-muted-foreground">
                {selectedSize != null ? `Size ${selectedSize} · ` : ""}
                {formatPrice(enriched.price)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  openWhatsAppOrderMessage({
                    productName: enriched.name,
                    productPrice: enriched.price,
                    imageUrl: images[0]?.url || "",
                    productUrl: `${window.location.origin}/shoes/${enriched.slug}`,
                    currency: siteConfig.currency,
                    quantity: 1,
                    sizeLabel: selectedSize != null ? String(selectedSize) : undefined,
                  })
                }
                className="h-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-whatsapp/10 px-4 text-sm font-semibold font-ui text-leaf"
              >
                <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
                WhatsApp
              </button>
              <button
                type="button"
                disabled={selectedSize == null}
                onClick={add}
                className="h-10 rounded-md bg-primary px-4 text-sm font-semibold text-white font-ui disabled:opacity-40"
              >
                Add to bag
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
