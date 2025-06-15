"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, Trash2 } from "lucide-react";
import {
  getAllProducts,
  updateProductFeatured,
  deleteProduct,
} from "@/app/actions/product.actions";
import { toast } from "sonner";

interface ProductSize {
  size: string;
  price: number;
  quantity: number;
}

interface Product {
  id: string;
  title: string;
  mainImage: string;
  category: string;
  sizes: ProductSize[];
  featured: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const result = await getAllProducts();
      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        toast.error(result.error || "Failed to load products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeaturedToggle = async (productId: string, featured: boolean) => {
    try {
      // Update featured status in the UI immediately
      setProducts(
        products.map((product) =>
          product.id === productId ? { ...product, featured } : product
        )
      );

      // Update in the backend
      const result = await updateProductFeatured(productId, featured);
      if (!result.success) {
        // Revert UI change if backend update fails
        setProducts(
          products.map((product) =>
            product.id === productId
              ? { ...product, featured: !featured }
              : product
          )
        );
        toast.error(result.error || "Failed to update featured status");
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast.error("Failed to update featured status");
      // Revert UI change
      setProducts(
        products.map((product) =>
          product.id === productId
            ? { ...product, featured: !featured }
            : product
        )
      );
    }
  };

  const handleEditClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        // Remove from UI immediately
        setProducts(products.filter((p) => p.id !== productToDelete));
        setDeleteDialogOpen(false);

        // Delete from backend
        const result = await deleteProduct(productToDelete);
        if (!result.success) {
          // Revert UI change if backend delete fails
          loadProducts(); // Reload all products to ensure consistency
          toast.error(result.error || "Failed to delete product");
        } else {
          toast.success("Product deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
        loadProducts(); // Reload all products to ensure consistency
      }
      setProductToDelete(null);
    }
  };

  const formatSizes = (sizes: ProductSize[]) => {
    return sizes
      .map((size) => `${size.size}: ₹${size.price.toLocaleString()}`)
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => router.push("/products/new")}>
          Add New Product
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Product Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sizes</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-sm">
                  {product.id.slice(-6)}
                </TableCell>
                <TableCell>
                  <div className="relative h-12 w-12">
                    <Image
                      src={product.mainImage || "/placeholder.png"}
                      alt={product.title}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {product.title.length > 30
                    ? product.title.slice(0, 30) + "..."
                    : product.title}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="font-mono">
                  ₹{product.sizes[0]?.price.toLocaleString() || 0}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  <span title={formatSizes(product.sizes)}>
                    {formatSizes(product.sizes)}
                  </span>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={product.featured}
                    onCheckedChange={(checked) =>
                      handleFeaturedToggle(product.id, checked)
                    }
                  />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(product.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
