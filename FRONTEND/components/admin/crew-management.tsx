"use client"

import { useState, useEffect, useCallback } from "react"
// !!! DEĞİŞİKLİK BURADA: axios yerine bizim ayarlı api'yi çağırıyoruz !!!
import { api, API_BASE } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon, Trash2, Edit, Users } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

// ESKİ API TANIMINI SİLDİK. 
// Artık lib/api.ts içindeki 'withCredentials: true' ayarlı api'yi kullanıyoruz.

const normalizeImageUrl = (v: string | null) => {
  const s = (v || "").trim()
  if (!s) return ""
  if (s.startsWith("http://") || s.startsWith("https://")) return s
  const path = s.startsWith("/") ? s : `/${s}`
  if (path.startsWith("/public/") || path.startsWith("/uploads/")) return `${API_BASE}${path}`

  // Fallback
  return `${API_BASE}/public/uploads${path}`
}

type CrewMemberOut = {
  id: number
  name: string
  role: string
  description: string | null
  category: string
  photo_url: string | null
  linkedin_url: string | null
  github_url: string | null
  order_index: number
}

const CREW_CATEGORIES = [
  "Başkan ve Yardımcılar",
  "Sosyal Medya ve Tasarım",
  "Etkinlik ve Organizasyon",
  "Eğitim ve Proje",
]

const OTHER_CATEGORY = "Diğer"

const INITIAL_CREW = { name: "", role: "", description: "", photo_url: "", linkedin_url: "", github_url: "" }

