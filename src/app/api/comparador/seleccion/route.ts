import { NextRequest, NextResponse } from "next/server"

type ComparadorSelectionPayload = {
  source: "comparador"
  selectedPlanId: string
  selectedPlan: unknown
  comparedPlans: unknown[]
  metadata?: Record<string, unknown>
}

type CotizacionSelectionPayload = {
  source: "cotizaciones"
  selectedDealId: string
  selectedDeal: unknown
  metadata?: Record<string, unknown>
}

type SelectionPayload = ComparadorSelectionPayload | CotizacionSelectionPayload

type SelectionRequest = SelectionPayload & {
  receivedAt?: string
}

function isComparadorPayload(payload: SelectionPayload): payload is ComparadorSelectionPayload {
  return payload.source === "comparador"
}

function isCotizacionPayload(payload: SelectionPayload): payload is CotizacionSelectionPayload {
  return payload.source === "cotizaciones"
}

function validatePayload(payload: any): payload is SelectionPayload {
  if (!payload || typeof payload !== "object") return false
  if (payload.source === "comparador") {
    return (
      typeof payload.selectedPlanId === "string" &&
      payload.selectedPlanId.length > 0 &&
      Array.isArray(payload.comparedPlans)
    )
  }
  if (payload.source === "cotizaciones") {
    return typeof payload.selectedDealId === "string" && payload.selectedDealId.length > 0
  }
  return false
}

export async function POST(request: NextRequest) {
  let payload: SelectionRequest

  try {
    const body = await request.json()
    if (!validatePayload(body)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Payload inválido. Revisa los campos requeridos para la fuente indicada.",
        },
        { status: 400 },
      )
    }

    payload = {
      ...body,
      receivedAt: new Date().toISOString(),
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "No se pudo parsear el cuerpo de la petición.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    )
  }

  if (isComparadorPayload(payload)) {
    const comparedPlansInfo = Array.isArray(payload.comparedPlans)
      ? payload.comparedPlans.map((plan: any) => ({
          id: plan?.id,
          aseguradora: plan?.aseguradora,
          netPremium: plan?.netPremium ?? null,
        }))
      : []

    const selectedPlanInfo = (payload as any).selectedPlan ?? {}
    const selectedPlanAseguradora =
      typeof selectedPlanInfo?.aseguradora === "string" ? selectedPlanInfo.aseguradora : null

    console.info("[Comparador] Selección recibida", {
      selectedPlanId: payload.selectedPlanId,
      selectedPlanAseguradora,
      selectedPlanNetPremium: selectedPlanInfo?.netPremium ?? null,
      comparedPlans: comparedPlansInfo,
      receivedAt: payload.receivedAt,
    })
  }

  if (isCotizacionPayload(payload)) {
    const metadata = (payload as any).metadata ?? {}
    console.info("[Cotizaciones] Selección recibida", {
      selectedDealId: payload.selectedDealId,
      netPremium: metadata?.netPremium ?? null,
      receivedAt: payload.receivedAt,
    })
  }

  const responseBody: Record<string, unknown> = { ok: true, receivedAt: payload.receivedAt }

  if (isComparadorPayload(payload)) {
    responseBody.comparador = {
      selectedPlanId: payload.selectedPlanId,
      selectedPlanAseguradora: (payload as any).selectedPlan?.aseguradora ?? null,
      selectedPlanNetPremium: (payload as any).selectedPlan?.netPremium ?? null,
      comparedPlans: Array.isArray(payload.comparedPlans)
        ? payload.comparedPlans.map((plan: any) => ({
            id: plan?.id,
            aseguradora: plan?.aseguradora,
            netPremium: plan?.netPremium ?? null,
          }))
        : [],
    }
  }

  if (isCotizacionPayload(payload)) {
    responseBody.cotizacion = {
      selectedDealId: payload.selectedDealId,
      netPremium: (payload as any).metadata?.netPremium ?? null,
    }
  }

  return NextResponse.json(responseBody)
}
