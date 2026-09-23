"use client"

import { useState, useEffect } from "react"
import { Trophy } from "lucide-react"
import Image from "next/image"
import { ScrollAnimation } from "@/components/scroll-animations"
import { API_BASE } from "@/lib/api"
import { normalizeImageUrl } from "@/lib/normalize-image-url"

type Award = {
  id: number
  title: string
  description: string
  image_url: string | null
  year: number | null
  order_index: number | null
}

/** "Ödüllerimiz" — /awards endpoint'inden topluluğun aldığı ödül ve başarılar. */
export function AwardsSection() {
  const [awards, setAwards] = useState<Award[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {awards.map((award, i) => (
        <ScrollAnimation key={award.id} animation="fade-up" delay={(i % 9) * 60}>
          <div className="group h-full rounded-2xl border border-white/[0.08] bg-[#0D1726] p-5 sm:p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-[#22D3EE]/30">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/[0.08] flex-shrink-0 bg-white/[0.03] flex items-center justify-center">
                {award.image_url ? (
                  <Image
                    src={normalizeImageUrl(award.image_url) || "/placeholder.svg"}
                    alt={award.title}
                    fill
                    sizes="48px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    quality={60}
                  />
                ) : (
                  <Trophy className="w-5 h-5 text-[#22D3EE]" />
                )}
              </div>
              {award.year && (
                <span className="text-[11px] font-route text-[#22D3EE] mt-1 flex-shrink-0">{award.year}</span>
              )}
            </div>
            <h4 className="font-display font-semibold text-base text-foreground">{award.title}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed mt-2">{award.description}</p>
          </div>
        </ScrollAnimation>
      ))}
    </div>
  )
}
