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

type PosterOut = {
  id: number
  title: string
  subtitle?: string | null
  content?: string | null
  image_url?: string | null
  is_active: boolean
  order_index: number
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

const INITIAL_POSTER = { title: "", subtitle: "", content: "", image_url: "" }

export function PosterManagement({ onNotify }: { onNotify: (msg: string) => void }) {
  const [posterItems, setPosterItems] = useState<PosterOut[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Ekleme State'leri
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newPoster, setNewPoster] = useState(INITIAL_POSTER)

  // Düzenleme State'leri
  const [editOpen, setEditOpen] = useState(false)
  const [editPoster, setEditPoster] = useState<PosterOut | null>(null)

  // Ortak Dosya State'i
  const [posterFile, setPosterFile] = useState<File | null>(null)

  const handleManageOpenChange = (open: boolean) => {
    if (!open) {
      setIsAddOpen(false)
      setEditOpen(false)
      setNewPoster(INITIAL_POSTER)
      setPosterFile(null)
      setEditPoster(null)
    }
    setIsOpen(open)
  }

  useEffect(() => {
    fetchPosters()
  }, [])

  const fetchPosters = async () => {
    try {
      // api.get (Cookie otomatik gider)
      const { data } = await api.get<PosterOut[]>("/posters", { params: { limit: 200 } })
      setPosterItems(data)
    } catch (e) {
      console.error("Poster list hata:", e)
    }
  }

  const handleAdd = async () => {
    if (!newPoster.title) return
    const formData = new FormData()
    formData.append("title", newPoster.title)
    if (newPoster.subtitle) formData.append("subtitle", newPoster.subtitle)
    if (newPoster.content) formData.append("content", newPoster.content)

    if (posterFile) {
      formData.append("file", posterFile)
    } else if (newPoster.image_url) {
      formData.append("image_url", newPoster.image_url)
    }

    formData.append("is_active", "true")
    formData.append("order_index", String(posterItems.length))

    try {
      // api.post (Cookie otomatik gider)
      const { data } = await api.post<PosterOut>("/posters", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setPosterItems((prev) => [data, ...prev])

      setNewPoster({ title: "", subtitle: "", content: "", image_url: "" })
      setPosterFile(null)
      setIsAddOpen(false)
      onNotify("Poster eklendi")
    } catch (e) {
      console.error("Poster ekle hata:", e)
      onNotify("Poster eklenemedi")
    }
  }

  const handleUpdate = async () => {
    if (!editPoster) return
    try {
      const formData = new FormData()
      formData.append("title", editPoster.title)
      if (editPoster.subtitle) formData.append("subtitle", editPoster.subtitle)
      if (editPoster.content) formData.append("content", editPoster.content)
      formData.append("is_active", String(editPoster.is_active))
      formData.append("order_index", String(editPoster.order_index))

      if (posterFile) {
        formData.append("file", posterFile)
      }
      else if (editPoster.image_url) {
        formData.append("image_url", editPoster.image_url)
      }

      // api.put (Cookie otomatik gider)
      const { data } = await api.put<PosterOut>(`/posters/${editPoster.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setPosterItems(prev => prev.map(x => (x.id === data.id ? data : x)))

      setPosterFile(null)
      setEditOpen(false)
      onNotify("Poster güncellendi")
    } catch (e) {
      console.error("Poster güncelle hata:", e)
      onNotify("Güncelleme başarısız")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Posteri silmek istediğinizden emin misiniz?")) return
    try {
      // api.delete (Cookie otomatik gider)
      await api.delete(`/posters/${id}`)
      setPosterItems((prev) => prev.filter((p) => p.id !== id))
      onNotify("Poster silindi")
    } catch (e) {
      console.error("Poster sil hata:", e)
      onNotify("Silme yetkiniz yok veya hata oluştu")
    }
  }

  const openEditDialog = (item: PosterOut) => {
    setEditPoster(item)
    setPosterFile(null)
    setEditOpen(true)
  }

  const openAddDialog = (open: boolean) => {
    if (open) setPosterFile(null)
    setIsAddOpen(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleManageOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-ayzek-gradient hover:opacity-90 w-full">
          <Edit className="w-4 h-4 mr-2" /> Posterleri Yönet
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Poster Yönetimi</DialogTitle>
        </VisuallyHidden>
        <DialogHeader>
          <div className="relative w-full h-10 rounded flex items-center justify-center">
            <div className="absolute inset-0 rounded bg-ayzek-gradient" />
            <span className="relative z-10 text-white text-base md:text-lg font-display font-semibold tracking-wide">
              Poster Yönetimi
            </span>
          </div>
        </DialogHeader>

        <div className="mb-4">
          <Dialog open={isAddOpen} onOpenChange={openAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent">Yeni Poster Ekle</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yeni Poster</DialogTitle>
                <DialogDescription>Ana sayfa poster alanına yeni bir öğe ekleyin</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Başlık *</Label>
                  <Input value={newPoster.title} onChange={(e) => setNewPoster((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label>Alt Başlık</Label>
                  <Input value={newPoster.subtitle || ""} onChange={(e) => setNewPoster((p) => ({ ...p, subtitle: e.target.value }))} />
                </div>
                <div>
                  <Label>İçerik</Label>
                  <Textarea value={newPoster.content || ""} onChange={(e) => setNewPoster((p) => ({ ...p, content: e.target.value }))} rows={4} />
                </div>
                <div>
                  <Label>Görsel *</Label>
                  <div className="flex gap-2">
                    <Input placeholder="URL girin veya dosya seçin" value={newPoster.image_url || ""} onChange={(e) => setNewPoster((p) => ({ ...p, image_url: e.target.value }))} className="flex-1" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPosterFile(e.target.files[0])
                          setNewPoster((p) => ({ ...p, image_url: e.target.files![0].name }))
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {posterFile && <p className="text-xs text-green-600 mt-1">Seçili: {posterFile.name}</p>}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAdd} className="flex-1 bg-ayzek-gradient hover:opacity-90">Ekle</Button>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)} className="flex-1">İptal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posterItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {item.image_url ? (
                  <img src={normalizeImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</p>
                <p className="text-sm mt-2 break-words whitespace-pre-wrap">{item.content}</p>
                <div className="flex justify-end mt-3 gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>Düzenle</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-3 h-3 mr-1" /> Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!posterItems.length && <div className="text-sm text-muted-foreground px-2 py-6 text-center col-span-2">Henüz poster yok.</div>}
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-card border-primary/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Posteri Düzenle</DialogTitle>
            </DialogHeader>
            {editPoster && (
              <div className="space-y-4">
                <div><Label>Başlık</Label><Input value={editPoster.title} onChange={(e) => setEditPoster({ ...editPoster, title: e.target.value })} /></div>
                <div><Label>Alt Başlık</Label><Input value={editPoster.subtitle ?? ""} onChange={(e) => setEditPoster({ ...editPoster, subtitle: e.target.value })} /></div>
                <div><Label>İçerik</Label><Textarea value={editPoster.content ?? ""} onChange={(e) => setEditPoster({ ...editPoster, content: e.target.value })} /></div>
                <div>
                  <Label>Görsel URL</Label>
                  <div className="flex gap-2">
                    <Input value={editPoster.image_url ?? ""} onChange={(e) => setEditPoster({ ...editPoster, image_url: e.target.value })} className="flex-1" placeholder="URL girin veya dosya seçin" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPosterFile(e.target.files[0])
                          setEditPoster({ ...editPoster, image_url: e.target.files[0].name })
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {posterFile && <p className="text-xs text-green-600 mt-1">Yeni dosya seçildi: {posterFile.name}</p>}
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