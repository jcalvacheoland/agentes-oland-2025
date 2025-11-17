import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CardInicio = () => {
  return (
    <>
      <div className="w-96 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Imagen */}
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200">
          <img
            src="/img/carros.png"
            alt="Asegura tu vehículo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contenido */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Asegura tu vehículo
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            ¡Cotiza el vehículo de tu cliente y encuentra la mejor opción para
            cerrar la venta!
          </p>

          {/* Botón */}
          <Link href="/dashboard/cotizaciones">
            <Button variant={"oland"}>Cotizar Ahora</Button>
          </Link>
        </div>
      </div>
    </>
  );
};
