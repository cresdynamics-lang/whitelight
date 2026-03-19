import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const SITEMAP_PATH = path.join(ROOT, "public", "sitemap.xml");
const TARGET_ORIGIN = process.env.TARGET_ORIGIN || "";

function parseSitemapUrls(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1]).filter(Boolean);
}

function mapUrl(url) {
  if (!TARGET_ORIGIN) return url;
  try {
    const original = new URL(url);
    const target = new URL(TARGET_ORIGIN);
    original.protocol = target.protocol;
    original.host = target.host;
    return original.toString();
  } catch {
    return url;
  }
}

function hasCanonical(html) {
  return /<link[^>]+rel=["']canonical["'][^>]*>/i.test(html);
}

function hasMetaDescription(html) {
  return /<meta[^>]+name=["']description["'][^>]*>/i.test(html);
}

function hasTitle(html) {
  return /<title>.*?<\/title>/is.test(html);
}

function hasProductJsonLd(html) {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return scripts.some((m) => /"@type"\s*:\s*"Product"/i.test(m[1] || ""));
}

function isSpaShell(html) {
  return /<div[^>]+id=["']root["'][^>]*>/i.test(html);
}

async function checkUrl(url, index, total) {
  const target = mapUrl(url);
  const result = {
    url,
    target,
    ok: false,
    status: 0,
    hasTitle: false,
    hasDescription: false,
    hasCanonical: false,
    hasProductSchema: false,
    error: "",
  };

  try {
    const res = await fetch(target, {
      redirect: "follow",
      headers: { "user-agent": "seo-checker/1.0" },
    });
    result.status = res.status;

    const html = await res.text();
    const spaShell = isSpaShell(html);
    result.hasTitle = hasTitle(html);
    result.hasDescription = hasMetaDescription(html);
    result.hasCanonical = hasCanonical(html);
    if (/\/product\//.test(new URL(target).pathname)) {
      result.hasProductSchema = hasProductJsonLd(html);
    } else {
      result.hasProductSchema = true;
    }

    // In SPA shell HTML, canonical and JSON-LD are often injected at runtime.
    // For raw fetch checks we accept title+description+200 and flag the rest as warnings.
    result.ok = spaShell
      ? res.ok && result.hasTitle && result.hasDescription
      : res.ok &&
        result.hasTitle &&
        result.hasDescription &&
        result.hasCanonical &&
        result.hasProductSchema;

    const statusLabel = result.ok ? "OK" : "ISSUE";
    console.log(
      `[${index + 1}/${total}] ${statusLabel} ${result.status} ${target}${spaShell ? " (spa-shell)" : ""}`
    );
  } catch (error) {
    result.error = String(error);
    console.log(`[${index + 1}/${total}] ERROR ${target} -> ${result.error}`);
  }

  return result;
}

async function main() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`Sitemap not found: ${SITEMAP_PATH}`);
    process.exit(1);
  }

  const xml = fs.readFileSync(SITEMAP_PATH, "utf8");
  const urls = parseSitemapUrls(xml);

  if (!urls.length) {
    console.error("No URLs found in sitemap.");
    process.exit(1);
  }

  console.log(`Checking ${urls.length} URLs`);
  if (TARGET_ORIGIN) {
    console.log(`Using mapped target origin: ${TARGET_ORIGIN}`);
  }

  const results = [];
  for (let i = 0; i < urls.length; i += 1) {
    // Sequential checks avoid overwhelming the target host.
    // eslint-disable-next-line no-await-in-loop
    const checked = await checkUrl(urls[i], i, urls.length);
    results.push(checked);
  }

  const okCount = results.filter((r) => r.ok).length;
  const bad = results.filter((r) => !r.ok);
  const warningCanonical = results.filter((r) => r.ok && !r.hasCanonical).length;
  const warningSchema = results.filter((r) => r.ok && !r.hasProductSchema).length;

  console.log("\n--- SEO Check Summary ---");
  console.log(`Passed: ${okCount}/${results.length}`);
  console.log(`Failed: ${bad.length}/${results.length}`);
  console.log(`Warnings (missing canonical in raw HTML): ${warningCanonical}`);
  console.log(`Warnings (missing product schema in raw HTML): ${warningSchema}`);

  if (bad.length) {
    console.log("\nIssues:");
    for (const r of bad) {
      console.log(
        `- ${r.target} | status=${r.status} title=${r.hasTitle} description=${r.hasDescription} canonical=${r.hasCanonical} productSchema=${r.hasProductSchema}${r.error ? ` error=${r.error}` : ""}`
      );
    }
    process.exitCode = 1;
  }
}

main();

