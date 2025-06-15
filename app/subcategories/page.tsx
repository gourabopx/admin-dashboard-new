"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  createSubCategory,
  deleteSubCategory,
  getAllCategories,
  getAllSubCategories,
  updateSubCategory,
} from "../actions/subcategory.actions";
import { toast } from "sonner";

interface SubCategoryImage {
  url: string | null;
  public_url: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  images: SubCategoryImage[];
  parent: {
    id: string;
    name: string;
  };
}

export default function SubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [newSubcategory, setNewSubcategory] = useState({
    name: "",
    parentCategoryId: "",
    image: "",
    imageFile: null as File | null,
  });
  const [editSubcategory, setEditSubcategory] = useState<Subcategory | null>(
    null
  );
  const [editImage, setEditImage] = useState<{
    url: string;
    file: File | null;
  }>({ url: "", file: null });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<{
    id: string;
    imagePublicId: string;
  } | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    const result = await getAllCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    } else {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchSubcategories = async () => {
    const result = await getAllSubCategories();
    if (result.success && result.data) {
      setSubcategories(result.data);
    } else {
      toast.error("Failed to fetch subcategories");
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
            setNewSubcategory((prev) => ({
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

  const handleCreateSubcategory = async () => {
    if (
      !newSubcategory.name ||
      !newSubcategory.image ||
      !newSubcategory.parentCategoryId
    )
      return;

    const result = await createSubCategory({
      name: newSubcategory.name,
      parentId: newSubcategory.parentCategoryId,
      image: newSubcategory.image,
    });

    if (result.success) {
      toast.success("Subcategory created successfully");
      fetchSubcategories();
      setNewSubcategory({
        name: "",
        parentCategoryId: "",
        image: "",
        imageFile: null,
      });
    } else {
      toast.error("Failed to create subcategory");
    }
  };

  const handleEditClick = (subcategory: Subcategory) => {
    setEditSubcategory(subcategory);
    setEditImage({ url: subcategory.images[0]?.url || "", file: null });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (subcategory: Subcategory) => {
    const publicUrl = subcategory.images[0]?.public_url;
    if (!publicUrl) {
      toast.error("No image found to delete");
      return;
    }
    setSubcategoryToDelete({
      id: subcategory.id,
      imagePublicId: publicUrl,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (editSubcategory) {
      const result = await updateSubCategory(editSubcategory.id, {
        name: editSubcategory.name,
        parentId: editSubcategory.parent.id,
        image: editImage.file ? editImage.url : undefined,
        oldImagePublicId: editImage.file
          ? editSubcategory.images[0]?.public_url || undefined
          : undefined,
      });

      if (result.success) {
        toast.success("Subcategory updated successfully");
        fetchSubcategories();
        setIsEditDialogOpen(false);
        setEditSubcategory(null);
        setEditImage({ url: "", file: null });
      } else {
        toast.error("Failed to update subcategory");
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (subcategoryToDelete) {
      const result = await deleteSubCategory(
        subcategoryToDelete.id,
        subcategoryToDelete.imagePublicId
      );

      if (result.success) {
        toast.success("Subcategory deleted successfully");
        fetchSubcategories();
        setIsDeleteDialogOpen(false);
        setSubcategoryToDelete(null);
      } else {
        toast.error("Failed to delete subcategory");
      }
    }
  };

  const getImageUrl = (subcategory: Subcategory) => {
    return subcategory.images[0]?.url || "/placeholder.jpg";
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Subcategories</h1>

      {/* Create Subcategory Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Subcategory</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Subcategory Name</Label>
            <Input
              id="name"
              value={newSubcategory.name}
              onChange={(e) =>
                setNewSubcategory((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter subcategory name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentCategory">Parent Category</Label>
            <Select
              value={newSubcategory.parentCategoryId}
              onValueChange={(value) =>
                setNewSubcategory((prev) => ({
                  ...prev,
                  parentCategoryId: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subcategory Image</Label>
            {newSubcategory.image ? (
              <div className="relative w-40 h-40">
                <Image
                  src={newSubcategory.image}
                  alt="Subcategory preview"
                  fill
                  className="rounded-lg object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    setNewSubcategory((prev) => ({
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
          onClick={handleCreateSubcategory}
          disabled={
            !newSubcategory.name ||
            !newSubcategory.image ||
            !newSubcategory.parentCategoryId
          }
        >
          Create Subcategory
        </Button>
      </Card>

      {/* Subcategories Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Subcategories</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subcategory Name</TableHead>
              <TableHead>Parent Category</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcategories.map((subcategory) => (
              <TableRow key={subcategory.id}>
                <TableCell className="font-medium">
                  {subcategory.name}
                </TableCell>
                <TableCell>{subcategory.parent.name}</TableCell>
                <TableCell>
                  <div className="relative h-16 w-16">
                    <Image
                      src={getImageUrl(subcategory)}
                      alt={subcategory.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(subcategory)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(subcategory)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Subcategory Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Make changes to the subcategory details below.
            </DialogDescription>
          </DialogHeader>

          {editSubcategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Subcategory Name</Label>
                <Input
                  value={editSubcategory.name}
                  onChange={(e) =>
                    setEditSubcategory({
                      ...editSubcategory,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Parent Category</Label>
                <Select
                  value={editSubcategory.parent.id}
                  onValueChange={(value) => {
                    const category = categories.find((c) => c.id === value);
                    if (category) {
                      setEditSubcategory({
                        ...editSubcategory,
                        parent: {
                          id: category.id,
                          name: category.name,
                        },
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subcategory Image</Label>
                <div className="relative w-40 h-40">
                  <Image
                    src={editImage.url || getImageUrl(editSubcategory)}
                    alt="Subcategory"
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
              Are you sure you want to delete this subcategory? This action
              cannot be undone.
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
