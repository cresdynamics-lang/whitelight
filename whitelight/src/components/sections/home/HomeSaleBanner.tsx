import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { FastImage } from "@/components/ui/FastImage";
import { FALLBACK_MANIFEST, getImageManifest, type BannerImage } from "@/services/imageManifestService";

interface HomeSaleBannerProps {
  kicker?: string;
  title?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function HomeSaleBanner({
  kicker = "Selected styles",
  title = "Good pairs. Better prices.",
  subtext = "Explore current markdowns without leaving the main shopping flow.",
  ctaLabel = "Shop sale",
  ctaHref = "/sale",
}: HomeSaleBannerProps) {
  const [images, setImages] = useState<BannerImage[]>(FALLBACK_MANIFEST.cta);

  useEffect(() => {
    let mounted = true;
    getImageManifest().then((manifest) => {
      if (mounted) setImages(manifest.cta);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const image = images[0];

  return (
    <section className="wh-sale">
      <div className="wh-sale__copy">
        <p className="wh-kicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{subtext}</p>
        <div className="wh-actions">
          <Link to={ctaHref} className="wh-text-link">
            {ctaLabel} →
          </Link>
        </div>
      </div>
      {image && (
        <div className="wh-sale__media">
          <FastImage
            src={image.url}
            alt={image.alt_text}
            variant="hero"
            priority
            objectFit="cover"
            className="wh-sale__image"
          />
        </div>
      )}
    </section>
  );
}
