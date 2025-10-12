// ./components/Planes.tsx
"use client";
import { useMemo, useState } from "react";
import type { IPlanRequest } from "@/interfaces/interfaces.type";
import { Star, Info } from "lucide-react";
import ComparisonModal from "./comparisonModal";

type RawResp = any;
type ResponsesMap = Record<string, RawResp | null | { __error: string }>;

type PlanEntry = {
  insurerKey: string;
  planIndex: number;
  plan: any;
  isError?: boolean;
  errorMessage?: string | null;
};

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
  const [selected, setSelected] = useState<PlanEntry[]>([]);
  const maxSelect = 3;
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  function normalizeRespToPlans(resp: RawResp): any[] {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray((resp as any)?.plans)) return (resp as any).plans;
    if (Array.isArray((resp as any)?.data)) return (resp as any).data;
    // si es objeto con plan -> array con él
    if (typeof resp === "object" && !resp.__error) return [resp];
    return [];
  }

  const allByAseg = useMemo(() => {
    const arr: PlanEntry[] = [];
    Object.entries(responses || {}).forEach(([insurerKey, resp]) => {
      // caso de error guardado
      if (resp && typeof resp === "object" && "__error" in resp) {
        arr.push({
          insurerKey,
          planIndex: -1,
          plan: null,
          isError: true,
          errorMessage: (resp as any).__error ?? "error desconocido",
        });
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
          Detectados: {allByAseg.length}
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          ¿Quieres comparar tus opciones? Selecciona hasta 3 productos
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
          Seleccionados: {selected.length} / {maxSelect}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {allByAseg.map((e, idx) => {
          if (e.isError) {
            return (
              <div
                key={`err-${e.insurerKey}-${idx}`}
                className="p-6 border-2 border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-950/20"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">
                      {e.insurerKey.toUpperCase()}
                    </div>
                    <div className="text-sm text-red-800 dark:text-red-300 mb-3">
                      <p className="font-medium mb-1">
                        Contactate con esta aseguradora
                      </p>
                      <p className="text-lg font-semibold">0987748808</p>
                      <p className="text-xs mt-2 text-red-600 dark:text-red-400">
                        {e.errorMessage ?? "Error"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRetry?.(e.insurerKey)}
                    className="px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium bg-white dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            );
          }

          const price = extractPrice(e.plan);
          const isSelected = selected.some(
            (s) => s.insurerKey === e.insurerKey && s.planIndex === e.planIndex
          );
          const coverageDetails = getCoverageDetails(e.plan);
          const monthlyPrice = price ? price / (e.plan?.period || 12) : null;
          const totalWithTax = price ? price * 1.12 : null;

          return (
            <div
              key={`${e.insurerKey}-${e.planIndex}-${idx}`}
              onClick={() => toggleSelect(e)}
              className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                isSelected
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20 shadow-md"
                  : "border-border bg-card hover:border-blue-300"
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-start">
                <div className="flex flex-col items-center gap-2 min-w-[120px]">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border border-border">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {e.insurerKey.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">AAA</div>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {e.insurerKey.toUpperCase()} -{" "}
                      {e.plan?.planName ?? `Plan ${e.planIndex + 1}`}
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

                  <div className="flex gap-4 mt-4">
                    <div>
                      {/* Lista visible solo al abrir de coberturas */}
                      <div>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation(); // para que no active el toggleSelect al clickear
                            setOpen(!open);
                          }}
                          className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition"
                        >
                          <span>Coberturas</span>
                          <Info className="w-4 h-4" />
                        </button>

                        {open && e.plan?.secondaries && (
                          <div className="mt-2 p-2 border rounded bg-gray-50 text-sm">
                            {e.plan.secondaries.map((s: any, i: number) => (
                              <div key={i} className="mb-1 font-semibold">
                                {s.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {/* Lista visible solo al abrir de Deducible */}
                      <div>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation(); // para que no active el toggleSelect al clickear
                            setOpen(!open);
                          }}
                          className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition"
                        >
                          <span>Deducible</span>
                          <Info className="w-4 h-4" />
                        </button>

                         {open && e.plan?.principals && (
                          <div className="mb-2">
                           
                            {e.plan.principals["DEDUCIBLE"]}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {/* Lista visible solo al abrir de Beneficios */}
                      <div>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation(); // para que no active el toggleSelect al clickear
                            setOpen(!open);
                          }}
                          className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition"
                        >
                          <span>Beneficios</span>
                          <Info className="w-4 h-4" />
                        </button>
                          {open && e.plan?.principals && (
                          <div className="mb-2">
                            
                            {e.plan.principals["BENEFICIOS ESPECIALES"]}
                          </div>
                        )}

                      </div>
                      
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4 min-w-[180px]">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">
                      {formatCurrency(monthlyPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {e.plan?.period || 12} cuotas mensuales
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Pago con tarjeta de crédito
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(totalWithTax)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Incluido impuestos
                    </div>
                  </div>
                    
                  <button
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      handleChooseDirect(e);
                    }}
                  >
                    ELEGIR PLAN
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {selected.length >= 2 && (
          <button
            onClick={() => setOpenModal(true)}
            className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition"
          >
            Comparar ({selected.length})
          </button>
        )}

        {openModal && (
          <ComparisonModal
            selected={selected}
            onConfirm={handleConfirmComparison}
            onClose={() => setOpenModal(false)}
          />
        )}
      </div>
      
    </section>
  );
}
  
