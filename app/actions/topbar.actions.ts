"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createTopbar({
  title,
  link,
  textColor,
  backgroundColor,
  button,
}: {
  title: string;
  link: string;
  textColor: string;
  backgroundColor: string;
  button?: {
    text: string;
    link: string;
    textColor: string;
    backgroundColor: string;
  };
}) {
  try {
    const topbar = await prisma.topBar.create({
      data: {
        title,
        link,
        textColor,
        backgroundColor,
        button: button
          ? {
              text: button.text,
              link: button.link,
              textColor: button.textColor,
              backgroundColor: button.backgroundColor,
            }
          : undefined,
      },
    });

    revalidatePath("/topbar");
    return { success: true, data: topbar };
  } catch (error) {
    console.error("Error creating topbar:", error);
    return { success: false, error: "Failed to create topbar" };
  }
}

export async function getTopbars() {
  try {
    const topbars = await prisma.topBar.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: topbars };
  } catch (error) {
    console.error("Error fetching topbars:", error);
    return { success: false, error: "Failed to fetch topbars" };
  }
}

export async function updateTopbar({
  id,
  title,
  link,
  textColor,
  backgroundColor,
  button,
}: {
  id: string;
  title: string;
  link: string;
  textColor: string;
  backgroundColor: string;
  button?: {
    text: string;
    link: string;
    textColor: string;
    backgroundColor: string;
  };
}) {
  try {
    const topbar = await prisma.topBar.update({
      where: { id },
      data: {
        title,
        link,
        textColor,
        backgroundColor,
        button: button
          ? {
              text: button.text,
              link: button.link,
              textColor: button.textColor,
              backgroundColor: button.backgroundColor,
            }
          : undefined,
      },
    });

    revalidatePath("/topbar");
    return { success: true, data: topbar };
  } catch (error) {
    console.error("Error updating topbar:", error);
    return { success: false, error: "Failed to update topbar" };
  }
}

export async function deleteTopbar(id: string) {
  try {
    await prisma.topBar.delete({
      where: { id },
    });

    revalidatePath("/topbar");
    return { success: true };
  } catch (error) {
    console.error("Error deleting topbar:", error);
    return { success: false, error: "Failed to delete topbar" };
  }
}
