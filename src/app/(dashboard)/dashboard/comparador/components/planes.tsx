"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { IPlanRequest } from "@/interfaces/interfaces.type";
import { Info, ChevronDown, LucideCheckCircle } from "lucide-react";
import ComparisonModal, { type ComparedPlanPayload } from "./comparisonModal";
import { StaticPlanCard } from "./StaticPlanCard";
import { AseguradorasLogo } from "@/configuration/constants";
import { updateCotizacionWithPlanesHistorial } from "@/actions/updateCotizacionWithSelectedPlan";
import { Circle } from "lucide-react";

type RawResp = any;
type ResponsesMap = Record<string, RawResp | null | { __error: string }>;

type PlanEntry = {
  insurerKey: string;
  planIndex: number;
  plan: any;
  isError?: boolean;
  errorMessage?: string | null;
};

type SectionKey = "coverage" | "deductible" | "benefits";
type ExpandedSectionsMap = Record<string, Record<SectionKey, boolean>>;

function createSectionState(): Record<SectionKey, boolean> {
  return {
    coverage: false,
    deductible: false,
    benefits: false,
  };
}

type PlanComparadoPersist = Parameters<
  typeof updateCotizacionWithPlanesHistorial
>[1][number];

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const sanitized = value.replace(/[^0-9,.-]/g, "");
    if (!sanitized) {
      return null;
    }
    const hasComma = sanitized.includes(",");
    const hasDot = sanitized.includes(".");
    const normalized =
      hasComma && hasDot
        ? sanitized.replace(/\./g, "").replace(",", ".")
        : sanitized.replace(",", ".");
    const parsed = Number(normalized);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return null;
}

function resolvePrimaTotal(plan: ComparedPlanPayload): number | null {
  const totalPremium = plan.pricing?.totalPremium;
  if (typeof totalPremium === "number" && !Number.isNaN(totalPremium)) {
    return totalPremium;
  }

  const netPremium = plan.netPremium;
  if (typeof netPremium === "number" && !Number.isNaN(netPremium)) {
    return netPremium;
  }

  const monthly = plan.pricing?.monthly;
  const period = plan.pricing?.period;
  if (typeof monthly === "number" && typeof period === "number") {
    const computed = monthly * (period > 0 ? period : 1);
    if (!Number.isNaN(computed)) {
      return computed;
    }
  }

  return null;
}

function resolvePlanRate(plan: ComparedPlanPayload): number | null {
  const direct = toNumber(plan.rate);
  if (direct !== null) {
    return direct;
  }

  const raw = plan.rawPlan;
  if (raw && typeof raw === "object") {
    const candidates = [
      raw.rate,
      raw.Rate,
      raw.ratePercentage,
      raw.rate_percent,
      raw.tasa,
      raw.Tasa,
      raw.tasaNeta,
      raw.tasaBruta,
      raw.planRate,
      raw.rateValue,
      raw?.pricing?.rate,
      raw?.pricing?.Rate,
      raw?.pricing?.percentage,
      raw?.pricing?.tasa,
    ];

    for (const candidate of candidates) {
      const parsed = toNumber(candidate);
      if (parsed !== null) {
        return parsed;
      }
    }
  }

  return null;
}

interface PlanesProps {
  responses: ResponsesMap;
  planRequest?: IPlanRequest | null;
  onSendComparison?: (payload: any) => void;
  onRetry?: (aseguradoraKey: string) => void; // nuevo
}

