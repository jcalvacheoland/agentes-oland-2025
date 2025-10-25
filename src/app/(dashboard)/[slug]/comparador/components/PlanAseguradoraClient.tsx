'use client';
import { useEffect, useState } from 'react';
import { obtenerPlanPorAseguradora2 } from "@/lib/services/api";
import { IPlanRequest, IPlanResponse } from "@/interfaces/interfaces.type";
import { LoadingPlan } from "./LoadingPlan";

interface Props {
  aseguradora: string;
  planRequest: IPlanRequest;
  cacheKey: string;
}

export function PlanAseguradoraClient({ aseguradora, planRequest, cacheKey }: Props) {
  const [planData, setPlanData] = useState<IPlanResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        console.log(`🌐 Llamando API para ${aseguradora}`);
        const response = await obtenerPlanPorAseguradora2(aseguradora, planRequest);
        setPlanData(Array.isArray(response) ? response : [response]);
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
    return <LoadingPlan aseguradora={aseguradora} />;
  }

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
    <div className="border p-4 rounded shadow-sm bg-white hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-3 capitalize flex items-center gap-2">
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        {aseguradora}
      </h3>
      
      {planData ? (
        <div className="space-y-2">
          <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded max-h-96 border">
            {JSON.stringify(planData, null, 2)}
          </pre>
          <p className="text-xs text-green-600 font-medium">✓ Planes cargados</p>
        </div>
      ) : (
        <p className="text-gray-500">No hay planes disponibles</p>
      )}

    <div className="space-y-3">
   {planData && planData.length > 0 ? (
    planData.map((plan: IPlanResponse, index: number) => (
      <div
        key={index}
        className="p-3 bg-gray-50 rounded border border-gray-200"
      >
        <h4 className="font-medium text-gray-800 mb-2">
          {plan.planName} - {plan.insurer}
        </h4>

        <div className="text-sm text-gray-700 space-y-1">
          <p>ID: {plan.id}</p>
          <p>Periodo: {plan.period}</p>
          <p>Ranking: {plan.ranking}</p>
          <p>Prima Neta: {plan.netPremium}</p>
          <p>Tasa: {plan.rate}</p>
          <p>Subtotal: {plan.subtotalPremium}</p>
          <p>IVA: {plan.ivaTax}</p>
          <p>Total: {plan.totalPremium}</p>

          {/* Principales */}
          <div>
            <strong>Principales:</strong>
            {plan.principals &&
              Object.entries(plan.principals).map(([key, value]) => (
                <p key={key}>
                  {key}: {value as string}
                </p>
              ))}
          </div>

          {/* Notas */}
          <div>
            <strong>Notas:</strong>
            {plan.notes && plan.notes.length > 0 ? (
              plan.notes.map((n, i) => (
                <p key={i}>
                  {n.title}: {n.text}
                </p>
              ))
            ) : (
              <p>No hay notas</p>
            )}
          </div>

          {/* Coberturas secundarias */}
          <div>
            <strong>Secundarias:</strong>
            {plan.secondaries && plan.secondaries.length > 0 ? (
              plan.secondaries.map((s, i) => (
                <p key={i}>
                  {s.name}: {s.detail}
                </p>
              ))
            ) : (
              <p>No hay coberturas secundarias</p>
            )}
          </div>

          {/* Click Seguros */}
          <div>
            <strong>Click Seguros:</strong>
            {plan.clickSeguros && plan.clickSeguros.length > 0 ? (
              plan.clickSeguros.map((c, i) => (
                <p key={i}>
                  {c.title}: {c.text}
                </p>
              ))
            ) : (
              <p>No hay datos de clickSeguros</p>
            )}
          </div>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500">No hay planes disponibles</p>
  )}
</div>

    
    <p className="text-xs text-green-600 font-medium mt-3">
      ✓ {planData?.length || 0} plan(es) cargado(s)
    </p>
    </div>
  );
}