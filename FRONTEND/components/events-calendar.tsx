"use client"

import { useMemo, useRef, useState } from "react"
// !!! DEĞİŞİKLİK: Backend adresini almak için import
import { API_BASE } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { ScrollAnimation } from "@/components/scroll-animations"
import { TiltCard } from "@/components/tilt-card"

export type Event = {
  id: number
  title: string
  description: string
  type: string
  category?: string
  date: string
  time: string
  duration: string
  location: string
  image: string
  maxAttendees: number
  registrationLink: string
  tags: string[]
}

interface EventsCalendarProps {
  events: Event[]
  loading: boolean
}

// --- YARDIMCI FONKSİYONLAR ---

// Resim URL'sini düzeltir (Başına 94.177.147.50:8000ekler)
const normalizeImageUrl = (v: string | null | undefined) => {
  const s = (v || "").trim()
  if (!s) return ""

  if (s.startsWith("http://") || s.startsWith("https://")) return s

  const path = s.startsWith("/") ? s : `/${s}`

  if (path.startsWith("/public/") || path.startsWith("/uploads/")) {
    return `${API_BASE}${path}`
  }

  // Fallback: Diğer durumlar için varsayılan olarak backend'e yönlendir
  return `${API_BASE}/public/uploads${path}`
}

const parseDate = (value: string) => {
  const d1 = new Date(value)
  if (!Number.isNaN(d1.getTime())) return d1
  const m = String(value).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (m) {
    const day = Number(m[1]); const month = Number(m[2]) - 1; const year = Number(m[3])
    return new Date(year, month, day)
  }
  return null
}

