'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Aseguradoras } from "@/configuration/constants";
import { IPlanRequest } from "@/interfaces/interfaces.type";
import { PlanAseguradoraClient } from "./PlanAseguradoraClient";
import { HeaderComparatorCard } from "./HeaderComparador";
import { StaticPlanCard } from "@/app/(dashboard)/dashboard/comparador/components/StaticPlanCard";
import { IPlanResponse } from "@/interfaces/interfaces.type";
import { ShoppingCart } from "lucide-react";
import { ComparadorModal } from "./ComparadorModal";

interface Props {
  slug: string;
  planRequest: IPlanRequest;
  cotizacion: any;
}

export function ComparadorWrapper({ slug, planRequest, cotizacion }: Props) {
  const [selectedPlans, setSelectedPlans] = useState<IPlanResponse[]>([]);
  const [showComparison, setShowComparison] = useState(false);

   const togglePlanSelection = (plan: IPlanResponse) => {
    setSelectedPlans(prev => {
      const isAlreadySelected = prev.some(p => 
        p.insurer === plan.insurer && p.planName === plan.planName
      );
      
      if (isAlreadySelected) {
        // Quitar del array
        return prev.filter(p => 
          !(p.insurer === plan.insurer && p.planName === plan.planName)
        );
      } else {
        // Agregar al array (máximo 4)
        if (prev.length >= 3) {
          alert('Máximo 3 planes para comparar');
          return prev;
        }
        return [...prev, plan];
      }
    });
  };

  // Verificar si un plan está seleccionado
  const isPlanSelected = (plan: IPlanResponse) => {
    return selectedPlans.some(p => 
      p.insurer === plan.insurer && p.planName === plan.planName
    );
  };

   // 👇 Función para cerrar el modal
  const handleCloseModal = () => {
    setShowComparison(false);
  };

  // 👇 Función para abrir el modal
  const handleOpenComparison = () => {
    if (selectedPlans.length >= 2) {
      setShowComparison(true);
    }
  };

  return (
     <div className="max-w-6xl mx-auto px-6 lg:px-0">
      <h1>Comparador: {slug}</h1>

      <Button asChild variant="oland" className="cursor-pointer">
        <Link href={`/${slug}`}>Volver a {slug}</Link>
      </Button>

      {/* Información de cotización */}
      <HeaderComparatorCard
        nombreDelCliente={cotizacion.name}
        vehiculoDelCliente={cotizacion.brand}
        modeloDelVehiculo={cotizacion.model}
        yearDelVehiculo={cotizacion.year}
        valorAsegurado={cotizacion.vehicleValue}
      />

      {/* Barra flotante de comparación */}
      {selectedPlans.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-blue-600 text-white rounded-lg shadow-2xl p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={24} />
              <div>
                <div className="font-semibold">
                  {selectedPlans.length} {selectedPlans.length === 1 ? 'plan seleccionado' : 'planes seleccionados'}
                </div>
                <div className="text-xs text-blue-100">
                  Máximo 3 planes
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedPlans([])}
                variant="outline"
                size="sm"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Limpiar
              </Button>
              <Button
                onClick={handleOpenComparison}
                disabled={selectedPlans.length < 2}
                size="sm"
                className="bg-blue-700 hover:bg-blue-800"
              >
                Comparar {selectedPlans.length > 1 && `(${selectedPlans.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}

     {/* 👇 Modal de Comparación */}
      <ComparadorModal
        isOpen={showComparison}
        onClose={handleCloseModal}
        selectedPlans={selectedPlans}
      />
      

      {/* Lista de planes (ocultar cuando se muestra comparación) */}
 
        <div className="my-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Todos los Planes</h2>
            <p className="text-sm text-gray-500">
              {Aseguradoras.length} aseguradoras
            </p>
          </div>
          
          <div className="space-y-4">
            {Aseguradoras.map((aseguradora) => (
              <PlanAseguradoraClient
                key={aseguradora}
                aseguradora={aseguradora}
                planRequest={planRequest}
                cacheKey={slug}            
                onToggleSelection={togglePlanSelection}
                isPlanSelected={isPlanSelected}
              />
            ))}
          </div>
          
          <div className="mt-4">
            <StaticPlanCard />
          </div>
        </div>
    
    </div>
  );
}