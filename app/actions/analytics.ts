"use server";

import { PrismaClient } from "@/lib/generated/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

const prisma = new PrismaClient();

// Helper function to get last N months
function getLastNMonths(n: number) {
  const months = [];
  for (let i = 0; i < n; i++) {
    const date = subMonths(new Date(), i);
    months.unshift({
      start: startOfMonth(date),
      end: endOfMonth(date),
      month: format(date, "MMM"),
    });
  }
  return months;
}

export async function getOrdersAnalytics() {
  try {
    const months = getLastNMonths(7);
    const ordersData = await Promise.all(
      months.map(async ({ start, end, month }) => {
        const count = await prisma.order.count({
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });
        return { month, orders: count };
      })
    );
    return { ordersData };
  } catch (error) {
    console.error("Error fetching orders analytics:", error);
    return { error: "Failed to fetch orders analytics" };
  }
}

export async function getCustomersAnalytics() {
  try {
    const months = getLastNMonths(7);
    const customersData = await Promise.all(
      months.map(async ({ start, end, month }) => {
        const count = await prisma.user.count({
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        });
        return { month, customers: count };
      })
    );
    return { customersData };
  } catch (error) {
    console.error("Error fetching customers analytics:", error);
    return { error: "Failed to fetch customers analytics" };
  }
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    });
    return { products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { error: "Failed to fetch products" };
  }
}

export async function getProductAnalytics(productId: string) {
  try {
    const months = getLastNMonths(7);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sold: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Get orders containing this product for each month
    const productPerformance = await Promise.all(
      months.map(async ({ start, end, month }) => {
        const orders = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
            products: {
              some: {
                productId: productId,
              },
            },
          },
          select: {
            products: true,
          },
        });

        // Calculate sales and revenue for this specific product
        const sales = orders.reduce((total, order) => {
          const productInOrder = order.products.find(
            (p) => p.productId === productId
          );
          return total + (productInOrder?.qty || 0);
        }, 0);

        const revenue = orders.reduce((total, order) => {
          const productInOrder = order.products.find(
            (p) => p.productId === productId
          );
          return (
            total + (productInOrder?.qty || 0) * (productInOrder?.price || 0)
          );
        }, 0);

        return {
          month,
          sales,
          revenue,
        };
      })
    );

    return { productPerformance };
  } catch (error) {
    console.error("Error fetching product analytics:", error);
    return { error: "Failed to fetch product analytics" };
  }
}

export async function getDashboardAnalytics() {
  try {
    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get total products
    const totalProducts = await prisma.product.count();

    // Get total revenue
    const orders = await prisma.order.findMany({
      select: {
        total: true,
      },
    });
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

    // Get total completed sales
    const totalSales = await prisma.order.count({
      where: {
        status: "Delivered",
      },
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Get top selling products
    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: {
        sold: "desc",
      },
      select: {
        id: true,
        title: true,
        images: true,
        category: {
          select: {
            name: true,
          },
        },
        sold: true,
        sizes: true,
      },
    });

    // Get recent customers
    const recentCustomers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      totalOrders,
      totalProducts,
      totalRevenue,
      totalSales,
      recentOrders,
      topProducts,
      recentCustomers,
    };
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return { error: "Failed to fetch dashboard analytics" };
  }
}
