"use client"

import { useState, useEffect } from "react"
// !!! DEĞİŞİKLİK BURADA: axios yerine bizim ayarlı api'yi çağırıyoruz !!!
import { api, API_BASE } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Trash2, Edit } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

// ESKİ API TANIMINI SİLDİK. 
// Artık lib/api.ts içindeki 'withCredentials: true' ayarlı api'yi kullanıyoruz.

type TimelineOut = {
  id: number
  title: string
  description: string
  category: string
  date_label: string
  sort_date?: string | null
  image_url?: string | null
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

const INITIAL_TIMELINE_ITEM = { title: "", description: "", date_label: "", sort_date: "", category: "milestone", image_url: "" }

export function TimelineManagement({ onNotify }: { onNotify: (msg: string) => void }) {
  const [items, setItems] = useState<TimelineOut[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Ekleme State'leri
  const [addOpen, setAddOpen] = useState(false)
  const [newItem, setNewItem] = useState(INITIAL_TIMELINE_ITEM)

  // Düzenleme State'leri
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<TimelineOut | null>(null)

  // Ortak Dosya State'i
  const [timelineFile, setTimelineFile] = useState<File | null>(null)

  useEffect(() => {
    fetchTimeline()
  }, [])

  const fetchTimeline = async () => {
    setLoading(true)
    try {
      // api.get (Cookie otomatik gider)
      const { data } = await api.get<TimelineOut[]>("/timeline", { headers: { "Cache-Control": "no-cache" } })
      // Backend zaten sıralı gönderiyor, client-side sıralamayı kaldırıyoruz veya backendin gönderdiği sırayı koruyoruz.
      setItems(data)
    } catch (e) {
      console.error("Timeline list hata:", e)
    } finally {
      setLoading(false)
    }
  }

  // --- YENİ EKLEME FONKSİYONU (FormData) ---
  const handleAdd = async () => {
    if (!newItem.title || !newItem.date_label || !newItem.category) return

    try {
      const formData = new FormData()
      formData.append("title", newItem.title)
      formData.append("description", newItem.description || "")
      formData.append("category", newItem.category)
      formData.append("date_label", newItem.date_label)
      if (newItem.sort_date) {
        formData.append("sort_date", newItem.sort_date)
      }

      if (timelineFile) {
        formData.append("file", timelineFile)
      } else if (newItem.image_url) {
        formData.append("image_url", normalizeImageUrl(newItem.image_url))
      }

      // api.post (Cookie otomatik gider)
      const { data } = await api.post<TimelineOut>("/timeline", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Ekleme sonrası yeniden fetch veya listeye ekleme. En doğrusu fetch ederek sıranın backend'den gelmesini sağlamak.
      fetchTimeline();

      setNewItem({ title: "", description: "", date_label: "", sort_date: "", category: "milestone", image_url: "" })
      setTimelineFile(null)
      setAddOpen(false)
      onNotify("Timeline eklendi")
    } catch (e) {
      console.error("Timeline ekle hata:", e)
      onNotify("Timeline eklenemedi")
    }
  }

  // --- YENİ GÜNCELLEME FONKSİYONU (FormData) ---
  const handleUpdate = async () => {
    if (!editItem) return
    try {
      const formData = new FormData()
      formData.append("title", editItem.title)
      formData.append("description", editItem.description || "")
      formData.append("category", editItem.category)
      formData.append("date_label", editItem.date_label)
      if (editItem.sort_date) {
        formData.append("sort_date", editItem.sort_date)
      }

      if (timelineFile) {
        formData.append("file", timelineFile)
      }
      else if (editItem.image_url) {
        formData.append("image_url", normalizeImageUrl(editItem.image_url))
      }

      // api.put (Cookie otomatik gider)
      const { data } = await api.put<TimelineOut>(`/timeline/${editItem.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setItems(prev => {
        // Güncellemeden sonra listeyi tekrar sıralamak yerine, güncel öğeyi yerine koyup
        // Backend'in sıralamasını güvenmek için yeniden fetch yapılabilir veya
        // Client-side basitçe sort_date'e göre sıralayabiliriz.
        // Ancak en temiz yöntem listeyi yenilemek veya güncel elemanla devam etmektir.
        // Burada sadece replace yapıyoruz.
        return prev.map(x => (x.id === data.id ? data : x))
      })
      fetchTimeline(); // Sıralamayı garantiye almak için yeniden çekelim

      setTimelineFile(null)
      setEditOpen(false)
      onNotify("Timeline güncellendi")
    } catch (e) {
      console.error("Timeline güncelle hata:", e)
      onNotify("Güncelleme başarısız")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Timeline kaydını silmek istediğinizden emin misiniz?")) return
    try {
      // api.delete (Cookie otomatik gider)
      await api.delete(`/timeline/${id}`)
      setItems((prev) => prev.filter((t) => t.id !== id))
      onNotify("Timeline silindi")
    } catch (e) {
      console.error("Timeline sil hata:", e)
    }
  }

  const handleManageOpenChange = (open: boolean) => {
    if (!open) {
      setAddOpen(false)
      setEditOpen(false)
      setNewItem(INITIAL_TIMELINE_ITEM)
      setTimelineFile(null)
      setEditItem(null)
    }
    setIsOpen(open)
  }

  const openAddDialog = (open: boolean) => {
    if (open) setTimelineFile(null)
    setAddOpen(open)
  }

  const openEditDialog = (item: TimelineOut) => {
    setEditItem(item)
    setTimelineFile(null)
    setEditOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleManageOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-ayzek-gradient hover:opacity-90 w-full">
          <Edit className="w-4 h-4 mr-2" /> Timeline Düzenle
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Timeline Yönetimi</DialogTitle>
        </VisuallyHidden>
        <DialogHeader>
          <div className="relative w-full h-10 rounded flex items-center justify-center">
            <div className="absolute inset-0 rounded bg-ayzek-gradient" />
            <span className="relative z-10 text-white text-base md:text-lg font-display font-semibold tracking-wide">
              Timeline Yönetimi
            </span>
          </div>
        </DialogHeader>

        <div className="mb-4">
          <Dialog open={addOpen} onOpenChange={openAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent">Yeni Timeline Ekle</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/20">
              <DialogHeader>
                <DialogTitle>Yeni Timeline Girişi</DialogTitle>
                <DialogDescription>Zaman kapsülüne yeni bir kilometre taşı ekleyin</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label>Başlık *</Label><Input value={newItem.title} onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))} /></div>
                <div><Label>Açıklama</Label><Textarea value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} rows={3} /></div>
                <div><Label>Tarih Etiketi *</Label><Input placeholder="Mart 2024 / 2022 Q4" value={newItem.date_label} onChange={(e) => setNewItem((p) => ({ ...p, date_label: e.target.value }))} /></div>
                <div><Label>Sıralama Tarihi *</Label><Input type="date" value={newItem.sort_date} onChange={(e) => setNewItem((p) => ({ ...p, sort_date: e.target.value }))} /></div>
                <div><Label>Kategori *</Label><Input placeholder="milestone / success / education / event / other" value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))} /></div>
                <div>
                  <Label>Görsel (opsiyonel)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="URL girin veya dosya seçin" value={newItem.image_url || ""} onChange={(e) => setNewItem((p) => ({ ...p, image_url: e.target.value }))} className="flex-1" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setTimelineFile(e.target.files[0])
                          setNewItem((p) => ({ ...p, image_url: e.target.files![0].name }))
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {timelineFile && <p className="text-xs text-green-600 mt-1">Seçili: {timelineFile.name}</p>}
                  {!timelineFile && newItem.image_url && <img src={normalizeImageUrl(newItem.image_url)} alt="Önizleme" className="mt-2 h-24 w-auto rounded object-cover border border-border/30" />}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAdd} className="flex-1 bg-ayzek-gradient hover:opacity-90">Ekle</Button>
                  <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1">İptal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.date_label}</span>
                    {item.sort_date && <span className="text-xs opacity-70">({item.sort_date})</span>}
                  </div>
                  <p className="text-sm mt-2 break-words whitespace-pre-wrap">{item.description}</p>
                  {item.image_url && <img src={normalizeImageUrl(item.image_url)} alt={item.title} className="mt-2 h-24 w-auto rounded object-cover" />}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>Düzenle</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {!items.length && !loading && <div className="text-sm text-muted-foreground px-2 py-6 text-center">Henüz timeline kaydı yok.</div>}
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-card border-primary/20">
            <DialogHeader><DialogTitle>Timeline Düzenle</DialogTitle></DialogHeader>
            {editItem && (
              <div className="space-y-4">
                <div><Label>Başlık</Label><Input value={editItem.title} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} /></div>
                <div><Label>Açıklama</Label><Textarea value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} /></div>
                <div><Label>Tarih Etiketi</Label><Input value={editItem.date_label} onChange={(e) => setEditItem({ ...editItem, date_label: e.target.value })} /></div>
                <div><Label>Sıralama Tarihi</Label><Input type="date" value={editItem.sort_date || ""} onChange={(e) => setEditItem({ ...editItem, sort_date: e.target.value })} /></div>
                <div><Label>Kategori</Label><Input value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })} /></div>

                <div>
                  <Label>Görsel URL</Label>
                  <div className="flex gap-2">
                    <Input value={editItem.image_url ?? ""} onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })} className="flex-1" placeholder="URL girin veya dosya seçin" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setTimelineFile(e.target.files[0])
                          setEditItem({ ...editItem, image_url: e.target.files[0].name })
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {timelineFile && <p className="text-xs text-green-600 mt-1">Yeni dosya seçildi: {timelineFile.name}</p>}
                </div>

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