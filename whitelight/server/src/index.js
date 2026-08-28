import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { config } from "./config.js";
import { query } from "./db.js";
import { loadProductsFull } from "./products.js";
import { submitPesapalOrder, getPesapalStatus, isPesapalConfigured } from "./pesapal.js";
import { loginAdmin, requireAdmin } from "./auth.js";
import { storeUpload } from "./storage.js";
import { handleImg } from "./img.js";
import { analyzeProductImage, isGeminiConfigured, isGroqConfigured, isVisionAiConfigured } from "./productImageAi.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
const app = express();

app.use(cors({ origin: config.corsOrigin === "*" ? true : config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

fs.mkdirSync(config.uploadsDir, { recursive: true });
app.get("/api/img", handleImg);
app.use("/uploads", express.static(config.uploadsDir, {
  maxAge: "365d",
  immutable: true,
  setHeaders(res) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  },
}));

function toFeedItems(products, { forceInStock = false } = {}) {
  const CURRENCY = "KES";
  const BRAND = "WHITELIGHT STORE";
  const BASE = "https://whitelightstore.co.ke";
  return products
    .map((p) => {
      const rawImage = p.images?.[0]?.url;
      if (!rawImage) return null;
      // Meta requires absolute image URLs — older rows store relative /uploads paths
      const image = /^https?:\/\//i.test(rawImage)
        ? rawImage
        : `${BASE}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
      const variants = p.variants || [];
      const availability = forceInStock
        ? "in stock"
        : variants.length === 0 || variants.some((v) => v.inStock)
          ? "in stock"
          : "out of stock";
      const link = p.url_slug
        ? `${BASE}${p.url_slug.startsWith("/") ? p.url_slug : `/${p.url_slug}`}`
        : `${BASE}/product/${p.slug}`;
      const hasSale = p.originalPrice != null && p.originalPrice > p.price;
      const listPrice = hasSale ? p.originalPrice : p.price;
      const salePrice = hasSale ? p.price : undefined;
      return {
        id: p.id,
        title: String(p.name).slice(0, 150),
        description: String(p.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 5000),
        link,
        image_link: image,
        availability,
        condition: "new",
        price: `${Number(listPrice).toFixed(2)} ${CURRENCY}`,
        sale_price: salePrice != null ? `${Number(salePrice).toFixed(2)} ${CURRENCY}` : undefined,
        brand: p.brand || BRAND,
        item_group_id: p.slug,
      };
    })
    .filter(Boolean);
}

function csvEscape(value = "") {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function buildMetaCsv(products, opts) {
  const items = toFeedItems(products, opts);
  const headers = [
    "id", "title", "description", "availability", "condition", "price", "sale_price",
    "link", "image_link", "brand", "item_group_id",
  ];
  const rows = items.map((item) =>
    headers.map((h) => csvEscape(item[h] ?? "")).join(",")
  );
  return [headers.join(","), ...rows].join("\n") + "\n";
}

function buildGoogleRss(products) {
  const items = toFeedItems(products);
  const esc = (v) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const nodes = items
    .map(
      (item) => `    <item>
      <g:id>${esc(item.id)}</g:id>
      <title>${esc(item.title)}</title>
      <description>${esc(item.description)}</description>
      <g:link>${esc(item.link)}</g:link>
      <g:image_link>${esc(item.image_link)}</g:image_link>
      <g:availability>${esc(item.availability)}</g:availability>
      <g:price>${esc(item.price)}</g:price>${item.sale_price ? `\n      <g:sale_price>${esc(item.sale_price)}</g:sale_price>` : ""}
      <g:brand>${esc(item.brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:item_group_id>${esc(item.item_group_id)}</g:item_group_id>
    </item>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>WHITELIGHT STORE Product Feed</title>
    <link>https://whitelightstore.co.ke</link>
    <description>Sale catalogue</description>
${nodes}
  </channel>
</rss>
`;
}

// Health
app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Catalog (short in-memory cache — tiny droplet / cheaper TTFB)
let catalogCache = { at: 0, body: null };
const CATALOG_TTL_MS = 60_000;
function invalidateCatalogCache() {
  catalogCache = { at: 0, body: null };
}

app.get("/api/catalog", async (_req, res) => {
  try {
    const now = Date.now();
    if (catalogCache.body && now - catalogCache.at < CATALOG_TTL_MS) {
      res.set("Cache-Control", "public, max-age=30");
      return res.json(catalogCache.body);
    }
    const products = await loadProductsFull(query);
    catalogCache = { at: now, body: { products } };
    res.set("Cache-Control", "public, max-age=30");
    res.json(catalogCache.body);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    const products = await loadProductsFull(query, { slug: req.params.slug });
    if (!products[0]) return res.status(404).json({ error: "Not found" });
    res.json({ product: products[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin auth
app.post("/api/admin/login", async (req, res) => {
  try {
    const email = String(req.body?.email || req.body?.username || "").trim();
    const password = String(req.body?.password || "");
    const result = await loginAdmin(email, password);
    if (!result) return res.status(401).json({ error: "Invalid email or password" });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/products", requireAdmin, async (_req, res) => {
  try {
    const products = await loadProductsFull(query);
    res.json({ products });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const products = await loadProductsFull(query, { id: req.params.id });
    if (!products[0]) return res.status(404).json({ error: "Not found" });
    res.json({ product: products[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/admin/products/:id/sale", requireAdmin, async (req, res) => {
  try {
    const isOnOffer = Boolean(req.body?.isOnOffer);
    await query(`UPDATE products SET is_on_offer = $1 WHERE id = $2`, [isOnOffer, req.params.id]);
    invalidateCatalogCache();
    res.json({ ok: true, isOnOffer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/upload", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });
    const url = await storeUpload(req.file);
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/ai/status", requireAdmin, (_req, res) => {
  res.json({
    configured: isVisionAiConfigured(),
    groq: { configured: isGroqConfigured(), model: config.groq.visionModel },
    gemini: { configured: isGeminiConfigured(), model: config.gemini.visionModel },
    provider: isGroqConfigured() ? "groq" : isGeminiConfigured() ? "gemini" : null,
    fallback: isGroqConfigured() && isGeminiConfigured(),
  });
});

app.post("/api/admin/analyze-image", requireAdmin, async (req, res) => {
  try {
    const { imageUrl, name, brand, category, sizes } = req.body || {};
    if (!imageUrl) return res.status(400).json({ error: "imageUrl required" });
    const result = await analyzeProductImage({
      imageUrl,
      name,
      brand,
      category,
      sizes: Array.isArray(sizes) ? sizes : [],
    });
    res.json(result);
  } catch (e) {
    const raw = e?.message || String(e);
    console.error("analyze-image:", raw);
    if (/rate limit|tokens per minute|quota/i.test(raw)) {
      res.status(429).json({
        error: "AI is busy right now (per-minute limit). Wait about a minute, then press Generate SEO (AI).",
        detail: raw,
      });
      return;
    }
    res.status(500).json({ error: raw || "Image analysis failed" });
  }
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  const client = await (await import("./db.js")).pool.connect();
  try {
    const p = req.body || {};
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO products (slug, name, brand, category, categories, price, original_price, description, tags, is_new, is_best_seller, is_on_offer)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [
        p.slug,
        p.name,
        p.brand || "",
        p.category || "running",
        p.categories?.length ? p.categories : [p.category || "running"],
        p.price || 0,
        p.originalPrice ?? null,
        p.description || "",
        p.tags || [],
        Boolean(p.isNew),
        Boolean(p.isBestSeller),
        Boolean(p.isOnOffer),
      ]
    );
    const id = rows[0].id;
    for (const img of p.images || []) {
      await client.query(
        `INSERT INTO product_images (product_id, url, alt_text) VALUES ($1,$2,$3)`,
        [id, img.url, img.alt || p.name]
      );
    }
    for (const v of p.variants || []) {
      await client.query(
        `INSERT INTO product_variants (product_id, size, in_stock, stock_quantity) VALUES ($1,$2,$3,$4)`,
        [id, String(v.size), v.inStock !== false, v.stockQuantity || 0]
      );
    }
    await client.query("COMMIT");
    invalidateCatalogCache();
    const products = await loadProductsFull(query, { id: String(id) });
    res.status(201).json({ product: products[0] });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
  const client = await (await import("./db.js")).pool.connect();
  const id = req.params.id;
  const p = req.body || {};
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE products SET
        slug = COALESCE($1, slug),
        name = COALESCE($2, name),
        brand = COALESCE($3, brand),
        category = COALESCE($4, category),
        categories = COALESCE($5, categories),
        price = COALESCE($6, price),
        original_price = $7,
        description = COALESCE($8, description),
        tags = COALESCE($9, tags),
        is_new = COALESCE($10, is_new),
        is_best_seller = COALESCE($11, is_best_seller),
        is_on_offer = COALESCE($12, is_on_offer)
       WHERE id = $13`,
      [
        p.slug ?? null,
        p.name ?? null,
        p.brand ?? null,
        p.category ?? null,
        p.categories ?? null,
        p.price ?? null,
        p.originalPrice ?? null,
        p.description ?? null,
        p.tags ?? null,
        p.isNew ?? null,
        p.isBestSeller ?? null,
        p.isOnOffer ?? null,
        id,
      ]
    );
    if (Array.isArray(p.images)) {
      await client.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);
      for (const img of p.images) {
        await client.query(
          `INSERT INTO product_images (product_id, url, alt_text) VALUES ($1,$2,$3)`,
          [id, img.url, img.alt || p.name || ""]
        );
      }
    }
    if (Array.isArray(p.variants)) {
      await client.query(`DELETE FROM product_variants WHERE product_id = $1`, [id]);
      for (const v of p.variants) {
        await client.query(
          `INSERT INTO product_variants (product_id, size, in_stock, stock_quantity) VALUES ($1,$2,$3,$4)`,
          [id, String(v.size), v.inStock !== false, v.stockQuantity || 0]
        );
      }
    }
    await client.query("COMMIT");
    invalidateCatalogCache();
    const products = await loadProductsFull(query, { id });
    res.json({ product: products[0] });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    await query(`DELETE FROM products WHERE id = $1`, [req.params.id]);
    invalidateCatalogCache();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Orders
app.post("/api/orders", async (req, res) => {
  const client = await (await import("./db.js")).pool.connect();
  const b = req.body || {};
  try {
    if (!b.customerName || !b.customerPhone || !b.deliveryAddress || !b.items?.length) {
      return res.status(400).json({ error: "Missing required order fields" });
    }
    await client.query("BEGIN");
    const orderNumber = await client.query(
      `SELECT 'WL' || to_char(now() AT TIME ZONE 'Africa/Nairobi', 'YYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 4, '0') AS n`
    );
    const onum = orderNumber.rows[0].n;
    const { rows } = await client.query(
      `INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, delivery_location, delivery_location_label,
        delivery_fee, subtotal, total_amount, order_notes, payment_method, mpesa_code, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending') RETURNING id, order_number`,
      [
        onum,
        b.customerName,
        b.customerPhone,
        b.customerEmail || null,
        b.deliveryAddress,
        b.deliveryLocation || "",
        b.deliveryLocationLabel || b.deliveryLocation || "",
        b.deliveryFee || 0,
        b.subtotal || 0,
        b.totalAmount || 0,
        b.orderNotes || null,
        b.paymentMethod || "mpesa_paybill",
        b.mpesaCode || null,
      ]
    );
    const orderId = rows[0].id;
    for (const item of b.items) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_slug, product_name, product_price, size, quantity, subtotal, product_image, reference_link, selected_sizes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          orderId,
          String(item.productId),
          item.productSlug || null,
          item.productName,
          item.productPrice,
          String(item.size ?? "40"),
          item.quantity || 1,
          item.productPrice * (item.quantity || 1),
          item.productImage || null,
          item.referenceLink || null,
          item.selectedSizes ? JSON.stringify(item.selectedSizes) : null,
        ]
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ id: Number(orderId), orderNumber: rows[0].order_number });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
  try {
    const { rows: orders } = await query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`);
    const ids = orders.map((o) => o.id);
    let items = [];
    if (ids.length) {
      const r = await query(`SELECT * FROM order_items WHERE order_id = ANY($1::bigint[])`, [ids]);
      items = r.rows;
    }
    res.json({ orders, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Feeds
// Meta catalog: ONLY products on the sale page (is_on_offer), availability always "in stock".
app.get(["/api/feeds/meta.json", "/api/feeds/meta"], async (_req, res) => {
  try {
    const products = await loadProductsFull(query, { saleOnly: true });
    const data = toFeedItems(products, { forceInStock: true });
    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get(["/feeds/meta.csv", "/api/feeds/meta.csv", "/api/feeds/meta-csv"], async (_req, res) => {
  try {
    const products = await loadProductsFull(query, { saleOnly: true });
    const csv = buildMetaCsv(products, { forceInStock: true });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="meta.csv"');
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/feeds/google", async (_req, res) => {
  try {
    const products = await loadProductsFull(query, { saleOnly: true });
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(buildGoogleRss(products));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Meta CAPI
app.post("/api/conversions/meta", async (req, res) => {
  const pixelId = config.meta.pixelId;
  const accessToken = config.meta.accessToken;
  if (!pixelId || !accessToken) {
    return res.status(503).json({ error: "Meta CAPI not configured" });
  }
  try {
    const body = req.body || {};
    if (!body.event_name || !body.event_id) {
      return res.status(400).json({ error: "event_name and event_id required" });
    }
    const hash = (v) =>
      v ? createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex") : undefined;
    const user_data = {};
    if (body.user_data?.email) user_data.em = [hash(body.user_data.email)];
    if (body.user_data?.phone) user_data.ph = [hash(body.user_data.phone)];
    if (body.user_data?.fbp) user_data.fbp = body.user_data.fbp;
    if (body.user_data?.fbc) user_data.fbc = body.user_data.fbc;
    if (body.user_data?.client_user_agent) user_data.client_user_agent = body.user_data.client_user_agent;

    const payload = {
      data: [
        {
          event_name: body.event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: body.event_id,
          event_source_url: body.event_source_url || "https://whitelightstore.co.ke",
          action_source: body.action_source || "website",
          user_data,
          custom_data: body.custom_data || {},
        },
      ],
    };
    const url = `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;
    const graphRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await graphRes.json();
    if (!graphRes.ok) return res.status(502).json({ error: "Meta API rejected", details: result });
    res.json({ success: true, events_received: result.events_received });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Pesapal payments ---
app.get("/api/payments/pesapal/status", (_req, res) => {
  res.json({ configured: isPesapalConfigured(), env: config.pesapal.env });
});

app.post("/api/payments/pesapal/initiate", async (req, res) => {
  try {
    if (!isPesapalConfigured()) {
      return res.status(503).json({
        error: "Pesapal not configured",
        code: "PESAPAL_MISSING",
      });
    }
    const b = req.body || {};
    const amount = Number(b.amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: "amount required" });
    const merchantReference = String(b.merchantReference || `WL-${Date.now()}`).slice(0, 50);
    const callbackUrl =
      b.callbackUrl ||
      `${config.publicBaseUrl.replace(/\/$/, "")}/payment/success`;
    const names = String(b.customerName || "Customer").trim().split(/\s+/);
    const result = await submitPesapalOrder({
      merchantReference,
      amount,
      description: b.description || `Whitelight order ${merchantReference}`,
      callbackUrl,
      phone: b.phone,
      email: b.email,
      firstName: names[0] || "Customer",
      lastName: names.slice(1).join(" ") || "Store",
    });
    res.json({
      ok: true,
      ...result,
      merchantReference,
    });
  } catch (e) {
    console.error("pesapal initiate", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/payments/pesapal/ipn", async (req, res) => {
  try {
    const trackingId = String(req.query.OrderTrackingId || req.query.orderTrackingId || "");
    if (trackingId) {
      const status = await getPesapalStatus(trackingId);
      console.log("[pesapal-ipn]", trackingId, status?.payment_status_description || status);
    }
    res.json({
      orderNotificationType: req.query.OrderNotificationType || "IPNCHANGE",
      orderTrackingId: trackingId,
      orderMerchantReference: req.query.OrderMerchantReference || "",
      status: 200,
    });
  } catch (e) {
    res.status(200).json({ status: 200, error: e.message });
  }
});

app.get("/api/payments/pesapal/transaction/:trackingId", async (req, res) => {
  try {
    if (!isPesapalConfigured()) return res.status(503).json({ error: "Pesapal not configured" });
    const status = await getPesapalStatus(req.params.trackingId);
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(config.port, config.host, () => {
  console.log(`[whitelight-api] listening on ${config.host}:${config.port}`);
});
