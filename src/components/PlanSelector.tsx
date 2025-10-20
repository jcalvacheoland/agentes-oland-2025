'use client';
import { useEffect, useState, useTransition } from 'react';
import { updateBitrixDealWithPlanSelected } from '@/actions/bitrixActions';

type Plan = {
  id: string;
  aseguradora: string | null;
  nombrePlan: string | null;
  primaTotal: number;
  primaNeta: number | null;
  Tasa: number | null;
  version: number;
  selected?: boolean;
};

type PlanSelectorProps = {
  dealId: string;
  plans: Plan[];
};

export function PlanSelector({ dealId, plans }: PlanSelectorProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => plans.find((plan) => plan.selected)?.id ?? null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const aseguradoraNombres: Record<string, string> = {
    asur: 'Aseguradora del Sur',
    zurich: 'Zurich Seguros',
    mapfre: 'Mapfre Ecuador',
    equinoccial: 'Equinoccial Seguros',
    sweaden: 'Sweaden Seguros',
    latina: 'Latina Seguros',
    panamericana: 'Panamericana Seguros',
  };

  const planNombres: Record<string, string> = {
  "s123 chubb": "CHUBB",
  "s123 zurich pro": "Zurich PRO",
  "s124 equinoccial full": "Equinoccial FULL",
  // agrega más según tus códigos internos
};


  useEffect(() => {
    if (!plans.length) {
      setSelectedPlanId(null);
      return;
    }

    const exists = selectedPlanId ? plans.some((plan) => plan.id === selectedPlanId) : false;
    if (exists) return;

    const nextSelected = plans.find((plan) => plan.selected)?.id ?? null;
    setSelectedPlanId(nextSelected);
  }, [plans, selectedPlanId]);

  const handleSelect = (plan: Plan) => {
  if (isPending || plan.id === selectedPlanId) return;

  setFeedback(null);
  setFeedbackType(null);
  setPendingPlanId(plan.id);

  // 🟦 Nuevo: transformar la abreviatura a nombre completo
  const aseguradoraKey = plan.aseguradora?.toLowerCase() ?? '';
  const aseguradoraNombre = aseguradoraNombres[aseguradoraKey] || plan.aseguradora || '';

  startTransition(async () => {
    const result = await updateBitrixDealWithPlanSelected(dealId, {
      aseguradora: aseguradoraNombre, // 👈 ahora envías el nombre completo
      plan: plan.nombrePlan ?? '',
      tasa: plan.Tasa ?? 0,
      primaNeta: plan.primaNeta ?? 0,
      primaTotal: plan.primaTotal,
    });

    if (!result.ok) {
      setFeedback(result.error ?? 'No se pudo actualizar el deal.');
      setFeedbackType('error');
      setPendingPlanId(null);
      return;
    }

    setSelectedPlanId(plan.id);
    setFeedback('Plan seleccionado y deal actualizado correctamente.');
    setFeedbackType('success');
    setPendingPlanId(null);
  });
};


  if (!plans.length) {
    return <p className="text-sm text-slate-500">No hay planes comparados en esta cotización.</p>;
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => {
        const isSelected = plan.id === selectedPlanId;
        const isProcessing = isPending && plan.id === pendingPlanId;

        // 👇 Aquí normalizamos el nombre de la aseguradora sin errores TS
        const aseguradoraKey = plan.aseguradora?.toLowerCase() ?? '';
        const aseguradoraNombre = aseguradoraNombres[aseguradoraKey] || 'Aseguradora no especificada';
        
        const planKey = plan.nombrePlan?.toLowerCase() ?? '';
        const planNombreLimpio = planNombres[planKey] || plan.nombrePlan || 'Sin nombre';

        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => handleSelect(plan)}
            className={`w-full text-left rounded-lg border p-4 transition-colors ${
              isSelected
                ? 'border-blue-500 bg-blue-50/70'
                : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
            } ${isPending ? 'cursor-wait opacity-80' : ''}`}
            disabled={isPending}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-900">
                  {aseguradoraNombre}
                </p>
                <p className="text-sm text-slate-700">Plan: {planNombreLimpio}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>Prima total: ${Number(plan.primaTotal ?? 0).toFixed(2)}</span>
                  <span>Prima neta: ${Number(plan.primaNeta ?? 0).toFixed(2)}</span>
                  <span>Tasa: {Number(plan.Tasa ?? 0).toFixed(2)}%</span>
                  <span>Versión: {plan.version}</span>
                </div>
              </div>
              <span
                className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                  isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-slate-400'
                }`}
                aria-hidden
              >
                {isSelected ? '✓' : ''}
              </span>
            </div>
            {isProcessing && <p className="mt-2 text-xs text-blue-600">Actualizando deal...</p>}
          </button>
        );
      })}
      {feedback && (
        <p className={`text-xs ${feedbackType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {feedback}
        </p>
      )}
    </div>
  );
}
