"use server";

import { PrismaClient } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { error: "Failed to fetch users" };
  }
}

export async function deleteUser(userId: string) {
  try {
    // First delete related records
    await prisma.cart.deleteMany({
      where: { userId },
    });

    await prisma.order.deleteMany({
      where: { userId },
    });

    await prisma.review.deleteMany({
      where: { reviewById: userId },
    });

    // Then delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user" };
  }
}
