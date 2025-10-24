"use client"

import { Clock, Shield, TrendingUp, CheckCircle2, Zap, BookOpen, DollarSign, BarChart3, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const benefits = [
  {
    icon: Clock,
    title: "Oszczędność czasu",
    description: "Wszystkie kluczowe informacje w jednym miejscu. Zaoszczędź nawet 2-3 godziny dziennie.",
  },
  {
    icon: Shield,
    title: "Bezpieczeństwo pacjentów",
    description: "Natychmiastowe powiadomienia o wycofanych lekach pozwalają szybko reagować i chronić pacjentów.",
  },
  {
    icon: CheckCircle2,
    title: "Zgodność z przepisami",
    description: "Bądź na bieżąco z regulacjami GIF. Uniknij kar dzięki automatycznym aktualizacjom.",
  },
  {
    icon: TrendingUp,
    title: "Przewaga konkurencyjna",
    description: "Dowiaduj się o nowych lekach jako pierwszy. Oferuj najnowsze rozwiązania szybciej niż konkurencja.",
  },
  {
    icon: DollarSign,
    title: "Optymalizacja cen",
    description: "Monitoruj ceny konkurencji i dostosowuj strategię. Zwiększ rentowność apteki.",
  },
  {
    icon: BarChart3,
    title: "Analiza rynku",
    description: "Szczegółowe raporty o trendach cenowych i dostępności leków. Decyzje oparte na danych.",
  },
  {
    icon: Zap,
    title: "Szybkie decyzje",
    description: "Skonsolidowane informacje pozwalają na świadome decyzje w czasie rzeczywistym.",
  },
  {
    icon: Users,
    title: "Lepsza obsługa klienta",
    description: "Lepiej doradzaj pacjentom dzięki wiedzy o cenach i dostępności leków w okolicy.",
  },
  {
    icon: BookOpen,
    title: "Kompleksowa wiedza",
    description: "Wszystkie istotne informacje w jednym miejscu. Nie przegap żadnej ważnej zmiany.",
  },
]

export function BenefitsSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)

  return (
    <section id="benefity" ref={ref as React.RefObject<HTMLElement>} className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Co zyskujesz dzięki PharmaRadar?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platforma stworzona z myślą o farmaceutach, którzy cenią swój czas i bezpieczeństwo pacjentów
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card 
                key={index} 
                className={`transition-all duration-700 hover:shadow-lg hover:-translate-y-2 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
