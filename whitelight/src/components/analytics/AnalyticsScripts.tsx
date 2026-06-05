import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initGoogleTag } from "@/lib/analytics/googleTag";
import { initMetaPixel, trackMetaPageView } from "@/lib/analytics/metaPixel";
import { isAnalyticsEnabled, isMetaEnabled } from "@/lib/analytics/config";

/** Meta Pixel + Google tag; PageView on every client-side route change. */
export function AnalyticsScripts() {
  const { pathname, search } = useLocation();
  const skipFirstPageView = useRef(true);

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    initMetaPixel();
    initGoogleTag();
  }, []);

  useEffect(() => {
    if (!isMetaEnabled()) return;
    // First PageView is sent from index.html on load
    if (skipFirstPageView.current) {
      skipFirstPageView.current = false;
      return;
    }
    trackMetaPageView();
  }, [pathname, search]);

  return null;
}
