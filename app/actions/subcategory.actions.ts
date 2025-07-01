"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

export async function createSubCategory(data: {
  name: string;
  parentId: string;
  image: string;
}) {
  try {
    // Upload image to Cloudinary
    const imageResult = await uploadImage(data.image, "subcategories");

    // Create subcategory in database
    const subcategory = await prisma.subCategory.create({
      data: {
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        images: [
          {
            url: imageResult.url,
            public_url: imageResult.public_id,
          },
        ],
        parentId: data.parentId,
      },
      include: {
        parent: true,
      },
    });

    revalidatePath("/subcategories");
    return { success: true, data: subcategory };
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return { success: false, error: "Failed to create subcategory" };
  }
}

export async function getAllSubCategories() {
  try {
    const subcategories = await prisma.subCategory.findMany({
      include: {
        parent: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: subcategories };
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return { success: false, error: "Failed to fetch subcategories" };
  }
}

export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function updateSubCategory(
  id: string,
  data: {
    name: string;
    parentId: string;
    image?: string;
    oldImagePublicId?: string;
  }
) {
  try {
    let imageData = undefined;

    // If new image is provided, upload it and delete old one
    if (data.image) {
      const imageResult = await uploadImage(data.image, "subcategories");
      if (data.oldImagePublicId) {
        await deleteImage(data.oldImagePublicId);
      }
      imageData = [
        {
          url: imageResult.url,
          public_url: imageResult.public_id,
        },
      ];
    }

    // Update subcategory in database
    const subcategory = await prisma.subCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        parentId: data.parentId,
        ...(imageData && { images: imageData }),
      },
      include: {
        parent: true,
      },
    });

    revalidatePath("/subcategories");
    return { success: true, data: subcategory };
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return { success: false, error: "Failed to update subcategory" };
  }
}

export async function deleteSubCategory(id: string, imagePublicId: string) {
  try {
    // Delete image from Cloudinary
    await deleteImage(imagePublicId);

    // Delete subcategory from database
    await prisma.subCategory.delete({
      where: { id },
    });

    revalidatePath("/subcategories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return { success: false, error: "Failed to delete subcategory" };
  }
}
