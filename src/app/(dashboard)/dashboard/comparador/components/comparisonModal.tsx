"use client"
import { X, Check } from "lucide-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button";
import { AseguradorasLogo } from "@/configuration/constants";
import { PdfBuild } from "./PdfBuild";
type PlanEntry = {
  insurerKey: string
  planIndex: number
  plan: any
}

export type ComparedPlanPayload = {
  insurerKey: string
  planName: string
  logoUrl: string
  pricing: {
    totalPremium: number | null
    period: number
    monthly: number
  }
  netPremium: number | null
  coverages: {
    civilLiability: string | boolean
    accidentalDeath: string | boolean
    medicalExpenses: string | boolean
  }
  deductibles: {
    partialLoss: string | boolean
    totalLossDamage: string | boolean
    totalLossTheftWithDevice: string | boolean
    totalLossTheftWithoutDevice: string | boolean
  }
  benefits: {
    patrimonialCoverage: string | boolean
    airbag: string | boolean
    towService: string | boolean
    vehicleAssistance: string | boolean
    legalAssistance: string | boolean
    exequialAssistance: string | boolean
    substituteAuto: string | boolean
    andeanPact: string | boolean
  }
  rawPlan: any
}

interface ComparisonModalProps {
  selected: PlanEntry[]
  onClose: () => void
  onConfirm?: (payload: {
    compared: ComparedPlanPayload[]
  }) => void
}

