/**
 * Meta Conversions API (server-side) — deduplicates with browser Pixel via event_id.
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api
 */
import { createHash } from "node:crypto";

const GRAPH_API = "https://graph.facebook.com/v21.0";

function hashField(value) {
  if (!value) return undefined;
  const normalized = String(value).trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const pixelId = process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    res.status(503).json({
      error: "Meta Conversions API not configured",
      hint: "Set META_PIXEL_ID and META_ACCESS_TOKEN in Vercel environment variables",
    });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const {
      event_name,
      event_id,
      event_source_url,
      action_source = "website",
      user_data = {},
      custom_data = {},
    } = body ?? {};

    if (!event_name || !event_id) {
      res.status(400).json({ error: "event_name and event_id are required" });
      return;
    }

    const hashedUserData = {};
    if (user_data.email) hashedUserData.em = [hashField(user_data.email)];
    if (user_data.phone) hashedUserData.ph = [hashField(user_data.phone)];
    if (user_data.fbp) hashedUserData.fbp = user_data.fbp;
    if (user_data.fbc) hashedUserData.fbc = user_data.fbc;
    if (user_data.client_user_agent) {
      hashedUserData.client_user_agent = user_data.client_user_agent;
    }
    if (user_data.client_ip_address) {
      hashedUserData.client_ip_address = user_data.client_ip_address;
    }

    const eventTime = Math.floor(Date.now() / 1000);
    const payload = {
      data: [
        {
          event_name,
          event_time: eventTime,
          event_id,
          event_source_url: event_source_url || "https://whitelightstore.co.ke",
          action_source,
          user_data: hashedUserData,
          custom_data,
        },
      ],
    };

    const url = `${GRAPH_API}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
    const graphRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await graphRes.json();
    if (!graphRes.ok) {
      console.error("[conversions/meta] Graph API error:", result);
      res.status(502).json({ error: "Meta API rejected event", details: result });
      return;
    }

    res.status(200).json({ success: true, events_received: result.events_received });
  } catch (error) {
    console.error("[conversions/meta]", error);
    res.status(500).json({
      error: "Failed to send conversion event",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
