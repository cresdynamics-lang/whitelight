/**
 * Build-time SEO prerender for the Vite SPA.
 * Writes route-specific HTML (meta + visible body text + JSON-LD) so Googlebot
 * and other non-JS fetchers can read page content without executing JavaScript.
 *
 * Output: dist/<path>/index.html  (nginx: try_files $uri $uri/index.html /index.html)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const BASE = "https://whitelightstore.co.ke";

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readShell() {
  const shellPath = path.join(DIST, "index.html");
  if (!fs.existsSync(shellPath)) {
    throw new Error(`Missing ${shellPath}. Run vite build first.`);
  }
  return fs.readFileSync(shellPath, "utf8");
}

function replaceTag(html, regex, replacement) {
  if (regex.test(html)) return html.replace(regex, replacement);
  return html.replace("</head>", `  ${replacement}\n  </head>`);
}

function injectHead(html, { title, description, canonical, ogType = "website", image, jsonLd = [] }) {
  let out = html;
  out = replaceTag(out, /<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  out = replaceTag(
    out,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${esc(description)}" />`
  );
  out = replaceTag(
    out,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${esc(canonical)}" />`
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']og:type["'][^>]*>/i,
    `<meta property="og:type" content="${esc(ogType)}" />`
  );
  out = replaceTag(
    out,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${esc(canonical)}" />`
  );
  if (image) {
    out = replaceTag(
      out,
      /<meta\s+property=["']og:image["'][^>]*>/i,
      `<meta property="og:image" content="${esc(image)}" />`
    );
  }
  out = replaceTag(
    out,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${esc(title)}" />`
  );
  out = replaceTag(
    out,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${esc(description)}" />`
  );

  const ldHtml = jsonLd
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join("\n    ");
  if (ldHtml) {
    out = out.replace("</head>", `    ${ldHtml}\n  </head>`);
  }
  return out;
}

function injectBody(html, bodyInner) {
  // Keep #root for React mount; place crawlable content beside it so bots see text
  // even when some crawlers treat empty roots poorly. React replaces #root only.
  const crawlerBlock = `<div id="seo-static" data-seo-prerender="1">${bodyInner}</div>
    <script>document.documentElement.dataset.seoPrerender="1";</script>`;
  if (/<div id="root"><\/div>/i.test(html)) {
    return html.replace(
      /<div id="root"><\/div>/i,
      `<div id="root"></div>\n    ${crawlerBlock}`
    );
  }
  return html.replace("</body>", `    ${crawlerBlock}\n  </body>`);
}

function writeRoute(routePath, html) {
  const clean = routePath === "/" ? "" : routePath.replace(/^\//, "").replace(/\/$/, "");
  const outDir = clean ? path.join(DIST, clean) : DIST;
  ensureDir(outDir);
  const outFile = path.join(outDir, "index.html");
  // Never overwrite the SPA shell's hashed asset references incorrectly for "/"
  fs.writeFileSync(outFile, html, "utf8");
  return outFile;
}

function shoeStoreLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ShoeStore",
    name: "Whitelight Store Kenya",
    url: BASE,
    telephone: "+254-708-749473",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Rware Building, Luthuli Avenue, Shop 410, Fourth Floor",
      addressLocality: "Nairobi",
      addressRegion: "Nairobi",
      postalCode: "00100",
      addressCountry: "KE",
    },
    openingHours: "Mo-Sa 08:00-19:00",
    priceRange: "$$",
  };
}

function breadcrumbs(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function renderBlocks(blocks) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "p":
          return `<p>${esc(block.text)}</p>`;
        case "h2":
          return `<h2>${esc(block.text)}</h2>`;
        case "h3":
          return `<h3>${esc(block.text)}</h3>`;
        case "ul":
          return `<ul>${block.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
        case "ol":
          return `<ol>${block.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>`;
        case "table": {
          const head = block.headers.map((h) => `<th>${esc(h)}</th>`).join("");
          const rows = block.rows
            .map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
            .join("");
          const caption = block.caption ? `<caption>${esc(block.caption)}</caption>` : "";
          return `<table>${caption}<thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
        }
        case "links":
          return `<ul>${block.items
            .map((i) => `<li><a href="${esc(i.href)}">${esc(i.label)}</a></li>`)
            .join("")}</ul>`;
        case "map":
          return `<p><a href="https://maps.google.com/?q=Rware+Building+Luthuli+Avenue+Nairobi">${esc(block.title)} — view map</a></p>`;
        case "printGuide":
          return `<section><h3>${esc(block.title)}</h3><ol>${block.steps
            .map((s) => `<li>${esc(s)}</li>`)
            .join("")}</ol></section>`;
        default:
          return "";
      }
    })
    .join("\n");
}

async function loadBlogPosts() {
  // Compile-free import: read TS as text and eval via dynamic import of a generated temp mjs is heavy.
  // Instead, duplicate-load by transforming with a tiny regex extract is fragile.
  // Use the built approach: import from a JSON snapshot we write next to the script.
  const snapshot = path.join(ROOT, "scripts", ".blog-posts.snapshot.json");
  if (fs.existsSync(snapshot)) {
    return JSON.parse(fs.readFileSync(snapshot, "utf8"));
  }
  // Fallback: parse the TS file's exported array via node --experimental-strip-types if available
  const tsPath = path.join(ROOT, "src/data/blogPosts.ts");
  try {
    const mod = await import(pathToFileURL(tsPath).href);
    return mod.blogPosts;
  } catch {
    // Node without TS strip — generate snapshot instruction
    throw new Error(
      "Cannot load blogPosts.ts. Run: node --experimental-strip-types scripts/export-blog-snapshot.mjs"
    );
  }
}

async function loadProducts() {
  try {
    const res = await fetch(`${BASE}/api/catalog`);
    if (res.ok) {
      const data = await res.json();
      const products = data.products || [];
      if (products.length) {
        fs.writeFileSync(
          path.join(ROOT, "public/catalog.json"),
          JSON.stringify({ products }, null, 0),
          "utf8"
        );
        return products;
      }
    }
  } catch {
    /* fall through */
  }
  const localCatalog = path.join(ROOT, "public/catalog.json");
  if (fs.existsSync(localCatalog)) {
    const data = JSON.parse(fs.readFileSync(localCatalog, "utf8"));
    return Array.isArray(data) ? data : data.products || [];
  }
  return [];
}

