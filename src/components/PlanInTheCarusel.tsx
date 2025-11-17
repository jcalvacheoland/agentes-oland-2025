import { IPlan } from "./PlanSelector"; // O donde tengas definido IPlan

export interface IPlanInTheCarouselProps {
  plan: IPlan;
  isSelected: boolean;
  isPending: boolean;
  isProcessing: boolean;
  planNombres: Record<string, string>;
  onSelect: (plan: IPlan) => void;
  formatPrecioUSD: (price: number) => string;
}

export const PlanInTheCarousel = ({
  plan,
  isSelected,
  isPending,
  isProcessing,
  planNombres,
  onSelect,
  formatPrecioUSD,
}: IPlanInTheCarouselProps) => {
  const primaTotalPlan =typeof plan.primaTotal === "number" ? plan.primaTotal : 0;
  const primaNetaPlan = typeof plan.primaNeta === "number" ? plan.primaNeta : 0;
  const planKey = plan.nombrePlan?.toLowerCase() ?? "";
  const planNombreLimpio =
    planNombres[planKey] || plan.nombrePlan || "Sin nombre";

  return (
    <button
      type="button"
      onClick={() => onSelect(plan)}
      className={`text-left rounded-lg border p-4 transition-all hover:shadow-md ${
        isSelected
          ? "border-azul-oland-100 border-2 bg-blue-50 shadow-sm"
          : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
      } ${isPending ? "cursor-wait opacity-80" : ""}`}
      disabled={isPending}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {plan.aseguradora}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Plan: {planNombreLimpio}
            </p>
          </div>
          <span
            className={`flex-shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full border ${
              isSelected
                ? "border-rojo-oland-100  bg-rojo-oland-100 text-white"
                : "border-slate-300 text-slate-300"
            }`}
            aria-hidden
          >
            {isSelected ? "✓" : ""}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span className="text-slate-500">Prima total:</span>
            <span className="font-medium text-slate-700">
              {formatPrecioUSD(primaTotalPlan)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Prima neta:</span>
            <span className="font-medium text-slate-700">
              {formatPrecioUSD(primaNetaPlan)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tasa:</span>
            <span className="font-medium text-slate-700">
              {Number((plan.Tasa ?? 0) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
      {isProcessing && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <p className="text-xs text-rojo-oland-100">
            Actualizando cotización...
          </p>
        </div>
      )}
    </button>
  );
};
