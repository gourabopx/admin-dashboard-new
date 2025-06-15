"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Star, StarHalf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import {
  getUnverifiedReviews,
  verifyReview,
  type ReviewWithDetails,
} from "@/app/actions/reviews";
import { toast } from "sonner";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const unverifiedReviews = await getUnverifiedReviews();
      setReviews(unverifiedReviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async (reviewId: string, approved: boolean) => {
    if (!approved) return; // We only handle approving reviews, not un-approving

    try {
      await verifyReview(reviewId);
      // Remove the review from the list since it's now verified
      setReviews(reviews.filter((review) => review.id !== reviewId));
      toast.success("Review verified successfully");
    } catch (error) {
      console.error("Error verifying review:", error);
      toast.error("Failed to verify review");
    }
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-4 h-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Unverified Reviews</h1>
        <div className="text-sm text-gray-500">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} pending
          verification
        </div>
      </div>

      <Card className="p-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No unverified reviews to display
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Product</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Verify</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="relative w-20 h-20">
                      <Image
                        src={
                          review.product.images[0]?.url || "/placeholder.png"
                        }
                        alt={review.product.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px]">
                    <div>
                      <p className="truncate">{review.product.title}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {review.review}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{renderStarRating(review.rating)}</TableCell>
                  <TableCell>{review.reviewBy.username}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {review.reviewBy.email}
                  </TableCell>
                  <TableCell>
                    {format(new Date(review.reviewCreatedAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={review.verified}
                      onCheckedChange={(checked) =>
                        handleApprovalChange(review.id, checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
