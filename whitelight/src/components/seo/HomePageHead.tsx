/**
 * Minimal head for home page only. Uses useEffect to avoid React error #300
 * (fewer hooks) that can occur with react-helmet-async on first paint.
 */
import { useEffect } from "react";

const DEFAULT_TITLE = "Running, Trail & Basketball Shoes Nairobi | White Light Store";
const DEFAULT_DESC =
  "Nairobi's specialist for running, trail, basketball & gym shoes. Nike, Adidas, HOKA & more. Fast Kenya delivery. Shop now.";
const CANONICAL = "https://whitelightstore.co.ke";
const OG_IMAGE = "https://whitelightstore.co.ke/couresel_images/running/running2.webp";
const ROBOTS_CONTENT =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

function setMeta(selector: string, attr: string, value: string, tag = "meta") {
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute(attr, value);
  } else {
    const m = document.createElement(tag);
    // parse attribute pairs from selector e.g. meta[name="robots"]
    const match = selector.match(/\[([^\]="]+)="([^\]"]+)"\]/);
    if (match) m.setAttribute(match[1], match[2]);
    m.setAttribute(attr, value);
    document.head.appendChild(m);
  }
}

export function HomePageHead() {
  useEffect(() => {
    // Title
    document.title = DEFAULT_TITLE;

    // Basic meta
    setMeta('meta[name="robots"]',      "content", ROBOTS_CONTENT);
    setMeta('meta[name="description"]', "content", DEFAULT_DESC);

    // Geo tags — missing from original
    setMeta('meta[name="geo.region"]',    "content", "KE-30");
    setMeta('meta[name="geo.placename"]', "content", "Nairobi, Kenya");
    setMeta('meta[name="geo.position"]',  "content", "-1.2840719;36.8219473");
    setMeta('meta[name="ICBM"]',          "content", "-1.2840719, 36.8219473");

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", CANONICAL);
    } else {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = CANONICAL;
      document.head.appendChild(l);
    }

    // Open Graph
    setMeta('meta[property="og:title"]',       "content", DEFAULT_TITLE);
    setMeta('meta[property="og:description"]',  "content", DEFAULT_DESC);
    setMeta('meta[property="og:image"]',        "content", OG_IMAGE);
    setMeta('meta[property="og:url"]',          "content", CANONICAL);       // was missing
    setMeta('meta[property="og:site_name"]',    "content", "Whitelight Store Kenya"); // was missing
    setMeta('meta[property="og:locale"]',       "content", "en_KE");          // was missing
    setMeta('meta[property="og:type"]',         "content", "website");

    // Twitter Card — entirely missing from original
    setMeta('meta[name="twitter:card"]',        "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]',       "content", DEFAULT_TITLE);
    setMeta('meta[name="twitter:description"]', "content", DEFAULT_DESC);
    setMeta('meta[name="twitter:image"]',       "content", OG_IMAGE);
    setMeta('meta[name="twitter:domain"]',      "content", "whitelightstore.co.ke");

    // Preload LCP hero image — mentioned in audit but wasn't in original
    const existing = document.querySelector('link[rel="preload"][as="image"]');
    if (!existing) {
      const preload = document.createElement("link");
      preload.rel = "preload";
      preload.as = "image";
      preload.setAttribute("href", OG_IMAGE);
      preload.setAttribute("fetchpriority", "high");
      document.head.prepend(preload); // prepend so it fires first
    }
  }, []);

  return null;
}