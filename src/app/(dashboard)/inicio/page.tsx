import { CardCarrusel } from "./components/cardCarrusel"
const HomeAgentesInfoPage={
    title: "Inicio - Agentes",
    description: "Transforma vidas, protege sueños: Cada Poliza, que vender es una familia que duerme tranquila. Tu exito es su seguridad.",
    keywords: "Inicio, Agentes",
}
export default function HomeAgentes() {


    return (
        <div className="px-8 ">
            <header className="text-center mt-12">
                <h2 className="md:text-xl ">{HomeAgentesInfoPage.description}</h2>
            </header>

            <div className="mt-4">
            <section className="ml-6">
                <h3>
                    Tipos de seguros disponibles
                </h3>
                
            </section>
            <main >
                <CardCarrusel autoPlayInterval={2000} isAutoPlay={true}></CardCarrusel>
            </main>
            </div>
        
        </div>
    )
}