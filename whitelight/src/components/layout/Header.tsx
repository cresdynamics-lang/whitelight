import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
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
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
          <img 
            src={siteConfig.logo} 
            alt={siteConfig.name} 
            className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-full ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
          />
          <span className="font-heading text-lg sm:text-xl lg:text-2xl font-black tracking-tight bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-300 hidden xs:block">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="relative font-body text-sm xl:text-lg font-semibold text-muted-foreground transition-all duration-300 hover:text-primary hover:scale-105 pb-1 whitespace-nowrap"
            >
              {item.label}
              {isActiveLink(item.href) && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:scale-110 transition-transform duration-300 border-2 border-primary/20 rounded-full hover:border-primary/40 "
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-xs font-bold text-white animate-pulse">
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
            <Link
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
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
