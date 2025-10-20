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
            </div>
            
            <h1 className="mb-1 font-outfit font-medium md:text-4xl text-azul-oland-100 text-center mt'6 leading-relaxed sm:text-lg">
              Herramienta para comparar vehículos en minutos.{" "}
            </h1>
          </div>
        </div>
        <FormularioClienteVehiculo></FormularioClienteVehiculo>
      </main>
    </div>
  );
}
