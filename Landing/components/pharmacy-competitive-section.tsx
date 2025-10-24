"use client"

import { TrendingUp, BarChart, Banknote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const competitiveFeatures = [
  {
    icon: BarChart,
    title: "Analiza konkurencji",
    description:
      "Śledź ceny i dostępność leków w aptekach konkurencyjnych w promieniu kilku kilometrów. Otrzymuj codzienne raporty z analizą różnic cenowych i możliwości optymalizacji.",
  },
  {
    icon: Banknote,
    title: "Strategia cenowa",
    description:
      "Narzędzia do tworzenia optymalnej strategii cenowej bazującej na danych rynkowych. Maksymalizuj marże przy zachowaniu konkurencyjności oferty.",
  },
  {
    icon: TrendingUp,
    title: "Wzrost sprzedaży",
    description:
      "Zwiększ obroty apteki dzięki lepszemu pozycjonowaniu cenowemu i szybszej reakcji na zmiany rynkowe. Przyciągnij nowych klientów konkurencyjnymi cenami.",
  },
]

export function PharmacyCompetitiveSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)

  return (
    <section
      id="farmaceuci"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Dla farmaceutów - przewaga konkurencyjna
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            PharmaRadar to nie tylko informacje o lekach - to kompleksowe narzędzie do zarządzania konkurencyjnością
            Twojej apteki
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {competitiveFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={`bg-white/95 hover:bg-white transition-all duration-700 hover:shadow-xl hover:-translate-y-2 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
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
