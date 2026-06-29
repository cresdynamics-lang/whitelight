import {
  fetchSaleCatalogProducts,
  buildGoogleMerchantRss,
} from "../../scripts/lib/catalog-feed.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const products = await fetchSaleCatalogProducts();
    const xml = buildGoogleMerchantRss(products);

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    if (req.method === "HEAD") {
      res.status(200).end();
      return;
    }
    res.status(200).send(xml);
  } catch (error) {
    console.error("[feeds/google]", error);
    res.status(500).json({
      error: "Failed to generate Google Merchant feed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
