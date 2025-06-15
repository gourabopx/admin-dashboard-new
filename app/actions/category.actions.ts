"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

export async function createCategory(data: { name: string; image: string }) {
  try {
    // Upload image to Cloudinary
    const imageResult = await uploadImage(data.image);

    // Create category in database
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        images: [
          {
            url: imageResult.url,
            public_id: imageResult.public_id,
          },
        ],
      },
    });

    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    image?: string;
    oldImagePublicId?: string;
  }
) {
  try {
    let imageData = undefined;

    // If new image is provided, upload it and delete old one
    if (data.image) {
      const imageResult = await uploadImage(data.image);
      if (data.oldImagePublicId) {
        await deleteImage(data.oldImagePublicId);
      }
      imageData = [
        {
          url: imageResult.url,
          public_id: imageResult.public_id,
        },
      ];
    }

    // Update category in database
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        ...(imageData && { images: imageData }),
      },
    });

    revalidatePath("/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string, imagePublicId: string) {
  try {
    // Delete image from Cloudinary
    await deleteImage(imagePublicId);

    // Delete category from database
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
