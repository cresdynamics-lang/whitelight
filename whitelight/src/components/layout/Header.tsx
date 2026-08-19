import { useState } from "react";
import { useLocation } from "react-router-dom";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { ShoppingCart, Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { setIsOpen, getItemCount } = useCart();
  const location = useLocation();
  const itemCount = getItemCount();

  const isActiveLink = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-[4.25rem] lg:h-[4.5rem] items-center justify-between gap-3 lg:gap-4">
        {/* Logo */}
        <NavPrefetchLink to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0">
          <img
            src={siteConfig.logo}
            alt={siteConfig.name}
            width={48}
            height={48}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200 object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <span className="font-heading text-sm sm:text-base lg:text-[1.05rem] font-bold uppercase tracking-[0.06em] text-foreground hidden lg:block truncate max-w-[8rem] xl:max-w-[10rem] 2xl:max-w-none">
            {siteConfig.name}
          </span>
          {/* Mobile & tablet wordmark */}
          <span className="mobile-wordmark lg:hidden">
            <span className="mobile-wordmark-light">whitelight</span>
            <span className="mobile-wordmark-store">store</span>
          </span>
        </NavPrefetchLink>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1.5 xl:gap-2.5 2xl:gap-3 min-w-0 px-2">
          {siteConfig.navigation.map((item) => (
            <NavPrefetchLink
              key={item.href}
              to={item.href}
              className={cn(
                "relative px-1.5 xl:px-2 py-1 font-body text-[11px] xl:text-xs 2xl:text-[0.8125rem] font-medium whitespace-nowrap tracking-wide transition-colors duration-150",
                item.href === "/sale"
                  ? "font-semibold text-red-600 hover:text-red-700"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
              {isActiveLink(item.href) && (
                <span className="absolute -bottom-0.5 left-1.5 right-1.5 xl:left-2 xl:right-2 h-0.5 bg-primary rounded-full" />
              )}
            </NavPrefetchLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <SearchBar />
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 lg:h-9 lg:w-9 border border-primary/15 rounded-full hover:border-primary/35 active:scale-95 transition-transform duration-150"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="h-4 w-4 lg:h-[1.125rem] lg:w-[1.125rem]" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                {itemCount}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </Button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden active:scale-95 transition-transform duration-150"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height] duration-200 ease-out bg-background",
          isMenuOpen ? "max-h-[min(85vh,720px)] border-b" : "max-h-0"
        )}
      >
        <nav className="container py-3 space-y-0.5 max-h-[min(80vh,680px)] overflow-y-auto">
          {siteConfig.navigation.map((item) => (
            <NavPrefetchLink
              key={item.href}
              to={item.href}
              className={cn(
                "block py-3 px-4 font-body text-[0.9375rem] font-semibold rounded-lg transition-colors duration-150",
                isActiveLink(item.href)
                  ? item.href === "/sale"
                    ? "text-white bg-red-600"
                    : "text-background bg-foreground"
                  : item.href === "/sale"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-foreground hover:bg-muted"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </NavPrefetchLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
