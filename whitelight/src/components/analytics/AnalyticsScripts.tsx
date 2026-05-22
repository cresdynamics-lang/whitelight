import { useEffect } from "react";
import { initGoogleTag } from "@/lib/analytics/googleTag";
import { initMetaPixel } from "@/lib/analytics/metaPixel";
import { isAnalyticsEnabled } from "@/lib/analytics/config";

/** Loads Meta Pixel and Google tag when env IDs are configured. */
export function AnalyticsScripts() {
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    initMetaPixel();
    initGoogleTag();
  }, []);

  return null;
}
