"use server"
import { cookies } from "next/headers" 
import { prisma } from "@/lib/prisma"
import { PlanComparadoInput } from "@/interfaces/interfaces.type"
export async function updateCotizacionWithPlanesHistorial(
  cotizacionId: string,
  planes: PlanComparadoInput[]
) {
  try {
    await cookies() // ← AGREGAR ESTA LÍNEA
    
    // 1️⃣ Verificamos que la cotización exista
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: cotizacionId },
    })
    
    if (!cotizacion) {
      return { ok: false, message: "Cotización no encontrada" }
    }

    // 2️⃣ Obtenemos la versión anterior más alta
    const lastPlan = await prisma.planesComparados.findFirst({
      where: { cotizacionId },
      orderBy: { version: "desc" },
    })
    
    const nextVersion = lastPlan ? lastPlan.version + 1 : 1

    // 3️⃣ Creamos los nuevos planes (sin borrar los anteriores)
    await prisma.planesComparados.createMany({
      data: planes.map((plan) => ({
        cotizacionId,
        aseguradora: plan.aseguradora,
        nombrePlan: plan.nombrePlan,
        primaTotal: plan.primaTotal,
        primaNeta: plan.primaNeta ?? null,
        Tasa: plan.Tasa ?? null,
        deducible: plan.deducible || null,
        cobertura: plan.cobertura || null,
        beneficios: plan.beneficios || null,
        pdfUrl: plan.pdfUrl || null,
        selected: plan.selected ?? false,
        version: nextVersion,
      })),
    })

    // 4️⃣ Actualizamos la cotización (opcional)
    await prisma.cotizacion.update({
      where: { id: cotizacionId },
      data: { status: "completed", updatedAt: new Date() },
    })

    return {
      ok: true,
      message: `Planes agregados correctamente (versión ${nextVersion})`,
      version: nextVersion,
    }
  } catch (error) {
    console.error("Error actualizando cotización:", error)
    return { ok: false, message: "Error interno al actualizar la cotización" }
  }
}
