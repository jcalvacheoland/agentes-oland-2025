"use server";

import { cookies } from "next/headers";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type UpdatePlanSelectionInput = {
  primaNeta?: number | null;
  Tasa?: number | null;
};

export async function updatePlanSelection(
  planId: string,
  { primaNeta = null, Tasa = null }: UpdatePlanSelectionInput = {},
) {
  try {
    await cookies();
    const session = await auth();

    if (!session?.user?.id) {
      return { ok: false, error: "Usuario no autenticado" };
    }

    const plan = await prisma.planesComparados.findUnique({
      where: { id: planId },
      include: {
        cotizacion: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!plan) {
      return { ok: false, error: "Plan comparado no encontrado" };
    }

    if (plan.cotizacion.userId !== session.user.id) {
      return { ok: false, error: "No tienes permiso para actualizar este plan" };
    }

    await prisma.$transaction([
      prisma.planesComparados.updateMany({
        where: {
          cotizacionId: plan.cotizacionId,
          version: plan.version,
          NOT: { id: planId },
        },
        data: { selected: false },
      }),
      prisma.planesComparados.update({
        where: { id: planId },
        data: {
          selected: true,
          primaNeta,
          Tasa,
          updatedAt: new Date(),
        },
      }),
    ]);

    return { ok: true };
  } catch (error) {
    console.error("Error actualizando el plan seleccionado:", error);
    return { ok: false, error: "No se pudo actualizar el plan seleccionado" };
  }
}

