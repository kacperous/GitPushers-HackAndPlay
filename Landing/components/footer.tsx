"use client"

import Link from "next/link"
import { PharmaRadarLogo } from "./pharma-radar-logo"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export function Footer() {
  const { ref, isVisible } = useScrollAnimation(0.1)

  return (
    <footer ref={ref as React.RefObject<HTMLElement>} className="border-t bg-background">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <PharmaRadarLogo className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">Profesjonalne rozwiązania dla farmaceutów.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Produkt</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#funkcje" className="text-muted-foreground hover:text-foreground transition-colors">
                  Funkcje
                </Link>
              </li>
              <li>
                <Link href="#benefity" className="text-muted-foreground hover:text-foreground transition-colors">
                  Benefity
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Firma</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  O nas
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Prawne</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Prywatność
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Regulamin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">© 2025 PharmaRadar. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  )
}
