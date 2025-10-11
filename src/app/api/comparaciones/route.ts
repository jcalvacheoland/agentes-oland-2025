import { NextResponse } from "next/server"
import { createDeal } from "@/lib/services/bitrix"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("[api/comparaciones] Incoming payload:", JSON.stringify(body))

    // extraer tokens de cookies
    const cookieHeader = req.headers.get("cookie") ?? ""
    const accessToken = cookieHeader.match(/bitrix_access_token=([^;]+)/)?.[1]
    const domain = cookieHeader.match(/bitrix_domain=([^;]+)/)?.[1]

    if (!accessToken || !domain) {
      return NextResponse.json(
        { ok: false, error: "No hay token de acceso o dominio" },
        { status: 401 }
      )
    }

    // crear payload adaptado
    const dealPayload = {
      ...body.planRequest,
      selectedPlanName: body.selected?.planName,
      selectedInsurer: body.selected?.insurerName,
      selectedNetPremium: body.selected?.netPremium,
      compared: body.compared, // por si quieres guardarlo después
    }

    // llamada directa a Bitrix
    const dealResult = await createDeal(dealPayload, accessToken, domain)
    console.log("[api/comparaciones] Deal creado:", dealResult)

    return NextResponse.json({
      ok: true,
      forwarded: false,
      bitrix: dealResult,
    })
  } catch (err: any) {
    console.error("[api/comparaciones] Error:", err?.message ?? err)
    return NextResponse.json(
      { ok: false, error: err?.message ?? "server_error" },
      { status: 500 }
    )
  }
}
