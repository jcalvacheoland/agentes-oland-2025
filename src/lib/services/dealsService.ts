import type { FormValues } from "@/schemas/formSchemas";
const DEALS_API_URL = "/api/deals"; // POST


export async function createDeal(payload: FormValues): Promise<{ success: true; dealId?: string }> {
const res = await fetch(DEALS_API_URL, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});
const json = await res.json();
if (!res.ok || !json?.success) {
const err: any = new Error(json?.error || "Error al enviar la cotización");
err.status = res.status; err.body = json; throw err;
}
return json;
}