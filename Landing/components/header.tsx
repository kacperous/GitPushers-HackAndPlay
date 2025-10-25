"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PharmaRadarLogo } from "./pharma-radar-logo"

export function Header() {
  const handleRedirect = () => {
    window.location.href = 'https://app.pharmaradar.pl'
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in fade-in slide-in-from-top duration-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <PharmaRadarLogo className="h-25 w-25 text-primary" />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" asChild>
              <a href="#funkcje">Funkcje</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#benefity">Benefity</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#farmaceuci">Dla Farmaceutów</a>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href="#funkcje">Funkcje</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#benefity">Benefity</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="#farmaceuci">Dla Farmaceutów</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="gap-2" onClick={handleRedirect}>Rozpocznij</Button>
        </div>
      </div>
    </header>
  )
}
