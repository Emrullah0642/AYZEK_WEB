"use client"

import { useState, useEffect } from "react"
// !!! DEĞİŞİKLİK BURADA: axios yerine bizim ayarlı api'yi çağırıyoruz !!!
import { api, API_BASE } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Trash2, Edit } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

// ESKİ API TANIMINI SİLDİK. 
// Artık lib/api.ts içindeki 'withCredentials: true' ayarlı api'yi kullanıyoruz.

type GalleryEvent = {
  id: number
  category: string
  image_url: string
  title: string
  description: string
  date: string
  location: string
}

const normalizeImageUrl = (v: string) => {
  const s = (v || "").trim()
  if (!s) return ""
  if (s.startsWith("http://") || s.startsWith("https://")) return s
  const path = s.startsWith("/") ? s : `/${s}`
  if (path.startsWith("/public/") || path.startsWith("/uploads/")) return `${API_BASE}${path}`

  // Fallback
  return `${API_BASE}/public/uploads${path}`
}

const INITIAL_GALLERY_ITEM = { title: "", description: "", image_url: "", category: "Workshop", date: "", location: "" }

export function GalleryManagement({ onNotify }: { onNotify: (msg: string) => void }) {
  const [items, setItems] = useState<GalleryEvent[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Ekleme State'leri
  const [addOpen, setAddOpen] = useState(false)
  const [newItem, setNewItem] = useState(INITIAL_GALLERY_ITEM)

  // Düzenleme State'leri
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<GalleryEvent | null>(null)

  // Ortak Dosya State'i
  const [galleryFile, setGalleryFile] = useState<File | null>(null)

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      // api.get (Cookie otomatik gider)
      const { data } = await api.get<GalleryEvent[]>("/api/gallery-events", { headers: { "Cache-Control": "no-cache" } })
      setItems(data.sort((a, b) => (a.date < b.date ? 1 : -1)))
    } catch (e) {
      console.error("Galeri list hata:", e)
    }
  }

  // --- YENİ EKLEME FONKSİYONU ---
  const handleAdd = async () => {
    const { title, description, image_url, category, date, location } = newItem
    if (!title || !description || !category || !date || !location) return

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("date", date)
      formData.append("location", location)

      // Dosya varsa dosyayı, yoksa manuel linki ekle
      if (galleryFile) {
        formData.append("file", galleryFile)
      } else if (image_url) {
        formData.append("image_url", normalizeImageUrl(image_url))
      }

      // api.post (Cookie otomatik gider)
      const { data } = await api.post<GalleryEvent>("/api/gallery-events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setItems((prev) => [data, ...prev])

      // Temizlik
      setNewItem({ title: "", description: "", image_url: "", category: "Workshop", date: "", location: "" })
      setGalleryFile(null)
      setAddOpen(false)
      onNotify("Galeri eklendi")
    } catch (e) {
      console.error("Galeri ekle hata:", e)
      onNotify("Ekleme başarısız")
    }
  }

  // --- YENİ GÜNCELLEME FONKSİYONU ---
  const handleUpdate = async () => {
    if (!editItem) return
    try {
      const formData = new FormData()
      formData.append("title", editItem.title)
      formData.append("description", editItem.description)
      formData.append("category", editItem.category)
      formData.append("date", editItem.date)
      formData.append("location", editItem.location)

      // 1. Yeni dosya seçildiyse ekle
      if (galleryFile) {
        formData.append("file", galleryFile)
      }
      // 2. Dosya yoksa mevcut URL'yi koru
      else if (editItem.image_url) {
        formData.append("image_url", normalizeImageUrl(editItem.image_url))
      }

      // api.put (Cookie otomatik gider)
      const { data } = await api.put<GalleryEvent>(`/api/gallery-events/${editItem.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setItems(prev => prev.map(x => (x.id === data.id ? data : x)))

      // Temizlik
      setGalleryFile(null)
      setEditOpen(false)
      onNotify("Galeri güncellendi")
    } catch (e) {
      console.error("Galeri güncelle hata:", e)
      onNotify("Güncelleme başarısız")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Galeri öğesini silmek istediğinizden emin misiniz?")) return
    try {
      // api.delete (Cookie otomatik gider)
      await api.delete(`/api/gallery-events/${id}`)
      setItems((prev) => prev.filter((g) => g.id !== id))
      onNotify("Galeri silindi")
    } catch (e) {
      console.error("Galeri sil hata:", e)
    }
  }

  const handleManageOpenChange = (open: boolean) => {
    if (!open) {
      setAddOpen(false)
      setEditOpen(false)
      setNewItem(INITIAL_GALLERY_ITEM)
      setGalleryFile(null)
      setEditItem(null)
    }
    setIsOpen(open)
  }

  // Dialog açılışlarında dosya state'ini temizle
  const openAddDialog = (open: boolean) => {
    if (open) setGalleryFile(null)
    setAddOpen(open)
  }

  const openEditDialog = (item: GalleryEvent) => {
    setEditItem(item)
    setGalleryFile(null)
    setEditOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleManageOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-ayzek-gradient hover:opacity-90 w-full">
          <Edit className="w-4 h-4 mr-2" /> Galeri Yönet
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Galeri Yönetimi</DialogTitle>
        </VisuallyHidden>
        <DialogHeader>
          <div className="relative w-full h-10 rounded flex items-center justify-center">
            <div className="absolute inset-0 rounded bg-ayzek-gradient" />
            <span className="relative z-10 text-white text-base md:text-lg font-display font-semibold tracking-wide">
              Etkinlik Galerisi Yönetimi
            </span>
          </div>
        </DialogHeader>

        <div className="mb-4">
          <Dialog open={addOpen} onOpenChange={openAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent">Yeni Galeri Öğesi Ekle</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/20">
              <DialogHeader>
                <DialogTitle>Yeni Galeri Öğesi</DialogTitle>
                <DialogDescription>Etkinlik galerisine yeni bir görsel ekleyin</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Başlık *</Label><Input value={newItem.title} onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Açıklama *</Label><Textarea value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} rows={3} /></div>

                <div>
                  <Label>Görsel (opsiyonel)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="URL girin veya dosya seçin" value={newItem.image_url} onChange={(e) => setNewItem((p) => ({ ...p, image_url: e.target.value }))} className="flex-1" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setGalleryFile(e.target.files[0])
                          setNewItem((p) => ({ ...p, image_url: e.target.files![0].name }))
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {galleryFile && <p className="text-xs text-green-600 mt-1">Seçili: {galleryFile.name}</p>}
                  {!galleryFile && newItem.image_url && <img src={normalizeImageUrl(newItem.image_url)} alt="Önizleme" className="mt-2 h-24 w-auto rounded object-cover border border-border/30" />}
                </div>

                <div><Label>Kategori *</Label><Input placeholder="Workshop, Meetup, etc." value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))} /></div>
                <div><Label>Tarih *</Label><Input type="date" value={newItem.date} onChange={(e) => setNewItem((p) => ({ ...p, date: e.target.value }))} /></div>
                <div><Label>Konum *</Label><Input value={newItem.location} onChange={(e) => setNewItem((p) => ({ ...p, location: e.target.value }))} /></div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAdd} className="flex-1 bg-ayzek-gradient hover:opacity-90">Ekle</Button>
                  <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1">İptal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {item.image_url ? (
                  <img src={normalizeImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.location} • {item.date}</p>
                <div className="flex justify-end mt-2 gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>Düzenle</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!items.length && <div className="text-sm text-muted-foreground px-2 py-6 text-center col-span-3">Henüz galeri öğesi yok.</div>}
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-card border-primary/20">
            <DialogHeader><DialogTitle>Galeri Düzenle</DialogTitle></DialogHeader>
            {editItem && (
              <div className="space-y-4">
                <div><Label>Başlık</Label><Input value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} /></div>
                <div><Label>Açıklama</Label><Textarea value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} /></div>

                <div>
                  <Label>Görsel URL</Label>
                  <div className="flex gap-2">
                    <Input value={editItem.image_url} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} className="flex-1" placeholder="URL girin veya dosya seçin" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setGalleryFile(e.target.files[0])
                          setEditItem({ ...editItem, image_url: e.target.files[0].name })
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {galleryFile && <p className="text-xs text-green-600 mt-1">Yeni dosya seçildi: {galleryFile.name}</p>}
                </div>

                <div><Label>Kategori</Label><Input value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })} /></div>
                <div><Label>Tarih</Label><Input type="date" value={editItem.date} onChange={(e) => setEditItem({ ...editItem, date: e.target.value })} /></div>
                <div><Label>Konum</Label><Input value={editItem.location} onChange={(e) => setEditItem({ ...editItem, location: e.target.value })} /></div>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-ayzek-gradient hover:opacity-90" onClick={handleUpdate}>Kaydet</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setEditOpen(false)}>Kapat</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}