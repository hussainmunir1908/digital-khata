/**
 * app/page.tsx — Khata Landing Page
 *
 * Responsive Design Checklist:
 * ✅ Mobile layout (base): single-column, stacked sections, hamburger nav
 * ✅ Tablet layout (md/lg): 2-col grids, inline hero CTA form
 * ✅ Desktop layout (lg+): full 4-col stats, 2-col features, horizontal nav
 * ✅ Touch targets: all interactive elements ≥ 44px (min-h-[44px])
 * ✅ Icons: 16-22px mobile, 24-28px desktop via size props
 * ✅ Navigation: responsive with hamburger menu on mobile
 * ✅ Typography: fluid via text-{size} sm:text-{size} lg:text-{size} scale
 */

import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import ScrollytellingSection from '@/components/landing/ScrollytellingSection'
import TeamSection from '@/components/landing/TeamSection'
import Footer from '@/components/landing/Footer'
import { Toaster } from 'sonner'

export default function Home() {
  return (
    <>
      {/* Toast notifications for waitlist signup */}
      <Toaster position="top-center" richColors />

      {/* Sticky responsive navbar */}
      <Navbar />

      <main>
        {/* Mobile/tablet only — hidden on desktop where scrollytelling takes over */}
        <div className="lg:hidden">
          <HeroSection />
          <FeaturesSection />
        </div>

        {/* Desktop-only Apple-style scrollytelling */}
        <ScrollytellingSection />

        {/* Team section — visible on all breakpoints */}
        <TeamSection />
      </main>

      {/* Site footer */}
      <Footer />
    </>
  )
}
