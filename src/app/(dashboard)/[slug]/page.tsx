import { getBitrixDeal } from "@/actions/bitrixActions"

export default async function DealPage(props: { params: Promise<{ slug: string }> }) {
  // 👇 aquí esperamos los params
  const { slug } = await props.params

  const response = await getBitrixDeal(slug)

  if (!response.ok || !response.deal) {
    return <div>Error: {response.error || "No se encontró la cotización"}</div>
  }

  const deal = response.deal

  return (
<div className="p-6 space-y-2">
  <h1 className="text-xl font-bold">{deal.TITLE}</h1>

  <p><strong>Valor del negocio:</strong> {deal.OPPORTUNITY} USD</p>
  <p><strong>Etapa:</strong> {deal.STAGE_ID}</p>

  <hr className="my-3" />

  <h2 className="font-semibold text-lg">🧍 Datos del cliente</h2>
  <p><strong>Nombre:</strong> {deal.UF_CRM_1675696681}</p>
  <p><strong>Cédula / Identificación:</strong> {deal.UF_CRM_1699991426}</p>
  <p><strong>Ciudad:</strong> {deal.UF_CRM_1758140561898}</p>
  <p><strong>Estado civil:</strong> {deal.UF_CRM_1757969782406}</p>
  <p><strong>Género:</strong> {deal.UF_CRM_1758140844163}</p>

  <hr className="my-3" />

  <h2 className="font-semibold text-lg">🚗 Datos del vehículo</h2>
  <p><strong>Marca:</strong> {deal.UF_CRM_1708442550726}</p>
  <p><strong>Modelo:</strong> {deal.UF_CRM_1708442569166}</p>
  <p><strong>Año:</strong> {deal.UF_CRM_1708442612728}</p>
  <p><strong>Placa:</strong> {deal.UF_CRM_1708442675536}</p>
  <p><strong>Uso del vehículo:</strong> {deal.UF_CRM_1747676789932}</p>
  <p><strong>Valor del vehículo:</strong> {deal.UF_CRM_1757947153789}</p>
</div>

  )
}
