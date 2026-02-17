import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productService } from "@/services/productService";
import { apiService } from "@/services/apiService";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";

const MAX_PRODUCT_IMAGES = 10;

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "running", label: "Running" },
  { value: "trail", label: "Trail" },
  { value: "gym", label: "Gym" },
  { value: "basketball", label: "Basketball" },
  { value: "accessories", label: "Accessories" },
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
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]); // URLs of images uploaded to server
  const [uploadingImages, setUploadingImages] = useState(false); // Track if images are being uploaded
  const [uploadProgress, setUploadProgress] = useState<Record<number, 'uploading' | 'success' | 'error'>>({}); // Track individual image upload status

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "running" as ProductCategory, // Primary category (for backward compatibility)
    categories: [] as ProductCategory[], // Multiple categories
    price: "",
    originalPrice: "",
    description: "",
    imageUrl: "",
    tags: "",
    isNew: false,
    isBestSeller: false,
    isOnOffer: false,
  });

  // Available shoe sizes (36-45)
  const AVAILABLE_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
  
  // Track which sizes are selected (checked = available/in stock)
  const [selectedSizes, setSelectedSizes] = useState<Set<number>>(new Set());

  // Clothing sizes for accessories with correct mapping
  const CLOTHING_SIZES = [
    { label: 'XS', value: 1 },
    { label: '2XL', value: 2 },
    { label: '3XL', value: 3 },
    { label: '4XL', value: 4 },
    { label: '5XL', value: 5 },
    { label: 'L', value: 6 },
    { label: 'XL', value: 7 },
    { label: 'M', value: 8 },
    { label: 'S', value: 9 }
  ];
  
  const isAccessoryCategory = formData.category === 'accessories';

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
            categories: product.categories || [product.category], // Use categories array or fallback to single category
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
          
          // Load existing variants from database and populate selected sizes
          if (product.variants && product.variants.length > 0) {
            // For non-accessory products, check sizes that are in stock
            const productCategory = product.category || product.categories?.[0];
            if (productCategory !== 'accessories') {
              const inStockSizes = product.variants
                .filter(v => v.inStock && typeof v.size === 'number' && AVAILABLE_SIZES.includes(v.size))
                .map(v => v.size as number);
              setSelectedSizes(new Set(inStockSizes));
            }
            // For accessories, we'll handle separately if needed in the future
          }
        }
        setIsLoading(false);
      });
    }
  }, [id, isEditing]);

  const toggleSize = (size: number) => {
    const newSelectedSizes = new Set(selectedSizes);
    if (newSelectedSizes.has(size)) {
      newSelectedSizes.delete(size);
    } else {
      newSelectedSizes.add(size);
    }
    setSelectedSizes(newSelectedSizes);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentTotal = existingImages.length - imagesToDelete.length + uploadedImageUrls.length;
    const spaceLeft = MAX_PRODUCT_IMAGES - currentTotal;
    if (spaceLeft <= 0) {
      toast.error(`Maximum ${MAX_PRODUCT_IMAGES} images total. Remove some to add more.`);
      e.target.value = "";
      return;
    }
    const toAdd = files.slice(0, spaceLeft);
    if (files.length > spaceLeft) {
      toast.info(`Adding ${toAdd.length} of ${files.length} images (max ${MAX_PRODUCT_IMAGES} total).`);
    }

    // Create preview URLs immediately
    const previewUrlsForNewFiles = toAdd.map(file => URL.createObjectURL(file));
    const startIndex = previewUrls.length;
    setPreviewUrls(prev => [...prev, ...previewUrlsForNewFiles]);

    // Initialize upload progress for all new images
    const initialProgress: Record<number, 'uploading' | 'success' | 'error'> = {};
    toAdd.forEach((_, index) => {
      initialProgress[startIndex + index] = 'uploading';
    });
    setUploadProgress(prev => ({ ...prev, ...initialProgress }));

    // Upload images one by one sequentially
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    const failedIndices: number[] = [];

    for (let i = 0; i < toAdd.length; i++) {
      const file = toAdd[i];
      const currentIndex = startIndex + i;
      
      try {
        toast.loading(`Uploading image ${i + 1}/${toAdd.length}: ${file.name}...`, { 
          id: `image-upload-${currentIndex}` 
        });
        
        const response = await apiService.uploadSingleImage(file);
        
        if (response.success && response.data?.images && response.data.images.length > 0) {
          const imageUrl = response.data.images[0].url;
          uploadedUrls.push(imageUrl);
          
          // Update progress for this image
          setUploadProgress(prev => ({
            ...prev,
            [currentIndex]: 'success'
          }));
          
          // Add URL to uploaded URLs immediately
          setUploadedImageUrls(prev => [...prev, imageUrl]);
          
          toast.success(`Image ${i + 1}/${toAdd.length} uploaded`, { 
            id: `image-upload-${currentIndex}`,
            duration: 2000
          });
        } else {
          throw new Error(response.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error(`Image ${i + 1} upload error:`, error);
        failedIndices.push(currentIndex);
        
        // Update progress for this image
        setUploadProgress(prev => ({
          ...prev,
          [currentIndex]: 'error'
        }));
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
        
        // If it's an authentication error, stop all uploads and show login message
        if (errorMessage.includes('Session expired') || errorMessage.includes('Authentication required')) {
          toast.error('Session expired. Please log in again.', { 
            id: `image-upload-auth-error`,
            duration: 5000
          });
          // Stop further uploads
          break;
        }
        
        toast.error(`Image ${i + 1}/${toAdd.length} failed: ${errorMessage}`, { 
          id: `image-upload-${currentIndex}`,
          duration: 3000
        });
      }
    }

    // Clean up failed uploads
    if (failedIndices.length > 0) {
      failedIndices.forEach(index => {
        URL.revokeObjectURL(previewUrlsForNewFiles[index - startIndex]);
      });
      setPreviewUrls(prev => prev.filter((_, idx) => !failedIndices.includes(idx)));
    }

    // Final summary
    if (uploadedUrls.length > 0) {
      toast.success(`Successfully uploaded ${uploadedUrls.length}/${toAdd.length} image${uploadedUrls.length === 1 ? "" : "s"}`, { 
        id: "image-upload-summary",
        duration: 3000
      });
    }

    setUploadingImages(false);
    e.target.value = "";
  };

  const removeExistingImage = (imageId: string) => {
    setImagesToDelete([...imagesToDelete, imageId]);
    setExistingImages(existingImages.filter(img => img.id !== imageId));
  };

  const removeFile = (index: number) => {
    // Remove from uploaded URLs
    const newUploadedUrls = uploadedImageUrls.filter((_, i) => i !== index);
    setUploadedImageUrls(newUploadedUrls);
    
    // Remove preview URL
    const newUrls = previewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    toast.loading("Saving product...", { id: "product-save" });

    // Validate at least one category is selected
    if (formData.categories.length === 0) {
      toast.error("Please select at least one category");
      setIsSaving(false);
      return;
    }

    // Validate at least one size is selected (for non-accessory products)
    if (!isAccessoryCategory && selectedSizes.size === 0) {
      toast.error("Please select at least one size");
      setIsSaving(false);
      return;
    }

    // Combine uploaded URLs with any URL from imageUrl field
    const allImageUrls = [...uploadedImageUrls];
    if (formData.imageUrl) {
      allImageUrls.push(formData.imageUrl);
    }

    const productData: Omit<Product, "id" | "createdAt"> = {
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
      brand: formData.brand,
      category: formData.categories[0] || formData.category, // Primary category (first selected)
      categories: formData.categories, // Multiple categories
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      description: formData.description,
      images: allImageUrls.map((url, index) => ({
        id: `img-${index + 1}`,
        url: url,
        alt: formData.name,
      })),
      variants: isAccessoryCategory 
        ? [] // Accessories will use old system if needed
        : Array.from(selectedSizes).map(size => ({
            id: `v-${size}`,
            size: size,
            inStock: true,
            stockQuantity: 10 // Default stock quantity for checked sizes
          })),
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isNew: formData.isNew,
      isBestSeller: formData.isBestSeller,
      isOnOffer: formData.isOnOffer,
    };

    try {
      if (isEditing) {
        // For updates, still send files if any remain, but prioritize URLs
        await productService.update(id, productData, selectedFiles.length > 0 ? selectedFiles : undefined, imagesToDelete);
        toast.success("Product updated successfully", { id: "product-save" });
      } else {
        // For create, send image URLs instead of files
        await productService.create(productData, undefined, allImageUrls);
        toast.success("Product created successfully", { id: "product-save" });
      }
      navigate("/admin/products");
    } catch (error) {
      console.error('Save error:', error);
      const message = error instanceof Error ? error.message : 'Failed to save product';
      toast.error(message, { id: "product-save" });
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
                  <Label>Categories * (Select one or more)</Label>
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                    {CATEGORIES.map((cat) => {
                      const isChecked = formData.categories.includes(cat.value);
                      return (
                        <div key={cat.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${cat.value}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                // Add category
                                const newCategories = [...formData.categories, cat.value];
                                setFormData({ 
                                  ...formData, 
                                  categories: newCategories,
                                  category: newCategories[0] || formData.category // Set primary category
                                });
                              } else {
                                // Remove category
                                const newCategories = formData.categories.filter(c => c !== cat.value);
                                setFormData({ 
                                  ...formData, 
                                  categories: newCategories,
                                  category: newCategories[0] || formData.category // Set primary category
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`category-${cat.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {cat.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {formData.categories.length === 0 && (
                    <p className="text-xs text-destructive">Please select at least one category</p>
                  )}
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
              <CardTitle className="flex items-center justify-between">
                Media
                <span className="text-sm font-normal text-muted-foreground">
                  {(existingImages.length - imagesToDelete.length) + uploadedImageUrls.length} / {MAX_PRODUCT_IMAGES} images
                  {uploadingImages && <span className="ml-2 text-primary">(Uploading...)</span>}
                </span>
              </CardTitle>
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
                <Label htmlFor="imageFiles">Upload Images (max 10)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors">
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
                      Click to upload or drag and drop · Max 10 images
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG, JPEG up to 10MB each · Images upload immediately when selected
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

              {/* Image Previews - Show all images with upload status */}
              {previewUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    Images ({uploadedImageUrls.length} uploaded / {previewUrls.length} total)
                    {uploadingImages && <span className="ml-2 text-primary text-xs">(Uploading...)</span>}
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {previewUrls.map((url, index) => {
                      const isUploaded = index < uploadedImageUrls.length;
                      const status = uploadProgress[index];
                      const imageUrl = isUploaded ? uploadedImageUrls[index] : url;
                      
                      return (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg ${
                              status === 'uploading' ? 'opacity-50' : ''
                            }`}
                          />
                          {/* Status badge */}
                          <div className={`absolute top-2 left-2 text-white text-xs px-2 py-1 rounded ${
                            status === 'success' || isUploaded 
                              ? 'bg-green-500' 
                              : status === 'error' 
                              ? 'bg-red-500' 
                              : 'bg-blue-500'
                          }`}>
                            {status === 'success' || isUploaded 
                              ? '✓ Uploaded' 
                              : status === 'error' 
                              ? '✗ Failed' 
                              : status === 'uploading'
                              ? '⏳ Uploading...'
                              : '⏳ Pending'}
                          </div>
                          {/* Loading spinner */}
                          {status === 'uploading' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          )}
                          {/* Remove button */}
                          {(isUploaded || status === 'error') && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6"
                              onClick={() => removeFile(index)}
                              disabled={uploadingImages}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
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
              <CardTitle className="text-sm">
                Available Sizes
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Check sizes that are in stock
              </p>
            </CardHeader>
            <CardContent className="space-y-3 p-3">
              {isAccessoryCategory ? (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  <p>Accessories use different sizing. Coming soon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_SIZES.map((size) => {
                    const isChecked = selectedSizes.has(size);
                    return (
                      <div
                        key={size}
                        className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`size-${size}`}
                          checked={isChecked}
                          onCheckedChange={() => toggleSize(size)}
                        />
                        <label
                          htmlFor={`size-${size}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 text-center"
                        >
                          {size}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
              {!isAccessoryCategory && selectedSizes.size === 0 && (
                <p className="text-xs text-destructive text-center mt-2">
                  Please select at least one size
                </p>
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
