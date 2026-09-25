"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
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

// Kartlar yer değiştirirken 3D geçişi koru; fotoğrafların tamamı kartın içinde görünür.
function cardStyle(offset: number): React.CSSProperties {
  const distance = Math.abs(offset)
  return {
    transform: `translateX(${-50 + offset * 62}%) translateZ(${-distance * 110}px) rotateY(${-Math.sign(offset) * Math.min(distance * 28, 48)}deg) scale(${Math.max(1 - distance * 0.12, 0.7)})`,
    opacity: Math.max(1 - distance * 0.28, 0.18),
    zIndex: 10 - distance,
  }
}

export default function EventGallery() {
  const [items, setItems] = useState<GalleryEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Sürükleme başlangıcını ve yatay hareketi takip et.
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
    if (e.pointerType === "mouse" && e.button !== 0) return
    startX.current = e.clientX
    deltaX.current = 0
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    deltaX.current = e.clientX - startX.current
  }
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (Math.abs(deltaX.current) >= 50) {
      if (deltaX.current < 0) goNext()
      else goPrev()
    }
    deltaX.current = 0
  }
  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    deltaX.current = 0
  }
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      goPrev()
    }
    if (e.key === "ArrowRight") {
      e.preventDefault()
      goNext()
    }
  }

  if (loading) return <div className="text-center text-sm sm:text-base py-8">Yükleniyor…</div>
  if (error) return <div className="text-destructive text-center text-sm sm:text-base py-8">Hata: {error}</div>
  if (!items.length) return <div className="text-muted-foreground text-center text-sm sm:text-base py-8">Henüz galeri yok.</div>

  const activeItem = items[activeIndex]
  const imageUrl = normalizeImageUrl(activeItem.image_url) || "/placeholder.svg"

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div
        className="relative h-[300px] w-full overflow-hidden rounded-2xl bg-[#080f1d] sm:h-[440px] lg:h-[560px] touch-pan-y select-none"
        style={{ perspective: "1400px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-label={`${activeItem.title} fotoğrafı; ok tuşlarıyla diğer etkinliklere geçin`}
      >
        {items.map((photo, index) => {
          const offset = index - activeIndex
          if (Math.abs(offset) > 2) return null
          const isActive = offset === 0
          return (
            <div
              key={photo.id}
              className={`absolute left-1/2 top-0 h-full w-[92vw] sm:w-[82vw] lg:w-[min(76vw,800px)] cursor-pointer overflow-hidden rounded-2xl border border-[#22D3EE]/20 bg-[#0D1726] shadow-2xl transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none ${isActive ? "ring-1 ring-[#22D3EE]/40" : "hover:border-[#22D3EE]/50"}`}
              style={cardStyle(offset)}
              onClick={() => !isActive && goTo(index)}
              aria-hidden={!isActive}
            >
              <Image
                src={normalizeImageUrl(photo.image_url) || "/placeholder.svg"}
                alt={photo.title}
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 82vw, 800px"
                className="object-contain"
                priority={Math.abs(offset) <= 1}
                quality={85}
                draggable={false}
              />
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={activeIndex === 0}
          aria-label="Önceki fotoğraf"
          className="inline-flex h-10 items-center gap-1 rounded-full border border-foreground/15 px-3 text-sm transition hover:border-primary/50 disabled:opacity-40 sm:px-4"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Önceki</span>
        </button>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {activeIndex + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={activeIndex === items.length - 1}
          aria-label="Sonraki fotoğraf"
          className="inline-flex h-10 items-center gap-1 rounded-full border border-foreground/15 px-3 text-sm transition hover:border-primary/50 disabled:opacity-40 sm:px-4"
        >
          <span className="hidden sm:inline">Sonraki</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-xl border border-foreground/10 bg-background/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="secondary">{activeItem.category}</Badge>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Maximize2 className="h-4 w-4" />
            Fotoğrafı tam boy aç
          </a>
        </div>
        <h3 className="mt-3 text-lg font-semibold sm:text-xl">{activeItem.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{activeItem.description}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {fmtTRDate(activeItem.date)}
          </span>
          {typeof activeItem.participants === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {activeItem.participants} kişi
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {activeItem.location}
          </span>
        </div>
      </div>
    </div>
  )
}
