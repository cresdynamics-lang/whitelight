import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FastImage } from "@/components/ui/FastImage";
import { FALLBACK_MANIFEST, getImageManifest, type CategoryImage } from "@/services/imageManifestService";

interface HomeCategoryTilesProps {
  title?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
}

const tileMeta: Record<string, { label: string; href: string }> = {
  running: { label: "Running", href: "/category/running" },
  trail: { label: "Trail", href: "/category/trail" },
  basketball: { label: "Basketball", href: "/category/basketball" },
  gym: { label: "Gym", href: "/category/gym" },
  tennis: { label: "Tennis", href: "/category/tennis" },
  accessories: { label: "Accessories", href: "/category/accessories" },
  training: { label: "Training", href: "/category/training" },
  orthopedic: { label: "Orthopedic", href: "/category/orthopedic" },
};

export function HomeCategoryTiles({
  title = "Shop the essentials",
  viewAllLabel = "Shop all",
  viewAllHref = "/category/running",
}: HomeCategoryTilesProps) {
  const [categories, setCategories] = useState<CategoryImage[]>(FALLBACK_MANIFEST.category);

  useEffect(() => {
    let mounted = true;
    getImageManifest().then((manifest) => {
      if (mounted) setCategories(manifest.category);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const picks = ["running", "trail", "basketball", "gym"].length
    ? ["running", "trail", "basketball", "gym"]
    : [];

  const tiles = picks
    .map((slug) => categories.find((c) => c.category === slug))
    .filter((c): c is CategoryImage => Boolean(c));

  if (tiles.length === 0) return null;

  return (
    <section className="wh-categories">
      <div className="wh-shell">
        <div className="wh-section__head">
          <h2>{title}</h2>
          <Link to={viewAllHref}>{viewAllLabel} →</Link>
        </div>
        <div className="wh-category-grid">
          {tiles.map((cat) => {
            const meta = tileMeta[cat.category] ?? {
              label: cat.category,
              href: `/category/${cat.category}`,
            };
            return (
              <Link key={cat.category} to={meta.href} className="wh-category-card">
                <span className="wh-category-card__media">
                  <FastImage
                    src={cat.url}
                    alt={cat.alt_text}
                    priority
                    className="wh-category-card__image"
                  />
                </span>
                <span className="wh-category-card__body">
                  <h3>{meta.label}</h3>
                  <span>Shop now</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
