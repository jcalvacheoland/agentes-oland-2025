import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormularioClienteVehiculo } from "./components/form/formularioClienteVehiculo";
import {ArrowLeft} from "lucide-react"

export default function Dashboard() {
  return (
    <div >
      <main className="mt-4">
        <div className="max-w-7xl px-4 mx-auto sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6  sm:mb-8">
            <div >
                <Link href="/dashboard" className="left-0">
                  <Button variant="oland" className="flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    Regresar
                  </Button>
                </Link>

                <h1 className="mb-3 text-2xl text-center font-bold text-gray-900 sm:text-3xl lg:text-4xl">
                  Cotiza Seguros de Auto para tus Clientes
                </h1>
            </div>
            
            <p className="mb-1 text-base text-gray-600 leading-relaxed sm:text-lg">
              Herramienta profesional para comparar seguros vehiculares de todas
              las aseguradoras ecuatorianas.{" "}
              <span className="text-rojo-oland-100 font-semibold">
                Cierra más ventas con cotizaciones precisas.
              </span>
            </p>
          </div>
        </div>
        <FormularioClienteVehiculo></FormularioClienteVehiculo>
      </main>
    </div>
  );
}
