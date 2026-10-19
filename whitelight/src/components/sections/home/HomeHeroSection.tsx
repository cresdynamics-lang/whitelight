import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FastImage } from "@/components/ui/FastImage";
import { FALLBACK_MANIFEST, getImageManifest } from "@/services/imageManifestService";

interface HomeHeroSectionProps {
  kicker?: string;
  headline?: string;
  subtext?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function HomeHeroSection({
  kicker = "Whitelight Nairobi",
  headline = "Own the road, own every mile.",
  subtext =
    "Performance footwear from the brands you trust, curated for how you actually train, run and move.",
  primaryLabel = "Shop new arrivals",
  primaryHref = "/new-arrivals",
  secondaryLabel = "Shop running",
  secondaryHref = "/category/running",
}: HomeHeroSectionProps) {
  const [heroImages, setHeroImages] = useState(FALLBACK_MANIFEST.hero);

  useEffect(() => {
    let mounted = true;
    getImageManifest().then((manifest) => {
      if (mounted) setHeroImages(manifest.hero);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const image = heroImages[0];

  return (
    <section className="wh-hero">
      <div className="wh-hero__copy">
        <p className="wh-kicker">{kicker}</p>
        <h1>{headline}</h1>
        <p>{subtext}</p>
        <div className="wh-actions">
          <Link to={primaryHref} className="wh-text-link">
            {primaryLabel} →
          </Link>
          <Link to={secondaryHref} className="wh-text-link">
            {secondaryLabel} →
          </Link>
        </div>
      </div>
      <div className="wh-hero__media">
        {image && (
          <FastImage
            src={image.url}
            alt={image.alt_text}
            variant="hero"
            priority
            objectFit="cover"
            className="wh-hero__image"
          />
        )}
      </div>
    </section>
  );
}
