"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CardCarruselProps {
  autoPlayInterval?: number
  isAutoPlay?: boolean
  cards?: Array<{
    id: number
    title: string
    description: string
    color?: string
    img?: string
    desde?: string
    buttonCard?:ButtonCardProps
    date?:string
    categoty?:string
  }>
}
interface ButtonCardProps {
  id: number
  title: string
  description: string
  color: string
  img?: string
  desde?: string
  date?:string
  categoty?:string
}


export default function CardCarrusel({
  autoPlayInterval = 3000,
  isAutoPlay = true,
    cards = [
  {
    id: 1,
    title: "Capacitación Zürich Seguros",
    description: "JULIO.- Capacitación con el equipo comercial de Zürich en el ramo de Vehículos, Pymes. Fue una excelente oportunidad para fortalecer conocimiento y conocer de primera mano las últimas herramientas y beneficios.",
    img: "img/capacitacionZurich.jpg",
    date: "Julio 2025",
  },
  {
    id: 2,
    title: "Capacitación Seguros Equinoccial",
    description: "SEPTIEMBRE.- Jornada de formación con Seguros Equinoccial, centrada en los ramos de Vehículos y Pymes. Este espacio nos permitió actualizar conocimientos, intercambiar experiencias con el equipo comercial y explorar nuevas soluciones que fortalecen nuestra propuesta de valor.",
    img: "img/capacitacionEquinoccial.jpg",
    date: "Septiembre 2025"
  },
  {
    id: 3,
    title: "Próxima Capacitación AIG",
    description: "NOVIEMBRE.- Próxima capacitación con AIG (fecha por confirmar). Mantente atento a los próximos eventos de formación que seguiremos compartiendo.",
    img: "/img/capacitacionZurich4.jpg",
    date: "Noviembre 2025",
  },
  {
    id: 4,
    title: "Extra Bono",
    description: "Nos complace anunciar el extra-bono que aplicará para este último trimestre del año, desde el 01/10/2025 hasta el 31/12/2025. ¡Una excelente oportunidad para cerrar el año con fuerza y entusiasmo!",
    img: "/img/extraBono.jpg",
    date: "Oct - Dic 2025",
  }
]
}: CardCarruselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [cardsPerView, setCardsPerView] = useState(3)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Crear carrusel infinito (3 copias del array)
  const extendedCards = [...cards, ...cards, ...cards]
  const startIndex = cards.length

  // Configurar cardsPerView según el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1)
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2)
      } else {
        setCardsPerView(3)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Inicializar en el índice central
  useEffect(() => {
    setCurrentIndex(startIndex)
  }, [startIndex])

  // Manejar transición y reset de posición
  useEffect(() => {
    if (!isTransitioning) return

    const timer = setTimeout(() => {
      setIsTransitioning(false)

      // Reset sin animación cuando llegamos a los límites
      if (currentIndex >= cards.length * 2) {
        setCurrentIndex(startIndex)
      } else if (currentIndex < cards.length) {
        setCurrentIndex(startIndex)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [currentIndex, isTransitioning, cards.length, startIndex])

  // AutoPlay
  useEffect(() => {
    if (!isAutoPlay) return

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsTransitioning(true)
      }, autoPlayInterval)
    }

    startAutoPlay()

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlay, autoPlayInterval])

  const nextSlide = () => {
    if (isTransitioning) return
    
    // Reiniciar autoplay
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev + 1)
  }

  const prevSlide = () => {
    if (isTransitioning) return
    
    // Reiniciar autoplay
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev - 1)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning) return
    
    // Reiniciar autoplay
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    
    setIsTransitioning(true)
    setCurrentIndex(startIndex + index)
  }

  // Calcular el índice actual normalizado para los dots
  const normalizedIndex = ((currentIndex % cards.length) + cards.length) % cards.length

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="overflow-hidden">
        <div
          className={`flex gap-4 ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
          style={{
            transform: `translateX(calc(-${currentIndex * (100 / cardsPerView)}% - ${currentIndex * (16 / cardsPerView)}px))`,
          }}
        >
          {extendedCards.map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              className="flex-shrink-0 w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
            >
              <Card className="h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className={`${card.color} h-48 sm:h-56 relative`}>
                    {card.img && (
                      <img 
                        src={card.img} 
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5 sm:p-6">
                    <h3 className="text-black text-xl sm:text-2xl font-bold mb-3 text-left">
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed text-left">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 sm:-translate-x-0 rounded-full shadow-lg bg-white hover:bg-gray-50 z-10 disabled:opacity-50"
        onClick={prevSlide}
        disabled={isTransitioning}
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 sm:translate-x-0 rounded-full shadow-lg bg-white hover:bg-gray-50 z-10 disabled:opacity-50"
        onClick={nextSlide}
        disabled={isTransitioning}
        aria-label="Siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      <div className="flex justify-center gap-2 mt-8">
        {cards.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === normalizedIndex 
                ? "w-8 bg-primary" 
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            aria-label={`Ir a tarjeta ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}