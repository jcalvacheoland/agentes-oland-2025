import { NextRequest, NextResponse } from "next/server"
import { getBitrixAuthContext } from "@/lib/bitrix/session"
import { BITRIX_USER_AGENT, CATEGORY_ID, STAGE_ID } from "@/configuration/constants"


async function callBitrix(
  path: string,
  accessToken: string,
  restBase: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
) {
  const url = `${restBase}${path}?auth=${accessToken}`
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": BITRIX_USER_AGENT,
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(url, options)
  const payload = await res.json()

  if (!res.ok || payload?.error) {
    const message =
      payload?.error_description || payload?.error || `Bitrix request failed (${res.status})`
    throw new Error(message)
  }

  return payload
}

const buildDealPayload = (rawBody: any) => {
  const cliente = rawBody?.cliente ?? {}
  const vehiculo = rawBody?.vehiculo ?? {}

  const resolveNameFromForm = () => {
    const nombres = (cliente.nombres ?? "").toString().trim()
    const apellidosForm = (cliente.apellidos ?? "").toString().trim()
    const primerApellido = (cliente.primerApellido ?? "").toString().trim()
    const segundoApellido = (cliente.segundoApellido ?? "").toString().trim()

    const apellidos =
      apellidosForm ||
      [primerApellido, segundoApellido]
        .filter(Boolean)
        .join(" ")
        .trim()

    return [nombres, apellidos].filter(Boolean).join(" ").trim()
  }

  const name =
    (rawBody?.name ?? "").toString().trim() ||
    resolveNameFromForm() ||
    cliente.nombreCompleto ||
    ""

  const identification = rawBody?.identification ?? cliente.cedula ?? ""
  const email = rawBody?.email ?? cliente.email ?? ""
  const phone = rawBody?.phone ?? cliente.celular ?? ""
  const city = rawBody?.city ?? cliente.ciudad ?? ""
  const age = rawBody?.age ?? cliente.edad ?? ""
  const gender = rawBody?.gender ?? cliente.genero ?? ""
  const civilStatus = rawBody?.civilStatus ?? cliente.estadoCivil ?? ""
  const brand = rawBody?.brand ?? vehiculo.marca ?? ""
  const model = rawBody?.model ?? vehiculo.modelo ?? ""
  const year = rawBody?.year ?? vehiculo.anio ?? ""
  const plate = rawBody?.plate ?? vehiculo.placa ?? ""
  const value = rawBody?.vehicleValue ?? vehiculo.avaluo ?? ""
  const useOfVehicle = rawBody?.useOfVehicle ?? vehiculo.tipoUso ?? ""

  const titleParts = [
    "Cotizacion",
    name || "Sin nombre",
    brand || null,
    model || null,
    value || null,
  ].filter(Boolean)

  return {
    fields: {
      TITLE: titleParts.join(" - "),
      CATEGORY_ID: CATEGORY_ID,
      STAGE_ID: STAGE_ID,
      NAME: name,
      CURRENCY_ID: "USD",
      OPPORTUNITY: value,
      PHONE: phone ? [{ VALUE: phone, VALUE_TYPE: "WORK" }] : [],
      EMAIL: email ? [{ VALUE: email, VALUE_TYPE: "WORK" }] : [],
      UF_CRM_1699991426: identification,
      UF_CRM_1675696681: name,
      UF_CRM_1708442569166: model,
      UF_CRM_1708442612728: year,
      UF_CRM_1708442675536: plate,
      UF_CRM_1757947153789: value ? `${value}|USD` : "",
      UF_CRM_1708442550726: brand,
      UF_CRM_1675696721: email,
      UF_CRM_1758140561898: city,
      UF_CRM_1747676789932: age,
      UF_CRM_1758140844163: gender,
      UF_CRM_1758120573688: useOfVehicle,
      UF_CRM_1757969782406: civilStatus,
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => ({}))
    const { accessToken, restBase } = await getBitrixAuthContext()

    const deal = buildDealPayload(rawBody)
    const addResult = await callBitrix("crm.deal.add.json", accessToken, restBase, "POST", deal)

    const dealId = addResult.result

    if (!dealId) {
      return NextResponse.json(
        {
          success: false,
          error: addResult?.error_description || addResult?.error || "Error al crear el deal",
        },
        { status: 400 },
      )
    }
    
    //crear titulo con id en bitrix
    const titleToUpdate = `${deal.fields.TITLE} - ID ${dealId}`
    await callBitrix("crm.deal.update.json", accessToken, restBase, "POST", {
      id: dealId,
      fields: {
        TITLE: titleToUpdate,
      },
    })

    return NextResponse.json({
      success: true,
      dealId,
      message: "Deal creado y titulo actualizado con ID",
    })
  } catch (error: any) {
    console.error("Error POST /api/bitrix/putDealBitrix:", error)
    const message = typeof error?.message === "string" ? error.message : "Error interno"
    const status = message === "Unauthorized" ? 401 : 500
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status },
    )
  }
}
