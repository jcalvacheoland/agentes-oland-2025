"use client";
import { useEffect, useState } from "react";
import { obtenerPlanPorAseguradora2 } from "@/lib/services/api";
import { IPlanRequest, IPlanResponse } from "@/interfaces/interfaces.type";
import { LoadingPlan } from "./LoadingPlan";
import { PlanCardAseguradora } from "./PlanCardAseguradora";

interface Props {
  aseguradora: string;
  planRequest: IPlanRequest;
  cacheKey: string;
  onPlanLoaded?: (plans: IPlanResponse[]) => void;
  onToggleSelection: (plan: IPlanResponse) => void;
  isPlanSelected: (plan: IPlanResponse) => boolean;
}

export function PlanAseguradoraClient({
  aseguradora,
  planRequest,
  cacheKey,
  onPlanLoaded,
  onToggleSelection,
  isPlanSelected,
}: Props) {
  const [planData, setPlanData] = useState<IPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
       
        const response = await obtenerPlanPorAseguradora2(
          aseguradora,
          planRequest
        );
        if (aseguradora.toLowerCase() === "aig") {
         /*  console.log("[AIG] request:", planRequest);
          console.log("[AIG] respuesta API:", response); */
          /* if (!response) {
            console.warn("[AIG] respuesta vacía/undefined");
          } */
        }
        if (!response) {
          setError(`Respuesta vacía de ${aseguradora}`);
          return;
        }
        //Mi api retorna un array de objetos
        const plans = Array.isArray(response) ? response : [response];
        setPlanData(plans);
        // Notificar al padre que los planes se cargaron
        if (onPlanLoaded) {
          onPlanLoaded(plans);
        }
      } catch (err) {
       /*  console.error(`Error fetching plan for ${aseguradora}:`, err); */
        setError(`Error al cargar ${aseguradora}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [aseguradora, planRequest, cacheKey]);

  if (loading) {
    return <LoadingPlan aseguradora={aseguradora} />;
  }
 // Procesar principales coberturas
  const procesarCoberturasPrincipales = (principals?: {
  "PRINCIPALES COBERTURAS"?: string;
  "BENEFICIOS ESPECIALES"?: string;
  DEDUCIBLE?: string;
}): string[] => {
  const valor = principals?.["PRINCIPALES COBERTURAS"];
  if (!valor) return [];

  return valor.includes("/*/")
    ? valor.split("/*/").map(v => v.trim()).filter(Boolean)
    : [valor.trim()];
};

  // Procesar DEDUCIBLE
const procesarDeducible = (principals?: {
  "PRINCIPALES COBERTURAS"?: string;
  "BENEFICIOS ESPECIALES"?: string;
  DEDUCIBLE?: string;
}): string[] => {
  const valor = principals?.DEDUCIBLE;
  if (!valor) return [];

  return valor.includes("/*/")
    ? valor.split("/*/").map(v => v.trim()).filter(Boolean)
    : [valor.trim()];
};

// Procesar BENEFICIOS ESPECIALES
const procesarBeneficios = (principals?: {
  "PRINCIPALES COBERTURAS"?: string;
  "BENEFICIOS ESPECIALES"?: string;
  DEDUCIBLE?: string;
}): string[] => {
  const valor = principals?.["BENEFICIOS ESPECIALES"];
  if (!valor) return [];

  return valor.includes("/*/")
    ? valor.split("/*/").map(v => v.trim()).filter(Boolean)
    : [valor.trim()];
};


  // Renderizar el plan exitosamente
  return (
    <div>
      <div className="space-y-4">
        {planData
          ?.filter((plan) => plan)
          .map((plan, index) => (
            <PlanCardAseguradora
              key={index}
              nombreAseguradora={plan.insurer}
              nombrePlan={plan.planName}
              precioAnual={plan.totalPremium}
              coberturas={procesarCoberturasPrincipales(plan.principals)}
              deducible={procesarDeducible(plan.principals)}
              beneficios={procesarBeneficios(plan.principals)}
              period={plan.period}
               // Props nuevos para la selección
              isSelected={isPlanSelected(plan)}
              onToggleSelect={() => onToggleSelection(plan)}
            />
          ))}
      </div>
    </div>
  );
}
