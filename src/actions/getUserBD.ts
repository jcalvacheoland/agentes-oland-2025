"use server"
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedUser() {
  try {
    await cookies();
    const session = await auth();

    // logs útiles para depuración si es necesario
    // console.log("🔍 Sesión completa en server action:", JSON.stringify(session, null, 2));
    // console.log("🔍 User ID:", session?.user?.id);
    // console.log("🔍 User email:", session?.user?.email);

    if (!session?.user?.id) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        ejecutivo:true,  
        imagenPDF:true,       
      },
    });

    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("getAuthenticatedUser error:", error);
    return { success: false, error: "Error al obtener el usuario autenticado" };
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user;
  } catch (error) {
    console.error("getUserById error:", error);
    return null;
  }
}