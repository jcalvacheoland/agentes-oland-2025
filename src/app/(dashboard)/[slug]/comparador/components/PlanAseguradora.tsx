import { obtenerPlanPorAseguradora2 } from "@/lib/services/api";
import { IPlanRequest } from "@/interfaces/interfaces.type";

export async function PlanAseguradora({ 
  aseguradora, 
  planRequest 
}: { 
  aseguradora: string; 
  planRequest: IPlanRequest 
}) {
  try {
    const plan = await obtenerPlanPorAseguradora2(aseguradora, planRequest);
    
    return (
      <div className="border p-4 rounded shadow-sm bg-white hover:shadow-md transition-shadow">
        <h3 className="text-xl font-semibold mb-3 capitalize flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          {aseguradora}
        </h3>
        
        {plan ? (
          <div className="space-y-2">
            <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded max-h-96 border">
              {JSON.stringify(plan, null, 2)}
            </pre>
            <p className="text-xs text-green-600 font-medium">✓ Planes cargados</p>
          </div>
        ) : (
          <p className="text-gray-500">No hay planes disponibles</p>
        )}
      </div>
    );
  } catch (error) {
    console.error(`Error obteniendo planes de ${aseguradora}:`, error);
    
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
}