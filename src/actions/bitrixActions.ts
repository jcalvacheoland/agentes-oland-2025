"use server"

import { BITRIX_WEBHOOK } from "../configuration/constants"

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
