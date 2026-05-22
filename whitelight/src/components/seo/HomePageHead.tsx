import { useEffect } from "react";
import { seoConfig } from "@/config/seo";

const { title: DEFAULT_TITLE, description: DEFAULT_DESC, keywords: DEFAULT_KEYWORDS } =
  seoConfig.pages.home;
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
    const match = selector.match(/\[([^\]="]+)="([^\]"]+)"\]/);
    if (match) m.setAttribute(match[1], match[2]);
    m.setAttribute(attr, value);
    document.head.appendChild(m);
  }
}

export function HomePageHead() {
  useEffect(() => {
    document.title = DEFAULT_TITLE;
    setMeta('meta[name="robots"]', "content", ROBOTS_CONTENT);
    setMeta('meta[name="description"]', "content", DEFAULT_DESC);
    setMeta('meta[name="keywords"]', "content", DEFAULT_KEYWORDS);
    setMeta('meta[name="geo.region"]', "content", "KE-30");
    setMeta('meta[name="geo.placename"]', "content", "Nairobi, Kenya");
    setMeta('meta[name="geo.position"]', "content", "-1.2840719;36.8219473");
    setMeta('meta[name="ICBM"]', "content", "-1.2840719, 36.8219473");

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", CANONICAL);
    } else {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = CANONICAL;
      document.head.appendChild(l);
    }

    setMeta('meta[property="og:title"]', "content", DEFAULT_TITLE);
    setMeta('meta[property="og:description"]', "content", DEFAULT_DESC);
    setMeta('meta[property="og:image"]', "content", OG_IMAGE);
    setMeta('meta[property="og:url"]', "content", CANONICAL);
    setMeta('meta[property="og:site_name"]', "content", "Whitelight Store Nairobi");
    setMeta('meta[property="og:locale"]', "content", "en_KE");
    setMeta('meta[property="og:type"]', "content", "website");

    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", DEFAULT_TITLE);
    setMeta('meta[name="twitter:description"]', "content", DEFAULT_DESC);
    setMeta('meta[name="twitter:image"]', "content", OG_IMAGE);
  }, []);

  return null;
}
