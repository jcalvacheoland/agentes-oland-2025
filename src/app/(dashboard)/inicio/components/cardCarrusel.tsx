"use client"

import { type SyntheticEvent, useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
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

type CarouselCard = NonNullable<CardCarruselProps["cards"]>[number]

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
  const [imageRatios, setImageRatios] = useState<Record<number, number>>({})
  const [expandedCard, setExpandedCard] = useState<CarouselCard | null>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }, [])

  const startAutoPlay = useCallback(() => {
    stopAutoPlay()

    if (!isAutoPlay || expandedCard) return

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
      setIsTransitioning(true)
    }, autoPlayInterval)
  }, [autoPlayInterval, expandedCard, isAutoPlay, stopAutoPlay])

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
    startAutoPlay()
    return () => stopAutoPlay()
  }, [startAutoPlay, stopAutoPlay])

  const nextSlide = () => {
    if (isTransitioning) return

    stopAutoPlay()
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev + 1)
    startAutoPlay()
  }

  const prevSlide = () => {
    if (isTransitioning) return

    stopAutoPlay()
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev - 1)
    startAutoPlay()
  }

  const goToSlide = (index: number) => {
    if (isTransitioning) return

    stopAutoPlay()
    setIsTransitioning(true)
    setCurrentIndex(startIndex + index)
    startAutoPlay()
  }

  // Calcular el índice actual normalizado para los dots
  const normalizedIndex = ((currentIndex % cards.length) + cards.length) % cards.length

  const registerImageRatio = (cardId: number) => (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    if (!img.naturalWidth || !img.naturalHeight) return

    const ratio = img.naturalWidth / img.naturalHeight
    setImageRatios((prev) => {
      if (prev[cardId] === ratio) return prev
      return { ...prev, [cardId]: ratio }
    })
  }

  const handleImageClick = (card: CarouselCard) => {
    if (!card.img) return

    stopAutoPlay()
    setExpandedCard(card)
  }

  const closeExpandedView = () => {
    setExpandedCard(null)
  }

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
                  <div
                    className={`${card.color ?? ""} relative overflow-hidden flex items-center justify-center`}
                    style={{ aspectRatio: imageRatios[card.id] ?? 16 / 9 }}
                  >
                    {card.img && (
                      <img
                        src={card.img}
                        alt={card.title}
                        className="w-full h-full object-contain cursor-zoom-in transition-opacity"
                        onLoad={registerImageRatio(card.id)}
                        onClick={() => handleImageClick(card)}
                      />
                    )}
                  </div>
                  <div className="p-5 sm:p-6">
                    <h3 className="text-black text-xl sm:text-2xl font-bold mb-3 text-left">
                      {card.title}
                    </h3>
                    <p className=" text-gray-800 text-sm sm:text-base leading-relaxed text-justify">
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

      {expandedCard?.img && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-8"
          onClick={closeExpandedView}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-black/70 p-2 text-white hover:bg-black/80 focus:outline-none"
              onClick={closeExpandedView}
              aria-label="Cerrar imagen ampliada"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={expandedCard.img}
              alt={expandedCard.title}
              className="w-full max-h-[80vh] rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
