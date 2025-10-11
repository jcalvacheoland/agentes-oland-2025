// app/api/update-deal/route.ts
import { NextResponse } from "next/server";

const aseguradoraEnumMap: Record<string, string> = {
  zurich: "23344",
  equinoccial: "23346",
  aig: "23348",
  atlantida: "23350",
  "aseguradora del sur": "23352",
  asur: "23352",
  chubb: "23354",
  interoceanica: "23356",
  generali: "23358",
  alianza: "23360",
  latina: "23362",
  sweaden: "23366",
  condor: "23368",
  ama: "23370",
  hispana: "23372",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dealId = Number(body.dealId || body.id);
    const selected = String(body.selectedPlanAseguradora || "").trim().toLowerCase();

    if (!dealId || !selected) {
      return NextResponse.json({ error: "Falta dealId o selectedPlanAseguradora" }, { status: 400 });
    }

    const enumId = aseguradoraEnumMap[selected];
    if (!enumId) {
      return NextResponse.json({ error: `No existe mapping para: ${selected}` }, { status: 400 });
    }

    const domain = process.env.BITRIX_DOMAIN;
    const user = process.env.BITRIX_USER_ID;
    const key = process.env.BITRIX_WEBHOOK_KEY;
    if (!domain || !user || !key) {
      return NextResponse.json({ error: "Faltan variables de entorno de Bitrix" }, { status: 500 });
    }

    const url = `https://${domain}/rest/${user}/${key}/crm.deal.update.json`;
    const payload = {
      id: dealId,
      fields: { UF_CRM_1758911447: String(enumId) },
      params: { REGISTER_SONET_EVENT: "Y" },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json({ bitrix: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
