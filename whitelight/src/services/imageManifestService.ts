export interface BannerImage {
  url: string;
  alt_text: string;
}

export interface CategoryImage extends BannerImage {
  category: string;
}

export interface ImageManifest {
  hero: BannerImage[];
  category: CategoryImage[];
  cta: BannerImage[];
  brand: BannerImage[];
}

const FALLBACK_MANIFEST: ImageManifest = {
  hero: [
    { url: "/couresel_images/running/running2.webp", alt_text: "Whitelight running shoes in Nairobi CBD" },
    { url: "/gymshoes.webp", alt_text: "Whitelight gym and training shoes in Nairobi" },
    { url: "/trainning.webp", alt_text: "Whitelight training shoes and multi-sport footwear" },
    { url: "/couresel_images/trail/trail1.webp", alt_text: "Trail shoes for Karura Forest and Ngong Hills — Nairobi" },
  ],
  category: [
    { category: "running", url: "/couresel_images/running/running2.webp", alt_text: "Running Shoes" },
    { category: "trail", url: "/couresel_images/trail/trail1.webp", alt_text: "Trail Shoes" },
    { category: "gym", url: "/couresel_images/gym/gym.webp", alt_text: "Gym Shoes" },
    { category: "basketball", url: "/couresel_images/basketball/bk1.webp", alt_text: "Basketball Shoes" },
    { category: "tennis", url: "/couresel_images/basketball/bk2.webp", alt_text: "Tennis Shoes" },
    { category: "training", url: "/couresel_images/gym/gym3.webp", alt_text: "Training Shoes" },
    { category: "orthopedic", url: "/couresel_images/orthopedic/orth1.webp", alt_text: "Orthopedic Shoes" },
  ],
  cta: [
    { url: "/couresel_images/running/running2.webp", alt_text: "Running Performance" },
    { url: "/couresel_images/gym/gym.webp", alt_text: "Gym Excellence" },
    { url: "/couresel_images/basketball/bk1.webp", alt_text: "Basketball Power" },
    { url: "/couresel_images/trail/trail1.webp", alt_text: "Trail Adventures" },
  ],
  brand: [
    { url: "/whychooseus.webp", alt_text: "Why Nairobi runners choose Whitelight Store" },
    { url: "/gymshoes.webp", alt_text: "Gym and training shoes from Whitelight Store Nairobi" },
    { url: "/ourstoryimage.webp", alt_text: "Inside Whitelight Store – Nairobi CBD" },
    { url: "/whitelight_logo.webp", alt_text: "Whitelight Store logo – premium footwear Nairobi" },
  ],
};

let manifestCache: ImageManifest | null = null;
let manifestPromise: Promise<ImageManifest> | null = null;

export async function getImageManifest(): Promise<ImageManifest> {
  if (manifestCache) return manifestCache;
  if (manifestPromise) return manifestPromise;

  manifestPromise = fetch("/image-manifest.json", { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
      const data = (await res.json()) as Partial<ImageManifest>;
      return {
        hero: Array.isArray(data.hero) && data.hero.length ? data.hero : FALLBACK_MANIFEST.hero,
        category: Array.isArray(data.category) && data.category.length ? data.category : FALLBACK_MANIFEST.category,
        cta: Array.isArray(data.cta) && data.cta.length ? data.cta : FALLBACK_MANIFEST.cta,
        brand: Array.isArray(data.brand) && data.brand.length ? data.brand : FALLBACK_MANIFEST.brand,
      };
    })
    .catch(() => FALLBACK_MANIFEST)
    .then((finalManifest) => {
      manifestCache = finalManifest;
      return finalManifest;
    })
    .finally(() => {
      manifestPromise = null;
    });

  return manifestPromise;
}

export { FALLBACK_MANIFEST };
