"use server";

import { PrismaClient } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";
import { subDays, startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

type OrderFilters = {
  dateRange?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  searchQuery?: string;
};

export async function getOrders(filters: OrderFilters = {}) {
  try {
    const { dateRange, paymentStatus, paymentMethod, searchQuery } = filters;

    // Build the where clause based on filters
    let where: any = {};

    // Date range filter
    if (dateRange && dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case "today":
          startDate = startOfDay(now);
          break;
        case "yesterday":
          startDate = startOfDay(subDays(now, 1));
          break;
        case "2days":
          startDate = startOfDay(subDays(now, 2));
          break;
        case "1week":
          startDate = startOfDay(subDays(now, 7));
          break;
        case "15days":
          startDate = startOfDay(subDays(now, 15));
          break;
        case "30days":
          startDate = startOfDay(subDays(now, 30));
          break;
        case "2months":
          startDate = startOfDay(subDays(now, 60));
          break;
        case "5months":
          startDate = startOfDay(subDays(now, 150));
          break;
        case "10months":
          startDate = startOfDay(subDays(now, 300));
          break;
        case "12months":
          startDate = startOfDay(subDays(now, 365));
          break;
        default:
          startDate = startOfDay(now);
      }

      where.createdAt = {
        gte: startDate,
        lte: endOfDay(now),
      };
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      where.isPaid = paymentStatus === "paid";
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== "all") {
      where.paymentMethod = paymentMethod;
    }

    // Search by order ID
    if (searchQuery) {
      where.id = searchQuery;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { error: "Failed to fetch orders" };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    // Start a transaction since we'll be updating multiple records
    return await prisma.$transaction(async (tx) => {
      // First, get the order
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // If status is being changed to "Processing", update product quantities
      if (status === "Processing" && order.status !== "Processing") {
        // Update each product's quantity
        for (const orderProduct of order.products) {
          if (!orderProduct.productId || !orderProduct.qty) continue;

          // Extract the base product ID (remove any variant information after underscore)
          const baseProductId = orderProduct.productId.split("_")[0];

          // Get the product
          const product = await tx.product.findUnique({
            where: { id: baseProductId },
          });

          if (!product) {
            console.error(`Product not found: ${baseProductId}`);
            continue;
          }

          // Update the product sizes
          const updatedSizes = product.sizes.map((size) => {
            // Match size by comparing with the variant part of the productId
            const variantSize = orderProduct.productId.split("_")[1];
            if (size.size === (variantSize || orderProduct.size)) {
              return {
                ...size,
                qty: size.qty - (orderProduct.qty || 0),
                sold: (size.sold || 0) + (orderProduct.qty || 0),
              };
            }
            return size;
          });

          // Update the product with new sizes
          await tx.product.update({
            where: { id: baseProductId },
            data: {
              sizes: updatedSizes,
              sold: (product.sold || 0) + (orderProduct.qty || 0),
            },
          });
        }
      }

      // Update the order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      revalidatePath("/orders");
      return { success: true, order: updatedOrder };
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: "Failed to update order status" };
  }
}
