import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/hooks/useCatalog";
import { getCardImageUrl } from "@/lib/imageUtils";
import { useSearch } from "@/context/SearchContext";
import { useNavigate } from "react-router-dom";
import { trackSearch } from "@/lib/analytics/events";
import { formatPrice } from "@/lib/products";
import { searchProducts } from "@/lib/productBlueprint";
import { NavPrefetchLink } from "@/components/NavPrefetchLink";

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: products = [] } = useCatalog();
  const { setSearchQuery, setFilteredProducts, setIsSearching } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 120);

  const filteredProducts = useMemo(() => {
    if (debouncedQuery.length < 1 || !products.length) return [];
    return searchProducts(products, debouncedQuery).slice(0, 8);
  }, [debouncedQuery, products]);

  useEffect(() => {
    setSearchQuery(debouncedQuery);
    if (debouncedQuery.length > 0) {
      const filtered = searchProducts(products, debouncedQuery);
      setFilteredProducts(filtered);
      setIsSearching(true);
      if (filtered.length === 0) {
        trackSearch(debouncedQuery);
      }
    } else {
      setFilteredProducts([]);
      setIsSearching(false);
    }
  }, [debouncedQuery, products, setFilteredProducts, setIsSearching, setSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openExpanded = () => {
    setIsExpanded(true);
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {!isExpanded ? (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 rounded-full border border-primary/15"
          onClick={openExpanded}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      ) : null}

      <div
        className={`relative ${isExpanded ? "block" : "hidden md:block"}`}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder='Search shoes… try "trail 43"'
          className="pl-9 pr-9 h-10 bg-card border-border font-ui text-sm"
        />
        {query && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && debouncedQuery && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-auto rounded-lg border border-border bg-card shadow-lg">
          {filteredProducts.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground font-ui">
              No in-stock matches for “{debouncedQuery}”. Try a brand, sport, or size.
            </p>
          ) : (
            <ul>
              {filteredProducts.map((p) => {
                const img = getCardImageUrl(p.images?.[0]?.url);
                const sizes = (p.variants || [])
                  .filter((v) => v.inStock)
                  .map((v) => v.size)
                  .slice(0, 6)
                  .join(", ");
                return (
                  <li key={p.id}>
                    <NavPrefetchLink
                      to={`/shoes/${p.slug}`}
                      className="flex items-center gap-3 p-3 hover:bg-sage/60 transition-colors"
                      onClick={() => {
                        setIsOpen(false);
                        setIsExpanded(false);
                        setQuery("");
                        trackSearch(debouncedQuery);
                      }}
                    >
                      <img
                        src={img || "/whitelight_logo.webp"}
                        alt=""
                        className="h-12 w-12 rounded object-contain bg-paper"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground font-ui">{p.brand}</p>
                        <p className="font-heading font-semibold truncate">{p.name}</p>
                        <p className="text-xs font-ui text-muted-foreground">
                          {formatPrice(p.price)}
                          {sizes ? ` · sizes ${sizes}` : ""}
                        </p>
                      </div>
                    </NavPrefetchLink>
                  </li>
                );
              })}
            </ul>
          )}
          <button
            type="button"
            className="w-full border-t border-border p-3 text-left text-sm font-semibold text-primary font-ui"
            onClick={() => {
              navigate(`/products?q=${encodeURIComponent(debouncedQuery)}`);
              setIsOpen(false);
            }}
          >
            See all results →
          </button>
        </div>
      )}
    </div>
  );
}
