export function LoadingPlan({ aseguradora }: { aseguradora: string }) {
  return (
    <div className="border p-4 rounded shadow-sm bg-white">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-rojo-oland-100 rounded-full animate-pulse"></div>
        <span className="capitalize">Consultando tu plan...</span>
      </div>
    </div>
  );
}