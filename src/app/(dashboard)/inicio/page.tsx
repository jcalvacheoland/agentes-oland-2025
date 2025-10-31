import  CardCarrusel  from "./components/cardCarrusel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CardInicio } from "./components/CardInicio";
const HomeAgentesInfoPage = {
  title: "Inicio - Agentes",
  subtittle: "Cotiza el seguro para tu cliente en minutos, sin complicaciones.",
  description:
    "En nuestro portal puedes comparar planes de las principales aseguradoras del país y elegir la opción que mejor se ajuste a ti y a tu cliente.",
  keywords: "Inicio, Agentes",
};
export default function HomeAgentes() {
  return (
    <div className="max-w-7xl mx-auto ">
      <header className="text-center mt-12 space-y-3">
        <h1 className="text-3xl font-bold">{HomeAgentesInfoPage.subtittle}</h1>
        <p className="md:text-lg">{HomeAgentesInfoPage.description}</p>
      </header>

      <div className="mt-4 ">
        
        <main className="flex justify-center">
          <CardInicio></CardInicio>
        </main>

        <section className=" mx-auto">
          <h2 className="font-bold text-xl">Novedades</h2>
            <CardCarrusel></CardCarrusel>
        </section>
      </div>
    </div>
  );
}
