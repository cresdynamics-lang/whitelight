import { analyticsConfig, isMetaEnabled } from "./config";

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

type Fbq = {
  (command: "init", pixelId: string): void;
  (command: "track", event: string, params?: Record<string, unknown>): void;
  (command: "trackCustom", event: string, params?: Record<string, unknown>): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push: Fbq;
};

let initialized = false;

export function initMetaPixel(): void {
  if (!isMetaEnabled() || initialized || typeof window === "undefined") return;

  const pixelId = analyticsConfig.metaPixelId!;

  if (!window.fbq) {
    const fbq: Fbq = function (...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue?.push(args);
      }
    } as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(script, first);
  }

  window.fbq!("init", pixelId);
  window.fbq!("track", "PageView");
  initialized = true;

  if (analyticsConfig.debug) {
    console.log("[analytics] Meta Pixel initialized", pixelId);
  }
}

export function trackMeta(
  event: string,
  params?: Record<string, unknown>
): void {
  if (!isMetaEnabled() || typeof window === "undefined") return;
  window.fbq?.("track", event, params);
  if (analyticsConfig.debug) {
    console.log("[analytics] Meta", event, params);
  }
}

/** Read _fbp / _fbc cookies for CAPI deduplication */
export function getMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {};
  const match = (name: string) => {
    const row = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${name}=`));
    return row ? decodeURIComponent(row.split("=").slice(1).join("=")) : undefined;
  };
  return { fbp: match("_fbp"), fbc: match("_fbc") };
}
