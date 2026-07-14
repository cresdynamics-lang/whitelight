import {
  fetchSaleCatalogProducts,
  buildMetaCatalogCsv,
} from "../../scripts/lib/catalog-feed.mjs";

/**
 * Meta Commerce Manager CSV catalog feed.
 * Served at /feeds/meta.csv (rewrite) and /api/feeds/meta-csv
 */
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const products = await fetchSaleCatalogProducts();
    const csv = buildMetaCatalogCsv(products);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="meta.csv"');
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    if (req.method === "HEAD") {
      res.status(200).end();
      return;
    }
    res.status(200).send(csv);
  } catch (error) {
    console.error("[feeds/meta-csv]", error);
    res.status(500).json({
      error: "Failed to generate Meta catalog CSV feed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
