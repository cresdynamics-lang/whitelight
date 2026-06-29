import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminProductsService } from "@/services/adminSupabaseProducts";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  buildBrandInventory,
  filterProductsByBrandKey,
  formatAdminDate,
} from "@/lib/adminBrandInventory";

const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const brandFilter = searchParams.get("brand") || "all";
  const saleOnly = searchParams.get("sale") === "1";

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingSaleId, setTogglingSaleId] = useState<string | null>(null);

  const brandInventory = useMemo(() => buildBrandInventory(products), [products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const data = await adminProductsService.getAll();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = filterProductsByBrandKey(products, brandFilter);
    if (saleOnly) {
      list = list.filter((p) => p.isOnOffer);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, brandFilter, saleOnly, searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;

    const success = await adminProductsService.delete(deleteId);
    if (success) {
      toast.success("Product deleted successfully");
      fetchProducts();
    } else {
      toast.error("Failed to delete product");
    }
    setDeleteId(null);
  };

  const handleToggleSale = async (product: Product, checked: boolean) => {
    setTogglingSaleId(product.id);
    try {
      await adminProductsService.toggleSale(product.id, checked);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isOnOffer: checked } : p))
      );
      toast.success(checked ? "Added to Sale category" : "Removed from Sale category");
    } catch {
      toast.error("Failed to update sale status");
    } finally {
      setTogglingSaleId(null);
    }
  };

  const setBrandFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    if (key === "all") next.delete("brand");
    else next.set("brand", key);
    setSearchParams(next);
  };

  const setSaleFilter = (on: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (on) next.set("sale", "1");
    else next.delete("sale");
    setSearchParams(next);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      running: "bg-blue-500/10 text-blue-500",
      trail: "bg-green-500/10 text-green-500",
      gym: "bg-orange-500/10 text-orange-500",
      training: "bg-cyan-500/10 text-cyan-600",
      basketball: "bg-purple-500/10 text-purple-500",
      tennis: "bg-lime-500/10 text-lime-700",
      accessories: "bg-pink-500/10 text-pink-500",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-1 text-muted-foreground">
            Filter by brand, manage Sale items, and track recent updates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Brand filters */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setBrandFilter("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            brandFilter === "all"
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          All ({products.length})
        </button>
        {brandInventory.map((group) => (
          <button
            key={group.key}
            type="button"
            onClick={() => setBrandFilter(group.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              brandFilter === group.key
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {group.label} ({group.total})
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSaleFilter(!saleOnly)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            saleOnly
              ? "bg-red-600 text-white"
              : "border border-red-200 text-red-600 hover:bg-red-50"
          )}
        >
          Sale only ({products.filter((p) => p.isOnOffer).length})
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 whitespace-nowrap">Image</TableHead>
                <TableHead className="min-w-[180px] whitespace-nowrap">Name</TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap">Brand</TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap">Category</TableHead>
                <TableHead className="min-w-[90px] whitespace-nowrap text-center">Sale</TableHead>
                <TableHead className="min-w-[100px] whitespace-nowrap text-right">Price</TableHead>
                <TableHead className="min-w-[130px] whitespace-nowrap">Updated</TableHead>
                <TableHead className="min-w-[90px] whitespace-nowrap text-center">Status</TableHead>
                <TableHead className="w-24 whitespace-nowrap text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="whitespace-nowrap">
                      <img
                        src={product.images[0]?.url}
                        alt={product.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{product.brand}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary" className={getCategoryColor(product.category)}>
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Checkbox
                        checked={Boolean(product.isOnOffer)}
                        disabled={togglingSaleId === product.id}
                        onCheckedChange={(checked) =>
                          handleToggleSale(product, checked === true)
                        }
                        aria-label={`Add ${product.name} to Sale category`}
                        className="border-red-300 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      KSh {product.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatAdminDate(product.updatedAt || product.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {product.isNew && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                        {product.isBestSeller && (
                          <Badge variant="secondary" className="text-xs">
                            Best
                          </Badge>
                        )}
                        {product.isOnOffer && (
                          <Badge className="bg-red-600 text-xs hover:bg-red-600">Sale</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/products/edit/${product.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
