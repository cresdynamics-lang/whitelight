import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Helmet } from "react-helmet-async";
import { getBlogPost, blogPosts, type BlogBlock, type BlogPost } from "@/data/blogPosts";
import { FastImage } from "@/components/ui/FastImage";
import { siteConfig } from "@/config/site";

const BASE = "https://whitelightstore.co.ke";
const WHATSAPP = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "");

function whatsappHref(post: BlogPost) {
  const text = encodeURIComponent(
    `Hi Whitelight Store — I read "${post.title}" and want help choosing a pair.`
  );
  return `https://wa.me/${WHATSAPP}?text=${text}`;
}

function BlockView({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "p":
      return <p>{block.text}</p>;
    case "h2":
      return (
        <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight pt-4">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-heading text-lg md:text-xl font-semibold tracking-tight pt-2">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="list-disc pl-5 space-y-2">
          {block.items.map((item) => (
            <li key={item.slice(0, 64)}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-5 space-y-2">
          {block.items.map((item) => (
            <li key={item.slice(0, 64)}>{item}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-border">
          {block.caption ? (
            <p className="px-3 py-2 text-sm font-semibold bg-secondary/60 border-b border-border">
              {block.caption}
            </p>
          ) : null}
          <table className="w-full text-sm md:text-base">
            <thead>
              <tr className="bg-secondary/40 text-left">
                {block.headers.map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold border-b border-border">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-border last:border-0">
                  {row.map((cell, i) => (
                    <td key={`${row[0]}-${i}`} className="px-3 py-2 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "links":
      return (
        <ul className="space-y-2">
          {block.items.map((item) => (
            <li key={item.href}>
              <Link to={item.href} className="text-primary font-semibold hover:underline">
                {item.label} →
              </Link>
            </li>
          ))}
        </ul>
      );
    case "map":
      return (
        <div className="overflow-hidden rounded-xl border border-border aspect-[16/10] bg-secondary">
          <iframe
            title={block.title}
            src={block.src}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      );
    case "printGuide":
      return (
        <aside className="rounded-xl border border-dashed border-primary/40 bg-secondary/40 p-5 print:border print:bg-white">
          <h3 className="font-heading text-lg font-bold mb-3">{block.title}</h3>
          <ol className="list-decimal pl-5 space-y-2">
            {block.steps.map((step) => (
              <li key={step.slice(0, 48)}>{step}</li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-background print:hidden"
          >
            Print this guide
          </button>
        </aside>
      );
    default:
      return null;
  }
}

function blogJsonLd(post: BlogPost) {
  const url = `${BASE}/blog/${post.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription,
      image: [`${BASE}${post.cover}`],
      datePublished: post.date,
      dateModified: post.updatedAt,
      author: {
        "@type": "Person",
        name: post.author,
      },
      publisher: {
        "@type": "Organization",
        name: "Whitelight Store Kenya",
        logo: {
          "@type": "ImageObject",
          url: `${BASE}/whitelight_logo.webp`,
        },
      },
      mainEntityOfPage: url,
      keywords: [post.primaryKeyword, ...post.secondaryKeywords].join(", "),
    },
    {
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
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];
}

export default function BlogPostPage() {
  const { slug = "" } = useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Update not found</h1>
          <Link to="/blog" className="text-primary font-semibold hover:underline">
            Back to Updates
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const wa = whatsappHref(post);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={post.metaTitle}
        description={post.metaDescription}
        keywords={[post.primaryKeyword, ...post.secondaryKeywords].join(", ")}
        canonical={`${BASE}/blog/${post.slug}`}
        ogImage={`${BASE}${post.cover}`}
        ogType="article"
      />
      <Helmet>
        <meta property="article:published_time" content={post.date} />
        <meta property="article:modified_time" content={post.updatedAt} />
        <meta property="article:author" content={post.author} />
        {blogJsonLd(post).map((data, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </Helmet>
      <Header />
      <main className="flex-1">
        <article>
          <div className="container max-w-3xl py-8 md:py-12">
            <Link
              to="/blog"
              className="inline-flex text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              ← All guides
            </Link>
            <p className="font-accent text-xs uppercase tracking-[0.16em] text-primary font-semibold mb-3">
              {post.category}
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-[2.15rem] font-bold leading-tight tracking-tight">
              {post.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground font-body">
              <span>By {post.author}</span>
              <time dateTime={post.date}>
                Published{" "}
                {new Date(post.date).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <time dateTime={post.updatedAt}>
                Last updated{" "}
                {new Date(post.updatedAt).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            <div className="mt-8 overflow-hidden rounded-xl bg-secondary aspect-[16/9]">
              <FastImage src={post.cover} alt={post.coverAlt} variant="detail" priority />
            </div>

            <p className="mt-8 font-body text-base md:text-lg leading-relaxed text-foreground font-medium border-l-4 border-primary pl-4">
              {post.answerFirst}
            </p>

            <div className="mt-8 space-y-5 font-body text-base md:text-lg leading-relaxed text-foreground/90">
              {post.blocks.map((block, i) => (
                <BlockView key={`${block.type}-${i}`} block={block} />
              ))}
            </div>

            <section className="mt-12">
              <h2 className="font-heading text-xl md:text-2xl font-bold mb-4">FAQ</h2>
              <div className="space-y-4">
                {post.faqs.map((faq) => (
                  <div key={faq.question} className="rounded-lg border border-border p-4">
                    <h3 className="font-heading font-semibold text-base md:text-lg">
                      {faq.question}
                    </h3>
                    <p className="mt-2 text-sm md:text-base text-foreground/90 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#25D366] px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98] hover:opacity-90"
              >
                Order on WhatsApp
              </a>
              {post.categoryLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-semibold transition-transform active:scale-[0.98] hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-border bg-secondary/40">
            <div className="container max-w-3xl py-10">
              <h2 className="font-heading text-lg font-semibold mb-5">Related guides</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/blog/${item.slug}`}
                    className="rounded-lg border border-border bg-background p-4 hover:border-primary/40 transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wider text-primary font-accent font-semibold">
                      {item.category}
                    </p>
                    <p className="mt-1 font-heading font-semibold leading-snug">{item.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
