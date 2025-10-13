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

  function getCoverageValue(plan: any, key: string): string | boolean {
    if (!plan) return "-"

    // Check principals object for coverage details
    if (plan.principals) {
      const principals = plan.principals

      switch (key) {
        case "civilLiability":
          return principals["PRINCIPALES COBERTURAS"]?.includes("Responsabilidad Civil")
            ? principals["PRINCIPALES COBERTURAS"].split("\n")[0].replace("Responsabilidad Civil: ", "")
            : "-"
        case "accidentalDeath":
          return principals["PRINCIPALES COBERTURAS"]?.includes("Muerte Accidental")
            ? principals["PRINCIPALES COBERTURAS"].split("\n")[1]?.replace("/*/Muerte Accidental: ", "") || "-"
            : "-"
        case "medicalExpenses":
          return principals["PRINCIPALES COBERTURAS"]?.includes("Gastos Médicos")
            ? principals["PRINCIPALES COBERTURAS"].split("\n")[2]?.replace("/*/Gastos Médicos: ", "") || "-"
            : "-"
      }
    }

    if (plan.clickSeguros && Array.isArray(plan.clickSeguros)) {
      const deductibles = plan.clickSeguros
      switch (key) {
        case "partialLoss":
          const partialLoss = deductibles.find((d: any) => d.title === "Perdida parcial")
          return partialLoss?.text || "10% del valor del siniestro, 1% del valor asegurado, mínimo..."
        case "totalLossDamage":
          const totalDamage = deductibles.find((d: any) => d.title === "Perdida total por daño")
          return totalDamage?.text || "15% valor asegurado"
        case "totalLossTheftWithDevice":
          const theftWith = deductibles.find((d: any) => d.title === "Perdida total por robo (con dispositivo)")
          return theftWith?.text || "30% valor asegurado"
        case "totalLossTheftWithoutDevice":
          const theftWithout = deductibles.find((d: any) => d.title === "Perdida total por robo (sin dispositivo)")
          return theftWithout?.text || "15% valor asegurado"
      }
    }

    // Check coverageBenefits array for boolean values
    if (plan.coverageBenefits && Array.isArray(plan.coverageBenefits)) {
      const benefits = plan.coverageBenefits
      switch (key) {
        case "patrimonialCoverage":
          return benefits[3] === "1"
        case "airbag":
          return benefits[8] === "1"
        case "towService":
          return benefits[9] === "1"
        case "vehicleAssistance":
          return benefits[10] === "1"
        case "legalAssistance":
          return benefits[11] === "1"
        case "sexualAssistance":
          return benefits[12] === "1"
        case "substituteAuto":
          return benefits[13] === "1" || benefits[14] === "1"
      }
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
      planName: s.plan?.planName || `Plan ${idx + 1}`,
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
        exequialAssistance: getCoverageValue(s.plan, "sexualAssistance"),
        substituteAuto: getCoverageValue(s.plan, "substituteAuto"),
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
                        <div className="font-bold text-blue-600 text-base">{s.insurerKey.toUpperCase()}</div>
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
                      {s.plan?.planName || `Plan ${s.planIndex + 1}`}
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
                      <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Airbag</td>
                  {selected.map((s, idx) => {
                    const value = getCoverageValue(s.plan, "airbag")
                    return (
                      <td key={idx} className="py-3 px-4 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                          ) : (
                            <span className="text-gray-600 text-xs">
                              Cobertura hasta 200 km de la frontera de Perú y Colombia
                            </span>
                          )
                        ) : (
                          <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Servicio de grúa</td>
                  {selected.map((s, idx) => {
                    const value = getCoverageValue(s.plan, "towService")
                    return (
                      <td key={idx} className="py-3 px-4 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                          ) : (
                            <span className="text-gray-600 text-xs">100% a consecuencia de siniestro</span>
                          )
                        ) : (
                          <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Asistencia vehicular</td>
                  {selected.map((s, idx) => {
                    const value = getCoverageValue(s.plan, "vehicleAssistance")
                    return (
                      <td key={idx} className="py-3 px-4 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Asistencia legal</td>
                  {selected.map((s, idx) => {
                    const value = getCoverageValue(s.plan, "legalAssistance")
                    return (
                      <td key={idx} className="py-3 px-4 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>

                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="py-3 px-3 text-gray-700 font-medium">Asistencia exequial</td>
                  {selected.map((s, idx) => {
                    const value = getCoverageValue(s.plan, "sexualAssistance")
                    return (
                      <td key={idx} className="py-3 px-4 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-3 px-3 text-gray-700 font-medium">Auto sustituto</td>
                  {selected.map((s, idx) => {
                    const value = getCoverageValue(s.plan, "substituteAuto")
                    return (
                      <td key={idx} className="py-3 px-4 text-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          <Check className="w-5 h-5 text-cyan-500 mx-auto" />
                        )}
                      </td>
                    )
                  })}
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
