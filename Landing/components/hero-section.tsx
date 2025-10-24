"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-background pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <Badge variant="secondary" className="gap-2">
            <Sparkles className="h-3 w-3" />
            Nowa platforma dla farmaceutów
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance">
            PharmaRadar - Bądź na bieżąco z branżą medyczną
          </h1>

          <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto text-pretty">
            Codzienne podsumowania wycofanych i nowych leków, zmian prawnych oraz najważniejszych newsów z branży
            medycznej - wszystko w jednym miejscu dla farmaceutów.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="gap-2 text-base">
              Wypróbuj za darmo
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-transparent">
              Zobacz demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
