"use client"

import { useState, useEffect } from "react"
import { Trophy, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { API_BASE } from "@/lib/api"
import { normalizeImageUrl } from "@/lib/normalize-image-url"

type Award = {
  id: number
  title: string
  description: string
  image_url: string | null
  location: string | null
  date: string | null
  order_index: number | null
}

function fmtTRDate(d: string) {
  const dt = new Date(`${d}T00:00:00`)
  if (Number.isNaN(dt.getTime())) return d
  return dt.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })
}

/** "Ödüllerimiz" — /awards endpoint'inden topluluğun aldığı ödül ve başarılar. Tam genişlik, tek kart, yatay slayt geçişli. */
export function AwardsSection() {
  const [awards, setAwards] = useState<Award[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await fetch(`${API_BASE}/awards`)
        if (!response.ok) throw new Error("Ödüller verisi alınamadı.")
        const data: Award[] = await response.json()
        setAwards(data)
      } catch (err: any) {
        setError(err.message)
        console.error("Ödüller çekilirken hata:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAwards()
  }, [])

  const goTo = (i: number) => setActiveIndex(Math.max(0, Math.min(i, awards.length - 1)))
  const goPrev = () => goTo(activeIndex - 1)
  const goNext = () => goTo(activeIndex + 1)

  if (isLoading) {
    return <p className="text-center text-sm text-muted-foreground py-16">Ödüller yükleniyor...</p>
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 py-16 text-center px-4">
        <p className="text-muted-foreground text-sm">Ödül bilgisi şu anda yüklenemedi.</p>
        <p className="text-muted-foreground/60 text-xs">Birazdan tekrar dene.</p>
      </div>
    )
  }
  if (awards.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-16">Henüz ödül eklenmemiş.</p>
  }

  const active = awards[activeIndex]

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl">
        <div key={active.id} className="award-text-in">
          <div className="flex flex-row rounded-2xl border border-white/[0.08] bg-[#0D1726] overflow-hidden min-h-[180px] sm:min-h-[320px]">
            <div className="relative w-36 sm:w-64 md:w-80 h-auto flex-shrink-0 bg-white/[0.03] flex items-center justify-center overflow-hidden">
              {active.image_url ? (
                <Image
                  key={active.id}
                  src={normalizeImageUrl(active.image_url) || "/placeholder.svg"}
                  alt={active.title}
                  fill
                  sizes="(max-width: 640px) 40vw, 320px"
                  className="object-cover award-photo-kenburns"
                  quality={80}
                  priority
                />
              ) : (
                <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-[#22D3EE]/40" />
              )}
            </div>

            <div className="flex-1 min-w-0 p-4 sm:p-7 md:p-8 flex flex-col justify-center">
              <h4 className="award-text-in font-display font-semibold text-base sm:text-xl text-foreground" style={{ animationDelay: "80ms" }}>
                {active.title}
              </h4>
              <p
                className="award-text-in text-muted-foreground text-sm sm:text-base leading-relaxed mt-2"
                style={{ animationDelay: "220ms" }}
              >
                {active.description}
              </p>

              {(active.date || active.location) && (
                <div
                  className="award-text-in flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10"
                  style={{ animationDelay: "360ms" }}
                >
                  {active.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{fmtTRDate(active.date)}</span>
                    </div>
                  )}
                  {active.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{active.location}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {awards.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex === 0}
              aria-label="Önceki"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-background/80 border border-foreground/15 hover:border-[#22D3EE]/50 backdrop-blur-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex === awards.length - 1}
              aria-label="Sonraki"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-background/80 border border-foreground/15 hover:border-[#22D3EE]/50 backdrop-blur-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {awards.length > 1 && (
        <div className="flex justify-center gap-2">
          {awards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className="p-2.5 -m-2.5 flex items-center"
              aria-label={`${i + 1}. ödüle git`}
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 block ${
                  i === activeIndex ? "w-6 bg-[#22D3EE]" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