export default function ComparisonModal({ selected, onClose, onConfirm }: ComparisonModalProps) {
  function formatCurrency(amount: number | null | undefined): string {
    if (!amount) return "-"
    return `$${Number(amount).toFixed(2)}`
  }

  function getNetPremium(plan: any): number | null {
    if (!plan) return null
    const candidates = [
      plan.netPremium,
      plan.primaNeta,
      plan.neto,
      plan.premiumNet,
      plan.premium_net,
    ]
    for (const c of candidates) {
      if (typeof c === "number" && !isNaN(c)) return c
      if (typeof c === "string" && c.trim() !== "" && !isNaN(Number(c))) return Number(c)
    }
    return null
  }

  function extractPrincipalCoverageValue(
    principals: any,
    labels: string[]
  ): string | null {
    const raw = principals?.["PRINCIPALES COBERTURAS"]
    if (typeof raw !== "string") {
      return null
    }

    const segments = raw
      .replace(/\r/g, "")
      .split(/\/\*\/|\n/)
      .map((segment) => segment.replace(/\s+/g, " ").trim())
      .filter((segment) => segment.length > 0)

    const toComparable = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()

    const normalizedLabels = labels
      .map((label) => label.replace(/:\s*$/, ""))
      .map(toComparable)

    for (const segment of segments) {
      const [segmentLabel, ...rest] = segment.split(":")
      if (!rest.length) continue
      const value = cleanupDisplayText(rest.join(":").trim())
      if (!value) continue

      const comparableSegmentLabel = toComparable(segmentLabel)
      if (normalizedLabels.includes(comparableSegmentLabel)) {
        return value
      }
    }

    return null
  }

  function cleanupDisplayText(text: string): string {
    const cleaned = text
      .replace(/\s*\/+\s*/g, ", ")
      .replace(/\s+/g, " ")
      .replace(/,\s*,+/g, ", ")
      .replace(/,\s*$/g, "")
      .trim()

    return cleaned.length > 0 ? cleaned : text.trim()
  }

  function formatInsurerName(insurerKey: string): string {
    if (typeof insurerKey !== "string" || !insurerKey.trim()) {
      return "-"
    }
    return insurerKey.toLowerCase() === "asur"
      ? "ASEGURADORA DEL SUR"
      : insurerKey.toUpperCase()
  }

  function formatPlanName(plan: any): string {
    const name = typeof plan?.planName === "string" ? plan.planName.trim() : ""
    if (name && name !== "S123 CHUBB") {
      return name
    }
    return "CHUBB"
  }

  function normalizeBenefitText(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  }

  type BenefitEntry = {
    original: string
    normalized: string
  }

  function collectBenefitEntries(plan: any): BenefitEntry[] {
    const entries: BenefitEntry[] = []

    const pushValue = (input: unknown) => {
      if (typeof input !== "string") return
      const trimmed = input.trim()
      if (!trimmed) return
      entries.push({
        original: trimmed,
        normalized: normalizeBenefitText(trimmed.replace(/\s+/g, " ")),
      })
    }

    const pushAndSplit = (input: unknown) => {
      if (typeof input !== "string") return
      input
        .split(/\/\*\/|\n/)
        .map((fragment) => fragment.replace(/\s+/g, " ").trim())
        .forEach(pushValue)
    }

    if (Array.isArray(plan?.secondaries)) {
      plan.secondaries.forEach((item: any) => {
        pushValue(item?.detail)
        pushValue(item?.name)
      })
    }

    if (Array.isArray(plan?.notes)) {
      plan.notes.forEach((note: any) => {
        pushValue(note?.text)
        pushValue(note?.title)
      })
    }

    if (plan?.principals) {
      Object.values(plan.principals).forEach(pushAndSplit)
    }

    return entries
  }

  function hasBenefitFromContent(plan: any, keywords: string[]): boolean {
    if (!Array.isArray(keywords) || !keywords.length) {
      return false
    }

    const normalizedKeywords = keywords.map((keyword) => normalizeBenefitText(keyword))
    const entries = collectBenefitEntries(plan)

    return entries.some((entry) =>
      normalizedKeywords.some((keyword) => entry.normalized.includes(keyword))
    )
  }

  const BENEFIT_KEYWORDS: Record<string, string[]> = {
    patrimonialCoverage: ["amparo patrimonial", "proteccion patrimonial"],
    airbag: ["airbag"],
    towService: ["servicio de grua", "grua", "auxilio vial", "remolque"],
    vehicleAssistance: [
      "asistencia vehicular",
      "asistencia zurich",
      "asistencia vial",
      "asistencia en carretera",
    ],
    legalAssistance: ["asistencia legal"],
    exequialAssistance: ["asistencia exequial", "servicio exequial", "servicio de sepelio", "sepelio"],
    substituteAuto: ["auto sustituto", "vehiculo sustituto", "auto de reemplazo", "vehiculo de reemplazo"],
    andeanPact: ["pacto andino"],
  }

  function resolveBenefitFromCoverage(plan: any, key: string): boolean | undefined {
    if (!Array.isArray(plan?.coverageBenefits)) return undefined

    const indexMap: Record<string, number | number[]> = {
      airbag: 8,
      towService: 9,
      vehicleAssistance: 10,
      legalAssistance: 11,
      exequialAssistance: 12,
      substituteAuto: [13, 14],
    }

    const indexes = indexMap[key]
    if (indexes === undefined) return undefined

    const values = (Array.isArray(indexes) ? indexes : [indexes])
      .map((idx) => plan.coverageBenefits[idx])
      .filter((value) => value !== undefined)

    if (!values.length) return undefined

    const toBoolean = (value: unknown): boolean => {
      if (typeof value === "number") return value === 1
      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase()
        const withoutAccents = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        return withoutAccents === "1" || withoutAccents === "si"
      }
      return Boolean(value)
    }

    return values.some((value) => toBoolean(value))
  }

  function getCoverageValue(plan: any, key: string): string | boolean {
    if (!plan) return "-"

    // Check principals object for coverage details
    if (plan.principals) {
      const principals = plan.principals

      switch (key) {
        case "civilLiability": {
          const value =
            typeof principals["PRINCIPALES COBERTURAS"] === "string"
              ? extractPrincipalCoverageValue(principals, ["Responsabilidad Civil:"])
              : null
          return value ?? "-"
        }
        case "accidentalDeath": {
          const value =
            typeof principals["PRINCIPALES COBERTURAS"] === "string"
              ? extractPrincipalCoverageValue(principals, ["Muerte Accidental:"])
              : null
          return value ?? "-"
        }
        case "medicalExpenses": {
          const value =
            typeof principals["PRINCIPALES COBERTURAS"] === "string"
              ? extractPrincipalCoverageValue(
                  principals,
                  [
                    "Gastos Medicos:",
                    "Gastos Medicos por Accidente:",
                    "Gastos Medicos por ocupante:",
                  ]
                )
              : null
          return value ?? "-"
        }
      }
    }

    if (plan.clickSeguros && Array.isArray(plan.clickSeguros)) {
      const deductibles = plan.clickSeguros
      switch (key) {
        case "partialLoss":
          const partialLoss = deductibles.find((d: any) => d.title === "Perdida parcial")
          return cleanupDisplayText(partialLoss?.text || "10% del valor del siniestro, 1% del valor asegurado, mínimo...")
        case "totalLossDamage":
          const totalDamage = deductibles.find((d: any) => d.title === "Perdida total por daño")
          return cleanupDisplayText(totalDamage?.text || "15% valor asegurado")
        case "totalLossTheftWithDevice":
          const theftWith = deductibles.find((d: any) => d.title === "Perdida total por robo (con dispositivo)")
          return cleanupDisplayText(theftWith?.text || "30% valor asegurado")
        case "totalLossTheftWithoutDevice":
          const theftWithout = deductibles.find((d: any) => d.title === "Perdida total por robo (sin dispositivo)")
          return cleanupDisplayText(theftWithout?.text || "15% valor asegurado")
      }
    }

    if (BENEFIT_KEYWORDS[key]) {
      if (hasBenefitFromContent(plan, BENEFIT_KEYWORDS[key])) {
        return true
      }
      const fallback = resolveBenefitFromCoverage(plan, key)
      if (typeof fallback === "boolean") {
        return fallback
      }
      return false
    }

    return "-"
  }

  function getPricing(plan: any) {
    const total = plan?.totalPremium || 0
    const period = plan?.period || 12
    const monthly = total / period

    return { monthly, period }
  }

  const comparedPayload = selected.map((s, idx): ComparedPlanPayload => {
    const { monthly, period } = getPricing(s.plan)
    const totalPremiumCandidate = s.plan?.totalPremium
    const totalPremium =
      typeof totalPremiumCandidate === "number"
        ? totalPremiumCandidate
        : typeof totalPremiumCandidate === "string" && totalPremiumCandidate.trim() !== "" && !isNaN(Number(totalPremiumCandidate))
          ? Number(totalPremiumCandidate)
          : null
    const logoUrl =
      AseguradorasLogo.find((logo) => logo.name.toLowerCase().includes(s.insurerKey.toLowerCase()))?.img || ""

    return {
      insurerKey: s.insurerKey,
      planName: formatPlanName(s.plan),
      logoUrl,
      pricing: {
        totalPremium,
        period,
        monthly,
      },
      netPremium: getNetPremium(s.plan),
      coverages: {
        civilLiability: getCoverageValue(s.plan, "civilLiability"),
        accidentalDeath: getCoverageValue(s.plan, "accidentalDeath"),
        medicalExpenses: getCoverageValue(s.plan, "medicalExpenses"),
      },
      deductibles: {
        partialLoss: getCoverageValue(s.plan, "partialLoss"),
        totalLossDamage: getCoverageValue(s.plan, "totalLossDamage"),
        totalLossTheftWithDevice: getCoverageValue(s.plan, "totalLossTheftWithDevice"),
        totalLossTheftWithoutDevice: getCoverageValue(s.plan, "totalLossTheftWithoutDevice"),
      },
      benefits: {
        patrimonialCoverage: getCoverageValue(s.plan, "patrimonialCoverage"),
        airbag: getCoverageValue(s.plan, "airbag"),
        towService: getCoverageValue(s.plan, "towService"),
        vehicleAssistance: getCoverageValue(s.plan, "vehicleAssistance"),
        legalAssistance: getCoverageValue(s.plan, "legalAssistance"),
        exequialAssistance: getCoverageValue(s.plan, "exequialAssistance"),
        substituteAuto: getCoverageValue(s.plan, "substituteAuto"),
        andeanPact: getCoverageValue(s.plan, "andeanPact"),
      },
      rawPlan: s.plan,
    }
  })

  const pdfDocument = <PdfBuild data={comparedPayload} />

  const handleConfirm = () => {
    if (!onConfirm) return
    // We send the enriched payload so the consumer can reproduce the comparison (e.g. when generating a PDF).
    onConfirm({ compared: comparedPayload })
  }
  /* console log para ver que datos captura */
  /* console.log("ComparisonModal render with selected:", selected) */

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 border-2 border-gray-400 rounded flex items-center justify-center text-gray-600 hover:bg-gray-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex-1 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 text-center">Coberturas y Beneficios</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-3 font-normal text-gray-600 min-w-[200px]"></th>
                  {selected.map((s, idx) => (
                    <th key={idx} className="py-4 px-4 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className=" rounded-lg flex items-center justify-center border">
                       {/*   logo */}
                         <div className="w-24 h-24">
                            <img
                            src={AseguradorasLogo.find((logo) => logo.name.toLowerCase().includes(s.insurerKey.toLowerCase()))?.img || ""}
                            >
                            </img>
                          </div>
                        </div>
                        <div className="font-bold text-blue-600 text-base">
                          {formatInsurerName(s.insurerKey)}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Producto</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center text-gray-600 text-xs">
                      {formatPlanName(s.plan)}
                    </td>
                  ))}
                </tr>

                

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Prima Total (valor mensual)</td>
                  {selected.map((s, idx) => {
                    const { monthly } = getPricing(s.plan)
                    return (
                      <td key={idx} className="py-3 px-4 text-center font-semibold text-gray-900">
                        {formatCurrency(monthly)}
                      </td>
                    )
                  })}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Responsabilidad Civil</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center text-gray-600 text-xs">
                      {getCoverageValue(s.plan, "civilLiability")}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Muerte Accidental</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center text-gray-600 text-xs">
                      {getCoverageValue(s.plan, "accidentalDeath")}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Gastos Médicos</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center text-gray-600 text-xs">
                      {getCoverageValue(s.plan, "medicalExpenses")}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Amparo Patrimonial</td>
                  {selected.map((s, idx) => {
                    const value = getCoverageValue(s.plan, "patrimonialCoverage")
                    return (
                      <td key={idx} className="py-3 px-4 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-600 text-xs">{value}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Pérdida parcial por daño o robo</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center text-gray-600 text-xs">
                      {getCoverageValue(s.plan, "partialLoss")}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Pérdida total por daño</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center text-gray-600 text-xs">
                      {getCoverageValue(s.plan, "totalLossDamage")}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">
                    Pérdida total por robo (sin dispositivo de rastreo)
                  </td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center text-gray-600 text-xs">
                      {getCoverageValue(s.plan, "totalLossTheftWithoutDevice")}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">
                    Pérdida total por robo (con dispositivo de rastreo)
                  </td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center text-gray-600 text-xs">
                      {getCoverageValue(s.plan, "totalLossTheftWithDevice")}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Pacto Andino</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center">
                      {getCoverageValue(s.plan, "andeanPact") ? (
                        <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Airbag</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center">
                      {getCoverageValue(s.plan, "airbag") ? (
                        <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Servicio de grúa</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center">
                      {getCoverageValue(s.plan, "towService") ? (
                        <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Asistencia vehicular</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center">
                      {getCoverageValue(s.plan, "vehicleAssistance") ? (
                        <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Asistencia legal</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center">
                      {getCoverageValue(s.plan, "legalAssistance") ? (
                        <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Asistencia exequial</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center">
                      {getCoverageValue(s.plan, "exequialAssistance") ? (
                        <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Auto sustituto</td>
                  {selected.map((s, idx) => (
                    <td key={idx} className="py-3 px-4 text-center">
                      {getCoverageValue(s.plan, "substituteAuto") ? (
                        <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                
              </tbody>
            </table>           
          </div>        
        </div>
       {/* Descargar PDF */}
        <div className="flex flex-row items-center px-4">
          <h1 className="ml-4 font-bold">Descargar PDF</h1>
          <div className="place-content-center space-x-3 mx-auto p-4">
            <PDFDownloadLink
              document={pdfDocument}
              fileName="comparacion-oland-seguros.pdf"
            >
              {({ loading }) => (
                <Button
                  variant="oland"
                  disabled={loading}
                  onClick={(event) => {
                    if (loading) {
                      event.preventDefault()
                      return
                    }
                    handleConfirm()
                  }}
                >
                  {loading ? "Generando..." : "PDF OlandSeguros"}
                </Button>
              )}
            </PDFDownloadLink>

            <PDFDownloadLink
              document={pdfDocument}
              fileName="comparacion-personalizada.pdf"
            >
              {({ loading }) => (
                <Button
                  variant="oland"
                  disabled={loading}
                  onClick={(event) => {
                    if (loading) {
                      event.preventDefault()
                      return
                    }
                    handleConfirm()
                  }}
                >
                  {loading ? "Generando..." : "PDF Personalizado"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
        {/* Fin Descargar PDF */}
            
      </div>
    </div>
  )
}
