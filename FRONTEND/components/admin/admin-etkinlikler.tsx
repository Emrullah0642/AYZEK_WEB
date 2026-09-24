"use client";

import { useState, useEffect, useRef } from "react";
import { api, API_BASE } from "@/lib/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar as LucideCalendar, Clock, Trash2, Plus, Upload, Eye, CheckCircle, XCircle, Lightbulb, Pencil } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- TİP TANIMLARI ---

// Backend'den gelen ham veri formatı
interface BackendEvent {
  id: number;
  title: string;
  description?: string;
  cover_image_url?: string; // Backend genelde bu ismi kullanır
  image_url?: string;       // Yedek olarak
  start_at: string;         // ISO string
  location: string;
  registered?: number;      // Katılımcı sayısı
  capacity: number;         // Kapasite
  tags?: string;            // Virgülle ayrılmış string
  category?: string;
  whatsapp_link?: string;
}

// Frontend'de kullandığımız format
export interface EventItem {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  location: string;
  attendees: number;
  max_attendees: number;
  tags: string[];
  category: string;
  registration_link: string;
}

export interface EventSuggestion {
  id: number;
  title: string;
  description: string;
  contact: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  created_at: string;
}

// --- YARDIMCI FONKSİYONLAR ---

const normalizeImageUrl = (v: string | null | undefined) => {
  const s = (v || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const path = s.startsWith("/") ? s : `/${s}`;
  if (path.startsWith("/public/") || path.startsWith("/uploads/")) return `${API_BASE}${path}`;

  // Fallback: Backend public/uploads
  return `${API_BASE}/public/uploads${path}`;
};

// Backend verisini Frontend formatına çeviren fonksiyon
const mapBackendToFrontend = (ev: BackendEvent): EventItem => {
  const startDate = new Date(ev.start_at);
  const isValidDate = !isNaN(startDate.getTime());

  return {
    id: ev.id,
    title: ev.title,
    description: ev.description,
    image_url: ev.cover_image_url || ev.image_url,
    // Yerel (tarayıcı) tarih bileşenlerinden oluşturulur — toISOString() burada kullanılmaz,
    // çünkü UTC'ye çevirirken gece yarısına yakın saatlerde günü bir öne/geriye kaydırıyordu.
    date: isValidDate
      ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-${String(startDate.getDate()).padStart(2, "0")}`
      : "",
    time: isValidDate ? startDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "",
    location: ev.location,
    attendees: ev.registered ?? 0,
    max_attendees: ev.capacity,
    tags: ev.tags ? ev.tags.split(",").map(t => t.trim()).filter(t => t) : [],
    category: ev.category || "",
    registration_link: ev.whatsapp_link || "",
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-500";
    case "accepted": return "bg-green-500";
    case "rejected": return "bg-red-500";
    case "reviewed": return "bg-blue-500";
    default: return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending": return "Beklemede";
    case "accepted": return "Onaylandı";
    case "rejected": return "Reddedildi";
    case "reviewed": return "İncelendi";
    default: return status;
  }
};

const toTurkishDate = (isoDate: string) => {
  if (!isoDate) return "-";
  try {
    return format(new Date(isoDate), "dd.MM.yyyy", { locale: tr });
  } catch {
    return isoDate;
  }
};

export default function EventsTab({ onNotify }: { onNotify: (msg: string) => void }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [maxAttendees, setMaxAttendees] = useState(60);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [whatsappLink, setWhatsappLink] = useState(""); // Backend destekliyorsa eklenir

  // Aksiyon State
  const [selectedSuggestion, setSelectedSuggestion] = useState<EventSuggestion | null>(null);
  const [isSuggestionDetailOpen, setIsSuggestionDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'event' | 'suggestion', id: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Etkinlikleri Çek ve Dönüştür
      const eventsRes = await api.get<BackendEvent[]>("/events");
      const formattedEvents = eventsRes.data.map(mapBackendToFrontend);
      setEvents(formattedEvents);

      // 2. Önerileri Çek
      try {
        const suggestionsRes = await api.get<EventSuggestion[]>("/event-suggestions");
        setSuggestions(suggestionsRes.data);
      } catch (err) {
        console.warn("Öneriler çekilemedi, endpoint henüz hazır olmayabilir:", err);
      }

    } catch (e) {
      console.error("Veri çekme hatası:", e);
      // onNotify("Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImage(file.name);
    }
  };

  // --- EKLEME / GÜNCELLEME İŞLEMİ ---
  const handleSubmitEvent = async () => {
    if (!title || !description || !date || !time || !location) {
      alert("Lütfen zorunlu alanları doldurun.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date); // Backend router bunu bekliyor
      formData.append("time", time); // Backend router bunu bekliyor
      formData.append("location", location);
      formData.append("max_attendees", String(maxAttendees));
      formData.append("category", category);
      formData.append("tags", tags);
      if (whatsappLink) formData.append("registration_link", whatsappLink);

      if (imageFile) {
        formData.append("file", imageFile);
      } else if (image) {
        formData.append("image_url", normalizeImageUrl(image));
      }

      if (editingEventId) {
        const { data } = await api.put<BackendEvent>(`/events/${editingEventId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const updatedEvent = mapBackendToFrontend(data);
        setEvents((prev) => prev.map((e) => (e.id === editingEventId ? updatedEvent : e)));
        onNotify("Etkinlik başarıyla güncellendi.");
      } else {
        const { data } = await api.post<BackendEvent>("/events", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newEvent = mapBackendToFrontend(data);
        setEvents((prev) => [newEvent, ...prev]);
        onNotify("Etkinlik başarıyla oluşturuldu.");
      }

      resetForm();
      setIsDialogOpen(false);

    } catch (e) {
      console.error("Etkinlik kaydetme hatası:", e);
      onNotify(editingEventId ? "Etkinlik güncellenirken bir hata oluştu." : "Etkinlik eklenirken bir hata oluştu.");
    }
  };

  const resetForm = () => {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setImage("");
    setImageFile(null);
    setDate("");
    setTime("");
    setLocation("");
    setMaxAttendees(60);
    setCategory("");
    setTags("");
    setWhatsappLink("");
  };

  const openEditDialog = (event: EventItem) => {
    setEditingEventId(event.id);
    setTitle(event.title);
    setDescription(event.description || "");
    setImage(event.image_url || "");
    setImageFile(null);
    setDate(event.date);
    setTime(event.time);
    setLocation(event.location);
    setMaxAttendees(event.max_attendees);
    setCategory(event.category);
    setTags(event.tags.join(", "));
    setWhatsappLink(event.registration_link);
    setIsDialogOpen(true);
  };

  // --- SİLME İŞLEMİ ---
  const handleDeleteClick = (type: 'event' | 'suggestion', id: number) => {
    setItemToDelete({ type, id });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'event') {
        await api.delete(`/events/${itemToDelete.id}`);
        setEvents(prev => prev.filter(e => e.id !== itemToDelete.id));
        onNotify("Etkinlik silindi.");
      } else {
        await api.delete(`/event-suggestions/${itemToDelete.id}`);
        setSuggestions(prev => prev.filter(s => s.id !== itemToDelete.id));
        onNotify("Öneri silindi.");
      }
    } catch (e) {
      console.error("Silme hatası:", e);
      onNotify("Silme işlemi başarısız.");
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSuggestionAction = async (id: number, action: "approve" | "reject") => {
    // Backend entegrasyonu buraya gelecek
    onNotify(`Öneri ${action === "approve" ? "onaylandı" : "reddedildi"}`);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <LucideCalendar className="w-4 h-4" />
            Etkinlikler
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Etkinlik Önerileri
            {suggestions.filter(s => s.status === 'pending').length > 0 && (
              <Badge className="ml-2 bg-orange-500 text-white">
                {suggestions.filter(s => s.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* --- ETKİNLİKLER TAB --- */}
        <TabsContent value="events" className="space-y-4">
          <Card className="bg-card/50 border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-2xl">Etkinlik Yönetimi</CardTitle>
                <CardDescription className="mt-2">Topluluk etkinliklerini oluşturun ve yönetin</CardDescription>
              </div>
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                    onClick={() => resetForm()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Etkinlik
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEventId ? "Etkinliği Düzenle" : "Yeni Etkinlik Ekle"}</DialogTitle>
                    <DialogDescription>
                      {editingEventId ? "Etkinlik bilgilerini güncelleyin" : "Topluluk için yeni bir etkinlik oluşturun"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Etkinlik Başlığı *</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: AI Workshop 2024" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Etkinlik Açıklaması *</Label>
                      <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detaylar..." rows={4} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Etkinlik Görseli</Label>
                      <div className="flex gap-2">
                        <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="URL girin veya dosya seçin" className="flex-1" />
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="border-primary/20">
                          <Upload className="w-4 h-4 mr-2" /> Dosya Seç
                        </Button>
                      </div>
                      {imageFile && <p className="text-sm text-muted-foreground">Seçili: {imageFile.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Seminer, Workshop..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Tarih *</Label>
                        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Saat *</Label>
                        <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Konum *</Label>
                      <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Örn: İTÜ Merkez Kampüs" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxAttendees">Maksimum Katılımcı</Label>
                      <Input id="maxAttendees" type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(Number(e.target.value))} min="1" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Etiketler (Virgülle ayırın)</Label>
                      <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="AI, Machine Learning, Python" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsappLink">Başvuru linki</Label>
                      <Input
                        id="whatsappLink"
                        value={whatsappLink}
                        onChange={(e) => setWhatsappLink(e.target.value)}
                        placeholder="Örn: WhatsApp grubu, form veya kayıt linki"
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
                    <Button onClick={handleSubmitEvent} className="bg-gradient-to-r from-primary to-accent">
                      {editingEventId ? (
                        <><Pencil className="w-4 h-4 mr-2" /> Değişiklikleri Kaydet</>
                      ) : (
                        <><Plus className="w-4 h-4 mr-2" /> Etkinlik Ekle</>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="text-center py-10 text-muted-foreground">Yükleniyor...</div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <LucideCalendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz etkinlik bulunmuyor</p>
                </div>
              ) : (
                <div className="rounded-md border border-primary/10">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-muted/50">
                        <TableHead className="font-semibold">Başlık</TableHead>
                        <TableHead className="font-semibold">Tarih & Saat</TableHead>
                        <TableHead className="font-semibold">Konum</TableHead>
                        <TableHead className="font-semibold">Katılım</TableHead>
                        <TableHead className="text-right font-semibold">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {event.image_url && <img src={normalizeImageUrl(event.image_url)} alt="" className="w-8 h-8 rounded object-cover" />}
                              {event.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm">
                                <LucideCalendar className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{toTurkishDate(event.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{event.location}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">
                              {event.attendees || 0}/{event.max_attendees}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(event)}
                              className="text-primary hover:bg-primary/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick('event', event.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ÖNERİLER TAB --- */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card className="bg-card/50 border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-orange-500" />
                Etkinlik Önerileri
              </CardTitle>
              <CardDescription>Kullanıcılar tarafından gönderilen öneriler</CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz etkinlik önerisi bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-start justify-between p-4 border border-primary/10 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                          <Badge className={`${getStatusColor(suggestion.status)} text-white border-0`}>
                            {getStatusText(suggestion.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>📧 {suggestion.contact}</span>
                          <span>📅 {toTurkishDate(suggestion.created_at.split('T')[0])}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedSuggestion(suggestion); setIsSuggestionDetailOpen(true); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteClick('suggestion', suggestion.id)} className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Öneri Detay & Silme Dialogları */}
      <Dialog open={isSuggestionDetailOpen} onOpenChange={setIsSuggestionDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedSuggestion?.title}</DialogTitle></DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-4">
              <div><Label>Açıklama</Label><p className="text-sm mt-1 text-muted-foreground">{selectedSuggestion.description}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>İletişim</Label><p className="text-sm mt-1">{selectedSuggestion.contact}</p></div>
                <div><Label>Durum</Label><div className="mt-1"><Badge className={getStatusColor(selectedSuggestion.status)}>{getStatusText(selectedSuggestion.status)}</Badge></div></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Silme Onayı</DialogTitle>
            <DialogDescription>Bu kaydı silmek istediğinizden emin misiniz?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={confirmDelete}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}