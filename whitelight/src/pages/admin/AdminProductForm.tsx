import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productService } from "@/services/productService";
import { Product, ProductCategory } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, Upload, X, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "running", label: "Running" },
  { value: "trail", label: "Trail" },
  { value: "gym", label: "Gym" },
  { value: "basketball", label: "Basketball" },
];

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{id: string, url: string}>>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "running" as ProductCategory,
    price: "",
    originalPrice: "",
    description: "",
    imageUrl: "",
    tags: "",
    isNew: false,
    isBestSeller: false,
    isOnOffer: false,
  });

  const [variants, setVariants] = useState<Array<{size: number, inStock: boolean, stockQuantity: number}>>([]);

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      productService.getById(id).then((product) => {
        if (product) {
          console.log('📦 Product loaded in form:', JSON.stringify(product, null, 2));
          console.log('🔢 Variants received:', product.variants);
          
          setFormData({
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: String(product.price),
            originalPrice: product.originalPrice ? String(product.originalPrice) : "",
            description: product.description,
            imageUrl: product.images[0]?.url || "",
            tags: product.tags.join(", "),
            isNew: product.isNew || false,
            isBestSeller: product.isBestSeller || false,
            isOnOffer: product.isOnOffer || false,
          });
          
          // Load existing images
          setExistingImages(product.images.map(img => ({ id: img.id, url: img.url })));
          
          // Load existing variants from database
          if (product.variants && product.variants.length > 0) {
            const mappedVariants = product.variants.map(v => {
              console.log('🔄 Mapping variant:', v);
              return {
                size: v.size,
                inStock: v.inStock,
                stockQuantity: v.stockQuantity || 0
              };
            });
            console.log('✅ Mapped variants:', mappedVariants);
            setVariants(mappedVariants);
          }
        }
        setIsLoading(false);
      });
    }
  }, [id, isEditing]);

  const addVariant = () => {
    setVariants([...variants, { size: 40, inStock: true, stockQuantity: 10 }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setSelectedFiles(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeExistingImage = (imageId: string) => {
    setImagesToDelete([...imagesToDelete, imageId]);
    setExistingImages(existingImages.filter(img => img.id !== imageId));
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the removed URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const productData: Omit<Product, "id" | "createdAt"> = {
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
      brand: formData.brand,
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      description: formData.description,
      images: formData.imageUrl ? [
        {
          id: "img-1",
          url: formData.imageUrl,
          alt: formData.name,
        },
      ] : [],
      variants: variants.map((v, index) => ({
        id: `v-${v.size}`,
        size: v.size,
        inStock: v.inStock,
        stockQuantity: v.stockQuantity
      })),
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isNew: formData.isNew,
      isBestSeller: formData.isBestSeller,
      isOnOffer: formData.isOnOffer,
    };

    try {
      if (isEditing) {
        await productService.update(id, productData, selectedFiles, imagesToDelete);
        toast.success("Product updated successfully");
      } else {
        await productService.create(productData, selectedFiles);
        toast.success("Product created successfully");
      }
      navigate("/admin/products");
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save product");
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update product details" : "Create a new product"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nike Pegasus 40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Nike"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value as ProductCategory })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="running, performance, cushioned"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (KSh) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="5800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (KSh)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: e.target.value })
                    }
                    placeholder="6500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageFiles">Upload Images (Max 5)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="imageFiles"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="imageFiles"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload images or drag and drop
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG, JPEG up to 10MB each
                    </span>
                  </label>
                </div>
              </div>

              {/* Existing Images (for edit mode) */}
              {isEditing && existingImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt="Product"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeExistingImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Previews */}
              {previewUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL Preview */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label>URL Preview</Label>
                  <img
                    src={formData.imageUrl}
                    alt="URL Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm">
                Size & Stock Management
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              {variants.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  <p>No sizes added yet. Click "Add" to start.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex flex-col gap-2 p-2 border rounded text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Label className="text-xs w-8">Size:</Label>
                          <Input
                            type="number"
                            min="35"
                            max="50"
                            value={variant.size}
                            onChange={(e) => {
                              const newVariants = [...variants];
                              newVariants[index].size = parseInt(e.target.value) || 40;
                              setVariants(newVariants);
                            }}
                            className="w-16 h-6 text-xs px-2"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVariant(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs w-8">Stock:</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stockQuantity}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].stockQuantity = parseInt(e.target.value) || 0;
                            newVariants[index].inStock = newVariants[index].stockQuantity > 0;
                            setVariants(newVariants);
                          }}
                          className="w-16 h-6 text-xs px-2"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={variant.inStock}
                          onCheckedChange={(checked) => {
                            const newVariants = [...variants];
                            newVariants[index].inStock = checked;
                            if (!checked) {
                              newVariants[index].stockQuantity = 0;
                            } else if (newVariants[index].stockQuantity === 0) {
                              newVariants[index].stockQuantity = 10;
                            }
                            setVariants(newVariants);
                          }}
                          className="scale-75"
                        />
                        <Label className="text-xs">
                          {variant.inStock ? 'Available' : 'Out of Stock'}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="isNew" className="text-xs">Mark as New</Label>
                <Switch
                  id="isNew"
                  checked={formData.isNew}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isNew: checked })
                  }
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isBestSeller" className="text-xs">Best Seller</Label>
                <Switch
                  id="isBestSeller"
                  checked={formData.isBestSeller}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isBestSeller: checked })
                  }
                  className="scale-75"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isOnOffer" className="text-xs">On Offer</Label>
                <Switch
                  id="isOnOffer"
                  checked={formData.isOnOffer}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isOnOffer: checked })
                  }
                  className="scale-75"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-8 text-xs" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1 h-3 w-3" />
                {isEditing ? "Update" : "Create"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
