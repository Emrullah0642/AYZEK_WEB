"use client"

import { useState } from "react"
import { TeamSection } from "@/components/team-section"
import { MissionValues } from "@/components/mission-values"
import { CommunityJourney } from "@/components/community-journey"
import { AdminNavbar } from "@/components/navbar"
import { InlineEditWrapper } from "@/components/admin/admin-inline-edit-wrapper"
import { ContentEditModal } from "@/components/content-edit-modal"
import { ScrollAnimation } from "@/components/scroll-animations"
import { SiteFooter } from "@/components/site-footer"
import { KineticHeading } from "@/components/kinetic-heading"
import { CountUp } from "@/components/count-up"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users, Trophy, Calendar, Layers } from "lucide-react"

const statIcons = [Layers, Users, Trophy, Calendar]

export default function AboutPage() {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [heroContent, setHeroContent] = useState({
    title: "AYZEK Hakkında",
    description:
      "Sadece projeler yapan ve yarışmalara katılan bir topluluk değiliz. Bizler kariyer basamaklarında beraber adımlar atmaya kararlı, işin sadece bilgiden ibaret olmadığına inanan, bir fikrin samimiyetle buluşmasının ardından insanların hayatlarına dokunabileceğine inanan bir aileyiz.",
  })
  const [stats, setStats] = useState([
    { value: "4", label: "Yıllık Ekip" },
    { value: "200+", label: "Aktif Üye" },
    { value: "20+", label: "Kazanılan Ödül" },
    { value: "50+", label: "Düzenlenen Etkinlik" },
  ])

  const handleEditHero = () => {
    setEditingSection("hero")
  }

  const handleSaveContent = (data: any) => {
    if (editingSection === "hero") {
      setHeroContent(data)
    }
    setEditingSection(null)
  }

  const handleSpotlightMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`)
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10 theme-transition">
      <AdminNavbar />

      {/* Hero */}
      <InlineEditWrapper onEdit={handleEditHero} className="py-8 sm:py-10 md:py-16 px-3 sm:px-4 relative overflow-hidden">
        <div className="container max-w-screen-xl mx-auto text-center relative z-10">
          <ScrollAnimation animation="fade-up" className="flex flex-col items-center gap-3 sm:gap-4">
            <Badge variant="outline" className="rounded-full border-foreground/15 bg-foreground/[0.04] text-[9px] sm:text-[10px] px-2.5 py-0.5 text-muted-foreground">
              <Sparkles className="w-3 h-3 mr-1.5 text-primary" />
              BİZ KİMİZ
            </Badge>
            <KineticHeading
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight max-w-3xl"
              words={heroContent.title.split(" ").map((text, i) => ({
                text,
                className: i === 0 ? "gradient-text" : undefined,
              }))}
            />
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
              {heroContent.description}
            </p>
          </ScrollAnimation>
        </div>
      </InlineEditWrapper>

      {/* İstatistikler */}
      <InlineEditWrapper className="py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="container max-w-screen-xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {stats.map((stat, index) => {
              const Icon = statIcons[index % statIcons.length]
              return (
                <ScrollAnimation key={index} animation="scale-up" delay={index * 100}>
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
      </InlineEditWrapper>

      {/* Misyon & Değerler */}
      <InlineEditWrapper className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 bg-transparent theme-transition">
        <div className="container max-w-screen-xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <MissionValues />
          </ScrollAnimation>
        </div>
      </InlineEditWrapper>

      {/* Topluluk Yolculuğu */}
      <InlineEditWrapper className="py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="container max-w-screen-xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <CommunityJourney />
          </ScrollAnimation>
        </div>
      </InlineEditWrapper>

      {/* Takım Bölümü */}
      <InlineEditWrapper className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 bg-transparent">
        <div className="container max-w-screen-xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <TeamSection />
          </ScrollAnimation>
        </div>
      </InlineEditWrapper>

      <SiteFooter />

      <ContentEditModal
        isOpen={editingSection === "hero"}
        onClose={() => setEditingSection(null)}
        onSave={handleSaveContent}
        title="Başlığı Düzenle"
        description="Ana sayfa giriş bölümünün içeriğini güncelle"
        initialData={heroContent}
        fields={[
          { key: "title", label: "Başlık", type: "text", required: true },
          { key: "description", label: "Açıklama", type: "textarea", required: true },
        ]}
      />
    </div>
  )
}
