"use client"

import { JoinCommunityForm } from "@/components/join-community-form"
import { AdminNavbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Heart, Lightbulb, Trophy, Calendar, MessageCircle, Sparkles } from "lucide-react"
import { ScrollAnimation } from "@/components/scroll-animations"
import { SiteFooter } from "@/components/site-footer"
import { KineticHeading } from "@/components/kinetic-heading"
import { Badge } from "@/components/ui/badge"

const benefits = [
  {
    icon: Users,
    title: "Networking Fırsatları",
    description: "Düzenlediğimiz sempozyum ve etkinliklerle üyelerimizi profesyonellerle buluşturuyor, bağlantı kurmalarını sağlıyoruz.",

  },
  {
    icon: Lightbulb,
    title: "Öğrenme ve Gelişim",
    description: "Tecrübe ve bilgi birikimi aramaksızın takımlarımıza sizleri dahil ediyor ve tecrübeli üyelerimizle gelişiminize katkı sağlıyoruz.",
  },
  {
    icon: Calendar,
    title: "Özel Etkinlikler",
    description: "Yıl boyunca eğitimler, uluslararası sempozyumlar, yatırımcılarla buluşmalar ve daha fazlasını yapıyoruz.",
  },
  {
    icon: Trophy,
    title: "Tanınma ve Ödüller",
    description: "Her yıl teknofestte birden fazla finalist takıma sahip olan topluluğumuz henüz kuruluşunun 3.yılında 4 tane ödüle sahip!",
  },
  {
    icon: MessageCircle,
    title: "7/24 Topluluk Desteği",
    description:
      "Gruplar, sosyal meyda hesaları gibi iletişim kanallarından yönetim kuruluna ulaşabilir ve destek alabilirsiniz.",
  },
  {
    icon: Heart,
    title: "Kapsayıcı Ortam",
    description: "Yapay Zekadan web geliştirmeye, gömülü sistemlerden mobil uygulama geliştirmeye bir çok alanda faliyet gösteriyoruz.",
  },
]

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-transparent relative z-10 theme-transition">
      {/* Navigation Header */}
      <AdminNavbar />

      {/* Hero Section with Background Pattern */}
      <section className="py-8 sm:py-10 md:py-14 px-3 sm:px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dots)" />
          </svg>
        </div>
        <div className="container max-w-screen-xl mx-auto text-center relative z-10">
          <ScrollAnimation animation="fade-up" className="flex flex-col items-center gap-3 sm:gap-4">
            <Badge variant="outline" className="rounded-full border-foreground/15 bg-foreground/[0.04] text-[9px] sm:text-[10px] px-2.5 py-0.5 text-muted-foreground">
              <Sparkles className="w-3 h-3 mr-1.5 text-primary" />
              ARAMIZA KATIL
            </Badge>
            <KineticHeading
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight"
              words={[
                { text: "Topluluğumuza" },
                { text: "Katıl", className: "gradient-text" },
              ]}
            />
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
              Yeniliğin işbirliğiyle buluştuğu canlı bir teknoloji topluluğunun parçası olun. Teknoloji konusunda
              tutkulu, benzer düşünen bireylerle bağlantı kurun, öğrenin ve büyüyün.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 bg-transparent theme-transition">
        <div className="container max-w-screen-xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 gradient-text">Neden AYZEK'e Katılmalısınız?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-snug">
                Gelişen teknoloji topluluğumuzun parçası olmanın avantajlarını keşfedin
              </p>
            </div>
          </ScrollAnimation>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <ScrollAnimation key={index} animation="scale-up" delay={index * 100}>
                  <Card
                    className="group relative overflow-hidden hover:shadow-[0_0_30px_-8px_oklch(0.62_0.21_258_/_0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 bg-card/70 backdrop-blur-sm border border-foreground/10 h-[250px] sm:h-[270px] md:h-[290px] flex flex-col"
                  >
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-ayzek-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    <CardHeader className="text-center flex-shrink-0 p-3 sm:p-3.5 md:p-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-1.5 rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                      </div>
                      <CardTitle className="font-display text-xs sm:text-sm md:text-base mb-0">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow p-3 sm:p-3.5 md:p-4 pt-0">
                      <CardDescription className="text-center leading-snug text-[10px] sm:text-xs md:text-sm line-clamp-4">
                        {benefit.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              )
            })}
          </div>
        </div>
      </section>

      {/* Join Form */}
      <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4">
        <div className="container max-w-screen-xl mx-auto">
          <ScrollAnimation animation="fade-up">
            <JoinCommunityForm />
          </ScrollAnimation>
        </div>
      </section>



      <SiteFooter />
    </div>
  )
}