export function EventsCalendar({ events, loading }: EventsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>()
    for (const ev of events) {
      const d = parseDate(ev.date)
      if (!d) continue
      if (d.getMonth() !== currentMonth.getMonth() || d.getFullYear() !== currentMonth.getFullYear()) continue
      const cat = (ev.category ?? ev.type ?? "").toString().trim()
      if (cat) set.add(cat)
    }
    return Array.from(set)
  }, [events, currentMonth])

  const catsRef = useRef<HTMLDivElement | null>(null)
  const scrollCats = (dir: "left" | "right") => {
    const el = catsRef.current
    if (!el) return
    const delta = Math.max(200, el.clientWidth * 0.6)
    el.scrollBy({ left: dir === "left" ? -delta : delta, behavior: "smooth" })
  }

  const filteredEvents = useMemo(() => {
    return events
      .map((e) => ({ e, d: parseDate(e.date) }))
      .filter(({ e, d }) => {
        if (!d) return false
        const sameMonth = d.getMonth() === currentMonth.getMonth()
        const sameYear = d.getFullYear() === currentMonth.getFullYear()
        if (!sameMonth || !sameYear) return false
        if (selectedCategory === "all") return true
        const cat = (e.category ?? e.type ?? "").toString().trim()
        return cat === selectedCategory
      })
      .sort((a, b) => a.d!.getTime() - b.d!.getTime())
      .map(({ e }) => e)
  }, [events, currentMonth, selectedCategory])

  const formatDate = (value: string) => {
    const d = parseDate(value)
    if (!d) return value
    return d.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const formatTime = (value: string) => {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(":", ".")
    }
    const m = String(value).match(/^(\d{1,2}):(\d{2})/)
    if (m) return `${m[1]}.${m[2]}`
    return String(value)
  }

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))

  if (loading) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-display font-semibold mb-2">Etkinlikler Yükleniyor...</h3>
        <p className="text-muted-foreground">Lütfen bekleyin, etkinlik takvimi hazırlanıyor.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 sm:h-9 sm:w-9">
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <h2 className="text-base sm:text-lg md:text-2xl font-display font-bold">
            {currentMonth.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
          </h2>
          <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 sm:h-9 sm:w-9">
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Dinamik Kategori Şeridi */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto">
          {uniqueCategories.length > 10 && (
            <Button variant="outline" size="icon" onClick={() => scrollCats("left")} aria-label="Kategorileri sola kaydır" className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}

          <div ref={catsRef} className="flex-1 md:flex-none max-w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 sm:gap-2 pr-2">
              <Button
                key="all"
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                className="text-[10px] sm:text-xs whitespace-nowrap h-7 sm:h-8 px-2 sm:px-3"
                onClick={() => setSelectedCategory("all")}
              >
                Tümü
              </Button>
              {uniqueCategories.map((c) => (
                <Button
                  key={c}
                  variant={selectedCategory === c ? "default" : "outline"}
                  size="sm"
                  className="text-[10px] sm:text-xs whitespace-nowrap h-7 sm:h-8 px-2 sm:px-3"
                  onClick={() => setSelectedCategory(c)}
                >
                  {c}
                </Button>
              ))}
              {uniqueCategories.length === 0 && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">Bu ay için kategori bulunamadı</span>
              )}
            </div>
          </div>

          {uniqueCategories.length > 10 && (
            <Button variant="outline" size="icon" onClick={() => scrollCats("right")} aria-label="Kategorileri sağa kaydır" className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Liste: Mobilde daha küçük kartlarla yatay kaydırma, md+ grid */}
      <div
        className="
          flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4
          md:mx-0 md:px-0 md:overflow-visible md:snap-none
          md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6
        "
      >
        {filteredEvents.map((event, index) => {
          const categoryLabel = (event.category ?? event.type ?? "").toString().trim() || "Etkinlik"
          return (
            <ScrollAnimation
              key={event.id}
              animation="scale-up"
              delay={(index % 6) * 80}
              className="flex-none w-[72vw] sm:w-[58vw] snap-center md:w-auto"
            >
            <TiltCard maxTilt={5}>
              <Card className="group hover:shadow-[0_0_30px_-8px_rgba(37,99,235,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 bg-card/70 backdrop-blur-sm border border-foreground/10">
                <CardHeader className="relative overflow-hidden p-0">
                  <div className="relative h-32 sm:h-36 md:h-44 lg:h-48">
                    {/* !!! DEĞİŞİKLİK: normalizeImageUrl kullanıldı !!! */}
                    {/* !!! DEĞİŞİKLİK: next/image kullanıldı !!! */}
                    <Image
                      src={normalizeImageUrl(event.image) || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      quality={60}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Kategori rozeti: SAĞ ÜST */}
                    <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4">
                      <Badge className="bg-primary text-primary-foreground border-0 shadow-sm text-[10px] sm:text-xs transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                        {categoryLabel}
                      </Badge>
                    </div>

                    <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 md:bottom-4 md:left-4 text-white transition-colors duration-300 group-hover:text-accent">
                      <div className="text-[10px] sm:text-xs md:text-sm font-medium">{formatDate(event.date)}</div>
                      <div className="text-[9px] sm:text-[11px] md:text-xs opacity-90">{formatTime(event.time)}</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <CardTitle className="font-display text-sm sm:text-base md:text-lg mb-1.5 sm:mb-2 line-clamp-2">
                    {event.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-2 break-words min-h-[3em]">
                    {event.description}
                  </CardDescription>

                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  {!!event.tags?.length && (
                    <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                      {event.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] sm:text-[10px] md:text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full text-xs sm:text-sm h-8 sm:h-9 md:h-10">Detayları Görüntüle</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl break-words pr-4">{event.title}</DialogTitle>
                        <DialogDescription className="text-base break-words whitespace-pre-wrap">{event.description}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* !!! DEĞİŞİKLİK: normalizeImageUrl kullanıldı !!! */}
                        {/* !!! DEĞİŞİKLİK: next/image kullanıldı !!! */}
                        <div className="relative w-full h-64">
                          <Image
                            src={normalizeImageUrl(event.image) || "/placeholder.svg"}
                            alt={event.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 672px"
                            className="object-cover rounded-lg"
                            quality={60}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-medium">{formatDate(event.date)}</div>
                                <div className="text-sm text-muted-foreground">
                                  Tarih: {formatDate(event.date)} • Saat: {formatTime(event.time)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-5 h-5 text-primary" />
                              <span>{event.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              <span>{event.location}</span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {!!event.tags?.length && (
                              <div className="flex flex-wrap gap-1">
                                {event.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {categoryLabel && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Kategori:</span>
                                <Badge className="bg-primary text-primary-foreground border-0">
                                  {categoryLabel}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button asChild className="flex-1">
                            <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Etkinliğe Başvur
                            </a>
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TiltCard>
            </ScrollAnimation>
          )
        })}
      </div>

      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-8 sm:py-10 md:py-12">
          <Calendar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg md:text-xl font-display font-semibold mb-1.5 sm:mb-2">Etkinlik bulunamadı</h3>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base px-2">Farklı bir kategori seçebilir veya başka bir aya bakabilirsin.</p>
        </div>
      )}
    </div>
  )
}