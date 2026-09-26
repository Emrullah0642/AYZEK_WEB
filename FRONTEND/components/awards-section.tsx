"use client"

import { useEffect, useState } from "react"
import { Trophy, Calendar, MapPin, ArrowUpRight } from "lucide-react"
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

  const [selectedId, setSelectedId] = useState<number | null>(null)

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

  const selected = awards.find((award) => award.id === selectedId) ?? awards[0]
  const imageUrl = normalizeImageUrl(selected?.image_url)

  if (!selected) return null

  return (
    <div className="awards-showcase">
      <div className="award-feature" id="award-detail" role="region" aria-label="Seçili ödül" aria-live="polite">
        <div className="award-feature-image">
          {imageUrl ? (
            <Image key={imageUrl} src={imageUrl} alt={selected.title} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-contain" quality={85} />
          ) : <Trophy className="h-16 w-16 text-amber-200/50" />}
          <span className="award-feature-badge"><Trophy size={14} /> AYZEK BAŞARILARI</span>
        </div>
        <div className="award-feature-copy">
          <div className="award-feature-meta">
            {selected.date && <span><Calendar size={13} />{fmtTRDate(selected.date)}</span>}
            {selected.location && <span><MapPin size={13} />{selected.location}</span>}
          </div>
          <h3>{selected.title}</h3>
          <p>{selected.description}</p>
          {imageUrl && <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="story-text-link">Fotoğrafı incele <ArrowUpRight size={16} /></a>}
        </div>
      </div>
      <div className="award-index">
        <p className="award-index-label">EMEĞİN İZLERİ <span>{String(awards.length).padStart(2, "0")} BAŞARI</span></p>
        {awards.map((award, index) => (
          <button type="button" key={award.id} className="award-index-item" aria-pressed={award.id === selected.id} aria-controls="award-detail" onClick={() => setSelectedId(award.id)}>
            <span className="award-index-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="award-index-text"><span>{award.title}</span><small>{[award.location, award.date?.slice(0, 4)].filter(Boolean).join(" · ")}</small></span>
            <ArrowUpRight size={19} aria-hidden="true" />
          </button>
        ))}
        <p className="award-index-note">Her başarının arkasında birlikte çalışan bir ekip var.</p>
      </div>
    </div>
  )
}
