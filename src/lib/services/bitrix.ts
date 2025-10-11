// lib/services/bitrix.ts
export async function callBitrix(
  path: string,
  accessToken: string,
  domain: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
) {
  const url = `https://${domain}/rest/${path}?auth=${accessToken}`;
  const options: RequestInit = { method };

  if (body) {
    options.body = JSON.stringify(body);
    options.headers = { "Content-Type": "application/json" };
  }

  const res = await fetch(url, options);
  return res.json();
}

export async function createDeal(
  payload: any,
  accessToken: string,
  domain: string
) {
  const CATEGORY_ID = 24;
  const STAGE_ID = "C24:NEW";

  const deal = {
    fields: {
      TITLE: `Cotizacion - ${payload.name} - ${payload.brand} ${
        payload.model
      } ${payload.vehicleValue} - Plan: ${
        payload.selectedPlanName ?? "N/A"
      } - Prima: ${payload.selectedNetPremium ?? "N/A"}`,
      CATEGORY_ID,
      STAGE_ID,
      NAME: payload.name,
      CURRENCY_ID: "USD",
      OPPORTUNITY: payload.vehicleValue,
      PHONE: payload.phone
        ? [{ VALUE: payload.phone, VALUE_TYPE: "WORK" }]
        : [],
      EMAIL: payload.email
        ? [{ VALUE: payload.email, VALUE_TYPE: "WORK" }]
        : [],
      UF_CRM_1699991426: payload.identification,
      UF_CRM_1675696681: payload.name,
      UF_CRM_1708442569166: payload.model,
      UF_CRM_1708442612728: payload.year,
      UF_CRM_1708442675536: payload.plate,
      UF_CRM_1757947153789: `${payload.vehicleValue}|USD`,
      UF_CRM_1708442550726: payload.brand,
      UF_CRM_1675696721: payload.email,
      UF_CRM_1758140561898: payload.city,
      UF_CRM_1747676789932: payload.age,
      UF_CRM_1758140844163: payload.gender,
      UF_CRM_1758120573688: payload.useOfVehicle,
      UF_CRM_1757969782406: payload.civilStatus,
      // extras de plan seleccionado
      UF_CRM_PLAN_NAME: payload.selectedPlanName,
      UF_CRM_PLAN_INSURER: payload.selectedInsurer,
      UF_CRM_PLAN_NETPREMIUM: payload.selectedNetPremium,
    },
  };

  return await callBitrix(
    "crm.deal.add.json",
    accessToken,
    domain,
    "POST",
    deal
  );
}
