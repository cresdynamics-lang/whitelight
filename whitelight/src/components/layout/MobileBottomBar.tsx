import { Home, LayoutGrid, Tag, ShoppingBag, Shirt } from "lucide-react";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";
import { useCart } from "@/context/CartContext";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "New In", href: "/new", icon: Shirt },
  { label: "Shop", href: "/products", icon: LayoutGrid },
  { label: "Sale", href: "/sale", icon: Tag, sale: true },
];

export function MobileBottomBar() {
  const { setIsOpen, getItemCount } = useCart();
  const location = useLocation();
  const count = getItemCount();

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 h-14">
        {items.map(({ label, href, icon: Icon, sale }) => {
          const active =
            href === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(href);
          return (
            <NavPrefetchLink
              key={href}
              to={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                sale ? "text-sale" : active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavPrefetchLink>
          );
        })}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground"
        >
          <ShoppingBag className="h-5 w-5" />
          Bag
          {count > 0 && (
            <span className="absolute top-1 right-[22%] flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-[9px] font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
