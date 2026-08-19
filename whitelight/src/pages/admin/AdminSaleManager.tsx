import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminProductsService } from "@/services/adminProducts";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Search,
  Plus,
  Minus,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/config/site";

const META_CSV_URL = "https://whitelightstore.co.ke/feeds/meta.csv";

const AdminSaleManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    const data = await adminProductsService.getAll();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const q = searchTerm.trim().toLowerCase();

  const onSale = useMemo(() => {
    let list = products.filter((p) => p.isOnOffer);
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, q]);

  const notOnSale = useMemo(() => {
    let list = products.filter((p) => !p.isOnOffer);
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, q]);

  const handleToggle = async (product: Product, addToSale: boolean) => {
    setBusyId(product.id);
    try {
      await adminProductsService.toggleSale(product.id, addToSale);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isOnOffer: addToSale } : p
        )
      );
      toast.success(
        addToSale
          ? `"${product.name}" added to Sale`
          : `"${product.name}" removed from Sale`
      );
    } catch {
      toast.error("Failed to update sale status");
    } finally {
      setBusyId(null);
    }
  };

  const copyFeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(META_CSV_URL);
      setCopied(true);
      toast.success("Meta CSV feed URL copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy URL");
    }
  };

  const ProductRow = ({
    product,
    action,
  }: {
    product: Product;
    action: "add" | "remove";
  }) => (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
      <img
        src={product.images[0]?.url || "/whitelight_logo.webp"}
        alt={product.name}
        className="h-14 w-14 shrink-0 rounded-md object-cover bg-muted"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          {product.brand} · {product.category}
        </p>
        <p className="mt-0.5 text-sm font-semibold">
          {formatPrice(product.price, siteConfig.currency)}
          {product.originalPrice != null &&
            product.originalPrice > product.price && (
              <span className="ml-2 text-xs font-normal text-muted-foreground line-through">
                {formatPrice(product.originalPrice, siteConfig.currency)}
              </span>
            )}
        </p>
      </div>
      <Button
        size="sm"
        variant={action === "add" ? "default" : "outline"}
        className={cn(
          "shrink-0",
          action === "remove" && "border-red-200 text-red-600 hover:bg-red-50"
        )}
        disabled={busyId === product.id}
        onClick={() => handleToggle(product, action === "add")}
      >
        {action === "add" ? (
          <>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </>
        ) : (
          <>
            <Minus className="mr-1 h-4 w-4" />
            Remove
          </>
        )}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sale Manager</h1>
          <p className="mt-1 text-muted-foreground">
            Choose which products show on the Sale page and in the Meta catalog
            feed. Changes apply immediately.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProducts}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-red-600 hover:bg-red-600">Meta catalog CSV</Badge>
          <span className="text-sm text-muted-foreground">
            Paste this URL in Commerce Manager → Use a URL
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 break-all rounded-md border bg-background px-3 py-2 text-xs sm:text-sm">
            {META_CSV_URL}
          </code>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyFeedUrl}>
              {copied ? (
                <Check className="mr-1 h-4 w-4" />
              ) : (
                <Copy className="mr-1 h-4 w-4" />
              )}
              Copy
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={META_CSV_URL} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-4 w-4" />
                Open
              </a>
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Feed includes only products marked On Sale ({products.filter((p) => p.isOnOffer).length}{" "}
          now).{" "}
          <Link to="/sale" className="underline underline-offset-2 hover:text-foreground">
            View Sale page
          </Link>
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, brand, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">On Sale</h2>
              <Badge variant="secondary">{onSale.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              These appear on /sale and in the Meta CSV feed.
            </p>
            <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
              {onSale.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No products on sale. Add from the list on the right.
                </div>
              ) : (
                onSale.map((product) => (
                  <ProductRow key={product.id} product={product} action="remove" />
                ))
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Not on Sale</h2>
              <Badge variant="outline">{notOnSale.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Tap Add to put a product on the Sale page and Meta feed.
            </p>
            <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
              {notOnSale.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  {q ? "No matches." : "All products are already on sale."}
                </div>
              ) : (
                notOnSale.map((product) => (
                  <ProductRow key={product.id} product={product} action="add" />
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminSaleManager;
