import LandingNav from "@/components/landing/LandingNav"
import Hero from "@/components/landing/Hero"
import LogoStrip from "@/components/landing/LogoStrip"
import FeatureGrid from "@/components/landing/FeatureGrid"
import HowItWorks from "@/components/landing/HowItWorks"
import ProductShowcase from "@/components/landing/ProductShowcase"
import Testimonial from "@/components/landing/Testimonial"
import PricingTeaser from "@/components/landing/PricingTeaser"
import FAQ from "@/components/landing/FAQ"
import FinalCTA from "@/components/landing/FinalCTA"
import LandingFooter from "@/components/landing/LandingFooter"

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 antialiased">
      <LandingNav />
      <main>
        <Hero />
        <LogoStrip />
        <FeatureGrid />
        <HowItWorks />
        <ProductShowcase />
        <Testimonial />
        <PricingTeaser />
        <FAQ />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  )
}
