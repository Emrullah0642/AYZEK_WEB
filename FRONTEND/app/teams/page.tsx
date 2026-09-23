"use client"

import { AdminNavbar } from "@/components/navbar"
import { ScrollAnimation } from "@/components/scroll-animations"
import { TeamExplorer } from "@/components/team"
import { SiteFooter } from "@/components/site-footer"
import { KineticHeading } from "@/components/kinetic-heading"
import { CountUp } from "@/components/count-up"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Layers, Trophy, Users, Rocket } from "lucide-react"

const stats = [
  { value: "12+", label: "Proje Takımı", icon: Layers },
  { value: "20+", label: "Kazanılan Ödül", icon: Trophy },
  { value: "120+", label: "Geliştirici Üye", icon: Users },
  { value: "25+", label: "Tamamlanan Proje", icon: Rocket },
]

function handleSpotlightMove(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`)
}

export default function TeamsPage() {
  return (
    <div className="min-h-screen bg-transparent relative z-10 theme-transition">
      <AdminNavbar />

      {/* Hero */}
      <section className="py-8 sm:py-10 md:py-16 px-3 sm:px-4 relative overflow-hidden">
        <div className="container max-w-screen-xl mx-auto text-center relative z-10">
          <ScrollAnimation animation="fade-up" className="flex flex-col items-center gap-3 sm:gap-4">
            <Badge variant="outline" className="rounded-full border-foreground/15 bg-foreground/[0.04] text-[9px] sm:text-[10px] px-2.5 py-0.5 text-muted-foreground">
              <Sparkles className="w-3 h-3 mr-1.5 text-primary" />
              EKİP
            </Badge>
            <KineticHeading
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight"
              words={[{ text: "Takımlarımız", className: "gradient-text" }]}
            />
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
              Geleceğe heyecanla bakan, hızla gelişen teknolojide kendine yer bulanlar: AYZEK Takımları!
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="container max-w-screen-xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <ScrollAnimation key={i} animation="scale-up" delay={i * 100}>
                  <div
                    onMouseMove={handleSpotlightMove}
                    className="spotlight group relative overflow-hidden rounded-2xl border border-foreground/10 bg-card/70 backdrop-blur-sm hover:border-primary/40 hover:shadow-[0_0_30px_-8px_oklch(0.62_0.21_258_/_0.5)] transition-all duration-300 p-4 sm:p-5 md:p-6 h-[130px] sm:h-[150px] md:h-[170px] flex flex-col items-center justify-center text-center"
                  >
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-ayzek-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    <Icon className="w-5 h-5 text-primary/70 mb-2" />
                    <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold gradient-text">
                      <CountUp value={stat.value} />
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm mt-1">{stat.label}</div>
                  </div>
                </ScrollAnimation>
              )
            })}
          </div>
        </div>
      </section>

      {/* Takımlar */}
      <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="container max-w-screen-xl mx-auto">
          <ScrollAnimation animation="fade-up" className="text-center mb-4 sm:mb-5 md:mb-6">
            <Badge variant="outline" className="rounded-full border-foreground/15 bg-foreground/[0.04] text-[9px] sm:text-[10px] px-2.5 py-0.5 mb-2 text-muted-foreground">
              KEŞFET
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 gradient-text">Takımlarımızı Keşfedin</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-xs sm:text-sm md:text-base leading-snug px-2">
              Farklı alanlarda çalışan yetenekli takımlarımızla tanışın. Her takım, kendi alanında öncü projeler geliştirerek topluluğumuzu güçlendiriyor.
            </p>
          </ScrollAnimation>
          <ScrollAnimation animation="fade-up" delay={200}>
            <TeamExplorer />
          </ScrollAnimation>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
