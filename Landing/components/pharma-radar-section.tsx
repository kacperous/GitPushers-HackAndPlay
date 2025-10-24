"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function PharmaRadarSection() {
  const { ref, isVisible } = useScrollAnimation(0.1)
  const features = [
    "Intuicyjny interfejs - zacznij korzystać bez szkoleń i skomplikowanych instrukcji.",
    "Oszczędność czasu - wszystkie informacje w jednym miejscu, bez przełączania między systemami.",
    "Zawsze aktualne dane - automatyczne aktualizacje zapewniają dostęp do najnowszych informacji.",
    "Kompleksowa baza danych - wszystkie leki, preparaty i informacje prawne w jednym systemie.",
  ]

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Badge variant="secondary" className="mb-4">
            Jak to działa
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">PharmaRadar w Twojej Aptece</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Nowoczesne rozwiązanie stworzone z myślą o farmaceutach
          </p>
        </div>

        <Card className={`overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left side - Image */}
            <div className="relative h-[400px] md:h-auto rounded-lg overflow-hidden">
              <Image
                src="/images/pharma-example.jpeg"
                alt="PharmaRadar w aptece"
                fill
                className="object-cover -rotate-1 scale-105 transition-transform duration-700 hover:scale-110"
              />
            </div>

            {/* Right side - List without numbers */}
            <div className="flex flex-col justify-center">
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className={`flex gap-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`} style={{ transitionDelay: `${400 + index * 100}ms` }}>
                    <span className="text-primary mt-1.5">•</span>
                    <p className="text-muted-foreground leading-relaxed">{feature}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
