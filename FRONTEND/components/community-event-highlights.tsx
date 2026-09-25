"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowRight, CalendarDays, MapPin } from "lucide-react"
import { API_BASE } from "@/lib/api"
import { normalizeImageUrl } from "@/lib/normalize-image-url"

type GalleryEvent = {
  id: number
  title: string
  description: string
  category: string
  date: string
  location: string
  image_url: string
}

// Galeri API'si geç yüklenirse de gerçekleşen etkinlikler ilk HTML'de görünür.
const FALLBACK_EVENTS: GalleryEvent[] = [
  {
    id: -1,
    title: "TEKNOFEST 2026",
    description: "Savaşan İHA ve Lojistik Optimizasyon yarışmalarında takımlarımızla yer aldık.",
    category: "Yarışma",
    date: "2026-09-03",
    location: "TEKNOFEST 2026",
    image_url: "/public/gallery/seed-12.jpg",
  },
  {
    id: -2,
    title: "TeknoSEL Festivali",
    description: "Selçuk Üniversitesi standında ekiplerimizin projelerini ziyaretçilere tanıttık.",
    category: "Festival",
    date: "2026-05-15",
    location: "Konya",
    image_url: "/public/gallery/seed-07.jpg",
  },
  {
    id: -3,
    title: "Redis Eğitimi",
    description: "Redis'in temellerini ve gerçek dünya kullanım senaryolarını uygulamalı olarak ele aldık.",
    category: "Workshop",
    date: "2026-05-11",
    location: "Selçuk Üniversitesi",
    image_url: "/public/gallery/seed-02.jpg",
  },
  {
    id: -4,
    title: "ÜNİFEST Ödül Töreni",
    description: "ÜNİFEST kapsamında düzenlenen ödül törenine katıldık ve projelerimizle ödül aldık.",
    category: "Yarışma",
    date: "2026-05-07",
    location: "Burdur Mehmet Akif Ersoy Üniversitesi",
    image_url: "/public/gallery/seed-00.jpg",
  },
  {
    id: -5,
    title: "Sistem Tasarımı ve Redis Eğitimi",
    description: "Sistem tasarımı ve Redis üzerine uygulamalı eğitim.",
    category: "Workshop",
    date: "2026-04-27",
    location: "Selçuk Üniversitesi",
    image_url: "/public/gallery/seed-17.jpg",
  },
  {
    id: -6,
    title: "Yapay Zeka ve Veri Bilimi Eğitimi",
    description: "Yapay zeka, veri hazırlama süreci ve kullanım alanları üzerine eğitim.",
    category: "Workshop",
    date: "2026-04-19",
    location: "Selçuk Üniversitesi",
    image_url: "/public/gallery/seed-09.jpg",
  },
]

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
}

export function CommunityEventHighlights() {
  const [events, setEvents] = useState<GalleryEvent[]>(FALLBACK_EVENTS)
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadEvents() {
      try {
        const response = await fetch(`${API_BASE}/api/gallery-events`, { signal: controller.signal })
        if (!response.ok) throw new Error("Etkinlik arşivi alınamadı.")
        const data: GalleryEvent[] = await response.json()
        const completed = data
          .filter((event) => event.category !== "Ödül")
          .sort((a, b) => b.date.localeCompare(a.date))
        if (completed.length) {
          setEvents(completed.slice(0, 6))
          setTotal(data.length)
        }
      } catch (error) {
        if (!controller.signal.aborted) console.error("Etkinlik arşivi yüklenemedi:", error)
      }
    }

    loadEvents()
    return () => controller.abort()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">Gerçekleşen etkinlikler</h3>
          <p className="mt-1 text-sm text-muted-foreground">En son buluşmalarımızdan seçili anlar</p>
        </div>
        {total !== null && <span className="text-sm text-[#67E8F9]">Arşivde {total} etkinlik</span>}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const imageUrl = normalizeImageUrl(event.image_url)
          return (
            <article key={event.id} className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D1726] transition-colors hover:border-[#22D3EE]/30">
              <div className="relative h-56 bg-[#080f1d] sm:h-64">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    quality={85}
                    priority={event.id === events[0]?.id}
                  />
                )}
              </div>
              <div className="space-y-3 p-5">
                <span className="inline-block rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/10 px-3 py-1 text-xs font-medium text-[#67E8F9]">{event.category}</span>
                <h4 className="font-display text-lg font-semibold text-foreground">{event.title}</h4>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(event.date)}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <a href="#etkinlik-galerisi" className="inline-flex items-center gap-2 text-sm font-medium text-[#67E8F9] hover:underline">
        Tüm etkinlik fotoğraflarını gör <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  )
}
