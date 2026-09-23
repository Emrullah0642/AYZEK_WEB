// app/events/page.tsx

"use client"

import type React from "react"
import { useState, useEffect } from "react"
// import axios from "axios" // Axios yerine api kullanacağız
import { api, API_BASE } from "@/lib/api" // Merkezi API importu
import { usePathname } from "next/navigation"
import { AdminNavbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, PlusCircle, Loader2, Sparkles, CalendarDays, Users2, MapPinned, Clock3 } from "lucide-react"
import { ScrollAnimation } from "@/components/scroll-animations"
import { EventsCalendar, type Event } from "@/components/events-calendar"
import EventGallery from "@/components/event-gallery"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { SiteFooter } from "@/components/site-footer"
import { KineticHeading } from "@/components/kinetic-heading"
import { CountUp } from "@/components/count-up"

function handleSpotlightMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`)
}

// Resim URL Düzeltici
const normalizeImageUrl = (v: string | null | undefined) => {
    const s = (v || "").trim()
    if (!s) return ""

    // 1. R2 veya harici link kontrolü
    if (s.startsWith("http://") || s.startsWith("https://")) return s

    // 2. Başında slash yoksa ekle
    const path = s.startsWith("/") ? s : `/${s}`

    // 3. Backend'deki dosya kontrolü
    if (path.startsWith("/public/") || path.startsWith("/uploads/")) {
        return `${API_BASE}${path}`
    }

    // 4. Default fallback: Backend public/uploads
    return `${API_BASE}/public/uploads${path}`
}

// Admin paneli bileşeni (Form düzeltmeleriyle)
const AdminPanel = () => {
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        category: "",
        start_at: "",
        location: "",
        cover_image_url: "",
        capacity: 0,
        whatsapp_link: "",
        tags: "",
    })
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setEventData(prevState => ({
            ...prevState,
            [id]: value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            // Backend "Multipart Form Data" ve ayrılmış date/time bekliyor
            const formData = new FormData();
            formData.append("title", eventData.title);
            formData.append("description", eventData.description);
            formData.append("category", eventData.category);
            formData.append("location", eventData.location);
            formData.append("max_attendees", String(eventData.capacity));
            formData.append("tags", eventData.tags);
            if (eventData.cover_image_url) formData.append("image_url", eventData.cover_image_url);

            // Tarih ve Saati ayırıp gönderiyoruz
            if (eventData.start_at) {
                const dateObj = new Date(eventData.start_at);
                const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
                const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }); // HH:MM
                formData.append("date", dateStr);
                formData.append("time", timeStr);
            }

            // api.post kullanıyoruz (axios yerine)
            await api.post("/events", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            toast.success("Etkinlik başarıyla eklendi!")
            setEventData({
                title: "", description: "", category: "", start_at: "", location: "",
                cover_image_url: "", capacity: 0, whatsapp_link: "", tags: "",
            })
        } catch (error) {
            console.error("Etkinlik eklenirken bir hata oluştu:", error)
            toast.error("Etkinlik eklenirken bir hata oluştu.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="container max-w-screen-xl py-12">
                <h1 className="text-3xl font-bold mb-8">Yeni Etkinlik Ekle</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Başlık</Label>
                            <Input id="title" value={eventData.title} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Kategori</Label>
                            <Input id="category" value={eventData.category} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Textarea id="description" value={eventData.description} onChange={handleInputChange} rows={4} required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="start_at">Tarih ve Saat</Label>
                            <Input id="start_at" type="datetime-local" value={eventData.start_at} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Mekan</Label>
                            <Input id="location" value={eventData.location} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="cover_image_url">Kapak Görseli URL</Label>
                            <Input id="cover_image_url" type="url" value={eventData.cover_image_url} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp_link">WhatsApp Grubu Bağlantısı</Label>
                            <Input id="whatsapp_link" type="url" value={eventData.whatsapp_link} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Kapasite</Label>
                            <Input id="capacity" type="number" value={eventData.capacity} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
                            <Input id="tags" value={eventData.tags} onChange={handleInputChange} />
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="bg-ayzek-gradient hover:opacity-90">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Etkinlik Ekleniyor...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Etkinliği Oluştur
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}

// Ana EventsPage bileşeni
export default function EventsPage() {
    const pathname = usePathname()
    const isAdmin = pathname === "/admin/events"

    const [isEventModalOpen, setIsEventModalOpen] = useState(false)
    const [eventForm, setEventForm] = useState({
        title: "",
        description: "",
        contact: "",
    })

    const handleEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Öneri gönderimi için api kullanımı
            await api.post("/event-suggestions", eventForm)
            setIsEventModalOpen(false)
            setEventForm({ title: "", description: "", contact: "" })
            toast.success("Etkinlik öneriniz başarıyla gönderildi!")
        } catch (error) {
            console.error("Event suggestion submission failed:", error)
            toast.error("Etkinlik önerisi gönderilirken bir hata oluştu.")
        }
    }

    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(null)

    useEffect(() => {
        const fetchAllEvents = async () => {
            try {
                setLoading(true)
                // !!! DÜZELTME BURADA: "/events/upcoming" yerine "/events" !!!
                // Böylece geçmiş/gelecek tüm etkinlikleri çekiyoruz.
                const response = await api.get<any[]>("/events")
                // En son eklenen en başta görünsün (ID'ye göre azalan sıralama)
                response.data.sort((a, b) => b.id - a.id)

                const formattedEvents = response.data.map(event => ({
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    type: event.category,
                    date: event.start_at,
                    time: event.start_at,
                    duration: "3 saat",
                    location: event.location,
                    // Resim URL normalizasyonu
                    image: normalizeImageUrl(event.cover_image_url || event.image_url),
                    attendees: event.registered,
                    maxAttendees: event.capacity,
                    registrationLink: event.whatsapp_link,
                    tags: event.tags ? (typeof event.tags === 'string' ? event.tags.split(',') : event.tags) : [],
                }));
                setEvents(formattedEvents)
            } catch (err: any) {
                setError(err)
                console.error("Etkinlikler çekilirken bir hata oluştu:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchAllEvents()
    }, [])

    if (isAdmin) {
        return (
            <div className="min-h-screen bg-transparent relative z-10 theme-transition">
                <AdminNavbar />
                <AdminPanel />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent relative z-10 theme-transition">
            {/* Navigation Header */}
            <AdminNavbar />

            {/* Hero Section */}
            <section className="py-8 sm:py-10 md:py-14 px-3 sm:px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="waves" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M0 10 Q5 5 10 10 T20 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#waves)" />
                    </svg>
                </div>
                <div className="container max-w-screen-xl mx-auto text-center relative z-10">
                    <ScrollAnimation animation="fade-up" className="flex flex-col items-center gap-3 sm:gap-4">
                        <Badge variant="outline" className="rounded-full border-foreground/15 bg-foreground/[0.04] text-[9px] sm:text-[10px] px-2.5 py-0.5 text-muted-foreground">
                            <Sparkles className="w-3 h-3 mr-1.5 text-primary" />
                            TAKVİM
                        </Badge>
                        <KineticHeading
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight"
                            words={[
                                { text: "Topluluk" },
                                { text: "Etkinlikleri", className: "gradient-text" },
                            ]}
                        />
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed">
                            Teknoloji topluluğumuzu ilham vermeye, eğitmeye ve birbirine bağlamaya yönelik tasarlanmış atölyeler,
                            buluşmalar, konferanslar ve hackathonları keşfedin.
                        </p>
                    </ScrollAnimation>
                </div>
            </section>

            {/* Quick Stats */}
            <section className="py-4 sm:py-6 md:py-8 px-3 sm:px-4">
                <div className="container max-w-screen-xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                        {[
                            { value: "15+", label: "Bu Yıl Yapılan Etkinlik", icon: CalendarDays },
                            { value: "3000+", label: "Toplam Katılımcı", icon: Users2 },
                            { value: "15", label: "Mekan Ortağı", icon: MapPinned },
                            { value: "1000+", label: "Atölye Saati", icon: Clock3 },
                        ].map((stat, i) => {
                            const Icon = stat.icon
                            return (
                                <ScrollAnimation key={i} animation="scale-up" delay={i * 100}>
                                    <div
                                        onMouseMove={handleSpotlightMove}
                                        className="spotlight group relative overflow-hidden rounded-2xl border border-foreground/10 bg-card/70 backdrop-blur-sm hover:border-primary/40 hover:shadow-[0_0_30px_-8px_oklch(0.62_0.21_258_/_0.5)] transition-all duration-300 p-4 sm:p-5 md:p-6 h-[130px] sm:h-[150px] md:h-[170px] flex flex-col items-center justify-center text-center"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-0.5 bg-ayzek-gradient scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                        <Icon className="w-5 h-5 text-primary/70 mb-2" />
                                        <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold gradient-text">
                                            <CountUp value={stat.value} />
                                        </div>
                                        <div className="text-muted-foreground text-xs sm:text-sm mt-1">{stat.label}</div>
                                    </div>
                                </ScrollAnimation>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Events Calendar */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4">
                <div className="container max-w-screen-xl mx-auto">
                    <ScrollAnimation animation="fade-up" className="text-center mb-4 sm:mb-5 md:mb-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 gradient-text">Etkinlik Takvimi</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-snug">
                            Geçmiş ve gelecek tüm etkinliklerimize göz atın, türe göre filtreleyin.
                        </p>
                    </ScrollAnimation>
                    <ScrollAnimation animation="fade-up" delay={200}>
                        {loading ? (
                            <p className="text-center text-muted-foreground">Etkinlikler yükleniyor...</p>
                        ) : error ? (
                            <p className="text-center text-destructive">Etkinlikler çekilirken bir hata oluştu.</p>
                        ) : events.length > 0 ? (
                            <EventsCalendar events={events} loading={loading} />
                        ) : (
                            <p className="text-center text-muted-foreground">Henüz etkinlik bulunmuyor.</p>
                        )}
                    </ScrollAnimation>
                </div>
            </section>

            {/* Event Gallery */}
            <section className="py-6 sm:py-8 md:py-12 px-3 sm:px-4 bg-transparent theme-transition">
                <div className="container max-w-screen-xl mx-auto">
                    <ScrollAnimation animation="fade-up" className="text-center mb-4 sm:mb-5 md:mb-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 gradient-text">Etkinlik Galerisi</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-snug">
                            Geçmiş etkinliklerimizden unutulmaz anlar ve topluluk deneyimlerimizin görsel hikayesi.
                        </p>
                    </ScrollAnimation>
                    <ScrollAnimation animation="fade-up" delay={200}>
                        <EventGallery />
                    </ScrollAnimation>
                </div>
            </section>

            {/* Suggest Event Section */}
            <section className="py-10 sm:py-12 md:py-16 px-3 sm:px-4">
                <div className="container max-w-screen-xl mx-auto text-center">
                    <ScrollAnimation animation="fade-up">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 sm:mb-3 md:mb-4 gradient-text">Etkinlik Düzenlemek İster misiniz?</h2>
                        <p className="text-muted-foreground mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2">
                            Atölye, buluşma veya sunum için bir fikriniz mi var? Bilginizi topluluğumuzla paylaşmanıza yardımcı olmaktan
                            memnuniyet duyarız.
                        </p>
                    </ScrollAnimation>
                    <ScrollAnimation animation="scale-up" delay={200}>
                        <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="text-sm sm:text-base md:text-lg px-6 sm:px-7 md:px-8 h-10 sm:h-11 md:h-12 bg-ayzek-gradient hover:opacity-90">
                                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                                    Etkinlik Öner
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Etkinlik Önerisi Gönder</DialogTitle>
                                    <DialogDescription>
                                        Etkinlik fikrinizi bizimle paylaşın. Tüm öneriler değerlendirilir ve size geri dönüş yapılır.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleEventSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Etkinlik Başlığı</Label>
                                            <Input
                                                id="title"
                                                value={eventForm.title}
                                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                                placeholder="Örn: React ile Modern Web Geliştirme"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Etkinlik Açıklaması</Label>
                                        <Textarea
                                            id="description"
                                            value={eventForm.description}
                                            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                            placeholder="Etkinliğinizin içeriği, hedefleri ve katılımcıların neler öğreneceği hakkında detaylı bilgi verin..."
                                            rows={4}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact">İletişim Bilgisi</Label>
                                        <Input
                                            id="contact"
                                            type="email"
                                            value={eventForm.contact}
                                            onChange={(e) => setEventForm({ ...eventForm, contact: e.target.value })}
                                            placeholder="E-posta adresiniz"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)}>
                                            İptal
                                        </Button>
                                        <Button type="submit" className="bg-ayzek-gradient hover:opacity-90">
                                            <Send className="w-4 h-4 mr-2" />
                                            Önerimi Gönder
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </ScrollAnimation>
                </div>
            </section>

            <SiteFooter />
        </div>
    )
}