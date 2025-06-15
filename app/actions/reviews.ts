"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Review, ProductReview } from "@/lib/generated/prisma";

export type ReviewWithDetails = {
  id: string;
  rating: number;
  review: string;
  reviewCreatedAt: Date;
  verified: boolean;
  createdAt: Date;
  product: {
    id: string;
    title: string;
    images: {
      url: string | null;
    }[];
  };
  reviewBy: {
    id: string;
    username: string;
    email: string;
  };
};

export async function getUnverifiedReviews(): Promise<ReviewWithDetails[]> {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        verified: false,
      },
      include: {
        productReviews: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
        },
        reviewBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Transform the data to match our expected format
    return reviews.map(
      (
        review: Review & {
          productReviews: (ProductReview & {
            product: {
              id: string;
              title: string;
              images: { url: string | null }[];
            };
          })[];
          reviewBy: {
            id: string;
            username: string;
            email: string;
          };
        }
      ) => ({
        id: review.id,
        rating: review.rating,
        review: review.review,
        reviewCreatedAt: review.reviewCreatedAt,
        verified: review.verified,
        createdAt: review.createdAt,
        // Get the first product since a review can only be for one product
        product: {
          id: review.productReviews[0]?.product.id || "",
          title: review.productReviews[0]?.product.title || "",
          images: review.productReviews[0]?.product.images || [],
        },
        reviewBy: review.reviewBy,
      })
    );
  } catch (error) {
    console.error("Error fetching unverified reviews:", error);
    throw new Error("Failed to fetch unverified reviews");
  }
}

export async function verifyReview(reviewId: string) {
  try {
    await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        verified: true,
      },
    });

    // Update the product's rating and numReviews
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        productReviews: {
          include: {
            product: true,
          },
        },
      },
    });

    if (review && review.productReviews[0]) {
      const productId = review.productReviews[0].productId;

      // First get all reviews for this product
      const allProductReviews = await prisma.productReview.findMany({
        where: {
          productId: productId,
        },
        include: {
          review: true,
        },
      });

      // Then filter for verified reviews in memory
      const verifiedReviews = allProductReviews.filter(
        (pr) => pr.review.verified
      );
      const totalRating = verifiedReviews.reduce(
        (sum: number, pr: ProductReview & { review: Review }) =>
          sum + pr.review.rating,
        0
      );
      const newRating =
        verifiedReviews.length > 0 ? totalRating / verifiedReviews.length : 0;

      // Update product
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          rating: newRating,
          numReviews: verifiedReviews.length,
        },
      });
    }

    revalidatePath("/reviews");
    return { success: true };
  } catch (error) {
    console.error("Error verifying review:", error);
    throw new Error("Failed to verify review");
  }
}
