"use server";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const cotizacionId = params.id;
    if (!cotizacionId || typeof cotizacionId !== "string") {
      return NextResponse.json({ error: "ID de cotización inválido" }, { status: 400 });
    }

    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
      select: { bitrixDealId: true, userId: true },
    });

    if (!cotizacion) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    if (cotizacion.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json({
      bitrixDealId: cotizacion.bitrixDealId ?? null,
    });
  } catch (error) {
    console.error("[GET /api/cotizaciones/:id/bitrix] Error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

