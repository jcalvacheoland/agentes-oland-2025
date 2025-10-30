import { CardCarrusel } from "./components/cardCarrusel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const HomeAgentesInfoPage = {
  title: "Inicio - Agentes",
  subtittle: "Cotiza el seguro para tu cliente en minutos, sin complicaciones.",
  description:
    "En nuestro portal puedes comparar planes de las principales aseguradoras del país y elegir la opción que mejor se ajuste a ti y a tu cliente.",
  keywords: "Inicio, Agentes",
};
export default function HomeAgentes() {
  return (
    <div className="max-w-6xl mx-auto ">
      <header className="text-center mt-12 space-y-3">
        <h1 className="text-2xl font-bold">{HomeAgentesInfoPage.subtittle}</h1>
        <p className="md:text-lg">{HomeAgentesInfoPage.description}</p>
      </header>

      <div className="mt-4">
        <section className="ml-6">
          <h3>Tipos de seguros disponibles</h3>
        </section>
        <main>
          <Card className="overflow-hidden my-5 w-[600px] mx-auto shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className=" h-48 sm:h-56 relative overflow-hidden">
                <img
                  src="img/carros.png"
                  className="w-full h-full object-cover p-4"
                />
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Protege tu vehículo con las mejores coberturas del mercado.
                  Compara entre diferentes aseguradoras y elige el plan ideal
                  para ti, todo en minutos y 100% en línea.
                </p>

                <Button asChild variant="oland" className="w-full not-prose">
                  <Link href="/dashboard/cotizaciones" className="no-underline">
                    Cotizar ahora
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <section className=" mx-auto">
          <h2 className="font-bold text-xl">Novedades</h2>
            <CardCarrusel></CardCarrusel>
        </section>
      </div>
    </div>
  );
}
