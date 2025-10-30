"use server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IPlanRequest } from "@/interfaces/interfaces.type";
import { tr } from "zod/v4/locales";

/**
 * Server Action para crear una nueva cotización
 * @param data - Datos de la cotización (IPlanRequest)
 * @param bitrixDealId - ID opcional del deal de Bitrix
 * @returns La cotización creada o un error
 */
export async function createCotizacion(
  data: IPlanRequest,
  bitrixDealId?: string | null
) {
  try {
    await cookies();
    // Obtener el usuario autenticado
    const session = await auth();
    //logs para ver sesion
   /*  console.log("🔍 Sesión completa en server action:", JSON.stringify(session, null, 2));
    console.log("🔍 User ID:", session?.user?.id);
    console.log("🔍 User email:", session?.user?.email); */

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    // Crear la cotización en la base de datos
    const cotizacion = await prisma.cotizacion.create({
      data: {
        userId: session.user.id,
        bitrixDealId: data.bitrixDealId || null,
        plate: data.plate,
        submodelEqui: data.submodelEqui,
        brand: data.brand,
        model: data.model,
        year: data.year,
        vehicleValue: data.vehicleValue,
        type: data.type,
        subtype: data.subtype || null,
        extras: data.extras,
        newVehicle: data.newVehicle,
        useOfVehicle: data.useOfVehicle || null,
        city: data.city || null,
        identification: data.identification || null,
        name: data.name || null,
        firstLastName: data.firstLastName || null,
        secondLastName: data.secondLastName || null,
        gender: data.gender || null,
        civilStatus: data.civilStatus || null,
        birthdate: data.birthdate || null,
        age: String(data.age) || null,
        cityCodeMapfre: data.cityCodeMapfre || null,
        chubb_mm: data.chubb_mm || null,
        status: "draft",
        email:data.email||null,
        phone:data.phone||null
      },
    });

    return {
      success: true,
      data: cotizacion,
    };
  } catch (error) {
    console.error("Error creando cotización:", error);
    return {
      success: false,
      error: "Error al guardar la cotización",
    };
  }
}

/**
 * Server Action para actualizar una cotización existente
 * @param id - ID de la cotización
 * @param data - Datos parciales a actualizar
 * @returns La cotización actualizada o un error
 */
export async function updateCotizacion(
  id: string,
  data: Partial<IPlanRequest> & { bitrixDealId?: string; status?: string }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    // Verificar que la cotización pertenece al usuario
    const existing = await prisma.cotizacion.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Cotización no encontrada",
      };
    }

    if (existing.userId !== session.user.id) {
      return {
        success: false,
        error: "No tienes permiso para actualizar esta cotización",
      };
    }

    // Actualizar la cotización
    const cotizacion = await prisma.cotizacion.update({
      where: { id },
       data: {
        ...(data.bitrixDealId !== undefined && { bitrixDealId: data.bitrixDealId }),
        ...(data.plate && { plate: data.plate }),
        ...(data.submodelEqui && { submodelEqui: data.submodelEqui }),
        ...(data.brand && { brand: data.brand }),
        ...(data.model && { model: data.model }),
        ...(data.year && { year: data.year }),
        ...(data.vehicleValue && { vehicleValue: data.vehicleValue }),
        ...(data.type && { type: data.type }),
        ...(data.subtype !== undefined && { subtype: data.subtype }),
        ...(data.extras !== undefined && { extras: data.extras }),
        ...(data.newVehicle !== undefined && { newVehicle: data.newVehicle }),
        ...(data.useOfVehicle !== undefined && { useOfVehicle: data.useOfVehicle }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.identification !== undefined && { identification: data.identification }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.firstLastName !== undefined && { firstLastName: data.firstLastName }),
        ...(data.secondLastName !== undefined && { secondLastName: data.secondLastName }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.civilStatus !== undefined && { civilStatus: data.civilStatus }),
        ...(data.birthdate !== undefined && { birthdate: data.birthdate }),
        ...(data.age !== undefined && { age: String(data.age) }),
        ...(data.cityCodeMapfre !== undefined && { cityCodeMapfre: data.cityCodeMapfre }),
        ...(data.chubb_mm !== undefined && { chubb_mm: data.chubb_mm }),
        ...(data.status && { status: data.status }),
      },
    });

    return {
      success: true,
      data: cotizacion,
    };
  } catch (error) {
    console.error("Error actualizando cotización:", error);
    return {
      success: false,
      error: "Error al actualizar la cotización",
    };
  }
}

/**
 * Server Action para obtener cotizaciones del usuario
 * @returns Lista de cotizaciones del usuario autenticado
 */
export async function getUserCotizaciones() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const cotizaciones = await prisma.cotizacion.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: cotizaciones,
    };
  } catch (error) {
    console.error("Error obteniendo cotizaciones:", error);
    return {
      success: false,
      error: "Error al obtener las cotizaciones",
    };
  }
}

/**
 * Server Action para obtener una cotización específica
 * @param id - ID de la cotización
 * @returns La cotización o un error
 */
export async function getCotizacionById(id: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id },
    });

    if (!cotizacion) {
      return {
        success: false,
        error: "Cotización no encontrada",
      };
    }

    if (cotizacion.userId !== session.user.id) {
      return {
        success: false,
        error: "No tienes permiso para ver esta cotización",
      };
    }

    return {
      success: true,
      data: cotizacion,
    };
  } catch (error) {
    console.error("Error obteniendo cotización:", error);
    return {
      success: false,
      error: "Error al obtener la cotización",
    };
  }
}

export async function getCotizacionByBitrixId(dealId: string) {
  try {
    // Inicializa cookies (importante si estás usando autenticación por sesión)
    await cookies()

    // Obtener el usuario autenticado (opcional si no lo necesitas)
    const session = await auth()
    if (!session?.user) {
      throw new Error("Usuario no autenticado")
    }

    // Buscar la cotización por Bitrix Deal ID
          // 1️⃣ Obtener las dos versiones más recientes
      const ultimasVersiones = await prisma.planesComparados.findMany({
        where: { cotizacion: { bitrixDealId: dealId } },
        distinct: ["version"],
        orderBy: { version: "desc" },
        take: 3,
        select: { version: true },
      })

      const versiones = ultimasVersiones.map((v) => v.version)

      // 2️⃣ Traer todos los planes que tengan esas versiones
      const cotizacion = await prisma.cotizacion.findFirst({
        where: { bitrixDealId: dealId },
        include: {
          planesComparados: {
            where: {
              version: { in: versiones },
            },
            orderBy: { version: "desc" },
          },
        },
      })



    if (!cotizacion) {
      throw new Error("No se encontró la cotización con ese Bitrix ID")
    }

    return { ok: true, cotizacion }
  } catch (error) {
    console.error("Error en getCotizacionByBitrixId:", error)
    return { ok: false, error: (error as Error).message }
  }
}

//Funcion para buscar solo la cotizacion por bitrix id
export async function searchJustCotizacionByBitrixId(dealId: string) {
  try {
    // Inicializa cookies (importante si estás usando autenticación por sesión)
    await cookies()

    // Obtener el usuario autenticado (opcional si no lo necesitas)
    const session = await auth()
    if (!session?.user) {
      throw new Error("Usuario no autenticado")
    }
    
    const cotizacion = await prisma.cotizacion.findFirst({
      where: { bitrixDealId: dealId },
    })

    // Retornar el resultado
    return cotizacion

  } catch (error) {
    console.error("Error al buscar cotización para comparar:", error)
    throw error // o return null según tu manejo de errores
  }
}