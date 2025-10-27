"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Aseguradoras } from "@/configuration/constants";
import { IPlanRequest } from "@/interfaces/interfaces.type";
import { PlanAseguradoraClient } from "./PlanAseguradoraClient";
import { HeaderComparatorCard } from "./HeaderComparador";
import { StaticPlanCard } from "@/app/(dashboard)/dashboard/comparador/components/StaticPlanCard";
import { IPlanResponse } from "@/interfaces/interfaces.type";
import { Car } from "lucide-react";
import { ComparadorModal } from "./ComparadorModal";
import { ArrowLeft } from "lucide-react";

interface Props {
  slug: string;
  planRequest: IPlanRequest;
  cotizacion: any;
}

export function ComparadorWrapper({ slug, planRequest, cotizacion }: Props) {
  const [selectedPlans, setSelectedPlans] = useState<IPlanResponse[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const togglePlanSelection = (plan: IPlanResponse) => {
    setSelectedPlans((prev) => {
      const isAlreadySelected = prev.some(
        (p) => p.insurer === plan.insurer && p.planName === plan.planName
      );

      if (isAlreadySelected) {
        // Quitar del array
        return prev.filter(
          (p) => !(p.insurer === plan.insurer && p.planName === plan.planName)
        );
      } else {
        // Agregar al array (máximo 4)
        if (prev.length >= 3) {
          alert("Máximo 3 planes para comparar");
          return prev;
        }
        return [...prev, plan];
      }
    });
  };

  // Verificar si un plan está seleccionado
  const isPlanSelected = (plan: IPlanResponse) => {
    return selectedPlans.some(
      (p) => p.insurer === plan.insurer && p.planName === plan.planName
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

  const handleGeneratePdf = async () => {
  if (selectedPlans.length === 0) {
    alert("Primero selecciona al menos un plan");
    return;
  }
  try {
    // Llamar a tu API
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedPlans }),
    });

    if (!res.ok) {
      throw new Error("Error al generar el PDF");
    }

    // Convertir respuesta a Blob (archivo binario)
    const blob = await res.blob();

    // Crear un enlace temporal para descargar
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "planes_comparados_OlandSeguro.pdf";
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert("No se pudo generar el PDF");
  }
};

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-0 ">
      <div className="mt-2">
        <Button
          asChild
          variant="oland"
          className="cursor-pointer  gap-2"
        >
          <Link href={`/${slug}`}>
            <ArrowLeft className="w-4 h-4" />
            Regresar
          </Link>
        </Button>
      </div>

      {/* Información de cotización */}
      <HeaderComparatorCard
        nombreDelCliente={cotizacion.name}
        vehiculoDelCliente={cotizacion.brand}
        modeloDelVehiculo={cotizacion.model}
        yearDelVehiculo={cotizacion.year}
        valorAsegurado={cotizacion.vehicleValue}
      />

      {/* Barra flotante de comparación */}
      <section className="flex justify-center">
        {selectedPlans.length > 0 && (
          <div className="fixed bottom-6 left-6 right-6 z-50 flex justify-center">
            <div className="bg-azul-oland-100 text-white rounded-lg shadow-2xl p-4 flex items-center gap-4 w-auto">
              <div className="flex items-center gap-2">
                <Car size={24} />
                <div>
                  <div className="font-semibold">
                    {selectedPlans.length}{" "}
                    {selectedPlans.length === 1
                      ? "plan seleccionado"
                      : "planes seleccionados"}
                  </div>
                  <div className="text-xs text-blue-100">Máximo 3 planes</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedPlans([])}
                  variant="outline"
                  size="sm"
                  className="bg-white text-black"
                >
                  Limpiar
                </Button>
                <Button
                  onClick={handleOpenComparison}
                  disabled={selectedPlans.length < 2}
                  size="sm"
                  className="bg-rojo-oland-100 hover:bg-azul-oland-100 text-white"
                >
                  Comparar{" "}
                  {selectedPlans.length > 1 && `(${selectedPlans.length})`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 👇 Modal de Comparación */}
      <ComparadorModal
        isOpen={showComparison}
        onClose={handleCloseModal}
        selectedPlans={selectedPlans}
        onGeneratePdf={handleGeneratePdf}
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
