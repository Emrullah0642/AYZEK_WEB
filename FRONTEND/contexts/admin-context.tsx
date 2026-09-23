"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { api } from "@/lib/api"

interface ContentItem {
  id: string
  type: "banner" | "timeline" | "team" | "event" | "gallery" | "poster" // DÜZENLEME: 'poster' eklendi
  title: string
  description?: string
  image?: string
  data: any
  createdAt: Date
  updatedAt: Date
}

interface Notification {
  id: string
  type: "join_request" | "event_suggestion" | "feedback" | "system"
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
}

interface AdminContextType {
  isAdminLoggedIn: boolean
  setIsAdminLoggedIn: (value: boolean) => void
  isEditMode: boolean
  setIsEditMode: (value: boolean) => void
  adminUser: {
    email: string
    name: string
  } | null
  setAdminUser: (user: { email: string; name: string } | null) => void
  contentItems: ContentItem[]
  setContentItems: (items: ContentItem[]) => void
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  unreadCount: number
  addContentItem: (item: Omit<ContentItem, "id" | "createdAt" | "updatedAt">) => void
  updateContentItem: (id: string, updates: Partial<ContentItem>) => void
  deleteContentItem: (id: string) => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  updateContent: (type: string, data: any) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null)

  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "join_request",
      title: "Yeni Üyelik Başvurusu",
      message: "Ahmet Yılmaz topluluğa katılmak istiyor",
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "event_suggestion",
      title: "Etkinlik Önerisi",
      message: "React Workshop önerisi alındı",
      read: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "3",
      type: "feedback",
      title: "Yeni Geri Bildirim",
      message: "Platform hakkında olumlu geri bildirim",
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addContentItem = (item: Omit<ContentItem, "id" | "createdAt" | "updatedAt">) => {
    const newItem: ContentItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setContentItems((prev) => [...prev, newItem])
  }

  const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
    setContentItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item)),
    )
  }

  const deleteContentItem = (id: string) => {
    setContentItems((prev) => prev.filter((item) => item.id !== id))
  }

  const addNotification = (notification: Omit<Notification, "id" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const updateContent = (type: string, data: any) => {
    console.log("[v0] updateContent called with:", type, data)
    // Handle different content types
    switch (type) {
      case "homepage":
        // Update homepage content
        addNotification({
          type: "system",
          title: "İçerik Güncellendi",
          message: "Ana sayfa içeriği başarıyla güncellendi",
          read: false,
        })
        break
      
      // ===== DÜZENLEME: "posters" İÇİN YENİ CASE EKLENDİ =====
      case "posters":
        if (data.action === "add" && data.item) {
          addContentItem({
            type: "poster",
            title: data.item.title,
            description: data.item.content,
            image: data.item.image_url,
            data: data.item,
          });
          addNotification({
            type: "system",
            title: "Poster Eklendi",
            message: `Yeni poster "${data.item.title}" başarıyla eklendi.`,
            read: false,
          });
        }
        break;
      // ========================================================
        
      case "timeline":
        if (data.action === "add" && data.entry) {
          addContentItem({
            type: "timeline",
            title: data.entry.title,
            description: data.entry.description,
            data: data.entry,
          })
        }
        break
      case "gallery":
        if (data.action === "add" && data.item) {
          addContentItem({
            type: "gallery",
            title: data.item.title,
            description: data.item.description,
            image: data.item.image,
            data: data.item,
          })
        }
        break
      case "team":
        if (data.action === "add" && data.member) {
          addContentItem({
            type: "team",
            title: data.member.name,
            description: data.member.role,
            image: data.member.image,
            data: data.member,
          })
        }
        break
      default:
        console.log("[v0] Unknown content type:", type)
    }
  }

  useEffect(() => {
    if (isAdminLoggedIn) {
      setIsEditMode(true)
    } else {
      setIsEditMode(false)
      setAdminUser(null)
    }
  }, [isAdminLoggedIn])

  // Cookie tabanlı gerçek admin oturumunu kontrol et — bu olmadan isAdminLoggedIn hiç true olmuyordu
  // ve anasayfadaki InlineEditWrapper/düzenleme butonları hiçbir zaman görünmüyordu.
  useEffect(() => {
    let cancelled = false
    api
      .get("/admin/me")
      .then(({ data }) => {
        if (cancelled) return
        setIsAdminLoggedIn(true)
        if (data?.email) setAdminUser({ email: data.email, name: data.email })
      })
      .catch(() => {
        if (!cancelled) setIsAdminLoggedIn(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AdminContext.Provider
      value={{
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isEditMode,
        setIsEditMode,
        adminUser,
        setAdminUser,
        contentItems,
        setContentItems,
        notifications,
        setNotifications,
        unreadCount,
        addContentItem,
        updateContentItem,
        deleteContentItem,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        updateContent,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}