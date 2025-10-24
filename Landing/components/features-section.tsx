"use client"

import { AlertTriangle, Pill, Scale, FileText, Newspaper } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const features = [
  {
    icon: AlertTriangle,
    title: "Wycofane leki",
    description:
      "Codzienne podsumowania leków wycofanych z obrotu na podstawie komunikatów Głównego Inspektoratu Farmaceutycznego (GIF). Natychmiastowe informacje o wymianach i zakazach stosowania.",
  },
  {
    icon: Pill,
    title: "Nowe leki",
    description:
      "Regularne agregowanie informacji o nowych lekach dopuszczonych do obrotu. Szybka aktualizacja wiedzy terapeutycznej na podstawie oficjalnych rejestrów i komunikatów.",
  },
  {
    icon: Scale,
    title: "Porównywanie cen",
    description:
      "Monitoruj i porównuj ceny leków w aptekach w Twojej okolicy. Zyskaj przewagę konkurencyjną dzięki wiedzy o cenach konkurencji i optymalizuj swoją ofertę cenową.",
  },
  {
    icon: FileText,
    title: "Zmiany prawne",
    description:
      "Aktualizacje dotyczące nowych przepisów i regulacji prawnych w sektorze medycznym i farmaceutycznym. Zachowaj zgodność z obowiązującym prawem bez wysiłku.",
  },
  {
    icon: Newspaper,
    title: "Newsy branżowe",
    description:
      "Codzienne wiadomości z branży medycznej - badania, innowacje i tendencje rynkowe ze sprawdzonych źródeł informacji medycznych. Wszystko w jednym miejscu.",
  },
]

export function FeaturesSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)

  return (
    <section id="funkcje" ref={ref as React.RefObject<HTMLElement>} className="py-16 md:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Funkcje platformy</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            PharmaRadar automatycznie agreguje i dostarcza najważniejsze informacje dla profesjonalistów medycznych.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={`transition-all duration-700 hover:shadow-lg hover:-translate-y-2 w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
