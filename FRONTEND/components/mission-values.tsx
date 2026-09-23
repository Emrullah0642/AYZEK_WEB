"use client"

import { Users, Handshake, Lightbulb, Award, MessageCircle, TrendingUp, Quote } from "lucide-react"
import { ScrollAnimation } from "@/components/scroll-animations"

const values = [
  {
    icon: Users,
    title: "Kapsayıcılık",
    description:
      "Birden fazla alanda çalışmalar yaparak her alanda tecrübeli, herkesin kendine yer bulabildiği bir topluluk oluyoruz.",
    accent: "#22D3EE",
    big: true,
  },
  {
    icon: Handshake,
    title: "İş Birliği",
    description: "Bölgenin önde gelen teknoloji kurumlarıyla güçlü bir network ağı kuruyoruz.",
    accent: "#8B5CF6",
    big: false,
  },
  {
    icon: Lightbulb,
    title: "Yenilikçilik",
    description: "Orijinal fikirlere değer verip, ekiplerimizle onları hayata geçiriyoruz.",
    accent: "#22D3EE",
    big: false,
  },
  {
    icon: Award,
    title: "Profesyonellik",
    description: "İşimizi ciddiyetle yapıyor, güvenilir bir topluluk ortamı sunuyoruz.",
    accent: "#8B5CF6",
    big: false,
  },
  {
    icon: MessageCircle,
    title: "Etkileşim",
    description: "Düzenlediğimiz etkinliklerle yeni insanlara ulaşıp ekibimizi büyütüyoruz.",
    accent: "#22D3EE",
    big: false,
  },
  {
    icon: TrendingUp,
    title: "Gelişim",
    description: "Geleceğin teknolojisi yapay zekâ alanında sürekli çalışmalar yapıyoruz.",
    accent: "#8B5CF6",
    big: false,
  },
] as const

export function MissionValues() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Misyon */}
      <div className="max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-foreground mb-4">Misyonumuz</h2>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Teknoloji meraklılarının birlikte öğrenebileceği, gelişebileceği ve yenilik yapabileceği; ömür boyu sürecek
          anlamlı bağlantılar kurabileceği kapsayıcı ve canlı bir topluluk oluşturmak.
        </p>
      </div>

      {/* Değerler */}
      <div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-foreground mb-3">Değerlerimiz</h2>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mb-6">
          Bu temel ilkeler, yaptığımız her şeyi yönlendirir ve topluluğumuzun kültürünü şekillendirir.
        </p>

        {/* Alıntı — değerler bölümünün girişine bağlı, ayrı bir blok değil */}
        <div className="relative border-l-2 border-[#22D3EE] pl-5 sm:pl-6 py-1 mb-10 sm:mb-12 max-w-2xl overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 -top-10 w-40 h-40 rounded-full opacity-[0.12] -z-10"
            style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }}
          />
          <Quote className="w-6 h-6 text-[#22D3EE]/50 mb-1.5" />
          <p className="text-base sm:text-lg font-medium text-foreground leading-snug">
            En iyi yenilikler, farklı zihinlerin bir araya gelip birbirinin yolculuğunu desteklemesiyle doğar.
          </p>
          <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">AYZEK Topluluğu</p>
        </div>

        {/* Bento grid — bir büyük vurgu kartı + beş küçük kart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-3 sm:gap-4">
          {values.map((value, index) => {
            const Icon = value.icon
            if (value.big) {
              return (
                <ScrollAnimation
                  key={index}
                  animation="fade-up"
                  className="lg:col-span-2 lg:row-span-2"
                >
                  <div className="group relative h-full min-h-[220px] rounded-2xl border border-white/[0.08] bg-[#0D1726] p-6 sm:p-8 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#22D3EE]/30">
                    {/* sağ altta çok hafif bağlantı noktaları */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-6 -bottom-6 w-40 h-40 opacity-[0.15] transition-opacity duration-300 group-hover:opacity-[0.28]"
                      style={{
                        backgroundImage: `radial-gradient(${value.accent} 1.5px, transparent 1.5px)`,
                        backgroundSize: "18px 18px",
                        maskImage: "radial-gradient(circle at bottom right, black, transparent 75%)",
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-16 -bottom-16 w-64 h-64 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-0"
                      style={{ background: `radial-gradient(circle, ${value.accent}, transparent 70%)` }}
                    />
                    <div className="relative grid place-items-center size-12 sm:size-14 rounded-xl border border-white/[0.08]" style={{ color: value.accent }}>
                      <Icon strokeWidth={1.5} className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="relative">
                      <h3 className="font-display font-semibold text-xl sm:text-2xl text-foreground mb-2">{value.title}</h3>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm">{value.description}</p>
                    </div>
                  </div>
                </ScrollAnimation>
              )
            }
            return (
              <ScrollAnimation key={index} animation="fade-up" delay={index * 60}>
                <div className="group h-full min-h-[150px] rounded-2xl border border-white/[0.08] bg-[#0D1726] p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16]">
                  <div className="grid place-items-center size-9 rounded-lg border border-white/[0.08]" style={{ color: value.accent }}>
                    <Icon strokeWidth={1.5} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm sm:text-base text-foreground mb-1">{value.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </ScrollAnimation>
            )
          })}
        </div>
      </div>
    </div>
  )
}
