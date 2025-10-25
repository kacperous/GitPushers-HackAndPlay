"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation(0.2)
  
  const handleRedirect = () => {
    window.location.href = 'https://app.pharmaradar.pl'
  }

  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className={`mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Gotowy na rozpoczęcie?</h2>
        <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
          Dołącz do tysięcy farmaceutów, którzy już korzystają z PharmaRadar i oszczędzają czas każdego dnia.
        </p>
        <Button size="lg" variant="secondary" className="gap-2 text-base transition-transform hover:scale-105 duration-200" onClick={handleRedirect}>
          Wypróbuj za darmo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}
