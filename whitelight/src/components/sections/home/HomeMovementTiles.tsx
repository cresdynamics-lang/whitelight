import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FastImage } from "@/components/ui/FastImage";
import { FALLBACK_MANIFEST, getImageManifest, type CategoryImage } from "@/services/imageManifestService";

interface MovementTile {
  image: CategoryImage | undefined;
  title: string;
  description: string;
  href: string;
}

interface HomeMovementTilesProps {
  title?: string;
  linkLabel?: string;
  linkHref?: string;
}

export function HomeMovementTiles({
  title = "Shop by movement",
  linkLabel = "Shop all",
  linkHref = "/new-arrivals",
}: HomeMovementTilesProps) {
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

  const byCat = (slug: string) => categories.find((c) => c.category === slug);

  const tiles: MovementTile[] = [
    {
      image: byCat("running"),
      title: "Run",
      description: "Daily trainers and performance footwear for the road ahead.",
      href: "/category/running",
    },
    {
      image: byCat("basketball"),
      title: "Court",
      description: "Basketball shoes built for quick cuts, grip and confidence.",
      href: "/category/basketball",
    },
    {
      image: byCat("gym"),
      title: "Everyday",
      description: "Versatile shoes for workdays, weekends and everything between.",
      href: "/category/gym",
    },
  ];

  return (
    <section className="wh-section wh-shell">
      <div className="wh-section__head">
        <h2>{title}</h2>
        <Link to={linkHref}>{linkLabel} →</Link>
      </div>
      <div className="wh-story-grid">
        {tiles.map((tile) => (
          <Link key={tile.title} to={tile.href} className="wh-story">
            {tile.image ? (
              <span className="wh-story__media">
                <FastImage
                  src={tile.image.url}
                  alt={tile.image.alt_text}
                  className="wh-story__image"
                />
              </span>
            ) : null}
            <span className="wh-story__body">
              <h3>{tile.title}</h3>
              <p>{tile.description}</p>
              <span>Shop collection</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
