'use client';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Aseguradoras } from "@/configuration/constants";
import { IPlanRequest } from "@/interfaces/interfaces.type";
import { PlanAseguradoraClient } from "./PlanAseguradoraClient";
import { HeaderComparatorCard } from "./HeaderComparador";

interface Props {
  slug: string;
  planRequest: IPlanRequest;
  cotizacion: any;
}

export function ComparadorWrapper({ slug, planRequest, cotizacion }: Props) {
  return (
    <div className="max-w-7xl mx-auto">
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
          valorAsegurado={cotizacion.vehicleValue}>
        </HeaderComparatorCard>


      {/* Comparación de Planes */}
      <div className="my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Comparación de Planes</h2>
          <p className="text-sm text-gray-500">
            {Aseguradoras.length} aseguradoras
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Aseguradoras.map((aseguradora) => (
            <PlanAseguradoraClient
              key={aseguradora}
              aseguradora={aseguradora}
              planRequest={planRequest}
              cacheKey={slug} // Para identificar el caché
            />
          ))}
        </div>

        
      </div>
    </div>
  );
}