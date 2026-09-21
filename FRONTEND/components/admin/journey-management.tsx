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
import { ImageIcon, Trash2, Users as UsersIcon, Edit } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

// ESKİ API TANIMINI SİLDİK. 
// Artık lib/api.ts içindeki 'withCredentials: true' ayarlı api'yi kullanıyoruz.

type JourneyPersonOut = {
  id: number
  year: number
  name: string
  role: string
  description: string
  photo_url: string | null
}

const normalizeImageUrl = (v: string | null) => {
  const s = (v || "").trim()
  if (!s) return ""
  if (s.startsWith("http://") || s.startsWith("https://")) return s
  const path = s.startsWith("/") ? s : `/${s}`
  if (path.startsWith("/public/") || path.startsWith("/uploads/")) return `${API_BASE}${path}`

  // Fallback
  return `${API_BASE}/public/uploads${path}`
}

const INITIAL_JOURNEY_PERSON = { name: "", role: "", description: "", photo_url: "" }

export function JourneyManagement({ onNotify }: { onNotify: (msg: string) => void }) {
  const [journeyPeople, setJourneyPeople] = useState<Record<number, JourneyPersonOut[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [isOpen, setIsOpen] = useState(false)

  // Ekleme State'leri
  const [addOpen, setAddOpen] = useState(false)
  const [newPerson, setNewPerson] = useState(INITIAL_JOURNEY_PERSON)

  // Düzenleme State'leri
  const [editOpen, setEditOpen] = useState(false)
  const [editPerson, setEditPerson] = useState<JourneyPersonOut | null>(null)

  // Ortak Dosya State'i
  const [journeyFile, setJourneyFile] = useState<File | null>(null)

  const yearsList = (() => {
    const now = new Date().getFullYear()
    const arr: number[] = []
    for (let y = now + 1; y >= 2017; y--) arr.push(y)
    return arr
  })()

  useEffect(() => {
    fetchJourneyPeople()
  }, [])

  const fetchJourneyPeople = async () => {
    setLoading(true)
    try {
      // api.get (Cookie otomatik gider)
      const { data } = await api.get<Record<number, JourneyPersonOut[]>>("/journey/")
      setJourneyPeople(data)
    } catch (e) {
      console.error("Yolculuğumuz verisi getirilirken hata:", e)
      onNotify("Yolculuğumuz verisi yüklenemedi")
    } finally {
      setLoading(false)
    }
  }

  // --- YENİ EKLEME FONKSİYONU ---
  const handleAdd = async () => {
    if (!newPerson.name || !newPerson.role || !newPerson.description) {
      onNotify("İsim, Görev ve Açıklama alanları zorunludur")
      return
    }

    try {
      const formData = new FormData()
      formData.append("year", String(selectedYear))
      formData.append("name", newPerson.name)
      formData.append("role", newPerson.role)
      formData.append("description", newPerson.description)

      // Dosya varsa dosyayı, yoksa manuel linki ekle
      if (journeyFile) {
        formData.append("file", journeyFile)
      } else if (newPerson.photo_url) {
        formData.append("photo_url", normalizeImageUrl(newPerson.photo_url))
      }

      // api.post (Cookie otomatik gider)
      const { data } = await api.post<JourneyPersonOut>("/journey/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setJourneyPeople(prev => {
        const yearData = prev[data.year] ? [...prev[data.year], data] : [data]
        return { ...prev, [data.year]: yearData }
      })

      // Temizlik
      setNewPerson({ name: "", role: "", description: "", photo_url: "" })
      setJourneyFile(null)
      setAddOpen(false)
      onNotify(`"${data.name}" kişisi ${data.year} yılına eklendi`)
    } catch (e) {
      console.error("Yolculuğumuz kişisi eklenirken hata:", e)
      onNotify("Kişi eklenemedi")
    }
  }

  // --- YENİ GÜNCELLEME FONKSİYONU ---
  const handleUpdate = async () => {
    if (!editPerson) return
    try {
      const formData = new FormData()
      formData.append("year", String(editPerson.year))
      formData.append("name", editPerson.name)
      formData.append("role", editPerson.role)
      formData.append("description", editPerson.description)

      // 1. Yeni dosya seçildiyse onu ekle
      if (journeyFile) {
        formData.append("file", journeyFile)
      }
      // 2. Dosya yoksa mevcut URL'yi koru
      else if (editPerson.photo_url) {
        formData.append("photo_url", normalizeImageUrl(editPerson.photo_url))
      }

      // api.put (Cookie otomatik gider)
      const { data } = await api.put<JourneyPersonOut>(`/journey/${editPerson.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setJourneyPeople(prev => {
        const cp = { ...prev }
        cp[data.year] = (cp[data.year] || []).map(x => (x.id === data.id ? data : x))
        return cp
      })

      // Temizlik
      setJourneyFile(null)
      setEditOpen(false)
      onNotify(`"${data.name}" güncellendi`)
    } catch (e) {
      console.error("Yolculuğumuz güncelle hata:", e)
      onNotify("Güncelleme başarısız")
    }
  }

  const handleDelete = async (personId: number) => {
    if (!confirm(`#${personId} ID'li kişiyi silmek istediğinizden emin misiniz?`)) return
    try {
      // api.delete (Cookie otomatik gider)
      await api.delete(`/journey/${personId}`)
      const updatedJourneyPeople: Record<number, JourneyPersonOut[]> = {}
      for (const year in journeyPeople) {
        updatedJourneyPeople[year] = journeyPeople[year].filter(p => p.id !== personId)
      }
      setJourneyPeople(updatedJourneyPeople)
      onNotify(`Kişi #${personId} silindi`)
    } catch (e) {
      console.error("Yolculuğumuz kişisi silinirken hata:", e)
      onNotify("Kişi silinemedi")
    }
  }

  // Dialog açılışlarında dosya state'ini temizle
  const handleManageOpenChange = (open: boolean) => {
    if (!open) {
      setAddOpen(false)
      setEditOpen(false)
      setNewPerson(INITIAL_JOURNEY_PERSON)
      setJourneyFile(null)
      setEditPerson(null)
    }
    setIsOpen(open)
  }

  const openAddDialog = (open: boolean) => {
    if (open) setJourneyFile(null)
    setAddOpen(open)
  }

  const openEditDialog = (person: JourneyPersonOut) => {
    setEditPerson(person)
    setJourneyFile(null)
    setEditOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleManageOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-ayzek-gradient hover:opacity-90 w-full">
          <Edit className="w-4 h-4 mr-2" /> Yılları Yönet
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Yolculuğumuz Yönetimi</DialogTitle>
        </VisuallyHidden>
        <DialogHeader>
          <div className="relative w-full h-10 rounded flex items-center justify-center">
            <div className="absolute inset-0 rounded bg-ayzek-gradient" />
            <span className="relative z-10 text-white text-base md:text-lg font-display font-semibold tracking-wide">
              Yolculuğumuz — Yıl ve Kişiler
            </span>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <Label>Yıl Seç</Label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full h-10 rounded-md border bg-background/50 px-3">
              {yearsList.map((y) => (<option key={y} value={y}>{y}</option>))}
            </select>
          </div>

          <Dialog open={addOpen} onOpenChange={openAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent mt-6">Kişi Ekle</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/20 max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedYear} Yılı — Yeni Kişi</DialogTitle>
                <DialogDescription>Yeni kişinin bilgilerini girin</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div><Label>İsim Soyisim *</Label><Input value={newPerson.name} onChange={(e) => setNewPerson(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Görevi *</Label><Input value={newPerson.role} onChange={(e) => setNewPerson(p => ({ ...p, role: e.target.value }))} /></div>
                <div><Label>Açıklama (Kısa Söz) *</Label><Textarea value={newPerson.description} onChange={(e) => setNewPerson(p => ({ ...p, description: e.target.value }))} rows={3} /></div>

                <div>
                  <Label>Resim (opsiyonel)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="URL girin veya dosya seçin" value={newPerson.photo_url} onChange={(e) => setNewPerson(p => ({ ...p, photo_url: e.target.value }))} className="flex-1" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setJourneyFile(e.target.files[0])
                          setNewPerson(p => ({ ...p, photo_url: e.target.files![0].name }))
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {journeyFile && <p className="text-xs text-green-600 mt-1">Seçili: {journeyFile.name}</p>}
                  {!journeyFile && newPerson.photo_url && <img src={normalizeImageUrl(newPerson.photo_url)} alt="Önizleme" className="mt-2 h-24 w-auto rounded object-cover border border-border/30" />}
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
        ) : (
          <div className="space-y-6">
            {yearsList.filter(y => journeyPeople[y] && journeyPeople[y].length > 0).map((year) => (
              <div key={year} className="space-y-3">
                <h3 className="text-lg font-semibold">{year}</h3>
                <div className="grid gap-3">
                  {journeyPeople[year].map((person) => (
                    <Card key={person.id} className="p-4">
                      <div className="flex items-start gap-4">
                        {person.photo_url ? (
                          <img src={normalizeImageUrl(person.photo_url)} alt={person.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <UsersIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{person.name}</h4>
                          <p className="text-sm text-muted-foreground">{person.role}</p>
                          <p className="text-sm mt-1 break-words whitespace-pre-wrap">{person.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(person)}>Düzenle</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(person.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(journeyPeople).length === 0 && (
              <div className="text-sm text-muted-foreground px-2 py-6 text-center">Henüz kayıt yok. Yıl seçip kişi ekleyin.</div>
            )}
          </div>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-card border-primary/20 max-w-lg">
            <DialogHeader><DialogTitle>Kişiyi Düzenle</DialogTitle></DialogHeader>
            {editPerson && (
              <div className="space-y-3">
                <div><Label>İsim Soyisim</Label><Input value={editPerson.name} onChange={(e) => setEditPerson({ ...editPerson, name: e.target.value })} /></div>
                <div><Label>Görevi</Label><Input value={editPerson.role} onChange={(e) => setEditPerson({ ...editPerson, role: e.target.value })} /></div>
                <div><Label>Açıklama</Label><Textarea value={editPerson.description} onChange={(e) => setEditPerson({ ...editPerson, description: e.target.value })} /></div>

                <div>
                  <Label>Resim URL</Label>
                  <div className="flex gap-2">
                    <Input value={editPerson.photo_url ?? ""} onChange={(e) => setEditPerson({ ...editPerson, photo_url: e.target.value })} className="flex-1" placeholder="URL girin veya dosya seçin" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setJourneyFile(e.target.files[0])
                          setEditPerson({ ...editPerson, photo_url: e.target.files[0].name })
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {journeyFile && <p className="text-xs text-green-600 mt-1">Yeni dosya seçildi: {journeyFile.name}</p>}
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