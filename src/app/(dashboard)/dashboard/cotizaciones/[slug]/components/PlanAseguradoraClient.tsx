"use client";
import { useEffect, useState } from "react";
import { obtenerPlanPorAseguradora2 } from "@/lib/services/api";
import { IPlanRequest, IPlanResponse } from "@/interfaces/interfaces.type";
import { LoadingPlanPostForm } from "./LoadingPlan";
import { PlanCardAseguradoraPostForm } from "./PlanCardAseguradora";

interface Props {
  aseguradora: string;
  planRequest: IPlanRequest;
  cacheKey: string;
  onPlanLoaded?: (plans: IPlanResponse[]) => void;
  onToggleSelection: (plan: IPlanResponse) => void;
  isPlanSelected: (plan: IPlanResponse) => boolean;
}

export function PlanAseguradoraClientPostForm({
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
        console.log(`🌐 Llamando API para ${aseguradora}`);
        const response = await obtenerPlanPorAseguradora2(
          aseguradora,
          planRequest
        );
        //Mi api retorna un array de objetos
        const plans = Array.isArray(response) ? response : [response];
        setPlanData(plans);
        // Notificar al padre que los planes se cargaron
        if (onPlanLoaded) {
          onPlanLoaded(plans);
        }
      } catch (err) {
        console.error(`Error fetching plan for ${aseguradora}:`, err);
        setError(`Error al cargar ${aseguradora}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [aseguradora, planRequest, cacheKey]);

  if (loading) {
    return <LoadingPlanPostForm aseguradora={aseguradora} />;
  }

  // Función para procesar el string de deducible
  const procesarDeducible = (principals?: {
    "PRINCIPALES COBERTURAS"?: string;
    "BENEFICIOS ESPECIALES"?: string;
    DEDUCIBLE?: string;
  }): string[] => {
    if (!principals || !principals.DEDUCIBLE) {
      console.log("❌ No hay principals o DEDUCIBLE");
      return [];
    }

    return principals.DEDUCIBLE.split("/*/") // Separador en tu API
      .map((item) => item.trim()) // Eliminar espacios
      .filter((item) => item.length > 0 && item !== "\n"); // Filtrar vacíos y saltos de línea
  };
  const procesarBeneficios = (principals?: {
    "PRINCIPALES COBERTURAS"?: string;
    "BENEFICIOS ESPECIALES"?: string;
    DEDUCIBLE?: string;
  }): string[] => {
    if (!principals || !principals["BENEFICIOS ESPECIALES"]) {
      console.log("❌ No hay principals o DEDUCIBLE");
      return [];
    }
    return principals["BENEFICIOS ESPECIALES"]
      .split("/*/") // Separador en tu API
      .map((item) => item.trim()) // Eliminar espacios
      .filter((item) => item.length > 0 && item !== "\n"); // Filtrar vacíos y saltos de línea
  };

  if (error) {
    return (
      <div className="border border-red-200 p-4 rounded shadow-sm bg-red-50">
        <h3 className="text-xl font-semibold mb-2 capitalize flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          {aseguradora}
        </h3>
        <div className="space-y-2">
          <p className="text-red-600 text-sm">⚠ Error al cargar planes</p>
          <p className="text-xs text-gray-600">
            No se pudo obtener información de esta aseguradora
          </p>
        </div>
      </div>
    );
  }

  // Renderizar el plan exitosamente
  return (
    <div>
      <div className="space-y-4">
        {planData
          ?.filter((plan) => plan)
          .map((plan, index) => (
            <PlanCardAseguradoraPostForm
              key={index}
              nombreAseguradora={plan.insurer}
              nombrePlan={plan.planName}
              precioAnual={plan.totalPremium}
              coberturas={plan.secondaries}
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
