"use client";
import { useBitrixUser } from "@/hooks/useBitrixUser";

interface HeaderProps {
  nombreDelCliente: string;
  vehiculoDelCliente: string;
  modeloDelVehiculo: string;
  yearDelVehiculo: number;
  valorAsegurado: number;
}

export const HeaderComparatorCard = ({
  nombreDelCliente,
  vehiculoDelCliente,
  modeloDelVehiculo,
  yearDelVehiculo,
  valorAsegurado,
}: HeaderProps) => {
  const { user } = useBitrixUser();

  return (
    <div >
      <article className="text-center mb-8">
        <h1 className="text-3xl md:text-2xl font-bold text-foreground mb-2">
          Hola {user?.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Estos son los planes disponibles para el vehículo de tu cliente{" "}
          <span className="lowercase">{nombreDelCliente}</span>
        </p>
      </article>

      <div className="bg-card border rounded-lg shadow-sm p-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Vehicle Details */}
          <div className="space-y-3 grid grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Vehículo
              </p>
              <p className="text-lg font-semibold text-foreground">
                {vehiculoDelCliente}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Modelo
              </p>
              <p className="text-lg font-semibold text-foreground">
                {modeloDelVehiculo}
              </p>
            </div>
          </div>

          {/* Year and Value */}
          <div className="space-y-3 grid grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Año
              </p>
              <p className="text-lg font-semibold text-foreground">
                {yearDelVehiculo}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Valor Asegurado
              </p>
              <p className="text-xl font-bold text-primary">
                $
                {valorAsegurado.toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
