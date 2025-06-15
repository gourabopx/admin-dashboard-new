"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  getAppBanners,
  uploadAppBanner,
  deleteBanner,
} from "@/app/actions/banner.actions";

interface Banner {
  public_id: string;
  url: string;
}

export default function AppBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const result = await getAppBanners();
    if (result.success) {
      setBanners(result.data);
    } else {
      toast.error("Failed to load banners");
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (files) {
      setIsLoading(true);
      try {
        for (const file of Array.from(files)) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            if (e.target?.result) {
              const result = await uploadAppBanner(e.target.result as string);
              if (result.success) {
                setBanners((prev) => [...prev, result.data]);
                toast.success("Banner uploaded successfully");
              } else {
                toast.error("Failed to upload banner");
              }
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        toast.error("Error uploading banner");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete(banner);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (bannerToDelete) {
      const result = await deleteBanner(bannerToDelete.public_id);
      if (result.success) {
        setBanners(
          banners.filter(
            (banner) => banner.public_id !== bannerToDelete.public_id
          )
        );
        toast.success("Banner deleted successfully");
      } else {
        toast.error("Failed to delete banner");
      }
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">App Banners</h1>
      </div>

      {/* Upload Section */}
      <Card
        className={`p-6 ${isDragging ? "border-primary border-2" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-lg text-gray-600">
              Drop your banner images here or click to upload
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Support for PNG, JPG - Recommended size: 1200x400px
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Select Files"}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
        </div>
      </Card>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <Card key={banner.public_id} className="relative group">
            <div className="relative aspect-[3/1] rounded-lg overflow-hidden">
              <Image
                src={banner.url}
                alt="Banner"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => handleDeleteClick(banner)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner? This action cannot be
              undone.
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
