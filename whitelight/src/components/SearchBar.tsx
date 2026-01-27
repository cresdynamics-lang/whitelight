import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useSearch } from "@/context/SearchContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

// Debounce hook for smooth filtering
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: productsResponse, isLoading } = useProducts();
  const products = productsResponse?.products || [];
  const { setSearchQuery, setFilteredProducts, setIsSearching } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Debounce search query for smooth filtering
  const debouncedQuery = useDebounce(query, 150);

  // Safe filtering with array check and memoization
  const filteredProducts = useMemo(() => {
    if (debouncedQuery.length > 0 && Array.isArray(products) && products.length > 0) {
      return products.filter(product =>
        product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  }, [debouncedQuery, products]);

  // Update global search context when debounced query changes
  useEffect(() => {
    setSearchQuery(debouncedQuery);
    if (Array.isArray(products)) {
      if (debouncedQuery.length > 0) {
        const filtered = products.filter(product =>
          product.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
        setIsSearching(true);
      } else {
        setFilteredProducts([]);
        setIsSearching(false);
      }
    }
  }, [debouncedQuery, products]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    setSearchQuery("");
    setFilteredProducts([]);
    setIsSearching(false);
  };

  const handleProductClick = (productSlug: string) => {
    // Don't clear search when clicking product, keep filtering active
    setIsOpen(false);
    navigate(`/product/${productSlug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Just close dropdown on submit, keep filtering on current page
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-56 sm:w-full sm:max-w-sm ml-2 sm:ml-0">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10 pr-10"
            onFocus={() => query.length > 0 && setIsOpen(true)}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product.slug)}
              className="w-full flex items-center gap-3 p-3 hover:bg-secondary transition-colors border-b last:border-b-0 text-left"
            >
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="w-10 h-10 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
              </div>
              <p className="text-sm font-medium">KSh {product.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length > 0 && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 p-4 text-center text-muted-foreground text-sm">
          No products found for "{query}"
        </div>
      )}
    </div>
  );
}