"use client"

import { useEffect, useState } from "react"
import { Trophy, Calendar, MapPin, Maximize2 } from "lucide-react"
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

// İlk HTML'de arşivdeki ödüller görünür; API kayıtları yüklenince yönetim panelindeki sıra kullanılır.
const FALLBACK_AWARDS: Award[] = [
  {
    id: -1,
    title: "Selçuk Ödülleri 2026 — Temsil Ödülü",
    description: "Selçuk Üniversitesi ödül töreninde verilen Temsil Ödülü.",
    image_url: "/public/awards/selcuk-temsil-2026.jpg",
    location: "Konya",
    date: "2026-05-21",
    order_index: 0,
  },
  {
    id: -2,
    title: "TEKNOFEST İstanbul 2025 Ödül Töreni",
    description: "TEKNOFEST İstanbul 2025 ödül töreninden bir kare.",
    image_url: "/public/awards/teknofest-istanbul-2025.jpg",
    location: "İstanbul",
    date: "2025-09-21",
    order_index: 1,
  },
  {
    id: -3,
    title: "TEKNOFEST Adana 2024 Madalyaları",
    description: "TEKNOFEST Adana'da kazanılan madalya ve kupalarımız.",
    image_url: "/public/awards/teknofest-adana-2024.jpg",
    location: "Adana",
    date: null,
    order_index: 2,
  },
  {
    id: -4,
    title: "ÜNİFEST 2026 Birincilik Ödülü",
    description: "ÜNİFEST'te Nitelikli İnsan ve Güçlü Aile kategorisinde birincilik ödülü.",
    image_url: "/public/awards/unifest-2026.jpg",
    location: "Burdur",
    date: "2026-05-07",
    order_index: 3,
  },
  {
    id: -5,
    title: "Aksaray Ar-Ge Proje Pazarı Birincilik Ödülü",
    description: "Aksaray Üniversitesi 2. Ar-Ge Proje Pazarı'nda kazanılan birincilik ödülü.",
    image_url: "/public/awards/aksaray-arge-2025.jpg",
    location: "Aksaray",
    date: "2025-11-13",
    order_index: 4,
  },
  {
    id: -6,
    title: "Girişim Express 2025 Üçüncülük Ödülü",
    description: "Girişim Express Demo Day'de kazanılan üçüncülük ödülü.",
    image_url: "/public/awards/girisim-express-2025.jpg",
    location: "Konya",
    date: "2025-10-15",
    order_index: 5,
  },
]

function fmtTRDate(d: string) {
  const dt = new Date(`${d}T00:00:00`)
  if (Number.isNaN(dt.getTime())) return d
  return dt.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })
}

export function AwardsSection() {
  const [awards, setAwards] = useState<Award[]>(FALLBACK_AWARDS)

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await fetch(`${API_BASE}/awards`)
        if (!response.ok) throw new Error("Ödüller verisi alınamadı.")
        const data: Award[] = await response.json()
        if (data.length) setAwards(data)
      } catch (err) {
        console.error("Ödüller çekilirken hata:", err)
      }
    }
    fetchAwards()
  }, [])

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {awards.map((award, index) => {
        const imageUrl = normalizeImageUrl(award.image_url)
        return (
          <article
            key={award.id}
            className="award-text-in group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D1726] transition-colors hover:border-[#22D3EE]/30"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative h-64 bg-white/[0.03] sm:h-80 lg:h-72">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={award.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-contain"
                  quality={85}
                  priority={index === 0}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Trophy className="h-12 w-12 text-[#22D3EE]/40" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <h3 className="font-display text-lg font-semibold text-foreground">{award.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{award.description}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs text-muted-foreground">
                {award.date && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {fmtTRDate(award.date)}
                  </span>
                )}
                {award.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {award.location}
                  </span>
                )}
              </div>
              {imageUrl && (
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 self-start text-sm text-[#22D3EE] hover:underline"
                >
                  <Maximize2 className="h-4 w-4" />
                  Fotoğrafı tam boy aç
                </a>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
