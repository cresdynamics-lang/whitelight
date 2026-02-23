/**
 * Minimal head for home page only. Uses useEffect to avoid React error #300
 * (fewer hooks) that can occur with react-helmet-async on first paint.
 */
import { useEffect } from "react";

const DEFAULT_TITLE = "Whitelight Store - Premium Footwear | Nairobi Kenya";
const DEFAULT_DESC = "Kenya's best trusted specialized seller for premium athletic footwear. Shop running, trail, gym, basketball shoes in Nairobi. Same day delivery.";
const CANONICAL = "https://whitelightstore.co.ke";
const OG_IMAGE = "https://whitelightstore.co.ke/couresel_images/running/running2.webp";

export function HomePageHead() {
  useEffect(() => {
    document.title = DEFAULT_TITLE;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", DEFAULT_DESC);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = DEFAULT_DESC;
      document.head.appendChild(m);
    }
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", CANONICAL);
    else {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = CANONICAL;
      document.head.appendChild(l);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", DEFAULT_TITLE);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", DEFAULT_DESC);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", OG_IMAGE);
  }, []);
  return null;
}
