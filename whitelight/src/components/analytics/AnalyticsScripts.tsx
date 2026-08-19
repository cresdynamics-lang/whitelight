import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { initGoogleTag, trackGtag } from "@/lib/analytics/googleTag";
import { initMetaPixel, trackMetaPageView } from "@/lib/analytics/metaPixel";
import { isAnalyticsEnabled, isGoogleEnabled, isMetaEnabled } from "@/lib/analytics/config";

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
    // First Meta PageView is sent from index.html on load
    if (skipFirstPageView.current) {
      skipFirstPageView.current = false;
      return;
    }
    if (isMetaEnabled()) trackMetaPageView();
    if (isGoogleEnabled()) {
      trackGtag("page_view", {
        page_path: `${pathname}${search}`,
        page_location: typeof window !== "undefined" ? window.location.href : pathname,
      });
    }
  }, [pathname, search]);

  return null;
}
