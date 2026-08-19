import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { getBlogPost, blogPosts } from "@/data/blogPosts";
import { FastImage } from "@/components/ui/FastImage";

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

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={`${post.title} | Whitelight Store`}
        description={post.excerpt}
        keywords={`${post.category}, whitelight store, sneakers nairobi`}
        canonical={`https://whitelightstore.co.ke/blog/${post.slug}`}
      />
      <Header />
      <main className="flex-1">
        <article>
          <div className="container max-w-3xl py-8 md:py-12">
            <Link
              to="/blog"
              className="inline-flex text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              ← All updates
            </Link>
            <p className="font-accent text-xs uppercase tracking-[0.16em] text-primary font-semibold mb-3">
              {post.category}
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-[2.15rem] font-bold leading-tight tracking-tight">
              {post.title}
            </h1>
            <time
              dateTime={post.date}
              className="mt-3 block text-sm text-muted-foreground font-body"
            >
              {new Date(post.date).toLocaleDateString("en-KE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>

            <div className="mt-8 overflow-hidden rounded-xl bg-secondary aspect-[16/9]">
              <FastImage src={post.cover} alt={post.coverAlt} variant="detail" priority />
            </div>

            <div className="mt-8 space-y-5 font-body text-base md:text-lg leading-relaxed text-foreground/90">
              {post.body.map((para) => (
                <p key={para.slice(0, 48)}>{para}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] hover:bg-primary/90"
              >
                Shop all shoes
              </Link>
              <Link
                to="/contact"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-semibold transition-transform active:scale-[0.98] hover:bg-secondary"
              >
                Ask us on WhatsApp
              </Link>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-border bg-secondary/40">
            <div className="container max-w-3xl py-10">
              <h2 className="font-heading text-lg font-semibold mb-5">More updates</h2>
              <div className="grid gap-4 sm:grid-cols-2">
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
