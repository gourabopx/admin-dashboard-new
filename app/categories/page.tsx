"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Edit2, Trash2, Upload, X } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../actions/category.actions";
import { toast } from "sonner";

interface CategoryImage {
  url: string | null;
  public_id: string | null;
}

interface Category {
  id: string;
  name: string;
  images: CategoryImage[];
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: "",
    image: "",
    imageFile: null as File | null,
  });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editImage, setEditImage] = useState<{
    url: string;
    file: File | null;
  }>({ url: "", file: null });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    imagePublicId: string;
  } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const result = await getAllCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    } else {
      toast.error("Failed to fetch categories");
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (isEdit) {
            setEditImage({
              url: e.target.result as string,
              file: file,
            });
          } else {
            setNewCategory((prev) => ({
              ...prev,
              image: e.target?.result as string,
              imageFile: file,
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.image) return;

    const result = await createCategory({
      name: newCategory.name,
      image: newCategory.image,
    });

    if (result.success) {
      toast.success("Category created successfully");
      fetchCategories();
      setNewCategory({ name: "", image: "", imageFile: null });
    } else {
      toast.error("Failed to create category");
    }
  };

  const handleEditClick = (category: Category) => {
    setEditCategory(category);
    setEditImage({ url: category.images[0]?.url || "", file: null });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    const publicId = category.images[0]?.public_id;
    if (!publicId) {
      toast.error("No image found to delete");
      return;
    }
    setCategoryToDelete({
      id: category.id,
      imagePublicId: publicId,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (editCategory) {
      const result = await updateCategory(editCategory.id, {
        name: editCategory.name,
        image: editImage.file ? editImage.url : undefined,
        oldImagePublicId: editImage.file
          ? editCategory.images[0]?.public_id || undefined
          : undefined,
      });

      if (result.success) {
        toast.success("Category updated successfully");
        fetchCategories();
        setIsEditDialogOpen(false);
        setEditCategory(null);
        setEditImage({ url: "", file: null });
      } else {
        toast.error("Failed to update category");
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      const result = await deleteCategory(
        categoryToDelete.id,
        categoryToDelete.imagePublicId
      );

      if (result.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } else {
        toast.error("Failed to delete category");
      }
    }
  };

  const getImageUrl = (category: Category) => {
    return category.images[0]?.url || "/placeholder.jpg";
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Categories</h1>

      {/* Create Category Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter category name"
            />
          </div>

          <div className="space-y-2">
            <Label>Category Image</Label>
            {newCategory.image ? (
              <div className="relative w-40 h-40">
                <Image
                  src={newCategory.image}
                  alt="Category preview"
                  fill
                  className="rounded-lg object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    setNewCategory((prev) => ({
                      ...prev,
                      image: "",
                      imageFile: null,
                    }))
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                />
              </label>
            )}
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={handleCreateCategory}
          disabled={!newCategory.name || !newCategory.image}
        >
          Create Category
        </Button>
      </Card>

      {/* Categories Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Categories</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <div className="relative h-16 w-16">
                    <Image
                      src={getImageUrl(category)}
                      alt={category.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Make changes to the category details below.
            </DialogDescription>
          </DialogHeader>

          {editCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  value={editCategory.name}
                  onChange={(e) =>
                    setEditCategory({ ...editCategory, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Category Image</Label>
                <div className="relative w-40 h-40">
                  <Image
                    src={editImage.url || getImageUrl(editCategory)}
                    alt="Category"
                    fill
                    className="rounded-lg object-cover"
                  />
                  <label className="absolute bottom-2 right-2 cursor-pointer">
                    <div className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100">
                      <Upload className="h-4 w-4" />
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
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
