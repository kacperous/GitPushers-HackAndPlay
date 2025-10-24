import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { BenefitsSection } from "@/components/benefits-section"
import { PharmacyCompetitiveSection } from "@/components/pharmacy-competitive-section"
import { PharmaRadarSection } from "@/components/pharma-radar-section"
import { CTASection } from "@/components/cta-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PharmacyCompetitiveSection />
      <BenefitsSection />
      <PharmaRadarSection />
      <CTASection />
      <Footer />
    </main>
  )
}
