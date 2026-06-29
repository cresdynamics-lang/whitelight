import {
  fetchSaleCatalogProducts,
  buildMetaCatalogJson,
} from "../../scripts/lib/catalog-feed.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const products = await fetchSaleCatalogProducts();
    const payload = buildMetaCatalogJson(products);

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    if (req.method === "HEAD") {
      res.status(200).end();
      return;
    }
    res.status(200).json(payload);
  } catch (error) {
    console.error("[feeds/meta]", error);
    res.status(500).json({
      error: "Failed to generate Meta catalog feed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
