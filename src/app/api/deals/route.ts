import { NextRequest, NextResponse } from "next/server"

const CATEGORY_ID = 24
const STAGE_ID = "C24:NEW"

async function callBitrix(
  path: string,
  accessToken: string,
  domain: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
) {
  const url = `https://${domain}/rest/${path}?auth=${accessToken}`
  const options: RequestInit = { method }

  if (body) {
    options.body = JSON.stringify(body)
    options.headers = { "Content-Type": "application/json" }
  }

  const res = await fetch(url, options)
  return res.json()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const accessToken = request.cookies.get("bitrix_access_token")?.value
    const domain = request.cookies.get("bitrix_domain")?.value

    if (!accessToken || !domain) {
      return NextResponse.json(
        {
          success: false,
          error: "No hay token de acceso o dominio",
        },
        { status: 401 },
      )
    }

    const deal = {
      fields: {
        TITLE: `Cotizacion - ${body.name} - ${body.brand} ${body.model} ${body.vehicleValue}`,
        CATEGORY_ID: CATEGORY_ID,
        STAGE_ID: STAGE_ID,
        NAME: body.name,
        CURRENCY_ID: "USD",
        OPPORTUNITY: body.vehicleValue,
        PHONE: [{ VALUE: body.phone, VALUE_TYPE: "WORK" }],
        EMAIL: [{ VALUE: body.email, VALUE_TYPE: "WORK" }],
        UF_CRM_1699991426: body.identification,
        UF_CRM_1675696681: body.name,
        UF_CRM_1708442569166: body.model,
        UF_CRM_1708442612728: body.year,
        UF_CRM_1708442675536: body.plate,
        UF_CRM_1757947153789: `${body.vehicleValue}|USD`,
        UF_CRM_1708442550726: body.brand,
        UF_CRM_1675696721: body.email,
        UF_CRM_1758140561898: body.city,
        UF_CRM_1747676789932: body.age,
        UF_CRM_1758140844163: body.gender,
        UF_CRM_1758120573688: body.useOfVehicle,
        UF_CRM_1757969782406: body.civilStatus,
      },
    }

    const result = await callBitrix(
      "crm.deal.add.json",
      accessToken,
      domain,
      "POST",
      deal,
    )

    if (result.result) {
      const dealId = result.result

      await callBitrix("crm.deal.update.json", accessToken, domain, "POST", {
        id: dealId,
        fields: {
          TITLE: `Cotizacion - ${body.name} - ${body.brand} ${body.model} ${body.vehicleValue}`,
        },
      })

      return NextResponse.json({
        success: true,
        dealId,
        message: "Deal creado y titulo actualizado con ID",
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error_description || "Error al crear el deal",
      },
      { status: 400 },
    )
  } catch (error: any) {
    console.error("Error POST /api/deals:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
