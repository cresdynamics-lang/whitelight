import { analyticsConfig, isGoogleEnabled } from "./config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

type Gtag = (
  command: "js" | "config" | "set" | "event",
  targetOrEvent: string | Date,
  params?: Record<string, unknown>
) => void;

let initialized = false;

export function initGoogleTag(): void {
  if (!isGoogleEnabled() || initialized || typeof window === "undefined") return;

  const measurementId = analyticsConfig.gaMeasurementId!;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  } as Gtag;

  window.gtag!("js", new Date());
  window.gtag!("config", measurementId, { send_page_view: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  initialized = true;

  if (analyticsConfig.debug) {
    console.log("[analytics] Google tag initialized", measurementId);
  }
}

export function trackGtag(
  event: string,
  params?: Record<string, unknown>
): void {
  if (!isGoogleEnabled() || typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  if (analyticsConfig.debug) {
    console.log("[analytics] gtag", event, params);
  }
}

/** Google Enhanced Conversions — hashed PII on purchase */
export async function setGoogleUserData(hashed: {
  email?: string;
  phone_number?: string;
}): Promise<void> {
  if (!isGoogleEnabled() || typeof window === "undefined") return;
  window.gtag?.("set", "user_data", hashed);
}
