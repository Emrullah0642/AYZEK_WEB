"use client"

import { Heart, Users, Lightbulb, Target, Globe, Zap } from "lucide-react"
import { ScrollAnimation } from "@/components/scroll-animations"

const values = [
  {
    icon: Heart,
    title: "Kapsayıcılık",
    description: "Birden fazla alanda çalışmalar yaparak her alanda tecrübeli bir topluluk oluyoruz.",
  },
  {
    icon: Users,
    title: "İş Birliği",
    description:
      "Bölgenin önde gelen teknoloji kurumlarıyla yaptığımız iş birlikleri sayesinde güçlü bir network ağına ulaşım imkanı sağlıyoruz.",
  },
  {
    icon: Lightbulb,
    title: "Yenilikçilik",
    description:
      "Orijinal fikirlere değer vererek gelişimlerini destekliyor, tecrübeli ekiplerimizle fikirlerin hayata geçmesini sağlıyoruz.",
  },
  {
    icon: Target,
    title: "Profesyonellik",
    description: "İşimizi ciddiyetle yapıyor, güvenilir ve kaliteli bir topluluk ortamı sunuyoruz.",
  },
  {
    icon: Globe,
    title: "Etkileşim",
    description: "Düzenlediğimiz etkinliklerle yeni insanlara ulaşarak ekibimizi büyütüyoruz.",
  },
  {
    icon: Zap,
    title: "Gelişim",
    description: "Algoritma ve yapay zeka topluluğu olarak geleceğin teknolojisinde çalışmalar yapıyoruz.",
  },
] as const

export function MissionValues() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Misyon */}
      <div className="max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-foreground mb-4">Misyonumuz</h2>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-5">
          Teknoloji meraklılarının birlikte öğrenebileceği, gelişebileceği ve yenilik yapabileceği; ömür boyu sürecek
          anlamlı bağlantılar kurabileceği kapsayıcı ve canlı bir topluluk oluşturmak.
        </p>
        <div className="border-l-2 border-primary pl-5">
          <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
            "En iyi yeniliklerin, farklı zihinlerin bir araya gelerek fikir alışverişinde bulunması ve birbirinin
            yolculuğunu desteklemesiyle gerçekleştiğine inanıyoruz."
          </p>
          <p className="text-sm text-muted-foreground mt-2">AYZEK Topluluğu</p>
        </div>
      </div>

      {/* Değerler */}
      <div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-foreground mb-3">Değerlerimiz</h2>
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
          Bu temel ilkeler, yaptığımız her şeyi yönlendirir ve topluluğumuzun kültürünü şekillendirir.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <ScrollAnimation key={index} animation="fade-up" delay={index * 60}>
                <div className="flip-card h-40 sm:h-44" tabIndex={0}>
                  <div className="flip-card-inner">
                    {/* Ön yüz — sadece başlık, site vurgu rengi (stat sayılarıyla aynı) */}
                    <div className="flip-card-front bg-primary flex flex-col items-center justify-center gap-3 text-center px-4">
                      <Icon className="icon-glow w-6 h-6 text-primary-foreground/80" />
                      <h3 className="font-display font-semibold text-base sm:text-lg text-primary-foreground">{value.title}</h3>
                    </div>
                    {/* Arka yüz — açıklama metni */}
                    <div className="flip-card-back bg-primary flex flex-col justify-center gap-1.5 px-5 py-4">
                      <h3 className="font-display font-semibold text-sm text-primary-foreground/80">{value.title}</h3>
                      <p className="text-primary-foreground text-xs sm:text-sm leading-relaxed">{value.description}</p>
                    </div>
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
