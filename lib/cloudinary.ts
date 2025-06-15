"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64Image: string, folder: string) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `e-commerce/${folder}`,
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error(`Error uploading to Cloudinary (${folder}):`, error);
    throw error;
  }
}

export async function uploadAppBanner(file: string) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "e-commerce/app-banners",
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

export async function uploadWebsiteBanner(file: string) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "e-commerce/website-banners",
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

export async function uploadHomeScreenOffer(file: string) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "e-commerce/offers",
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

export async function deleteImage(public_id: string) {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

export async function getCloudinaryImages(folder: string) {
  try {
    const { resources } = await cloudinary.search
      .expression(`folder:e-commerce/${folder}`)
      .execute();

    return resources.map((resource: any) => ({
      public_id: resource.public_id,
      url: resource.secure_url,
    }));
  } catch (error) {
    console.error("Error fetching from Cloudinary:", error);
    throw error;
  }
}
