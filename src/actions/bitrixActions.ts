"use server"
import { BITRIX_WEBHOOK } from "../configuration/constants"
import {getBitrixAuthContext} from "@/lib/bitrix/session";

export async function getBitrixDeal(dealId: string) {
  try {
    const res = await fetch(`${BITRIX_WEBHOOK}/crm.deal.get.json?ID=${dealId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    const data = await res.json()

    if (data.error) {
      return { ok: false, error: data.error_description }
    }

    if (!data.result) {
      return { ok: false, error: "No se encontró el deal" }
    }

    return { ok: true, deal: data.result }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}



export async function updateBitrixDealWithPlanSelected(
  dealId: string,
  planData: {
    aseguradora: string
    plan: string
    tasa: number
    primaNeta: number
    primaTotal: number
  }
) {
  try {
    const { accessToken, restBase } = await getBitrixAuthContext()

    const res = await fetch(`${restBase}crm.deal.update.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        id: dealId,
        fields: {
          UF_CRM_1732759057629: planData.tasa, // TASA
          UF_CRM_1733258852031: planData.primaNeta, // Prima Neta
          UF_CRM_PRIMA_TOTAL: planData.primaTotal, // Prima Total
          UF_CRM_ASEGURADORA_SELECCIONADA: planData.aseguradora, // Aseguradora
          UF_CRM_PLAN_SELECCIONADO: planData.plan, // Plan
          STAGE_ID:"C24:PREPARATION",
        },
      }),
    })

    const data = await res.json()

    if (!data.result) {
      return { ok: false, error: data.error_description || "No se pudo actualizar el deal" }
    }

    return { ok: true, result: data.result }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}