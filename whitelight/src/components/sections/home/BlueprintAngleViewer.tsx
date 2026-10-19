import { useMemo, useState } from "react";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { FastImage } from "@/components/ui/FastImage";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/products";
import {
  defaultHotspots,
  enrichProduct,
  PURPOSE_LABELS,
} from "@/lib/productBlueprint";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";
import { openWhatsAppOrderMessage } from "@/lib/whatsapp";
import { getDetailThumbUrl } from "@/lib/imageUtils";

type Props = { product?: Product };

const FEEL_KEYS = ["cushion", "response", "grip", "stability"] as const;

export function BlueprintAngleViewer({ product }: Props) {
  const enriched = useMemo(
    () => (product ? enrichProduct(product) : null),
    [product]
  );
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState<number | string | null>(null);
  const { addToCart } = useCart();

  if (!enriched) return null;

  const images = enriched.images.length
    ? enriched.images
    : [{ id: "1", url: "/whitelight_logo.webp", alt: enriched.name }];
  const hotspots = defaultHotspots(enriched);
  const feel = enriched.feel || {};

  return (
    <section className="container py-12 md:py-16">
      <div className="mb-6">
        <p className="font-accent text-2xl text-leaf">See it from every angle</p>
        <h2 className="font-heading text-3xl font-semibold text-forest">
          Inspect it like you would in the shop.
        </h2>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-paper">
            <FastImage
              src={images[imgIdx]?.url || "/whitelight_logo.webp"}
              alt={images[imgIdx]?.alt || enriched.name}
              variant="detail"
              objectFit="contain"
              className="h-full w-full"
            />
            {hotspots.slice(0, 2).map((h) => (
              <button
                key={h.id}
                type="button"
                title={`${h.label}: ${h.body}`}
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf ring-4 ring-leaf/30"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              />
            ))}
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.slice(0, 5).map((img, i) => (
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

        <div>
          <p className="text-xs uppercase tracking-wider text-moss font-ui">
            {enriched.brand} · {enriched.category} ·{" "}
            {PURPOSE_LABELS[enriched.purpose || "daily"]}
          </p>
          <h3 className="font-heading text-3xl font-semibold text-forest mt-1">
            {enriched.name}
          </h3>
          <p className="mt-2 text-lg font-semibold font-ui">{formatPrice(enriched.price)}</p>
          <p className="mt-3 text-sm text-muted-foreground font-ui leading-relaxed">
            {enriched.forWhom}
          </p>

          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest font-ui">
              Feel (store rating)
            </p>
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
                      className="h-2 rounded-full bg-leaf transition-all"
                      style={{ width: `${(val / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 font-ui">
              Size (EU)
            </p>
            <div className="flex flex-wrap gap-2">
              {enriched.variants.map((v) => (
                <button
                  key={v.id || String(v.size)}
                  type="button"
                  disabled={!v.inStock}
                  onClick={() => setSize(v.size)}
                  className={`h-10 min-w-10 rounded-md border px-2 text-sm font-semibold font-ui ${
                    !v.inStock
                      ? "line-through text-muted-foreground/40 border-transparent"
                      : size === v.size
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-card"
                  }`}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={size == null}
              onClick={() => size != null && addToCart(enriched, size, 1)}
              className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-white font-ui disabled:opacity-40"
            >
              {size != null ? `Add size ${size} to bag` : "Choose a size"}
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
                  sizeLabel: size != null ? String(size) : undefined,
                })
              }
              className="h-11 rounded-md border border-border px-5 text-sm font-semibold font-ui"
            >
              Ask on WhatsApp
            </button>
            <NavPrefetchLink
              to={`/shoes/${enriched.slug}`}
              className="h-11 inline-flex items-center text-sm font-semibold text-primary font-ui"
            >
              Full details →
            </NavPrefetchLink>
          </div>
        </div>
      </div>
    </section>
  );
}
