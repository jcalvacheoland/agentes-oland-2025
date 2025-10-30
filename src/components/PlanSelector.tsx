'use client';
import { useEffect, useState, useTransition } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import { updateBitrixDealWithPlanSelected } from '@/actions/bitrixActions';
import { updatePlanSelection } from '@/actions/planesComparados.actions';

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
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    () => plans.find((plan) => plan.selected)?.id ?? null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);

  const aseguradoraNombres: Record<string, string> = {
    asur: 'Aseguradora del Sur',
    zurich: 'Zurich',
    mapfre: 'Mapfre',
    equinoccial: 'Equinoccial',
    sweaden: 'Sweaden',
    chubb: 'CHUBB',
  };

  const planNombres: Record<string, string> = {
    "s123 chubb": "CHUBB",
  };

  // Agrupar planes por versión
  const planesPorVersion = plans.reduce((acc, plan) => {
    if (!acc[plan.version]) {
      acc[plan.version] = [];
    }
    acc[plan.version].push(plan);
    return acc;
  }, {} as Record<number, Plan[]>);

  // Ordenar versiones de mayor a menor
  const versionesOrdenadas = Object.keys(planesPorVersion)
    .map(Number)
    .sort((a, b) => b - a);

  const totalVersiones = versionesOrdenadas.length;
  const canGoUp = currentVersionIndex > 0;
  const canGoDown = currentVersionIndex < totalVersiones - 1;

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

    const aseguradoraKey = plan.aseguradora?.toLowerCase() ?? '';
    const aseguradoraNombre = aseguradoraNombres[aseguradoraKey] || plan.aseguradora || '';

    startTransition(async () => {
      const result = await updateBitrixDealWithPlanSelected(dealId, {
        aseguradora: aseguradoraNombre,
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

      const planUpdate = await updatePlanSelection(plan.id, {
        primaNeta: plan.primaNeta ?? null,
        Tasa: plan.Tasa ?? null,
      });

      if (!planUpdate.ok) {
        setFeedback(
          planUpdate.error ?? 'El plan se actualizó en Bitrix, pero no se pudo guardar en la base de datos.',
        );
        setFeedbackType('error');
        setPendingPlanId(null);
        return;
      }

      setSelectedPlanId(plan.id);
      setFeedback('Plan seleccionado y actualizado correctamente.');
      setFeedbackType('success');
      setPendingPlanId(null);
    });
  };

  const goUp = () => {
    if (canGoUp) {
      setCurrentVersionIndex(prev => prev - 1);
    }
  };

  const goDown = () => {
    if (canGoDown) {
      setCurrentVersionIndex(prev => prev + 1);
    }
  };

  if (!plans.length) {
    return <p className="text-sm text-slate-500">No hay planes comparados en esta cotización.</p>;
  }

  const currentVersion = versionesOrdenadas[currentVersionIndex];
  const planesDeVersion = planesPorVersion[currentVersion];

  return (
    <div className="space-y-4">
      {/* Botón superior */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={goUp}
          disabled={!canGoUp}
          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
            canGoUp
              ? 'border-blue-500 text-blue-500 hover:bg-blue-50 active:scale-95'
              : 'border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
          aria-label="Versión anterior"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

      {/* Contenedor con versión actual */}
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <h3 className="text-sm font-semibold text-slate-700 px-3 py-1.5 bg-slate-100 rounded-full">
            Versión {currentVersion}
          </h3>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planesDeVersion.map((plan) => {
            const isSelected = plan.id === selectedPlanId;
            const isProcessing = isPending && plan.id === pendingPlanId;

            const aseguradoraKey = plan.aseguradora?.toLowerCase() ?? '';
            const aseguradoraNombre = aseguradoraNombres[aseguradoraKey] || 'Aseguradora no especificada';

            const planKey = plan.nombrePlan?.toLowerCase() ?? '';
            const planNombreLimpio = planNombres[planKey] || plan.nombrePlan || 'Sin nombre';

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => handleSelect(plan)}
                className={`text-left rounded-lg border p-4 transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                } ${isPending ? 'cursor-wait opacity-80' : ''}`}
                disabled={isPending}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{aseguradoraNombre}</p>
                      <p className="text-xs text-slate-600 mt-1">Plan: {planNombreLimpio}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                        isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-slate-300'
                      }`}
                      aria-hidden
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Prima total:</span>
                      <span className="font-medium text-slate-700">${Number(plan.primaTotal ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Prima neta:</span>
                      <span className="font-medium text-slate-700">${Number(plan.primaNeta ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tasa:</span>
                      <span className="font-medium text-slate-700">{Number(plan.Tasa ?? 0).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
                {isProcessing && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-blue-600">Actualizando cotización...</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón inferior */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={goDown}
          disabled={!canGoDown}
          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
            canGoDown
              ? 'border-blue-500 text-blue-500 hover:bg-blue-50 active:scale-95'
              : 'border-slate-200 text-slate-300 cursor-not-allowed'
          }`}
          aria-label="Siguiente versión"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Indicador de posición */}
      <div className="flex justify-center gap-1.5">
        {versionesOrdenadas.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentVersionIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentVersionIndex
                ? 'w-8 bg-blue-500'
                : 'w-1.5 bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Ir a versión ${versionesOrdenadas[index]}`}
          />
        ))}
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg ${
          feedbackType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          <p className="text-sm">{feedback}</p>
        </div>
      )}
    </div>
  );
}