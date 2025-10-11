"use server";

import { createDealInBitrix } from "@/lib/services/api";

// 👇 Definimos un tipo para que no tengas "any"
interface ComparedPlan {
  planName: string;
  insurerName: string;
  netPremium: number;
}

interface PlanRequest {
  plate: string;
  brand: string;
  model: string;
  year: number;
  vehicleValue: number;
  identification: string;
  name: string;
  firstLastName: string;
  secondLastName: string;
  gender: string;
  civilStatus: string;
  birthdate: string;
  age: number;
  city: string;
  useOfVehicle: string;
  email?: string;
  phone?: string;
}

interface ComparisonPayload {
  selected: ComparedPlan;
  compared: ComparedPlan[];
  planRequest: PlanRequest;
}

export async function sendBitrixAction(payload: ComparisonPayload) {
  const accessToken = process.env.BITRIX_TOKEN!;
  const domain = process.env.BITRIX_DOMAIN!;
  const CATEGORY_ID = 24;
  const STAGE_ID = "C24:NEW";

  const fields = {
    TITLE: `Cotizacion - ${payload.planRequest.name} - ${payload.planRequest.brand} ${payload.planRequest.model}`,
    CATEGORY_ID,
    STAGE_ID,
    CURRENCY_ID: "USD",
    NAME: payload.planRequest.name,

    // 👇 ojo: aquí decides qué valor usar en OPPORTUNITY
    OPPORTUNITY: payload.selected.netPremium, // (o vehicleValue si prefieres)

    // Cliente
    UF_CRM_1699991426: payload.planRequest.identification,  // cédula
    UF_CRM_1675696681: payload.planRequest.name,            // nombres
    UF_CRM_1675696721: payload.planRequest.email ?? "",
    PHONE: payload.planRequest.phone
      ? [{ VALUE: payload.planRequest.phone, VALUE_TYPE: "WORK" }]
      : [],

    // Vehículo
    UF_CRM_1708442550726: payload.planRequest.brand,
    UF_CRM_1708442569166: payload.planRequest.model,
    UF_CRM_1708442612728: payload.planRequest.year,
    UF_CRM_1708442675536: payload.planRequest.plate,
    UF_CRM_1757947153789: `${payload.planRequest.vehicleValue}|USD`,

    // Datos adicionales
    UF_CRM_1758140561898: payload.planRequest.city,
    UF_CRM_1747676789932: payload.planRequest.age,
    UF_CRM_1758140844163: payload.planRequest.gender,
    UF_CRM_1758120573688: payload.planRequest.useOfVehicle,
    UF_CRM_1757969782406: payload.planRequest.civilStatus,
    UF_CRM_1758000000000: payload.planRequest.birthdate,

    /* // Información del plan seleccionado
    UF_CRM_PLAN_SELECCIONADO: `${payload.selected.insurerName} - ${payload.selected.planName}`,
    UF_CRM_PRIMA_NETA: payload.selected.netPremium,

    // Planes comparados
    UF_CRM_PLANES_COMPARADOS: payload.compared
      .map(
        (c) => `${c.insurerName} - ${c.planName}: $${c.netPremium}`
      )
      .join("\n"), */
  };

  return createDealInBitrix(fields, accessToken, domain);
}
