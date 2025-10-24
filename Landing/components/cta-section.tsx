"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Gotowy na rozpoczęcie?</h2>
        <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
          Dołącz do tysięcy farmaceutów, którzy już korzystają z PharmaRadar i oszczędzają czas każdego dnia.
        </p>
        {/* </CHANGE> */}
        <Button size="lg" variant="secondary" className="gap-2 text-base">
          Wypróbuj za darmo
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}
