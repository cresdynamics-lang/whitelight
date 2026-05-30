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
          <span className="font-heading text-sm sm:text-base lg:text-lg font-black tracking-tight bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300 hidden md:block truncate max-w-[7.5rem] lg:max-w-[9rem] xl:max-w-none">
            {siteConfig.name}
          </span>
          {/* Mobile fancy wordmark */}
          <span className="ml-1 inline-flex md:hidden items-baseline font-heading italic text-[0.85rem] leading-none text-muted-foreground">
            <span className="text-xl leading-none mr-0.5">W</span>
            <span className="text-xs leading-none tracking-[0.12em]">hitelight</span>
          </span>
        </NavPrefetchLink>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 xl:gap-2 min-w-0 px-1">
          {siteConfig.navigation.map((item) => (
            <NavPrefetchLink
              key={item.href}
              to={item.href}
              className="relative font-body text-[11px] xl:text-xs 2xl:text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary pb-1 whitespace-nowrap tracking-tight"
            >
              {item.label}
              {isActiveLink(item.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
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
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-[10px] font-bold text-white">
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
                  ? "text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 border-l-4 border-white shadow-lg"
                  : "text-foreground hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:scale-105"
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
