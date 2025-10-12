import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormularioClienteVehiculo } from "./components/form/formularioClienteVehiculo";

export default function Dashboard() {
  return (
    <div className=" bg-gray-100">
      <main className="mt-4">
        <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8">
          
           {/* Header */}
                  <div className="mb-6 text-center sm:mb-8">
                    <h1 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
                      Cotiza Seguros de Auto para tus Clientes
                    </h1>
                    <p className="mb-1 text-base text-gray-600 leading-relaxed sm:text-lg">
                      Herramienta profesional para comparar seguros vehiculares de todas las aseguradoras ecuatorianas.{" "}
                      <span className="text-red-700 font-semibold">
                        Cierra más ventas con cotizaciones precisas.
                      </span>
                    </p>
                  </div>
           <Link href="/dashboard">
            <Button className="" color="danger">
              Regresar
            </Button>
          </Link>
          
        </div>
        <FormularioClienteVehiculo></FormularioClienteVehiculo>
      </main>
    </div>
  );
}
