"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  uploadImage,
  deleteImage,
  getCloudinaryImages,
} from "@/lib/cloudinary";

// App Banners
export async function getAppBanners() {
  try {
    const images = await getCloudinaryImages("app-banners");
    return { success: true, data: images };
  } catch (error) {
    console.error("Error fetching app banners:", error);
    return { success: false, error: "Failed to fetch app banners" };
  }
}

export async function uploadAppBanner(base64Image: string) {
  try {
    const result = await uploadImage(base64Image, "app-banners");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error uploading app banner:", error);
    return { success: false, error: "Failed to upload app banner" };
  }
}

// Website Banners
export async function getWebsiteBanners() {
  try {
    const images = await getCloudinaryImages("website-banners");
    return { success: true, data: images };
  } catch (error) {
    console.error("Error fetching website banners:", error);
    return { success: false, error: "Failed to fetch website banners" };
  }
}

export async function uploadWebsiteBanner(base64Image: string) {
  try {
    const result = await uploadImage(base64Image, "website-banners");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error uploading website banner:", error);
    return { success: false, error: "Failed to upload website banner" };
  }
}

// Home Screen Offers
export async function getHomeScreenOffers() {
  try {
    const offers = await prisma.homeScreenOffer.findMany({
      select: {
        id: true,
        title: true,
        link: true,
        type: true,
        images: true,
      },
    });
    return {
      success: true,
      data: offers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        link: offer.link,
        type: offer.type,
        images: offer.images.map((img) => ({
          url: img.url || "",
          public_id: img.public_id || "",
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching home screen offers:", error);
    return { success: false, error: "Failed to fetch offers" };
  }
}

export async function createHomeScreenOffer(
  base64Image: string,
  title: string,
  link: string,
  type: "specialCombo" | "crazyDeal"
) {
  try {
    const uploadedImage = await uploadImage(base64Image, "offers");

    const offer = await prisma.homeScreenOffer.create({
      data: {
        title,
        link,
        type,
        images: [uploadedImage],
      },
      select: {
        id: true,
        title: true,
        link: true,
        type: true,
        images: true,
      },
    });

    const formattedOffer = {
      id: offer.id,
      title: offer.title,
      link: offer.link,
      type: offer.type,
      images: offer.images.map((img) => ({
        url: img.url || "",
        public_id: img.public_id || "",
      })),
    };

    revalidatePath("/offers");
    return { success: true, data: formattedOffer };
  } catch (error) {
    console.error("Error creating home screen offer:", error);
    return { success: false, error: "Failed to create offer" };
  }
}

export async function deleteHomeScreenOffer(id: string, public_id: string) {
  try {
    await deleteImage(public_id);

    await prisma.homeScreenOffer.delete({
      where: { id },
    });

    revalidatePath("/offers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting home screen offer:", error);
    return { success: false, error: "Failed to delete offer" };
  }
}

// Generic Banner Delete
export async function deleteBanner(public_id: string) {
  try {
    await deleteImage(public_id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting banner:", error);
    return { success: false, error: "Failed to delete banner" };
  }
}
