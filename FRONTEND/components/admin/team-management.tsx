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
import { Checkbox } from "@/components/ui/checkbox"
import { ImageIcon, Trash2, Star, Edit } from "lucide-react"
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

type TeamMemberOut = {
  id: number
  name: string
  role: string
  linkedin_url: string | null
}

type TeamOut = {
  id: number
  name: string
  project_name: string
  category: string
  description: string
  photo_url: string | null
  is_featured: boolean
  members: TeamMemberOut[]
}

type NewTeamMember = {
  name: string
  role: string
  linkedin_url: string
}

const INITIAL_TEAM = {
  name: "",
  project_name: "",
  category: "",
  description: "",
  photo_url: "",
  is_featured: false,
  members: [{ name: "", role: "", linkedin_url: "" }],
}

export function TeamManagement({ onNotify }: { onNotify: (msg: string) => void }) {
  const [teams, setTeams] = useState<TeamOut[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  // Ekleme State'leri
  const [addOpen, setAddOpen] = useState(false)
  const initialNewTeamState = INITIAL_TEAM
  const [newTeam, setNewTeam] = useState(initialNewTeamState)

  // Düzenleme State'leri
  const [editOpen, setEditOpen] = useState(false)
  const [editTeam, setEditTeam] = useState<TeamOut | null>(null)

  // Ortak Dosya State'i
  const [teamFile, setTeamFile] = useState<File | null>(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    setLoading(true)
    try {
      // api.get (Cookie otomatik gider)
      const { data } = await api.get<TeamOut[]>("/teams")
      setTeams(data)
    } catch (e) {
      console.error("Takımlar getirilirken hata:", e)
      onNotify("Takımlar yüklenemedi")
    } finally {
      setLoading(false)
    }
  }

  // Üye Ekleme/Çıkarma Helperları (State üzerinde)
  const addTeamMemberRow = () =>
    setNewTeam((p) => ({ ...p, members: [...p.members, { name: "", role: "", linkedin_url: "" }] }))

  const updateTeamMemberField = (idx: number, key: keyof NewTeamMember, value: string) =>
    setNewTeam((p) => {
      const membersCopy = [...p.members]
      membersCopy[idx] = { ...membersCopy[idx], [key]: value }
      return { ...p, members: membersCopy }
    })

  const removeTeamMemberRow = (idx: number) =>
    setNewTeam((p) => ({ ...p, members: p.members.filter((_, i) => i !== idx) }))

  // --- YENİ EKLEME FONKSİYONU ---
  const handleAdd = async () => {
    if (!newTeam.name || !newTeam.project_name || !newTeam.category || !newTeam.description) {
      onNotify("Lütfen tüm zorunlu alanları doldurun")
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", newTeam.name)
      formData.append("project_name", newTeam.project_name)
      formData.append("category", newTeam.category)
      formData.append("description", newTeam.description)
      formData.append("is_featured", String(newTeam.is_featured))

      // Üyeleri JSON string olarak ekle
      const validMembers = newTeam.members.filter(m => m.name && m.role).map(m => ({
        name: m.name,
        role: m.role,
        linkedin_url: m.linkedin_url || null
      }))
      formData.append("members", JSON.stringify(validMembers))

      // Dosya varsa dosyayı, yoksa manuel linki ekle
      if (teamFile) {
        formData.append("file", teamFile)
      } else if (newTeam.photo_url) {
        formData.append("photo_url", normalizeImageUrl(newTeam.photo_url))
      }

      // api.post (Cookie otomatik gider)
      const { data } = await api.post<TeamOut>("/teams", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setTeams((prev) => [data, ...prev])
      setNewTeam(initialNewTeamState)
      setTeamFile(null)
      setAddOpen(false)
      onNotify(`"${data.name}" takımı eklendi`)
    } catch (e) {
      console.error("Takım ekleme hatası:", e)
      onNotify("Takım eklenemedi")
    }
  }

  // --- YENİ GÜNCELLEME FONKSİYONU ---
  const handleUpdate = async () => {
    if (!editTeam) return
    try {
      const formData = new FormData()
      formData.append("name", editTeam.name)
      formData.append("project_name", editTeam.project_name)
      formData.append("category", editTeam.category)
      formData.append("description", editTeam.description)
      formData.append("is_featured", String(editTeam.is_featured))

      // Üyeleri JSON string olarak ekle
      const validMembers = (editTeam.members || []).map((m: any) => ({
        name: m.name,
        role: m.role,
        linkedin_url: m.linkedin_url || null
      }))
      formData.append("members", JSON.stringify(validMembers))

      // 1. Yeni dosya seçildiyse onu ekle
      if (teamFile) {
        formData.append("file", teamFile)
      }
      // 2. Dosya yoksa mevcut URL'yi koru
      else if (editTeam.photo_url) {
        formData.append("photo_url", normalizeImageUrl(editTeam.photo_url))
      }

      // api.put (Cookie otomatik gider)
      const { data } = await api.put<TeamOut>(`/teams/${editTeam.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setTeams(prev => prev.map(x => (x.id === data.id ? data : x)))
      setTeamFile(null)
      setEditOpen(false)
      onNotify(`"${data.name}" güncellendi`)
    } catch (e) {
      console.error("Takım güncelle hata:", e)
      onNotify("Güncelleme başarısız")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(`#${id} ID'li takımı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return
    try {
      // api.delete (Cookie otomatik gider)
      await api.delete(`/teams/${id}`)
      setTeams((prev) => prev.filter((t) => t.id !== id))
      onNotify("Takım silindi")
    } catch (e) {
      console.error("Takım silme hatası:", e)
      onNotify("Takım silinemedi")
    }
  }

  const handleManageOpenChange = (open: boolean) => {
    if (!open) {
      setAddOpen(false)
      setEditOpen(false)
      setNewTeam(INITIAL_TEAM)
      setTeamFile(null)
      setEditTeam(null)
    }
    setIsOpen(open)
  }

  // Dialog açılışlarında dosya state'ini temizle
  const openAddDialog = (open: boolean) => {
    if (open) setTeamFile(null)
    setAddOpen(open)
  }

  const openEditDialog = (team: TeamOut) => {
    setEditTeam(team)
    setTeamFile(null)
    setEditOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleManageOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-ayzek-gradient hover:opacity-90 w-full">
          <Edit className="w-4 h-4 mr-2" /> Takımları Yönet
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Takım Yönetimi</DialogTitle>
        </VisuallyHidden>
        <DialogHeader>
          <div className="relative w-full h-10 rounded flex items-center justify-center">
            <div className="absolute inset-0 rounded bg-ayzek-gradient" />
            <span className="relative z-10 text-white text-base md:text-lg font-display font-semibold tracking-wide">
              Takımlar (Yarışma Takımları)
            </span>
          </div>
        </DialogHeader>

        <div className="mb-4">
          <Dialog open={addOpen} onOpenChange={openAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent">Yeni Takım Ekle</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/20 max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Takım</DialogTitle>
                <DialogDescription>Yeni bir takım ve üyelerini ekleyin</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Takım Adı *</Label><Input value={newTeam.name} onChange={(e) => setNewTeam((p) => ({ ...p, name: e.target.value }))} /></div>
                  <div><Label>Proje Adı *</Label><Input value={newTeam.project_name} onChange={(e) => setNewTeam((p) => ({ ...p, project_name: e.target.value }))} /></div>
                </div>
                <div><Label>Açıklama *</Label><Textarea value={newTeam.description} onChange={(e) => setNewTeam((p) => ({ ...p, description: e.target.value }))} rows={3} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Kategori *</Label><Input value={newTeam.category} onChange={(e) => setNewTeam((p) => ({ ...p, category: e.target.value }))} /></div>
                  <div>
                    <Label>Takım Fotoğrafı (opsiyonel)</Label>
                    <div className="flex gap-2">
                      <Input value={newTeam.photo_url} onChange={(e) => setNewTeam((p) => ({ ...p, photo_url: e.target.value }))} className="flex-1" placeholder="URL girin veya dosya seçin" />
                      <div className="relative">
                        <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setTeamFile(e.target.files[0])
                            setNewTeam((p) => ({ ...p, photo_url: e.target.files![0].name }))
                          }
                        }} />
                        <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                          <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                        </Button>
                      </div>
                    </div>
                    {teamFile && <p className="text-xs text-green-600 mt-1">Seçili: {teamFile.name}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="teamFeatured" checked={newTeam.is_featured} onCheckedChange={(c) => setNewTeam((p) => ({ ...p, is_featured: !!c }))} />
                  <Label htmlFor="teamFeatured">Anasayfada öne çıkar</Label>
                </div>

                {/* ÜYE EKLEME KISMI */}
                <div className="space-y-2">
                  <Label>Takım Üyeleri</Label>
                  {newTeam.members.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2">
                      <Input placeholder="Ad Soyad" value={m.name} onChange={(e) => updateTeamMemberField(idx, "name", e.target.value)} />
                      <Input placeholder="Rol" value={m.role} onChange={(e) => updateTeamMemberField(idx, "role", e.target.value)} />
                      <Input placeholder="LinkedIn URL" value={m.linkedin_url} onChange={(e) => updateTeamMemberField(idx, "linkedin_url", e.target.value)} />
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeTeamMemberRow(idx)}>Sil</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addTeamMemberRow}>+ Üye Ekle</Button>
                </div>

                <div className="flex gap-2 pt-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.id} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  {team.photo_url ? (
                    <img src={normalizeImageUrl(team.photo_url)} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                  {team.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{team.name}</h3>
                  <p className="text-xs text-muted-foreground">{team.project_name}</p>
                  <p className="text-sm mt-2 break-words whitespace-pre-wrap">{team.description}</p>
                  <div className="flex justify-end mt-3 gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(team)}>Düzenle</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(team.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!teams.length && <div className="text-sm text-muted-foreground px-2 py-6 text-center col-span-full">Henüz takım yok.</div>}
          </div>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-card border-primary/20 max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Takımı Düzenle</DialogTitle></DialogHeader>
            {editTeam && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Takım Adı</Label><Input value={editTeam.name} onChange={(e) => setEditTeam({ ...editTeam, name: e.target.value })} /></div>
                  <div><Label>Proje Adı</Label><Input value={editTeam.project_name} onChange={(e) => setEditTeam({ ...editTeam, project_name: e.target.value })} /></div>
                </div>
                <div><Label>Açıklama</Label><Textarea value={editTeam.description} onChange={(e) => setEditTeam({ ...editTeam, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Kategori</Label><Input value={editTeam.category} onChange={(e) => setEditTeam({ ...editTeam, category: e.target.value })} /></div>
                  <div>
                    <Label>Foto URL</Label>
                    <div className="flex gap-2">
                      <Input value={editTeam.photo_url ?? ""} onChange={(e) => setEditTeam({ ...editTeam, photo_url: e.target.value })} className="flex-1" placeholder="URL girin veya dosya seçin" />
                      <div className="relative">
                        <Input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setTeamFile(e.target.files[0])
                            setEditTeam({ ...editTeam, photo_url: e.target.files[0].name })
                          }
                        }} />
                        <Button type="button" variant="outline" className="border-primary/20 pointer-events-none">
                          <ImageIcon className="w-4 h-4 mr-2" /> Dosya Seç
                        </Button>
                      </div>
                    </div>
                    {teamFile && <p className="text-xs text-green-600 mt-1">Yeni dosya seçildi: {teamFile.name}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="editTeamFeatured" checked={!!editTeam.is_featured} onCheckedChange={(c) => setEditTeam({ ...editTeam, is_featured: !!c })} />
                  <Label htmlFor="editTeamFeatured">Anasayfada öne çıkar</Label>
                </div>

                {/* EDIT MODUNDA ÜYELERİ DÜZENLEME */}
                <div className="space-y-2">
                  <Label>Takım Üyeleri (Düzenlemek için silip yeniden ekleyin)</Label>
                  {(editTeam.members || []).map((m, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2">
                      <Input placeholder="Ad Soyad" value={m.name} onChange={(e) => {
                        const newMembers = [...editTeam.members];
                        newMembers[idx] = { ...newMembers[idx], name: e.target.value };
                        setEditTeam({ ...editTeam, members: newMembers });
                      }} />
                      <Input placeholder="Rol" value={m.role} onChange={(e) => {
                        const newMembers = [...editTeam.members];
                        newMembers[idx] = { ...newMembers[idx], role: e.target.value };
                        setEditTeam({ ...editTeam, members: newMembers });
                      }} />
                      <Input placeholder="LinkedIn" value={m.linkedin_url || ""} onChange={(e) => {
                        const newMembers = [...editTeam.members];
                        newMembers[idx] = { ...newMembers[idx], linkedin_url: e.target.value };
                        setEditTeam({ ...editTeam, members: newMembers });
                      }} />
                      <Button type="button" variant="destructive" size="sm" onClick={() => {
                        const newMembers = editTeam.members.filter((_, i) => i !== idx);
                        setEditTeam({ ...editTeam, members: newMembers });
                      }}>Sil</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    setEditTeam({ ...editTeam, members: [...editTeam.members, { id: 0, name: "", role: "", linkedin_url: "" }] })
                  }}>+ Üye Ekle</Button>
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