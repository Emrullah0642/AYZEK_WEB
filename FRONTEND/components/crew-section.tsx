"use client"

import { useState, useEffect, useRef } from "react"
import { Github, Linkedin } from "lucide-react"
import Image from "next/image"
import { ScrollAnimation } from "@/components/scroll-animations"
import { API_BASE } from "@/lib/api"
import { normalizeImageUrl } from "@/lib/normalize-image-url"

const CATEGORIES = [
  { key: "Başkan ve Yardımcılar", title: "Başkan ve Yardımcılar" },
  { key: "Sosyal Medya ve Tasarım", title: "Sosyal Medya ve Tasarım" },
  { key: "Etkinlik ve Organizasyon", title: "Etkinlik ve Organizasyon" },
  { key: "Eğitim ve Proje", title: "Eğitim ve Proje" },
  { key: "Sponsorluk ve Reklam", title: "Sponsorluk ve Reklam" },
] as const

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
  const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({})
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const fetchCrewMembers = async () => {
      try {
        const response = await fetch(`${API_BASE}/crew/`)
        if (!response.ok) throw new Error("Ekip üyeleri verisi alınamadı.")
        const data: GroupedCrewMembers = await response.json()
        setGroupedMembers(data)

        const initialIndexes: Record<string, number> = {}
        Object.keys(data).forEach((key) => {
          initialIndexes[key] = 0
        })
        setCurrentIndexes(initialIndexes)
      } catch (err: any) {
        setError(err.message)
        console.error("Ekip üyeleri çekilirken hata:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCrewMembers()
  }, [])

  const scrollToIndex = (categoryKey: string, index: number) => {
    const container = scrollRefs.current[categoryKey]
    if (container) {
      const cardWidth = container.scrollWidth / (groupedMembers[categoryKey]?.length || 1)
      container.scrollTo({ left: cardWidth * index, behavior: "smooth" })
    }
  }

  useEffect(() => {
    const cleanups: Array<() => void> = []
    Object.keys(groupedMembers).forEach((key) => {
      const container = scrollRefs.current[key]
      if (!container) return
      const handleScroll = () => {
        const cardWidth = container.scrollWidth / (groupedMembers[key]?.length || 1)
        const newIndex = Math.round(container.scrollLeft / cardWidth)
        setCurrentIndexes((prev) => ({ ...prev, [key]: newIndex }))
      }
      container.addEventListener("scroll", handleScroll)
      cleanups.push(() => container.removeEventListener("scroll", handleScroll))
    })
    return () => cleanups.forEach((fn) => fn())
  }, [groupedMembers])

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

  const hasAnyMembers = CATEGORIES.some(({ key }) => (groupedMembers[key]?.length || 0) > 0)
  if (!hasAnyMembers) {
    return <p className="text-center text-sm text-muted-foreground py-16">Henüz ekip üyesi eklenmemiş.</p>
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {CATEGORIES.map(({ key, title }) => {
        const members = groupedMembers[key] || []
        if (members.length === 0) return null

        return (
          <div key={key}>
            <h3 className="font-route text-[11px] text-ayzek-gradient mb-4">/{title}</h3>

            <div
              ref={(el) => {
                scrollRefs.current[key] = el
              }}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible md:snap-none md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {members.map((member, i) => (
                <ScrollAnimation
                  key={member.id}
                  animation="fade-up"
                  delay={(i % 8) * 60}
                  className="flex-none w-[62vw] sm:w-[46vw] snap-center md:w-auto"
                >
                  <div className="group h-full rounded-2xl border border-white/[0.08] bg-[#0D1726] p-4 sm:p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#22D3EE]/30">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 rounded-full overflow-hidden ring-1 ring-white/[0.08]">
                      <Image
                        src={normalizeImageUrl(member.photo_url) || "/placeholder.svg"}
                        alt={member.name}
                        fill
                        sizes="80px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        quality={60}
                      />
                    </div>
                    <h4 className="font-display font-semibold text-sm sm:text-base text-foreground">{member.name}</h4>
                    <p className="text-[#22D3EE] text-xs sm:text-sm font-medium mt-0.5">{member.role}</p>
                    {member.description && (
                      <p className="text-muted-foreground text-xs leading-snug mt-2 line-clamp-3">{member.description}</p>
                    )}
                    {(member.github_url || member.linkedin_url) && (
                      <div className="flex items-center gap-3 mt-3">
                        {member.github_url && (
                          <a
                            href={member.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className="text-muted-foreground hover:text-[#67E8F9] transition-colors"
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
                            className="text-muted-foreground hover:text-[#67E8F9] transition-colors"
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

            {members.length > 1 && (
              <div className="flex justify-center gap-2 mt-3 md:hidden">
                {members.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => scrollToIndex(key, index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === (currentIndexes[key] || 0) ? "bg-[#22D3EE] scale-125" : "bg-muted-foreground/30"
                    }`}
                    aria-label={`${index + 1}. üyeye git`}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
