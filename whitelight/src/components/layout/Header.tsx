import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { EU_SIZES, useSizePreference } from "@/context/SizePreferenceContext";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { setIsOpen, getItemCount } = useCart();
  const { preferredSize, setPreferredSize } = useSizePreference();
  const location = useLocation();
  const itemCount = getItemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  const isActiveLink = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
      {/* Announcement bar */}
      <div
        className={cn(
          "border-b border-forest/10 bg-forest text-white text-[11px] sm:text-xs font-ui tracking-wide transition-all",
          scrolled ? "h-0 overflow-hidden opacity-0" : "py-1.5"
        )}
      >
        <div className="container flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p>
            Same-day delivery in Nairobi CBD · Pay with M-Pesa · Size help on WhatsApp
          </p>
          <div className="flex items-center gap-2.5 opacity-90">
            <span className="hidden sm:inline">
              {siteConfig.contact.address.split(",")[0]}, Nairobi CBD
            </span>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80"
              aria-label="Instagram"
            >
              IG
            </a>
            <a
              href={siteConfig.social.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80"
              aria-label="TikTok"
            >
              TT
            </a>
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80"
              aria-label="Facebook"
            >
              FB
            </a>
            <span>{siteConfig.social.instagramHandle}</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "border-b border-border/80 transition-all",
          scrolled ? "h-14" : "h-[4.25rem] lg:h-[4.5rem]"
        )}
      >
        <div className="container flex h-full items-center justify-between gap-3">
          <NavPrefetchLink to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={48}
              height={48}
              className="h-10 w-10 rounded-full ring-2 ring-primary/25 object-cover bg-white"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <div className="hidden sm:block leading-tight">
              <span className="font-heading text-lg font-semibold tracking-wide text-forest block">
                {siteConfig.name}
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-moss font-ui">
                Running · Trail · Training
              </span>
            </div>
          </NavPrefetchLink>

          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <SearchBar />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden lg:flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-ui px-1">
                Size
              </span>
              <select
                aria-label="Preferred EU size"
                className="bg-transparent text-sm font-semibold text-forest outline-none font-ui"
                value={preferredSize ?? ""}
                onChange={(e) =>
                  setPreferredSize(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Any</option>
                {EU_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:hidden">
              <SearchBar />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full border border-primary/15"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-forest text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
              <span className="sr-only">Bag</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <div className="hidden lg:block border-b border-border/80 bg-card/80">
        <div className="container flex items-center justify-between gap-2 h-11">
          <nav className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              onMouseEnter={() => setMegaOpen(true)}
              onClick={() => setMegaOpen((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-forest font-ui"
            >
              Shop <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {siteConfig.navigation.map((item) => (
              <NavPrefetchLink
                key={item.href}
                to={item.href}
                className={cn(
                  "relative px-2.5 py-1 text-xs font-medium tracking-wide font-ui whitespace-nowrap",
                  "sale" in item && item.sale
                    ? "font-semibold text-sale"
                    : isActiveLink(item.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                )}
              >
                {"live" in item && item.live && (
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-leaf align-middle" />
                )}
                {item.label}
              </NavPrefetchLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-ui">
            {siteConfig.secondaryNav.slice(0, 3).map((item) => (
              <NavPrefetchLink
                key={item.href}
                to={item.href}
                className="hover:text-primary whitespace-nowrap"
              >
                {item.label}
              </NavPrefetchLink>
            ))}
          </div>
        </div>

        {megaOpen && (
          <div
            className="border-t border-border bg-card shadow-lg"
            onMouseLeave={() => setMegaOpen(false)}
          >
            <div className="container grid grid-cols-3 gap-8 py-6">
              <div>
                <p className="font-heading text-lg font-semibold text-forest mb-3">
                  Shop by purpose
                </p>
                <ul className="space-y-2 text-sm font-ui">
                  {siteConfig.purposes.map((p) => (
                    <li key={p.id}>
                      <NavPrefetchLink
                        to={p.href}
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setMegaOpen(false)}
                      >
                        {p.label}
                      </NavPrefetchLink>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-forest mb-3">
                  Shop by brand
                </p>
                <ul className="grid grid-cols-2 gap-2 text-sm font-ui">
                  {siteConfig.brands.map((b) => (
                    <li key={b}>
                      <NavPrefetchLink
                        to={`/brand/${b.toLowerCase()}`}
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setMegaOpen(false)}
                      >
                        {b}
                      </NavPrefetchLink>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-heading text-lg font-semibold text-forest mb-3">
                  Shop by size
                </p>
                <div className="flex flex-wrap gap-2">
                  {EU_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setPreferredSize(s);
                        setMegaOpen(false);
                      }}
                      className={cn(
                        "h-9 w-11 rounded-md border text-sm font-semibold font-ui",
                        preferredSize === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/40"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground font-ui">
                  We remember your size so every page shows pairs you can buy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden border-b border-border bg-card overflow-hidden transition-all",
          isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container py-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {EU_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPreferredSize(s)}
                className={cn(
                  "h-9 w-11 rounded-md border text-sm font-semibold",
                  preferredSize === s
                    ? "border-primary bg-primary text-white"
                    : "border-border"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <nav className="flex flex-col gap-1">
            {siteConfig.navigation.map((item) => (
              <NavPrefetchLink
                key={item.href}
                to={item.href}
                className={cn(
                  "py-2 text-sm font-medium",
                  "sale" in item && item.sale ? "text-sale font-semibold" : "text-foreground"
                )}
              >
                {item.label}
              </NavPrefetchLink>
            ))}
            {siteConfig.secondaryNav.map((item) => (
              <NavPrefetchLink
                key={item.href}
                to={item.href}
                className="py-2 text-sm text-muted-foreground"
              >
                {item.label}
              </NavPrefetchLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