export function CrewManagement({ onNotify }: { onNotify: (msg: string) => void }) {
  const [crewMembers, setCrewMembers] = useState<Record<string, CrewMemberOut[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState<string>("Başkan ve Yardımcılar")
  const [customCategory, setCustomCategory] = useState("")
  const effectiveCategory = selectedCat === OTHER_CATEGORY ? customCategory.trim() : selectedCat
  const [isOpen, setIsOpen] = useState(false)

  // Ekleme State'leri
  const [addOpen, setAddOpen] = useState(false)
  const initialNewCrewState = INITIAL_CREW
  const [newCrew, setNewCrew] = useState(initialNewCrewState)

  // Düzenleme State'leri
  const [editOpen, setEditOpen] = useState(false)
  const [editCrew, setEditCrew] = useState<CrewMemberOut | null>(null)

  // Ortak Dosya State'i
  const [crewFile, setCrewFile] = useState<File | null>(null)

  const fetchCrewMembers = useCallback(async () => {
    setLoading(true)
    try {
      // api.get (Cookie otomatik gider)
      const { data } = await api.get<Record<string, CrewMemberOut[]>>("/crew/")
      setCrewMembers(data)
    } catch (e) {
      console.error("Ekip üyeleri getirilirken hata:", e)
      onNotify("Ekip üyeleri yüklenemedi")
    } finally {
      setLoading(false)
    }
  }, [onNotify])

  useEffect(() => {
    fetchCrewMembers()
  }, [fetchCrewMembers])

  // --- YENİ EKLEME FONKSİYONU ---
  const handleAdd = async () => {
    if (!newCrew.name || !newCrew.role) {
      onNotify("İsim ve Görev alanları zorunludur")
      return
    }
    if (!effectiveCategory) {
      onNotify("Kategori adını yazın")
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", newCrew.name)
      formData.append("role", newCrew.role)
      formData.append("category", effectiveCategory)
      formData.append("linkedin_url", newCrew.linkedin_url)
      formData.append("github_url", newCrew.github_url)

      // Dosya varsa dosyayı, yoksa manuel linki ekle
      if (crewFile) {
        formData.append("file", crewFile)
      } else if (newCrew.photo_url) {
        formData.append("photo_url", normalizeImageUrl(newCrew.photo_url))
      }

      // api.post (Cookie otomatik gider)
      const { data } = await api.post<CrewMemberOut>("/crew/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setCrewMembers(prev => {
        const categoryData = prev[data.category] ? [...prev[data.category], data] : [data]
        return { ...prev, [data.category]: categoryData }
      })

      // Temizlik
      setNewCrew(initialNewCrewState)
      setCrewFile(null)
      setAddOpen(false)
      onNotify(`"${data.name}" kişisi ${data.category} kategorisine eklendi`)
    } catch (e) {
      console.error("Ekip üyesi eklenirken hata:", e)
      onNotify("Ekip üyesi eklenemedi")
    }
  }

  // --- YENİ GÜNCELLEME FONKSİYONU ---
  const handleUpdate = async () => {
    if (!editCrew) return
    try {
      const formData = new FormData()
      formData.append("name", editCrew.name)
      formData.append("role", editCrew.role)
      formData.append("category", editCrew.category)
      formData.append("linkedin_url", editCrew.linkedin_url || "")
      formData.append("github_url", editCrew.github_url || "")
      formData.append("order_index", String(editCrew.order_index))

      // 1. Yeni dosya seçildiyse onu ekle
      if (crewFile) {
        formData.append("file", crewFile)
      }
      // 2. Dosya yoksa mevcut URL'yi koru
      else if (editCrew.photo_url) {
        formData.append("photo_url", normalizeImageUrl(editCrew.photo_url))
      }

      // api.put (Cookie otomatik gider)
      const { data } = await api.put<CrewMemberOut>(`/crew/${editCrew.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setCrewMembers(prev => {
        const cp = { ...prev }
        cp[data.category] = (cp[data.category] || []).map(x => (x.id === data.id ? data : x))
        return cp
      })

      // Temizlik
      setCrewFile(null)
      setEditOpen(false)
      onNotify(`"${data.name}" güncellendi`)
    } catch (e) {
      console.error("Crew güncelle hata:", e)
      onNotify("Güncelleme başarısız")
    }
  }

  const handleDelete = async (memberId: number) => {
    if (!confirm(`#${memberId} ID'li üyeyi silmek istediğinizden emin misiniz?`)) return
    try {
      // api.delete (Cookie otomatik gider)
      await api.delete(`/crew/${memberId}`)
      const updatedCrewMembers: Record<string, CrewMemberOut[]> = {}
      for (const category in crewMembers) {
        updatedCrewMembers[category] = crewMembers[category].filter(p => p.id !== memberId)
      }
      setCrewMembers(updatedCrewMembers)
      onNotify("Üye silindi")
    } catch (e) {
      console.error("Ekip üyesi silinirken hata:", e)
      onNotify("Üye silinemedi")
    }
  }

  const handleManageOpenChange = (open: boolean) => {
    if (!open) {
      setAddOpen(false)
      setEditOpen(false)
      setNewCrew(INITIAL_CREW)
      setCrewFile(null)
      setEditCrew(null)
    }
    setIsOpen(open)
  }

  // Dialog açılışlarında dosya state'ini temizle
  const openAddDialog = (open: boolean) => {
    if (open) setCrewFile(null)
    setAddOpen(open)
  }

  const openEditDialog = (member: CrewMemberOut) => {
    setEditCrew(member)
    setCrewFile(null)
    setEditOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleManageOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-ayzek-gradient hover:opacity-90 w-full">
          <Edit className="w-4 h-4 mr-2" /> Ekibi Yönet
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Ekip Yönetimi</DialogTitle>
        </VisuallyHidden>
        <DialogHeader>
          <div className="relative w-full h-10 rounded flex items-center justify-center">
            <div className="absolute inset-0 rounded bg-ayzek-gradient" />
            <span className="relative z-10 text-white text-base md:text-lg font-display font-semibold tracking-wide">
              Ekibimiz — Kategori Yönetimi
            </span>
          </div>
        </DialogHeader>

        <div className="flex items-start gap-4 mb-4">
          <div className="flex-1 space-y-2">
            <div>
              <Label>Kategori</Label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full h-10 rounded-md border bg-background/50 px-3"
              >
                {CREW_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                <option value={OTHER_CATEGORY}>{OTHER_CATEGORY}</option>
              </select>
            </div>
            {selectedCat === OTHER_CATEGORY && (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Kategori adını yaz"
              />
            )}
          </div>

          <Dialog open={addOpen} onOpenChange={openAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent mt-6" disabled={!effectiveCategory}>Üye Ekle</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/20 max-w-lg">
              <DialogHeader>
                <DialogTitle>{effectiveCategory || "Kategori seç"} — Yeni Üye</DialogTitle>
                <DialogDescription>Yeni üyenin bilgilerini girin</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div><Label>İsim Soyisim *</Label><Input value={newCrew.name} onChange={(e) => setNewCrew(p => ({ ...p, name: e.target.value }))} /></div>
                <div><Label>Görevi *</Label><Input value={newCrew.role} onChange={(e) => setNewCrew(p => ({ ...p, role: e.target.value }))} /></div>

                <div>
                  <Label>Fotoğraf (opsiyonel)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="URL girin veya dosya seçin" value={newCrew.photo_url} onChange={(e) => setNewCrew(p => ({ ...p, photo_url: e.target.value }))} className="flex-1" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCrewFile(e.target.files[0])
                          setNewCrew(p => ({ ...p, photo_url: e.target.files![0].name }))
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {crewFile && <p className="text-xs text-green-600 mt-1">Seçili: {crewFile.name}</p>}
                  {!crewFile && newCrew.photo_url && <img src={normalizeImageUrl(newCrew.photo_url)} alt="Önizleme" className="mt-2 h-24 w-auto rounded object-cover border border-border/30" />}
                </div>

                <div><Label>LinkedIn URL</Label><Input value={newCrew.linkedin_url} onChange={(e) => setNewCrew(p => ({ ...p, linkedin_url: e.target.value }))} /></div>
                <div><Label>GitHub URL</Label><Input value={newCrew.github_url} onChange={(e) => setNewCrew(p => ({ ...p, github_url: e.target.value }))} /></div>
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
            {Object.keys(crewMembers).filter(cat => crewMembers[cat]?.length > 0).map((category) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold">{category}</h3>
                <div className="grid gap-3">
                  {crewMembers[category].map((member) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-start gap-4">
                        {member.photo_url ? (
                          <img src={normalizeImageUrl(member.photo_url)} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Users className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          {member.description && <p className="text-sm mt-1 break-words whitespace-pre-wrap">{member.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(member)}>Düzenle</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(member.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(crewMembers).length === 0 && (
              <div className="text-sm text-muted-foreground px-2 py-6 text-center">Henüz ekip üyesi yok. Kategori seçip üye ekleyin.</div>
            )}
          </div>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-card border-primary/20 max-w-lg">
            <DialogHeader><DialogTitle>Üyeyi Düzenle</DialogTitle></DialogHeader>
            {editCrew && (
              <div className="space-y-3">
                <div><Label>İsim Soyisim</Label><Input value={editCrew.name} onChange={(e) => setEditCrew({ ...editCrew, name: e.target.value })} /></div>
                <div><Label>Görevi</Label><Input value={editCrew.role} onChange={(e) => setEditCrew({ ...editCrew, role: e.target.value })} /></div>

                <div>
                  <Label>Fotoğraf URL</Label>
                  <div className="flex gap-2">
                    <Input value={editCrew.photo_url ?? ""} onChange={(e) => setEditCrew({ ...editCrew, photo_url: e.target.value })} className="flex-1" placeholder="URL girin veya dosya seçin" />
                    <div className="relative">
                      <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCrewFile(e.target.files[0])
                          setEditCrew({ ...editCrew, photo_url: e.target.files[0].name })
                        }
                      }} />
                      <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                        <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                      </Button>
                    </div>
                  </div>
                  {crewFile && <p className="text-xs text-green-600 mt-1">Yeni dosya seçildi: {crewFile.name}</p>}
                </div>

                <div><Label>LinkedIn URL</Label><Input value={editCrew.linkedin_url ?? ""} onChange={(e) => setEditCrew({ ...editCrew, linkedin_url: e.target.value })} /></div>
                <div><Label>GitHub URL</Label><Input value={editCrew.github_url ?? ""} onChange={(e) => setEditCrew({ ...editCrew, github_url: e.target.value })} /></div>
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