function styleBlock() {
  return `<style>
#seo-static{font-family:system-ui,sans-serif;max-width:48rem;margin:0 auto;padding:1.25rem;line-height:1.6;color:#111}
#seo-static h1{font-size:1.75rem;line-height:1.25;margin:0 0 .75rem}
#seo-static h2{font-size:1.35rem;margin:1.5rem 0 .5rem}
#seo-static h3{font-size:1.1rem;margin:1.1rem 0 .4rem}
#seo-static table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.95rem}
#seo-static th,#seo-static td{border:1px solid #ddd;padding:.4rem .55rem;text-align:left;vertical-align:top}
#seo-static a{color:#0b5;font-weight:600}
.seo-meta{color:#444;font-size:.9rem;margin-bottom:1rem}
</style>
<script>
(function(){
  function hide(){var el=document.getElementById('seo-static'); if(el) el.style.display='none';}
  if(document.getElementById('root') && document.getElementById('root').childElementCount>0) hide();
  var obs=new MutationObserver(function(){
    var root=document.getElementById('root');
    if(root && root.childElementCount>0){hide(); obs.disconnect();}
  });
  var root=document.getElementById('root');
  if(root) obs.observe(root,{childList:true});
  setTimeout(hide, 8000);
})();
</script>`;
}

async function main() {
  const shell = readShell();
  let written = 0;

  const blogPosts = await loadBlogPosts();
  const products = await loadProducts();

  // Home
  {
    const title = "Best Running, Trail & Gym Shoes Nairobi | Whitelight Store";
    const description =
      "Nairobi's trusted store for the best running, trail, gym, training shoes and accessories. Same-day CBD delivery. Whitelight Store, Luthuli Avenue.";
    const body = `${styleBlock()}
      <article>
        <h1>Whitelight Store — Best Running, Trail &amp; Gym Shoes in Nairobi</h1>
        <p>Whitelight Store is a Nairobi athletic footwear store on Luthuli Avenue (Rware Building, Shop 410, 4th Floor) selling running, trail, gym, and training shoes, with same-day CBD delivery.</p>
        <p>Shop authentic performance footwear in Nairobi CBD. Open Monday–Saturday, 8am–7pm. WhatsApp +254 708 749473.</p>
        <h2>Shop by category</h2>
        <ul>
          <li><a href="/category/running">Running shoes Nairobi</a></li>
          <li><a href="/category/trail">Trail running shoes Kenya</a></li>
          <li><a href="/category/gym">Gym shoes Kenya</a></li>
          <li><a href="/category/training">Training shoes</a></li>
          <li><a href="/blog">Running shoe guides &amp; blog</a></li>
        </ul>
      </article>`;
    let html = injectHead(shell, {
      title,
      description,
      canonical: `${BASE}/`,
      image: `${BASE}/whitelight_logo.webp`,
      jsonLd: [shoeStoreLd()],
    });
    html = injectBody(html, body);
    writeRoute("/", html);
    written += 1;
  }

  // Blog index
  {
    const title = "Running Shoe Guides Nairobi | Whitelight Store Blog";
    const description =
      "Guides on best running shoes in Nairobi, Luthuli Avenue shopping, Kenya prices, trail shoes, gym shoes and sizing from Whitelight Store.";
    const list = blogPosts
      .map(
        (p) =>
          `<li><a href="/blog/${esc(p.slug)}"><strong>${esc(p.title)}</strong></a> — ${esc(p.excerpt)}</li>`
      )
      .join("");
    const body = `${styleBlock()}
      <article>
        <h1>Whitelight Store guides &amp; updates</h1>
        <p>Practical buying guides for Nairobi runners and gym athletes from Whitelight Store on Luthuli Avenue.</p>
        <ol>${list}</ol>
      </article>`;
    let html = injectHead(shell, {
      title,
      description,
      canonical: `${BASE}/blog`,
      jsonLd: [
        shoeStoreLd(),
        breadcrumbs([
          { name: "Home", item: `${BASE}/` },
          { name: "Blog", item: `${BASE}/blog` },
        ]),
      ],
    });
    html = injectBody(html, body);
    writeRoute("/blog", html);
    written += 1;
  }

  // Blog posts
  for (const post of blogPosts) {
    const url = `${BASE}/blog/${post.slug}`;
    const faqs = post.faqs
      .map(
        (f) =>
          `<div><h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p></div>`
      )
      .join("");
    const wa = `https://wa.me/254708749473?text=${encodeURIComponent(
      `Hi Whitelight Store — I read "${post.title}" and want help choosing a pair.`
    )}`;
    const body = `${styleBlock()}
      <article>
        <p class="seo-meta">By ${esc(post.author)} · Published ${esc(post.date)} · Last updated ${esc(post.updatedAt)}</p>
        <h1>${esc(post.title)}</h1>
        <p><strong>${esc(post.answerFirst)}</strong></p>
        <p><img src="${esc(post.cover)}" alt="${esc(post.coverAlt)}" width="1200" height="675" /></p>
        ${renderBlocks(post.blocks || [])}
        <h2>FAQ</h2>
        ${faqs}
        <p><a href="${esc(wa)}">Order on WhatsApp</a> · <a href="/category/running">Shop running shoes</a></p>
      </article>`;
    const jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.metaDescription,
        image: [`${BASE}${post.cover}`],
        datePublished: post.date,
        dateModified: post.updatedAt,
        author: { "@type": "Person", name: post.author },
        publisher: {
          "@type": "Organization",
          name: "Whitelight Store Kenya",
          logo: { "@type": "ImageObject", url: `${BASE}/whitelight_logo.webp` },
        },
        mainEntityOfPage: url,
        keywords: [post.primaryKeyword, ...(post.secondaryKeywords || [])].join(", "),
      },
      shoeStoreLd(),
      breadcrumbs([
        { name: "Home", item: `${BASE}/` },
        { name: "Blog", item: `${BASE}/blog` },
        { name: post.title, item: url },
      ]),
    ];
    let html = injectHead(shell, {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      canonical: url,
      ogType: "article",
      image: `${BASE}${post.cover}`,
      jsonLd,
    });
    html = injectBody(html, body);
    writeRoute(`/blog/${post.slug}`, html);
    written += 1;
  }

  // Categories (blueprint clean paths + legacy /category aliases)
  const categories = [
    {
      id: "running",
      title: "Running Shoes Nairobi | The Whitelight",
      description:
        "Shop authentic running shoes in Nairobi at The Whitelight, Luthuli Avenue. Same-day CBD delivery.",
    },
    {
      id: "trail",
      title: "Trail Running Shoes Kenya | The Whitelight",
      description:
        "Trail running shoes for Karura, Ngong Hills and Kenyan mud — grip and protection from The Whitelight.",
    },
    {
      id: "gym",
      title: "Gym Shoes Kenya | The Whitelight Nairobi",
      description:
        "Stable gym shoes for HIIT, classes and training floors. Shop The Whitelight Nairobi CBD.",
    },
    {
      id: "training",
      title: "Training Shoes Nairobi | The Whitelight",
      description:
        "Training shoes for side-to-side workouts and gym sessions. Authentic stock in Nairobi CBD.",
    },
    {
      id: "basketball",
      title: "Basketball Shoes Nairobi | The Whitelight",
      description: "Basketball shoes in Nairobi CBD with same-day delivery options.",
    },
    {
      id: "tennis",
      title: "Tennis Shoes Nairobi | The Whitelight",
      description: "Court and tennis shoes from The Whitelight on Luthuli Avenue.",
    },
    {
      id: "accessories",
      title: "Shoe Accessories Nairobi | The Whitelight",
      description: "Socks and shoe accessories at The Whitelight Kenya.",
    },
  ];

  for (const cat of categories) {
    const catProducts = products.filter((p) => p.category === cat.id).slice(0, 40);
    const list = catProducts
      .map(
        (p) =>
          `<li><a href="/shoes/${esc(p.slug)}">${esc(p.brand || "")} ${esc(p.name)}</a> — KSh ${esc(
            String(p.price)
          )}</li>`
      )
      .join("");
    const body = `${styleBlock()}
      <article>
        <h1>${esc(cat.title)}</h1>
        <p>${esc(cat.description)}</p>
        <p>The Whitelight is a Nairobi athletic footwear store on Luthuli Avenue selling running, trail, gym, and training shoes, with same-day CBD delivery.</p>
        <h2>Products</h2>
        <ul>${list || "<li>See live catalogue on the website.</li>"}</ul>
        <p><a href="https://wa.me/254708749473">Order on WhatsApp</a></p>
      </article>`;
    for (const path of [`/${cat.id}`, `/category/${cat.id}`]) {
      const url = `${BASE}${path}`;
      let html = injectHead(shell, {
        title: cat.title,
        description: cat.description,
        canonical: `${BASE}/${cat.id}`,
        jsonLd: [
          shoeStoreLd(),
          breadcrumbs([
            { name: "Home", item: `${BASE}/` },
            { name: cat.id, item: `${BASE}/${cat.id}` },
          ]),
        ],
      });
      html = injectBody(html, body);
      writeRoute(path, html);
      written += 1;
    }
  }

  // Support pages
  const supportPages = [
    {
      path: "/size-guide",
      title: "Running Shoe Size Guide Kenya | The Whitelight",
      description: "Measure your foot, EU/UK/US chart, and fit notes for online orders.",
      body: "<h1>Size guide</h1><p>Measure in the afternoon, leave a thumb’s width at the toe, and message WhatsApp for brand-specific advice.</p>",
    },
    {
      path: "/delivery",
      title: "Delivery & Exchanges Nairobi | The Whitelight",
      description: "Same-day CBD delivery and 3-day size exchange rules.",
      body: "<h1>Delivery & exchanges</h1><p>Same-day Nairobi CBD before cut-off. Size exchange within 3 days, same model, unworn.</p>",
    },
    {
      path: "/store",
      title: "Visit The Whitelight | Luthuli Avenue Nairobi",
      description: "Rware Building Shop 410, Luthuli Avenue. Hours, map, WhatsApp.",
      body: "<h1>Store & contact</h1><p>Rware Building, Luthuli Avenue, Shop 410, Fourth Floor. Mon–Sat 8am–7pm.</p>",
    },
    {
      path: "/new",
      title: "New Arrivals | The Whitelight Nairobi",
      description: "Just landed shoes, newest first, with sizes shown.",
      body: "<h1>New arrivals</h1><p>Latest drops at The Whitelight on Luthuli Avenue.</p>",
    },
    {
      path: "/journal",
      title: "Journal | The Whitelight",
      description: "Buying guides for Nairobi runners and gym athletes.",
      body: "<h1>Journal</h1><p>Guides on running shoes, trail, sizing and CBD shopping.</p><p><a href='/blog'>Read guides</a></p>",
    },
  ];
  for (const page of supportPages) {
    let html = injectHead(shell, {
      title: page.title,
      description: page.description,
      canonical: `${BASE}${page.path}`,
      jsonLd: [shoeStoreLd()],
    });
    html = injectBody(html, `${styleBlock()}<article>${page.body}</article>`);
    writeRoute(page.path, html);
    written += 1;
  }

  // Products — canonical /shoes/:slug (+ legacy /product/:slug)
  for (const p of products) {
    if (!p?.slug) continue;
    const url = `${BASE}/shoes/${p.slug}`;
    const title = `${p.brand || ""} ${p.name} | The Whitelight Nairobi`.replace(/\s+/g, " ").trim();
    const description = (
      p.seo_description ||
      `${p.brand || ""} ${p.name} — KSh ${p.price}. Authentic ${p.category} shoes at The Whitelight, Luthuli Avenue Nairobi. Same-day CBD delivery.`
    ).slice(0, 155);
    const image = p.images?.[0]?.url
      ? /^https?:/i.test(p.images[0].url)
        ? p.images[0].url
        : `${BASE}${p.images[0].url}`
      : `${BASE}/whitelight_logo.webp`;
    const inStock =
      !p.variants?.length || p.variants.some((v) => v.inStock || v.in_stock);
    const body = `${styleBlock()}
      <article>
        <h1>${esc(p.brand || "")} ${esc(p.name)}</h1>
        <p>Price: <strong>KSh ${esc(String(p.price))}</strong> · Category: ${esc(p.category || "")} · ${
      inStock ? "In stock" : "Out of stock"
    }</p>
        <p><img src="${esc(image)}" alt="${esc(p.alt_text_main || `${p.brand} ${p.name} ${p.category} shoes Nairobi`)}" width="800" height="800" /></p>
        <p>${esc(String(p.description || "").replace(/<[^>]*>/g, " ").slice(0, 1200))}</p>
        <p>Buy original athletic footwear at The Whitelight, Rware Building, Luthuli Avenue, Shop 410, Nairobi. Same-day CBD delivery available.</p>
        <p><a href="https://wa.me/254708749473?text=${encodeURIComponent(
          `Hi, I want to order ${p.brand || ""} ${p.name}`
        )}">Order on WhatsApp</a> · <a href="/${esc(p.category || "running")}">More ${esc(
      p.category || "running"
    )} shoes</a></p>
      </article>`;
    const productLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${p.brand || ""} ${p.name}`.trim(),
      description: description,
      image: [image],
      sku: p.id,
      brand: { "@type": "Brand", name: p.brand || "The Whitelight" },
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "KES",
        price: String(p.price),
        availability: inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: { "@type": "ShoeStore", name: "The Whitelight" },
      },
    };
    let html = injectHead(shell, {
      title: title.slice(0, 60),
      description,
      canonical: url,
      ogType: "product",
      image,
      jsonLd: [
        productLd,
        shoeStoreLd(),
        breadcrumbs([
          { name: "Home", item: `${BASE}/` },
          { name: p.category || "Shoes", item: `${BASE}/${p.category || "running"}` },
          { name: p.name, item: url },
        ]),
      ],
    });
    html = injectBody(html, body);
    writeRoute(`/shoes/${p.slug}`, html);
    writeRoute(`/product/${p.slug}`, html);
    written += 2;
  }

  // Keep sitemap in dist after late catalog refresh
  const sitemapSrc = path.join(ROOT, "public/sitemap.xml");
  if (fs.existsSync(sitemapSrc)) {
    // regenerate with latest product list if script available
    try {
      const { spawnSync } = await import("node:child_process");
      spawnSync(process.execPath, ["scripts/generate-sitemap.mjs"], {
        cwd: ROOT,
        stdio: "inherit",
      });
    } catch {
      /* keep existing */
    }
    fs.copyFileSync(path.join(ROOT, "public/sitemap.xml"), path.join(DIST, "sitemap.xml"));
  }

  console.log(`Prerendered ${written} HTML routes into ${DIST}`);
  console.log(`Blog posts: ${blogPosts.length}, products: ${products.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
