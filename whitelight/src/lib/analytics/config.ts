/** Client-side analytics IDs — set in .env (VITE_* prefix). */

/** Whitelight Store Meta Pixel (Events Manager) */
export const DEFAULT_META_PIXEL_ID = "1294655459040259";

export const analyticsConfig = {
  metaPixelId:
    (import.meta.env.VITE_META_PIXEL_ID as string | undefined) || DEFAULT_META_PIXEL_ID,
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined,
  /** When true, logs events to console in development */
  debug: import.meta.env.DEV,
};

export function isMetaEnabled(): boolean {
  return Boolean(analyticsConfig.metaPixelId);
}

export function isGoogleEnabled(): boolean {
  return Boolean(analyticsConfig.gaMeasurementId);
}

export function isAnalyticsEnabled(): boolean {
  return isMetaEnabled() || isGoogleEnabled();
}
