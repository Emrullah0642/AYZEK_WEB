"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { api, API_BASE } from "@/lib/api"
import Image from "next/image"

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

// Aktif karttan uzaklığa göre 3D coverflow dönüşümü
function cardStyle(offset: number): React.CSSProperties {
  const abs = Math.abs(offset)
  if (abs > 3) {
    return { transform: "translateX(0) scale(0)", opacity: 0, zIndex: 0, pointerEvents: "none" }
  }
  const dir = Math.sign(offset)
  const translateX = offset * 44 // % cinsinden, konteynere göre
  const translateZ = -abs * 120
  const rotateY = -dir * Math.min(abs * 38, 50)
  const scale = 1 - abs * 0.14
  const opacity = 1 - abs * 0.28

  return {
    transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${Math.max(scale, 0.55)})`,
    opacity: Math.max(opacity, 0.15),
    zIndex: 10 - abs,
    pointerEvents: abs === 0 ? "auto" : "auto",
  }
}

export default function EventGallery() {
  const [items, setItems] = useState<GalleryEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // sürükle/kaydır
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const deltaX = useRef(0)

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

  const goTo = (index: number) => {
    if (!items.length) return
    setActiveIndex(Math.max(0, Math.min(index, items.length - 1)))
  }
  const goPrev = () => goTo(activeIndex - 1)
  const goNext = () => goTo(activeIndex + 1)

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if ((e.target as HTMLElement).closest("button")) return
    if (e.button !== 0 && e.pointerType === "mouse") return
    startX.current = e.clientX
    deltaX.current = 0
    setDragging(true)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging) return
    deltaX.current = e.clientX - startX.current
  }
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging) return
    const dx = deltaX.current
    setDragging(false)
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    const THRESH = 50
    if (Math.abs(dx) >= THRESH) {
      if (dx < 0) goNext()
      else goPrev()
    }
    deltaX.current = 0
  }

  // Klavye ile gezinme
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "ArrowLeft") goPrev()
    if (e.key === "ArrowRight") goNext()
  }

  if (loading) return <div className="text-center text-sm sm:text-base py-8">Yükleniyor…</div>
  if (error) return <div className="text-destructive text-center text-sm sm:text-base py-8">Hata: {error}</div>
  if (!items.length) return <div className="text-muted-foreground text-center text-sm sm:text-base py-8">Henüz galeri yok.</div>

  return (
    <div className="space-y-6">
      <div
        className="relative h-[260px] sm:h-[320px] md:h-[380px] overflow-hidden select-none touch-pan-y"
        style={{ perspective: "1400px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-label="Etkinlik galerisi"
      >
        {items.map((photo, index) => {
          const offset = index - activeIndex
          if (Math.abs(offset) > 3) return null
          const isActive = offset === 0
          return (
            <div
              key={photo.id}
              className={[
                "absolute top-0 left-1/2 w-[62vw] sm:w-[280px] md:w-[320px] h-full -ml-[31vw] sm:-ml-[140px] md:-ml-[160px]",
                "transition-[transform,opacity] duration-500 ease-out",
                isActive ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
              style={cardStyle(offset)}
              onClick={() => !isActive && goTo(index)}
            >
              {isActive ? (
                <div className="flip-card-scene w-full h-full" tabIndex={0}>
                  <div className="flip-card-inner rounded-xl shadow-2xl">
                    {/* Ön yüz: fotoğraf */}
                    <div className="flip-card-face flip-card-front rounded-xl overflow-hidden bg-muted ring-1 ring-[#22D3EE]/40">
                      <Image
                        src={normalizeImageUrl(photo.image_url) || "/placeholder.svg"}
                        alt={photo.title}
                        fill
                        sizes="(max-width: 640px) 62vw, 320px"
                        className="object-cover"
                        priority
                        quality={70}
                      />
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                        <Badge variant="secondary" className="bg-background/90 text-foreground text-[10px] sm:text-xs">
                          {photo.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Arka yüz: detaylar — metin uzun olsa da burada yer var */}
                    <div className="flip-card-face flip-card-back rounded-xl border border-[#22D3EE]/30 bg-[#0D1726] p-4 sm:p-5 flex flex-col overflow-y-auto">
                      <Badge variant="secondary" className="self-start bg-[#22D3EE]/10 text-[#22D3EE] border-0 text-[10px] sm:text-xs mb-2">
                        {photo.category}
                      </Badge>
                      <h3 className="font-semibold text-base sm:text-lg text-white mb-2">{photo.title}</h3>
                      <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-3 flex-1">
                        {photo.description}
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs text-white/60 pt-2 border-t border-white/10">
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-muted shadow-2xl ring-1 ring-white/[0.06]">
                  <Image
                    src={normalizeImageUrl(photo.image_url) || "/placeholder.svg"}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 62vw, 320px"
                    className="object-cover"
                    priority={Math.abs(offset) <= 1}
                    quality={70}
                  />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <Badge variant="secondary" className="bg-background/90 text-foreground text-[10px] sm:text-xs">
                      {photo.category}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Ok navigasyonu */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex === 0}
              aria-label="Önceki"
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-background/80 border border-foreground/15 hover:border-primary/50 backdrop-blur-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex === items.length - 1}
              aria-label="Sonraki"
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-background/80 border border-foreground/15 hover:border-primary/50 backdrop-blur-sm transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Sayaç */}
      {items.length > 1 && (
        <div className="text-center text-xs text-muted-foreground">
          {activeIndex + 1} / {items.length}
        </div>
      )}
    </div>
  )
}
