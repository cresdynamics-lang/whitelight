import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";
import { FastImage } from "@/components/ui/FastImage";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";

/** Homepage teaser for store updates / blog */
export function BlogUpdatesSection() {
  const posts = blogPosts.slice(0, 3);

  return (
    <section className="border-t border-border bg-gradient-to-b from-background via-secondary/35 to-background">
      <div className="container py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="font-accent text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-2">
              Updates
            </p>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Guides & store news
            </h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground font-body max-w-lg">
              Fit advice, delivery notes, and what&apos;s new on the shelves.
            </p>
          </div>
          <NavPrefetchLink
            to="/blog"
            className="shrink-0 text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            View all updates →
          </NavPrefetchLink>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {posts.map((post) => (
            <article key={post.slug} className="flex flex-col">
              <Link
                to={`/blog/${post.slug}`}
                className="block overflow-hidden rounded-lg bg-secondary aspect-[16/10]"
              >
                <FastImage src={post.cover} alt={post.coverAlt} variant="card" />
              </Link>
              <p className="mt-3 text-[11px] uppercase tracking-wider font-accent text-muted-foreground">
                {post.category}
              </p>
              <h3 className="mt-1 font-heading text-base font-semibold leading-snug">
                <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 font-body">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
