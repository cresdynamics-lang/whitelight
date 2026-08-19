/**
 * Pesapal API 3.0 helper (sandbox or production via env).
 * Env: PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET, PESAPAL_ENV,
 *      PESAPAL_IPN_ID (optional — registered automatically if missing)
 */
import { config } from "./config.js";

const SANDBOX = "https://cybqa.pesapal.com/pesapalv3/api";
const LIVE = "https://pay.pesapal.com/v3/api";

function baseUrl() {
  return config.pesapal.env === "live" ? LIVE : SANDBOX;
}

export function isPesapalConfigured() {
  return Boolean(config.pesapal.consumerKey && config.pesapal.consumerSecret);
}

let cachedToken = { value: "", expiresAt: 0 };
let cachedIpnId = config.pesapal.ipnId || "";

async function getToken() {
  if (cachedToken.value && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.value;
  }
  const res = await fetch(`${baseUrl()}/Auth/RequestToken`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      consumer_key: config.pesapal.consumerKey,
      consumer_secret: config.pesapal.consumerSecret,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data.error?.message || data.message || "Pesapal auth failed");
  }
  cachedToken = { value: data.token, expiresAt: Date.now() + 4 * 60 * 1000 };
  return data.token;
}

async function ensureIpnId(token) {
  if (cachedIpnId) return cachedIpnId;
  const ipnUrl = `${config.publicBaseUrl.replace(/\/$/, "")}/api/payments/pesapal/ipn`;
  const res = await fetch(`${baseUrl()}/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: ipnUrl, ipn_notification_type: "GET" }),
  });
  const data = await res.json();
  if (!data.ipn_id) {
    throw new Error(data.error?.message || data.message || "Pesapal IPN register failed");
  }
  cachedIpnId = data.ipn_id;
  return cachedIpnId;
}

export async function submitPesapalOrder({
  merchantReference,
  amount,
  description,
  callbackUrl,
  phone,
  email,
  firstName,
  lastName,
}) {
  if (!isPesapalConfigured()) {
    throw new Error("Pesapal is not configured. Set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET.");
  }
  const token = await getToken();
  const notificationId = await ensureIpnId(token);
  const res = await fetch(`${baseUrl()}/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: merchantReference,
      currency: "KES",
      amount: Number(amount),
      description: String(description || "Whitelight Store order").slice(0, 100),
      callback_url: callbackUrl,
      notification_id: notificationId,
      billing_address: {
        email_address: email || "orders@whitelightstore.co.ke",
        phone_number: String(phone || "").replace(/\D/g, "").slice(-12),
        country_code: "KE",
        first_name: firstName || "Customer",
        middle_name: "",
        last_name: lastName || "Whitelight",
        line_1: "",
        line_2: "",
        city: "Nairobi",
        state: "",
        postal_code: "",
        zip_code: "",
      },
    }),
  });
  const data = await res.json();
  if (!data.redirect_url) {
    throw new Error(data.error?.message || data.message || "Pesapal submit failed");
  }
  return {
    orderTrackingId: data.order_tracking_id,
    redirectUrl: data.redirect_url,
    merchantReference: data.merchant_reference || merchantReference,
  };
}

export async function getPesapalStatus(orderTrackingId) {
  const token = await getToken();
  const res = await fetch(
    `${baseUrl()}/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    }
  );
  return res.json();
}
