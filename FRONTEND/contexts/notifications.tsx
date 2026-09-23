// contexts/notifications.tsx
"use client"
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import type { Announcement, AnnouncementKind } from "@/lib/announcements"

type Ctx = {
  items: Announcement[]
  unread: number
  lastAddedAt: number
  push: (a: Omit<Announcement, "id" | "createdAt" | "read"> & { id?: string }) => void
  markRead: (id: string) => void
  markAllRead: () => void
  clear: () => void
}

const NotificationsCtx = createContext<Ctx | null>(null)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  // Seed verileri: kind olmadan tanımlayıp, default kind ile dolduruyoruz
  const seedLite: Array<Omit<Announcement, "kind">> = [
    {
      id: "seed-1",
      title: "Site Bakımı",
      message: "Planlı bakım: 27 Eylül 2025 22:00'de başlayacak. Kısa süreli kesinti olabilir.",
      createdAt: Date.now(),
      read: false,
    },
    {
      id: "seed-2",
      title: "Yedekleme Tamamlandı",
      message: "Veritabanı yedeklemesi başarıyla tamamlandı.",
      createdAt: Date.now() - 1000 * 60 * 60,
      read: false,
    },
    {
      id: "seed-3",
      title: "Disk Alanı Düşük",
      message: "Sunucuda disk alanı %85'e ulaştı. Temizlik önerilir.",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      read: true,
    },
    {
      id: "seed-4",
      title: "Hata: Ödeme Servisi",
      message: "Ödeme servisine erişilemiyor. İnceleniyor.",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      read: false,
      href: "/admin/logs",
    },
    {
      id: "seed-5",
      title: "Yeni Etkinlik Eklendi",
      message: "Hackathon 2025 etkinliği takvime eklendi. Katılmak için tıkla.",
      createdAt: Date.now() - 1000 * 60 * 10,
      read: false,
      href: "/#etkinlikler",
    },
  ]

  // Enum/union fark etmeksizin güvenli default kind seçimi
  const DEFAULT_KIND: AnnouncementKind = "info" as AnnouncementKind

  const [items, setItems] = useState<Announcement[]>(seedLite.map((s) => ({ kind: DEFAULT_KIND, ...s })))
  const [lastAddedAt, setLastAddedAt] = useState(0)
  const booted = useRef(false)

  // persist
  useEffect(() => {
    if (!booted.current) {
      const raw = typeof window !== "undefined" ? localStorage.getItem("ayzek.notifications") : null
      if (raw) setItems(JSON.parse(raw))
      booted.current = true
    }
  }, [])
  useEffect(() => {
    if (booted.current) localStorage.setItem("ayzek.notifications", JSON.stringify(items))
  }, [items])

  const push: Ctx["push"] = (a) => {
    const created = {
      id: a.id ?? crypto.randomUUID(),
      createdAt: Date.now(),
      read: false,
      ...a,
    }
    setItems((prev) => [created, ...prev].slice(0, 200))
    setLastAddedAt(Date.now())
  }
  const markRead = (id: string) => setItems((xs) => xs.map(x => x.id === id ? { ...x, read: true } : x))
  const markAllRead = () => setItems((xs) => xs.map(x => ({ ...x, read: true })))
  const clear = () => setItems([])

  const unread = useMemo(() => items.filter(i => !i.read).length, [items])

  return (
    <NotificationsCtx.Provider value={{ items, unread, lastAddedAt, push, markRead, markAllRead, clear }}>
      {children}
    </NotificationsCtx.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsCtx)
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider")
  return ctx
}