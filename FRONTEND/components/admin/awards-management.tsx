"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { normalizeImageUrl } from "@/lib/normalize-image-url"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Trash2, Edit, Trophy } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

type AwardOut = {
  id: number
  title: string
  description: string
  image_url: string | null
  year: number | null
  order_index: number | null
}

const INITIAL_AWARD = { title: "", description: "", year: "", image_url: "" }

export function AwardsManagement({ onNotify }: { onNotify: (msg: string) => void }) {
  const [awards, setAwards] = useState<AwardOut[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const [addOpen, setAddOpen] = useState(false)
  const [newAward, setNewAward] = useState(INITIAL_AWARD)

  const [editOpen, setEditOpen] = useState(false)
  const [editAward, setEditAward] = useState<AwardOut | null>(null)

  const [awardFile, setAwardFile] = useState<File | null>(null)

  const fetchAwards = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<AwardOut[]>("/awards")
      setAwards(data)
    } catch (e) {
      console.error("Ödüller getirilirken hata:", e)
      onNotify("Ödüller yüklenemedi")
    } finally {
      setLoading(false)
    }
  }, [onNotify])

  useEffect(() => {
    fetchAwards()
  }, [fetchAwards])

  const handleAdd = async () => {
    if (!newAward.title || !newAward.description) {
      onNotify("Başlık ve açıklama zorunludur")
      return
    }
    try {
      const formData = new FormData()
      formData.append("title", newAward.title)
      formData.append("description", newAward.description)
      if (newAward.year) formData.append("year", newAward.year)

      if (awardFile) {
        formData.append("file", awardFile)
      } else if (newAward.image_url) {
        formData.append("image_url", normalizeImageUrl(newAward.image_url))
      }

      const { data } = await api.post<AwardOut>("/awards", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setAwards((prev) => [...prev, data])
      setNewAward(INITIAL_AWARD)
      setAwardFile(null)
      setAddOpen(false)
      onNotify(`"${data.title}" ödülü eklendi`)
    } catch (e) {
      console.error("Ödül eklenirken hata:", e)
      onNotify("Ödül eklenemedi")
    }
  }

  const handleUpdate = async () => {
    if (!editAward) return
    try {
      const formData = new FormData()
      formData.append("title", editAward.title)
      formData.append("description", editAward.description)
      if (editAward.year != null) formData.append("year", String(editAward.year))

      if (awardFile) {
        formData.append("file", awardFile)
      } else if (editAward.image_url) {
        formData.append("image_url", normalizeImageUrl(editAward.image_url))
      }

      const { data } = await api.put<AwardOut>(`/awards/${editAward.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setAwards((prev) => prev.map((a) => (a.id === data.id ? data : a)))
      setAwardFile(null)
      setEditOpen(false)
      onNotify(`"${data.title}" güncellendi`)
    } catch (e) {
      console.error("Ödül güncelle hata:", e)
      onNotify("Güncelleme başarısız")
    }
  }

  const handleDelete = async (awardId: number) => {
    if (!confirm(`#${awardId} ID'li ödülü silmek istediğinizden emin misiniz?`)) return
    try {
      await api.delete(`/awards/${awardId}`)
      setAwards((prev) => prev.filter((a) => a.id !== awardId))
      onNotify("Ödül silindi")
    } catch (e) {
      console.error("Ödül silinirken hata:", e)
      onNotify("Ödül silinemedi")
    }
  }

  const handleManageOpenChange = (open: boolean) => {
    if (!open) {
      setAddOpen(false)
      setEditOpen(false)
      setNewAward(INITIAL_AWARD)
      setAwardFile(null)
      setEditAward(null)
    }
    setIsOpen(open)
  }

  const openAddDialog = (open: boolean) => {
    if (open) setAwardFile(null)
    setAddOpen(open)
  }

  const openEditDialog = (award: AwardOut) => {
    setEditAward(award)
    setAwardFile(null)
    setEditOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleManageOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-ayzek-gradient hover:opacity-90 w-full">
          <Edit className="w-4 h-4 mr-2" /> Ödülleri Yönet
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Ödül Yönetimi</DialogTitle>
        </VisuallyHidden>
        <DialogHeader>
          <div className="relative w-full h-10 rounded flex items-center justify-center">
            <div className="absolute inset-0 rounded bg-ayzek-gradient" />
            <span className="relative z-10 text-white text-base md:text-lg font-display font-semibold tracking-wide">
              Ödüllerimiz
            </span>
          </div>
        </DialogHeader>

        <div className="flex justify-end mb-2">
          <Dialog open={addOpen} onOpenChange={openAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent">Ödül Ekle</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/20 max-w-lg">
              <DialogHeader>
                <DialogTitle>Yeni Ödül</DialogTitle>
                <DialogDescription>Ödülün bilgilerini girin</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Ödül Adı *</Label>
                  <Input value={newAward.title} onChange={(e) => setNewAward((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label>Açıklama *</Label>
                  <Textarea value={newAward.description} onChange={(e) => setNewAward((p) => ({ ...p, description: e.target.value }))} rows={3} />
                </div>
                <div>
                  <Label>Yıl</Label>
                  <Input type="number" value={newAward.year} onChange={(e) => setNewAward((p) => ({ ...p, year: e.target.value }))} placeholder="Örn: 2025" />
                </div>

                <div>
                  <Label>Görsel (opsiyonel)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="URL girin veya dosya seçin"
                      value={newAward.image_url}
                      onChange={(e) => setNewAward((p) => ({ ...p, image_url: e.target.value }))}
                      className="flex-1"
                    />
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAwardFile(e.target.files[0])
                            setNewAward((p) => ({ ...p, image_url: e.target.files![0].name }))
                          }
                        }}
                      />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {awardFile && <p className="text-xs text-green-600 mt-1">Seçili: {awardFile.name}</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAdd} className="flex-1 bg-ayzek-gradient hover:opacity-90">Ekle</Button>
                  <Button variant="outline" onClick={() => setAddOpen(false)} className="flex-1">İptal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Yükleniyor...</div>
        ) : awards.length === 0 ? (
          <div className="text-sm text-muted-foreground px-2 py-6 text-center">Henüz ödül eklenmemiş.</div>
        ) : (
          <div className="grid gap-3">
            {awards.map((award) => (
              <Card key={award.id} className="p-4">
                <div className="flex items-start gap-4">
                  {award.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={normalizeImageUrl(award.image_url)} alt={award.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-7 h-7 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{award.title}</h4>
                      {award.year && <span className="text-xs text-muted-foreground">({award.year})</span>}
                    </div>
                    <p className="text-sm mt-1 break-words whitespace-pre-wrap text-muted-foreground">{award.description}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(award)}>Düzenle</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(award.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-card border-primary/20 max-w-lg">
            <DialogHeader><DialogTitle>Ödülü Düzenle</DialogTitle></DialogHeader>
            {editAward && (
              <div className="space-y-3">
                <div>
                  <Label>Ödül Adı</Label>
                  <Input value={editAward.title} onChange={(e) => setEditAward({ ...editAward, title: e.target.value })} />
                </div>
                <div>
                  <Label>Açıklama</Label>
                  <Textarea value={editAward.description} onChange={(e) => setEditAward({ ...editAward, description: e.target.value })} rows={3} />
                </div>
                <div>
                  <Label>Yıl</Label>
                  <Input
                    type="number"
                    value={editAward.year ?? ""}
                    onChange={(e) => setEditAward({ ...editAward, year: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>

                <div>
                  <Label>Görsel URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editAward.image_url ?? ""}
                      onChange={(e) => setEditAward({ ...editAward, image_url: e.target.value })}
                      className="flex-1"
                      placeholder="URL girin veya dosya seçin"
                    />
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAwardFile(e.target.files[0])
                            setEditAward({ ...editAward, image_url: e.target.files[0].name })
                          }
                        }}
                      />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {awardFile && <p className="text-xs text-green-600 mt-1">Yeni dosya seçildi: {awardFile.name}</p>}
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
