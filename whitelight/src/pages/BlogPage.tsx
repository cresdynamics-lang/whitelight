import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { blogPosts } from "@/data/blogPosts";
import { FastImage } from "@/components/ui/FastImage";

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Running Shoe Guides Nairobi | Whitelight Blog"
        description="Guides on best running shoes in Nairobi, Luthuli Avenue shopping, Kenya prices, trail shoes, gym shoes and sizing from Whitelight Store."
        keywords="best running shoes Nairobi, running shoes Nairobi CBD, trail running shoes Kenya, gym shoes Kenya, running shoe size guide"
        canonical="https://whitelightstore.co.ke/blog"
      />
      <Header />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-secondary/60 to-background">
          <div className="container py-10 md:py-14">
            <p className="font-accent text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
              Guides
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight max-w-2xl">
              Running shoe guides for Nairobi
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground font-body text-base md:text-lg leading-relaxed">
              SEO-backed buying guides from Whitelight Store on Luthuli Avenue — fit, prices, trail vs road, and CBD pickup.
            </p>
          </div>
        </section>

        <section className="container py-10 md:py-14">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <article key={post.slug} className="group flex flex-col">
                <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-lg bg-secondary aspect-[16/10]">
                  <FastImage
                    src={post.cover}
                    alt={post.coverAlt}
                    variant="card"
                    className="transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
                <div className="mt-4 flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-accent uppercase tracking-wider text-muted-foreground">
                    <span className="text-primary font-semibold">{post.category}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <h2 className="font-heading text-lg font-semibold leading-snug">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed font-body flex-1">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-sm font-semibold text-primary hover:underline underline-offset-4 w-fit"
                  >
                    Read update →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
