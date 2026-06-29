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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-16 lg:h-[4.25rem] items-center justify-between gap-2 lg:gap-3">
        {/* Logo */}
        <NavPrefetchLink to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0 min-w-0">
          <img
            src={siteConfig.logo}
            alt={siteConfig.name}
            width={48}
            height={48}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300 object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <span className="font-heading text-sm sm:text-base lg:text-lg font-black uppercase tracking-tight text-foreground hidden lg:block truncate max-w-[7.5rem] xl:max-w-[9rem] 2xl:max-w-none">
            {siteConfig.name}
          </span>
          {/* Mobile & tablet wordmark */}
          <span className="mobile-wordmark lg:hidden">
            <span className="mobile-wordmark-light">whitelight</span>
            <span className="mobile-wordmark-store">store</span>
          </span>
        </NavPrefetchLink>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 xl:gap-2 min-w-0 px-1">
          {siteConfig.navigation.map((item) => (
            <NavPrefetchLink
              key={item.href}
              to={item.href}
              className={cn(
                "relative font-body text-[11px] xl:text-xs 2xl:text-sm font-medium pb-1 whitespace-nowrap tracking-tight transition-colors duration-200",
                item.href === "/sale"
                  ? "font-semibold text-red-600 hover:text-red-700"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {item.label}
              {isActiveLink(item.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
              )}
            </NavPrefetchLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <SearchBar />
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 lg:h-8 lg:w-8 border-2 border-primary/20 rounded-full hover:border-primary/40"
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
            className="lg:hidden hover:scale-110 transition-transform duration-300"
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
          "lg:hidden overflow-hidden transition-all duration-300 bg-background",
          isMenuOpen ? "max-h-screen border-b" : "max-h-0"
        )}
      >
        <nav className="container py-4 space-y-1">
          {siteConfig.navigation.map((item) => (
            <NavPrefetchLink
              key={item.href}
              to={item.href}
              className={cn(
                "block py-3 px-4 font-body text-base font-semibold rounded-lg transition-all duration-300",
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
