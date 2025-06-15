"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCoupon(data: {
  coupon: string;
  startDate: string;
  endDate: string;
  discount: number;
}) {
  try {
    const newCoupon = await prisma.coupon.create({
      data: {
        coupon: data.coupon,
        startDate: data.startDate,
        endDate: data.endDate,
        discount: data.discount,
      },
    });
    revalidatePath("/coupons");
    return { success: true, data: newCoupon };
  } catch (error) {
    console.error("Error creating coupon:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

export async function getAllCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: coupons };
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return { success: false, error: "Failed to fetch coupons" };
  }
}

export async function updateCoupon(
  id: string,
  data: {
    coupon: string;
    startDate: string;
    endDate: string;
    discount: number;
  }
) {
  try {
    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        coupon: data.coupon,
        startDate: data.startDate,
        endDate: data.endDate,
        discount: data.discount,
      },
    });
    revalidatePath("/coupons");
    return { success: true, data: updatedCoupon };
  } catch (error) {
    console.error("Error updating coupon:", error);
    return { success: false, error: "Failed to update coupon" };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({
      where: { id },
    });
    revalidatePath("/coupons");
    return { success: true };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}
