"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin } from "lucide-react"
import { api, API_BASE } from "@/lib/api"
import Image from "next/image"
import { ScrollAnimation } from "@/components/scroll-animations"

// --- YENİ EKLENEN KISIMLAR ---


const normalizeImageUrl = (v: string | null | undefined) => {
  const s = (v || "").trim()
  if (!s) return ""

  // 1. R2 veya harici link kontrolü
  if (s.startsWith("http://") || s.startsWith("https://")) return s

  // 2. Başında slash yoksa ekle
  const path = s.startsWith("/") ? s : `/${s}`

  // 3. Backend'deki dosya kontrolü
  if (path.startsWith("/public/") || path.startsWith("/uploads/")) {
    return `${API_BASE}${path}`
  }

  // 4. Fallback: Diğer durumlar için varsayılan olarak backend'e yönlendir (eski formatlar için)
  return `${API_BASE}/public/uploads${path}`
}
// -----------------------------

type GalleryEvent = {
  id: number
  category: string
  image_url: string
  title: string
  description: string
  date: string
  location: string
  participants?: number | null
}

function fmtTRDate(d: string) {
  const dt = new Date(`${d}T00:00:00`)
  if (Number.isNaN(dt.getTime())) return d
  return dt.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export default function EventGallery() {
  const [items, setItems] = useState<GalleryEvent[]>([])
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
      ; (async () => {
        setLoading(true)
        try {
          const res = await api.get<GalleryEvent[]>("/api/gallery-events")
          if (!alive) return
          const data = [...res.data].sort((a, b) => (a.date < b.date ? 1 : -1))
          setItems(data)
        } catch (e: any) {
          if (alive) setError(e.message || "İstek hatası")
        } finally {
          if (alive) setLoading(false)
        }
      })()
    return () => {
      alive = false
    }
  }, [])

  // Scroll pozisyonunu takip et
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || items.length === 0) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const itemWidth = container.scrollWidth / items.length
      const index = Math.round(scrollLeft / itemWidth)
      setCurrentIndex(Math.max(0, Math.min(index, items.length - 1)))
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [items.length])

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current
    if (!container) return
    const itemWidth = container.scrollWidth / items.length
    container.scrollTo({ left: itemWidth * index, behavior: "smooth" })
  }

  if (loading) return <div className="text-center text-sm sm:text-base py-8">Yükleniyor…</div>
  if (error) return <div className="text-destructive text-center text-sm sm:text-base py-8">Hata: {error}</div>
  if (!items.length) return <div className="text-muted-foreground text-center text-sm sm:text-base py-8">Henüz galeri yok.</div>

  return (
    <div className="space-y-4">
      <div
        ref={scrollContainerRef}
        className="
          flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4
          md:mx-0 md:px-0 md:overflow-visible md:snap-none
          md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6
          scrollbar-hide
        "
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((photo, index) => (
          <ScrollAnimation
            key={photo.id}
            animation="scale-up"
            delay={(index % 6) * 80}
            className="flex-none w-[85vw] sm:w-[70vw] snap-center md:w-auto"
          >
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => setHoveredId(photo.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-muted">
              {/* next/image ile optimize edilmiş resim */}
              <Image
                src={normalizeImageUrl(photo.image_url) || "/placeholder.svg"}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority={index < 3}
                quality={60}
              />

              {/* Kategori rozeti */}
              <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4">
                <Badge variant="secondary" className="bg-background/90 text-foreground text-[10px] sm:text-xs">
                  {photo.category}
                </Badge>
              </div>

              {/* Hover paneli: desktopta görünür, mobilde hover olmadığı için gizli kalır */}
              {hoveredId === photo.id && (
                <div className="absolute inset-0 flex items-end p-0 animate-fade-in">
                  <Card
                    className="
                    w-full
                    h-[70%] md:h-[75%]
                    bg-black/85
                    border border-white/10
                    pointer-events-auto
                    rounded-t-none md:rounded-t-lg
                  "
                  >
                    <CardContent className="p-4 sm:p-5 md:p-6 h-full overflow-y-auto">
                      <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-white">
                        {photo.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-white/90 mb-3 sm:mb-4 line-clamp-4 sm:line-clamp-5 md:line-clamp-8">
                        {photo.description}
                      </p>

                      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs text-white/80">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>{fmtTRDate(photo.date)}</span>
                        </div>

                        {typeof photo.participants === "number" && (
                          <div className="flex items-center gap-1">
                            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span>{photo.participants} kişi</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          <span>{photo.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
          </ScrollAnimation>
        ))}
      </div>

      {/* Nokta navigasyonu - sadece mobilde göster */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2 md:hidden">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${index === currentIndex ? "bg-primary scale-125" : "bg-muted-foreground/40"}
              `}
              aria-label={`${index + 1}. etkinliğe git`}
            />
          ))}
        </div>
      )}
    </div>
  )
}