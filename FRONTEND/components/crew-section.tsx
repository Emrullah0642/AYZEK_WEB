"use client"

import { useState, useEffect } from "react"
import { Github, Linkedin } from "lucide-react"
import Image from "next/image"
import { ScrollAnimation } from "@/components/scroll-animations"
import { API_BASE } from "@/lib/api"
import { normalizeImageUrl } from "@/lib/normalize-image-url"

// Bilinen kategoriler bu sırayla önde gösterilir; admin panelinden serbestçe
// yazılan yeni/özel kategoriler de (bu listede olmasalar bile) sonrasında gösterilir.
const PREFERRED_CATEGORY_ORDER = [
  "Başkan ve Yardımcılar",
  "Sosyal Medya ve Tasarım",
  "Etkinlik ve Organizasyon",
  "Eğitim ve Proje",
  "Sponsorluk ve Reklam",
]

type CrewMember = {
  id: number
  name: string
  role: string
  description: string | null
  photo_url: string | null
  linkedin_url: string | null
  github_url: string | null
  category: string
  order_index: number
}

type GroupedCrewMembers = Record<string, CrewMember[]>

/** "Bizim Ekibimiz" — /crew endpoint'inden kategoriye göre gruplanmış gerçek ekip üyeleri. */
export function CrewSection() {
  const [groupedMembers, setGroupedMembers] = useState<GroupedCrewMembers>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCrewMembers = async () => {
      try {
        const response = await fetch(`${API_BASE}/crew/`)
        if (!response.ok) throw new Error("Ekip üyeleri verisi alınamadı.")
        const data: GroupedCrewMembers = await response.json()
        setGroupedMembers(data)
      } catch (err: any) {
        setError(err.message)
        console.error("Ekip üyeleri çekilirken hata:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCrewMembers()
  }, [])

  if (isLoading) {
    return <p className="text-center text-sm text-muted-foreground py-16">Ekibimiz yükleniyor...</p>
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 py-16 text-center px-4">
        <p className="text-muted-foreground text-sm">Ekip bilgisi şu anda yüklenemedi.</p>
        <p className="text-muted-foreground/60 text-xs">Birazdan tekrar dene.</p>
      </div>
    )
  }

  const categoryKeys = [
    ...PREFERRED_CATEGORY_ORDER.filter((key) => (groupedMembers[key]?.length || 0) > 0),
    ...Object.keys(groupedMembers).filter(
      (key) => !PREFERRED_CATEGORY_ORDER.includes(key) && (groupedMembers[key]?.length || 0) > 0
    ),
  ]

  if (categoryKeys.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-16">Henüz ekip üyesi eklenmemiş.</p>
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {categoryKeys.map((key) => {
        const members = groupedMembers[key] || []

        return (
          <div key={key}>
            <h3 className="font-display font-semibold text-base sm:text-lg text-foreground mb-4">{key}</h3>

            <div className="flex flex-col items-center gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:items-stretch">
              {members.map((member, i) => (
                <ScrollAnimation
                  key={member.id}
                  animation="fade-up"
                  delay={(i % 8) * 60}
                  className="w-full max-w-xs md:w-auto md:max-w-none"
                >
                  <div className="group h-full rounded-2xl border border-white/[0.08] bg-[#0D1726] p-5 sm:p-6 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#22D3EE]/30">
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden ring-2 ring-[#22D3EE]/30">
                      <Image
                        src={normalizeImageUrl(member.photo_url) || "/placeholder.svg"}
                        alt={member.name}
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        quality={75}
                      />
                    </div>
                    <h4 className="font-display font-semibold text-base sm:text-lg text-foreground">{member.name}</h4>
                    <p className="text-[#22D3EE] text-sm sm:text-base font-medium mt-0.5">{member.role}</p>
                    {member.description && (
                      <p className="text-muted-foreground text-sm leading-snug mt-2 line-clamp-3">{member.description}</p>
                    )}
                    {(member.github_url || member.linkedin_url) && (
                      <div className="flex items-center gap-1 mt-3 -mb-2">
                        {member.github_url && (
                          <a
                            href={member.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="p-2.5 text-muted-foreground hover:text-[#67E8F9] transition-colors"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {member.linkedin_url && (
                          <a
                            href={member.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="p-2.5 text-muted-foreground hover:text-[#67E8F9] transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