export default function Planes({
  responses = {},
  planRequest = null,
  onSendComparison,
  onRetry,
}: PlanesProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<PlanEntry[]>([]);
  const maxSelect = 3;
  const [expandedSections, setExpandedSections] = useState<ExpandedSectionsMap>(
    {}
  );
  const [openModal, setOpenModal] = useState(false);
  const [, startSaving] = useTransition();
  const [cotizacionId, setCotizacionId] = useState<string | null>(null);
  const [bitrixDealId, setBitrixDealId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedId = window.localStorage.getItem("idCotizacion");
      if (storedId) {
        setCotizacionId(storedId);
      }
    } catch (error) {
      console.warn("No se pudo leer idCotizacion desde localStorage:", error);
    }

    try {
      const storedDealId = window.localStorage.getItem("bitrixDealId");
      const normalizedDealId = storedDealId?.trim();
      if (normalizedDealId) {
        setBitrixDealId(normalizedDealId);
      }
    } catch (error) {
      console.warn("No se pudo leer bitrixDealId desde localStorage:", error);
    }
  }, []);



  function normalizeRespToPlans(resp: RawResp): any[] {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray((resp as any)?.plans)) return (resp as any).plans;
    if (Array.isArray((resp as any)?.data)) return (resp as any).data;
    // si es objeto con plan -> array con él
    if (typeof resp === "object" && !resp.__error) return [resp];
    return [];
  }

  function toggleSection(entryKey: string, section: SectionKey) {
    setExpandedSections((prev) => {
      const current = prev[entryKey] ?? createSectionState();
      const next = { ...current, [section]: !current[section] };
      return { ...prev, [entryKey]: next };
    });
  }

  const allByAseg = useMemo(() => {
    const arr: PlanEntry[] = [];
    Object.entries(responses || {}).forEach(([insurerKey, resp]) => {
      // caso de error guardado
      if (resp && typeof resp === "object" && "__error" in resp) {
        return;
      }
      // caso normal: extraer planes
      const plans = normalizeRespToPlans(resp);
      plans.forEach((p: any, idx: number) =>
        arr.push({
          insurerKey,
          planIndex: idx,
          plan: p,
          isError: false,
          errorMessage: null,
        })
      );
      // si no hay planes ni error, mostramos tarjeta vacía (opcional)
      if (!plans.length && (resp === null || resp === undefined)) {
        arr.push({
          insurerKey,
          planIndex: -1,
          plan: null,
          isError: true,
          errorMessage: "Sin respuesta",
        });
      }
    });
    return arr;
  }, [responses]);

  const successfulPlans = useMemo(
    () => allByAseg.filter((entry) => !entry.isError),
    [allByAseg]
  );

  function toggleSelect(entry: PlanEntry) {
    if (entry.isError) {
      // no permitir seleccionar errores
      return;
    }
    const exists = selected.find(
      (s) =>
        s.insurerKey === entry.insurerKey && s.planIndex === entry.planIndex
    );
    if (exists) {
      setSelected((prev) =>
        prev.filter(
          (p) =>
            !(
              p.insurerKey === entry.insurerKey &&
              p.planIndex === entry.planIndex
            )
        )
      );
      return;
    }
    if (selected.length >= maxSelect) {
      alert(
        `Ya seleccionaste ${maxSelect} planes. Quita uno para seleccionar otro.`
      );
      return;
    }
    setSelected((prev) => [...prev, entry]);
  }

  function extractPrice(plan: any): number | null {
    if (!plan) return null;
    const cand = [
      plan.totalPremium,
      plan.netPremium,
      plan.premium,
      plan.price,
      plan.total,
      plan.prima,
      plan.primaNeta,
    ];
    for (const c of cand) {
      if (typeof c === "number") return c;
      if (typeof c === "string" && c.trim() !== "" && !isNaN(Number(c)))
        return Number(c);
    }
    return null;
  }

  function getNetPremium(plan: any): number | null {
    if (!plan) return null;
    const candidates = [
      plan.netPremium,
      plan.primaNeta,
      plan.neto,
      plan.premiumNet,
      plan.premium_net,
    ];
    for (const c of candidates) {
      if (typeof c === "number" && !isNaN(c)) return c;
      if (typeof c === "string" && c.trim() !== "" && !isNaN(Number(c))) return Number(c);
    }
    return null;
  }

  function serializeSelected(entry: PlanEntry) {
    return {
      planName: entry.plan?.planName || `Plan ${entry.planIndex + 1}`,
      insurerName: entry.insurerKey,
      netPremium: getNetPremium(entry.plan),
    };
  }

  function formatCurrency(amount: number | null): string {
    if (amount === null) return "-";
    return `$ ${amount.toFixed(2)}`;
  }

  function getCoverageDetails(plan: any) {
    if (!plan) return [];
    const details = [];

    if (plan.principals?.civilLiability) {
      details.push({
        label: "Responsabilidad Civil:",
        value: `$ ${plan.principals.civilLiability.toLocaleString()} anual`,
      });
    }

    if (plan.principals?.accidentalDeath) {
      details.push({
        label: "Muerte Accidental:",
        value: `Límite por ocupante $ ${plan.principals.accidentalDeath.toLocaleString()}`,
      });
    }

    if (plan.principals?.medicalExpenses) {
      details.push({
        label: "Gastos Médicos por Accidente:",
        value: `Límite por ocupante $ ${plan.principals.medicalExpenses.toLocaleString()}`,
      });
    }

    return details;
  }

  const handleComparisonConfirm = (payload: { compared: ComparedPlanPayload[] }) => {
    onSendComparison?.(payload);

    if (!payload?.compared?.length) {
      return;
    }

    const plansToPersist: PlanComparadoPersist[] = [];

    payload.compared.forEach((plan) => {
      const aseguradora =
        typeof plan.insurerKey === "string" && plan.insurerKey.trim().length > 0
          ? plan.insurerKey
          : typeof plan.rawPlan?.aseguradora === "string" &&
              plan.rawPlan.aseguradora.trim().length > 0
            ? plan.rawPlan.aseguradora
            : "";

      const primaTotal = resolvePrimaTotal(plan);

      if (!aseguradora || primaTotal === null) {
        return;
      }

      const primaNeta =
        toNumber(plan.netPremium) ??
        toNumber(plan.rawPlan?.netPremium) ??
        toNumber(plan.rawPlan?.primaNeta);

      const tasa = resolvePlanRate(plan);

      plansToPersist.push({
        aseguradora,
        nombrePlan:
          typeof plan.planName === "string" && plan.planName.trim().length > 0
            ? plan.planName
            : "Plan sin nombre",
        primaTotal,
        primaNeta,
        Tasa: tasa,
      });
    });

    if (!plansToPersist.length) {
      return;
    }

    let targetCotizacionId = cotizacionId;

    if (!targetCotizacionId && typeof window !== "undefined") {
      try {
        const storedId = window.localStorage.getItem("idCotizacion");
        if (storedId) {
          targetCotizacionId = storedId;
          setCotizacionId(storedId);
        }
      } catch (error) {
        console.warn("No se pudo leer idCotizacion desde localStorage:", error);
      }
    }

    if (!targetCotizacionId) {
      console.warn(
        "[comparaciones] No se encontró idCotizacion; se omite el guardado de planes en BD."
      );
      return;
    }

    startSaving(() => {
      updateCotizacionWithPlanesHistorial(targetCotizacionId, plansToPersist).catch((error) => {
        console.error("Error guardando los planes comparados en la BD:", error);
      });
    });
    const navigateToDeal = async () => {
      let targetDealId = bitrixDealId;

      if (!targetDealId && typeof window !== "undefined") {
        try {
          const storedDealId = window.localStorage.getItem("bitrixDealId");
          const normalized = storedDealId?.trim();
          if (normalized) {
            targetDealId = normalized;
            setBitrixDealId(normalized);
          }
        } catch (error) {
          console.warn("No se pudo volver a leer bitrixDealId desde localStorage:", error);
        }
      }

      if (!targetDealId && targetCotizacionId) {
        try {
          const response = await fetch(`/api/cotizaciones/${targetCotizacionId}/bitrix`, {
            method: "GET",
            credentials: "include",
          });
          if (response.ok) {
            const data: { bitrixDealId?: string | null } = await response.json();
            const fetchedDealId = data.bitrixDealId?.trim();
            if (fetchedDealId) {
              targetDealId = fetchedDealId;
              setBitrixDealId(fetchedDealId);
              if (typeof window !== "undefined") {
                try {
                  window.localStorage.setItem("bitrixDealId", fetchedDealId);
                } catch (storageError) {
                  console.warn("No se pudo guardar bitrixDealId en localStorage:", storageError);
                }
              }
            }
          } else {
            console.warn(
              `[comparaciones] No se pudo obtener bitrixDealId desde el backend (${response.status}).`
            );
          }
        } catch (error) {
          console.warn("Error obteniendo bitrixDealId desde el backend:", error);
        }
      }

      if (targetDealId) {
        setOpenModal(false);
        setTimeout(() => {
          router.push(`/${targetDealId}`);
        }, 400);
      } else {
        console.warn("[comparaciones] No se encontró bitrixDealId para redireccionar al detalle del deal.");
      }
    };

    void navigateToDeal();
  };

  async function handleConfirmComparison(payload: {
    selected: { planName: string; insurerName: string; netPremium: number | null };
    compared: Array<{ planName: string; insurerName: string; netPremium: number | null }>;
  }) {
    try {
      console.log("[comparaciones] Enviando payload:", payload);
      if (onSendComparison) {
        onSendComparison({ ...payload, planRequest });
        return;
      }
      await fetch("/api/comparaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, planRequest }),
      });
    } catch (e) {
      console.warn("Error enviando comparación:", e);
    }
  }

  function splitItems(str?: string): string[] {
    if (!str) return [];
    return str
      .split("/*/") // dividir por el separador
      .map((s) => s.replace(/\s+/g, " ").trim()) // limpiar espacios/tabulaciones
      .filter((s) => s.length > 0); // eliminar vacíos
  }

  function parseInfoContent(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item === null || item === undefined) return "";
          return String(item);
        })
        .filter((item) => item.length > 0);
    }
    if (typeof value === "string") {
      const parsed = splitItems(value);
      if (parsed.length > 0) return parsed;
      return value.trim() ? [value.trim()] : [];
    }
    if (value === null || value === undefined) {
      return [];
    }
    if (typeof value === "number") {
      return [value.toString()];
    }
    return [String(value)];
  }
  async function handleChooseDirect(entry: PlanEntry) {
  const payload = { selected: serializeSelected(entry) };
  const body = { ...payload, planRequest };

  if (onSendComparison) {
    onSendComparison(body);
    return;
  }

  const res = await fetch("/api/comparaciones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  console.log("[comparaciones] Respuesta API:", res.status, data);
}

  return (
    <section className="mt-6 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Planes disponibles
        </h2>
        <div className="text-sm text-muted-foreground">
          Detectados: {successfulPlans.length}
        </div>
      </div>

      <div className="mb-6 p-4  rounded-lg border border-blue-200 ">
        <p className="text-sm font-medium text-black dark:text-blue-100">
          ¿Quieres comparar tus opciones? Selecciona hasta 3 productos
        </p>
        <p className="text-xs text-azul-oland-100  mt-1">
          Seleccionados: {selected.length} / {maxSelect}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {successfulPlans.map((e, idx) => {
          const price = extractPrice(e.plan);
          const isSelected = selected.some(
            (s) => s.insurerKey === e.insurerKey && s.planIndex === e.planIndex
          );
          const coverageDetails = getCoverageDetails(e.plan);
          const monthlyPrice = price ? price / (e.plan?.period || 12) : null;
          const totalWithTax = price ? price * 1.12 : null;
          const entryKey = `${e.insurerKey}-${e.planIndex}-${idx}`;
          const sectionState = expandedSections[entryKey] ?? createSectionState();
          const coverageOpen = sectionState.coverage;
          const deductibleOpen = sectionState.deductible;
          const benefitsOpen = sectionState.benefits;
          const coverageExtras = Array.isArray(e.plan?.secondaries)
            ? e.plan.secondaries.filter((item: any) => item)
            : [];
          const deductibleItems = parseInfoContent(
            e.plan?.principals?.["DEDUCIBLE"]
          );
          const benefitsItems = parseInfoContent(
            e.plan?.principals?.["BENEFICIOS ESPECIALES"]
          );
          const hasCoverageExtras = coverageExtras.length > 0;
          const hasDeductible = deductibleItems.length > 0;
          const hasBenefits = benefitsItems.length > 0;

          return (
           <div
            key={entryKey}
            onClick={() => toggleSelect(e)}
            className={`relative p-6 rounded-xl cursor-pointer transition-all border-2  hover:border-azul-oland-100
              ${isSelected ? 
                "border-azul-oland-100 bg-card shadow-md " : 
                "border-gris-oland-100 bg-card hover:border-blue-oland-100 hover:shadow-lg "}`}
          >
            <div className="absolute top-1 right-2">
              <Circle
                className={`w-5 h-5 transition-colors ${
                  isSelected ? "text-azul-oland-100 fill-azul-oland-100 border-b-black" : "text-gray-300"
                }`}
              />
            </div>
              {/* seccion aseguradora, logo, estrellas */}
              <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-start">
                <div className="flex flex-col items-center gap-2 order-1 lg:order-none lg:min-w-[120px]">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border border-border">
                    <div className="w-24 h-24">
                        <img
                      src={AseguradorasLogo.find((logo) => logo.name.toLowerCase().includes(e.insurerKey.toLowerCase()))?.img || ""}
                      >
                      </img>
                    </div>
                    
                  </div>
                  <div className="text-center">
                    {/* <div className="text-lg font-bold text-foreground">AAA</div>   */}                
                  </div>
                </div>
                  {/* nombre del plan */}
                <div className="order-3 w-full lg:order-none lg:flex-1">
                  <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                      {e.insurerKey === "asur"
                        ? "ASEGURADORA DEL SUR"
                        : e.insurerKey.toUpperCase()}{" "}
                      -{" "}
                      {e.plan?.planName && e.plan.planName !== "S123 CHUBB"
                        ? e.plan.planName
                        : "CHUBB"}
                  </h3>



                  </div>

                  {coverageDetails.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {coverageDetails.map((detail, i) => (
                        <div key={i} className="text-sm">
                          <span className="text-muted-foreground">
                            {detail.label}
                          </span>{" "}
                          <span className="font-medium text-foreground">
                            {detail.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/*  botones de secciones desplegables */}
                  <div className="flex gap-4 mt-4">
                    <div className="flex w-full flex-col gap-3 sm:flex-row">
                      <div className="sm:w-1/3">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            if (!hasCoverageExtras) return;
                            toggleSection(entryKey, "coverage");
                          }}
                          className={`w-full inline-flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                            hasCoverageExtras
                              ? coverageOpen
                                ? "border-azul-oland-100  text-azul-oland-100"
                                : "border-transparent text-azul-oland-100 hover:border-azul-oland-100 hover:text-azul-oland-100"
                                : "cursor-not-allowed border-dashed "
                          }`}
                          aria-expanded={coverageOpen}
                          aria-controls={`${entryKey}-coverage`}
                          disabled={!hasCoverageExtras}
                        >
                          <span className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Coberturas
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              coverageOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {coverageOpen && hasCoverageExtras && (
                          <div
                            id={`${entryKey}-coverage`}
                            className="mt-2 space-y-1 rounded-md border p-3 text-sm text-foreground"
                          >
                            {coverageExtras.map((item: any, i: number) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="mt-0.5 h-2 w-2 rounded-full bg-azul-oland-100" />
                                <span className="font-medium">
                                  {item?.name ?? item?.title ?? String(item)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="sm:w-1/3">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            if (!hasDeductible) return;
                            toggleSection(entryKey, "deductible");
                          }}
                          className={`w-full inline-flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                            hasDeductible
                              ? deductibleOpen
                                ? "border-azul-oland-100  text-azul-oland-100"
                                : "border-transparent text-azul-oland-100 hover:border-azul-oland-100 hover:text-azul-oland-100"
                                : "cursor-not-allowed border-dashed "
                          }`}
                          aria-expanded={deductibleOpen}
                          aria-controls={`${entryKey}-deductible`}
                          disabled={!hasDeductible}
                        >
                          <span className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Deducible
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              deductibleOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {deductibleOpen && hasDeductible && (
                          <div
                            id={`${entryKey}-deductible`}
                            className="mt-2 space-y-1 rounded-md border p-3 text-sm text-foreground"
                          >
                            {deductibleItems.map((item, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="mt-0.5 h-2 w-2 rounded-full p-1 bg-azul-oland-100" />
                                <span className="font-medium">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="sm:w-1/3">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            if (!hasBenefits) return;
                            toggleSection(entryKey, "benefits");
                          }}
                          className={`w-full inline-flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
                            hasBenefits
                              ? benefitsOpen
                                ? "border-azul-oland-100  text-azul-oland-100"
                                : "border-transparent text-azul-oland-100 hover:border-azul-oland-100 hover:text-azul-oland-100"
                                : "cursor-not-allowed border-dashed "
                          }`}
                          aria-expanded={benefitsOpen}
                          aria-controls={`${entryKey}-benefits`}
                          disabled={!hasBenefits}
                        >
                          <span className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Beneficios
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              benefitsOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {benefitsOpen && hasBenefits && (
                          <div
                            id={`${entryKey}-benefits`}
                            className="mt-2 space-y-1 rounded-md border p-3 text-sm text-foreground"
                          >
                            {benefitsItems.map((item, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="mt-0.5 h-2 w-2 rounded-full p-1 bg-azul-oland-100" />
                                <span className="font-medium">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/*  seccion de precios */}
                <div className="order-2 flex w-full flex-col items-center gap-4 lg:order-none lg:items-end lg:min-w-[180px]">
                <div className="grid grid-cols-2 lg:grid-cols-1">
                 
                  <div className="text-center lg:text-right">
                      <div className="text-3xl font-bold text-foreground lg:text-4xl">
                        {formatCurrency(monthlyPrice)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {e.plan?.period || 12} cuotas mensuales
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Pago con tarjeta de crédito
                      </div>
                    </div>

                    <div className="text-center lg:text-right">
                      <div className="text-2xl font-bold text-foreground lg:text-3xl">
                        {formatCurrency(totalWithTax)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Incluido impuestos
                      </div>
                    </div>
                </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* //-- AQUÍ: tarjetas fijas -- */}
        <StaticPlanCard></StaticPlanCard>
        {/* //-- FIN tarjetas fijas -- */}


    

        {selected.length >= 2 && (
          <button
            onClick={() => setOpenModal(true)}
            className="fixed bottom-6 right-6 bg-azul-oland-100 hover:bg-rojo-oland-100 text-white font-bold py-3 px-6 rounded-full shadow-lg transition"
          >
            Comparar ({selected.length})
          </button>
        )}

        {openModal && (
          <ComparisonModal
            selected={selected}
            onClose={() => setOpenModal(false)}
            onConfirm={handleComparisonConfirm}
          />
        )}
      </div>
      
    </section>
  );
}
  
