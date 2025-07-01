"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadImage, deleteImage } from "@/lib/cloudinary";

interface ProductSize {
  size: string;
  qty: number;
  price: number;
  sold: number;
}

export async function createProduct(data: {
  title: string;
  description: string;
  longDescription: string;
  brand: string | null;
  slug: string;
  benefits: string[];
  ingredients: string[];
  sku: string;
  images: string[];
  sizes: ProductSize[];
  discount: number;
  featured: boolean;
  categoryId: string;
  subCategoryIds: string[];
}) {
  try {
    // Upload all images to Cloudinary
    const uploadPromises = data.images.map((image) => uploadImage(image, "products"));
    const uploadedImages = await Promise.all(uploadPromises);

    // Create product in database
    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        longDescription: data.longDescription,
        brand: data.brand,
        slug: data.slug,
        benefits: data.benefits.map((name) => ({ name })),
        ingredients: data.ingredients.map((name) => ({ name })),
        sku: data.sku,
        images: uploadedImages.map((img) => ({
          url: img.url,
          public_id: img.public_id,
        })),
        sizes: data.sizes,
        discount: data.discount,
        featured: data.featured,
        categoryId: data.categoryId,
        productSubCategories: {
          create: data.subCategoryIds.map((subCategoryId) => ({
            subCategoryId,
          })),
        },
      },
      include: {
        category: true,
        productSubCategories: {
          include: {
            subCategory: true,
          },
        },
      },
    });

    revalidatePath("/products");
    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        productSubCategories: {
          include: {
            subCategory: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: products.map((product) => ({
        id: product.id,
        title: product.title,
        mainImage: product.images?.[0]?.url || "",
        category: product.category.name,
        sizes: product.sizes.map((size) => ({
          size: size.size,
          price: size.price,
          quantity: size.qty,
        })),
        featured: product.featured,
      })),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function updateProductFeatured(
  productId: string,
  featured: boolean
) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { featured },
    });

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error updating product featured status:", error);
    return {
      success: false,
      error: "Failed to update product featured status",
    };
  }
}

export async function deleteProduct(productId: string) {
  try {
    // Get the product to delete its images
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Delete images from Cloudinary
    const deletePromises = product.images
      .filter((img) => img.public_id)
      .map((img) => deleteImage(img.public_id!));
    await Promise.all(deletePromises);

    // Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function getAllCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
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

export async function getSubcategoriesByCategory(categoryId: string) {
  try {
    const subcategories = await prisma.subCategory.findMany({
      where: {
        parentId: categoryId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, data: subcategories };
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return { success: false, error: "Failed to fetch subcategories" };
  }
}

export async function getProduct(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        productSubCategories: {
          include: {
            subCategory: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return {
      success: true,
      data: {
        id: product.id,
        title: product.title,
        description: product.description,
        longDescription: product.longDescription,
        brand: product.brand,
        slug: product.slug,
        benefits: product.benefits.map((b) => b.name),
        ingredients: product.ingredients.map((i) => i.name),
        sku: product.sku,
        images: product.images,
        sizes: product.sizes,
        discount: product.discount || 0,
        featured: product.featured,
        categoryId: product.categoryId,
        category: product.category,
        subCategories: product.productSubCategories.map((ps) => ps.subCategory),
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

export async function updateProduct(
  productId: string,
  data: {
    title: string;
    description: string;
    longDescription: string;
    brand: string | null;
    slug: string;
    benefits: string[];
    ingredients: string[];
    sku: string;
    images: string[];
    sizes: ProductSize[];
    discount: number;
    featured: boolean;
    categoryId: string;
    subCategoryIds: string[];
    imagesToDelete?: { public_id: string }[];
  }
) {
  try {
    // Delete old images from Cloudinary if specified
    if (data.imagesToDelete && data.imagesToDelete.length > 0) {
      const deletePromises = data.imagesToDelete.map((img) =>
        deleteImage(img.public_id)
      );
      await Promise.all(deletePromises);
    }

    // Upload new images to Cloudinary (if they are base64)
    const uploadPromises = data.images
      .filter((img) => img.startsWith("data:"))
      .map((image) => uploadImage(image, "products"));
    const uploadedImages = await Promise.all(uploadPromises);

    // Build the images array ensuring no null values are present
    const existingImages = data.images
      .filter((img) => !img.startsWith("data:"))
      .map((url) => {
        const isMarkedForDeletion = data.imagesToDelete?.some(
          (img) => img.public_id && url.includes(img.public_id)
        );
        if (isMarkedForDeletion) return undefined;

        return {
          url,
          public_id: url.split("/").pop()?.split(".")[0],
        } as { url: string; public_id?: string };
      })
      .filter((img): img is { url: string; public_id?: string } => Boolean(img));

    const newImages = uploadedImages.map((img) => ({
      url: img.url,
      public_id: img.public_id,
    }));

    const finalImages: { url: string; public_id?: string }[] = [
      ...existingImages,
      ...newImages,
    ];

    // Update product in database
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        description: data.description,
        longDescription: data.longDescription,
        brand: data.brand,
        slug: data.slug,
        benefits: data.benefits.map((name) => ({ name })),
        ingredients: data.ingredients.map((name) => ({ name })),
        sku: data.sku,
        images: finalImages,
        sizes: data.sizes,
        discount: data.discount,
        featured: data.featured,
        categoryId: data.categoryId,
        productSubCategories: {
          deleteMany: {},
          create: data.subCategoryIds.map((subCategoryId) => ({
            subCategoryId,
          })),
        },
      },
      include: {
        category: true,
        productSubCategories: {
          include: {
            subCategory: true,
          },
        },
      },
    });

    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    return { success: true, data: product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}
