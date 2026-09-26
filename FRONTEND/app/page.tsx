"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { AutoSlidingBanner } from "@/components/anasayfa-poster";
import { ScrollAnimation } from "@/components/scroll-animations";
import EventGallery from "@/components/event-gallery";
import { CommunityEventHighlights } from "@/components/community-event-highlights";
import { EventsCalendar, type Event } from "@/components/events-calendar";
import { CrewSection } from "@/components/crew-section";
import { AwardsSection } from "@/components/awards-section";
import { MissionValues } from "@/components/mission-values";
import { AdminNavbar } from "@/components/navbar";
import { InlineEditWrapper } from "@/components/admin/admin-inline-edit-wrapper";
import { ContentEditModal } from "@/components/content-edit-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Calendar, Rocket, ArrowRight, Clock, Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CountUp } from "@/components/count-up";
import { CommunityStart } from "@/components/community-start";
import { MagneticButton } from "@/components/magnetic-button";
import { SiteFooter } from "@/components/site-footer";
import { toast } from "sonner";
import { api, API_BASE } from "@/lib/api";
import { normalizeImageUrl } from "@/lib/normalize-image-url";

// --- Anasayfadaki düzenlenebilir metinler: DB'de (site_content) yoksa bu varsayılanlar kullanılır ---
const DEFAULT_CONTENT: Record<string, string> = {
  hero_title: "Teknolojiyi birlikte öğreniyor,\nüretiyoruz.",
  hero_subtitle:
    "AYZEK; hackathonlardan açık kaynağa, atölyelerden networking etkinliklerine kadar teknoloji tutkunlarını bir araya getiren, Selçuk Üniversitesi teknoloji topluluğu. Birlikte öğreniyor, birlikte üretiyor, birlikte büyüyoruz.",
  hero_cta_primary: "Topluluğa katıl",
  hero_cta_secondary: "Etkinlikleri gör",
  about_title: "Hakkımızda",
  about_description:
    "AYZEK, teknoloji tutkunu bireylerden oluşan bir topluluktur. Birlikte öğrenir, gelişir ve geleceği şekillendiririz.",
  about_extra:
    "Hackathonlardan açık kaynağa, atölyelerden networking etkinliklerine kadar birlikte öğreniyor, birlikte üretiyoruz. Herkesin fikrini özgürce paylaşabildiği, birbirinden öğrenmenin normalleştiği bir ortam kuruyoruz — deneyim seviyesi fark etmeksizin.",
  awards_title: "Ödüllerimiz",
  awards_description:
    "Topluluğumuzun ve üyelerimizin yarışmalarda, hackathonlarda ve etkinliklerde kazandığı ödüller ve elde ettiği başarılar.",
  events_title: "Topluluk etkinlikleri",
  events_description:
    "Atölyelerden yarışmalara, topluluğumuzun son buluşmalarını ve yaklaşan etkinliklerini keşfedin.",
  gallery_title: "Etkinlik galerisi",
  gallery_description: "Geçmiş etkinliklerimizden kareler ve unutulmaz anlar.",
  suggest_title: "Etkinlik düzenlemek ister misin?",
  suggest_description:
    "Atölye, buluşma veya sunum için bir fikrin mi var? Bilgini topluluğumuzla paylaşmana yardımcı olmaktan memnuniyet duyarız.",
  crew_title: "Bizim Ekibimiz",
  crew_description: "AYZEK'i ileriye taşıyan, arkasında emek olan isimlerle tanış.",
  cta_title: "Fikrini projeye dönüştür",
  cta_description: "AYZEK'te öğren, üret ve geleceği birlikte şekillendir.",
  cta_button: "Katıl",
  stats_0_value: "150+",
  stats_0_label: "Topluluk Üyesi",
  stats_1_value: "25+",
  stats_1_label: "Düzenlenen Etkinlik",
  stats_2_value: "10+",
  stats_2_label: "Tamamlanan Proje",
  stats_3_value: "3",
  stats_3_label: "Yıl Aktif",
};

type EditField = { key: string; label: string; type: "text" | "textarea" };

const SECTION_FIELDS: Record<string, EditField[]> = {
  hero: [
    { key: "hero_title", label: "Ana başlık (yeni satır = alt satıra geçer)", type: "textarea" },
    { key: "hero_subtitle", label: "Alt açıklama", type: "textarea" },
    { key: "hero_cta_primary", label: "Birincil buton yazısı", type: "text" },
    { key: "hero_cta_secondary", label: "İkincil buton yazısı", type: "text" },
  ],
  about: [
    { key: "about_title", label: "Başlık", type: "text" },
    { key: "about_description", label: "Kısa açıklama", type: "textarea" },
    { key: "about_extra", label: "Ek paragraf", type: "textarea" },
  ],
  awards: [
    { key: "awards_title", label: "Başlık", type: "text" },
    { key: "awards_description", label: "Açıklama", type: "textarea" },
  ],
  events: [
    { key: "events_title", label: "Başlık", type: "text" },
    { key: "events_description", label: "Açıklama", type: "textarea" },
  ],
  gallery: [
    { key: "gallery_title", label: "Başlık", type: "text" },
    { key: "gallery_description", label: "Açıklama", type: "textarea" },
  ],
  suggest: [
    { key: "suggest_title", label: "Başlık", type: "text" },
    { key: "suggest_description", label: "Açıklama", type: "textarea" },
  ],
  crew: [
    { key: "crew_title", label: "Başlık", type: "text" },
    { key: "crew_description", label: "Açıklama", type: "textarea" },
  ],
  cta: [
    { key: "cta_title", label: "Başlık", type: "text" },
    { key: "cta_description", label: "Açıklama", type: "textarea" },
    { key: "cta_button", label: "Buton yazısı", type: "text" },
  ],
  stats: [
    { key: "stats_0_value", label: "1. rakam", type: "text" },
    { key: "stats_0_label", label: "1. etiket", type: "text" },
    { key: "stats_1_value", label: "2. rakam", type: "text" },
    { key: "stats_1_label", label: "2. etiket", type: "text" },
    { key: "stats_2_value", label: "3. rakam", type: "text" },
    { key: "stats_2_label", label: "3. etiket", type: "text" },
    { key: "stats_3_value", label: "4. rakam", type: "text" },
    { key: "stats_3_label", label: "4. etiket", type: "text" },
  ],
};

const SECTION_TITLES: Record<string, string> = {
  hero: "Hero Bölümünü Düzenle",
  about: "Hakkımızda Bölümünü Düzenle",
  awards: "Ödüllerimiz Bölümünü Düzenle",
  events: "Etkinlikler Bölümünü Düzenle",
  gallery: "Etkinlik Galerisi Bölümünü Düzenle",
  suggest: "Etkinlik Öner Bölümünü Düzenle",
  crew: "Ekibimiz Bölümünü Düzenle",
  cta: "Kapanış Bölümünü Düzenle",
  stats: "İstatistikleri Düzenle",
};

export default function HomePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Yönetim panelinde duyurulan yaklaşan etkinlikler; geçmiş etkinlikler galeri arşivinden gösterilir.
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsStatus, setEventsStatus] = useState<"loading" | "ready" | "error">("loading");

  const [isEventSuggestOpen, setIsEventSuggestOpen] = useState(false);
  const [eventSuggestForm, setEventSuggestForm] = useState({ title: "", description: "", contact: "" });

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE}/events`);
        response.data.sort((a: any, b: any) => b.id - a.id);
        const formatted: Event[] = response.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.category,
          date: event.start_at,
          time: event.start_at,
          duration: "3 saat",
          location: event.location,
          image: normalizeImageUrl(event.cover_image_url || event.image_url),
          maxAttendees: event.capacity,
          registrationLink: event.whatsapp_link,
          tags: event.tags ? (typeof event.tags === "string" ? event.tags.split(",") : event.tags) : [],
        }));
        setEvents(formatted);
        setEventsStatus("ready");
      } catch (err: any) {
        setEventsStatus("error");
        console.error("Etkinlikler çekilirken bir hata oluştu:", err);
      }
    };
    fetchAllEvents();
  }, []);

  const upcomingEvents = events.filter((event) => new Date(event.date).getTime() >= Date.now()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleEventSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/event-suggestions`, eventSuggestForm);
      setIsEventSuggestOpen(false);
      setEventSuggestForm({ title: "", description: "", contact: "" });
      toast.success("Etkinlik öneriniz başarıyla gönderildi!");
    } catch (err) {
      console.error("Event suggestion submission failed:", err);
      toast.error("Etkinlik önerisi gönderilirken bir hata oluştu.");
    }
  };

  // Anasayfa metinleri — backend'deki /site-content'ten çekilir, yoksa DEFAULT_CONTENT kullanılır
  const [content, setContent] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/site-content`);
        setContent(data);
      } catch (err) {
        console.error("Site içeriği çekilirken hata:", err);
      }
    };
    fetchContent();
  }, []);
  const text = (key: string) => content[key] ?? DEFAULT_CONTENT[key] ?? "";

  const statIcons = [Users, Calendar, Rocket, Clock];
  const stats = statIcons.map((icon, i) => ({
    value: text(`stats_${i}_value`),
    label: text(`stats_${i}_label`),
    icon,
  }));

  // Handler fonksiyonları
  const handleEditSection = (section: string) => setEditingSection(section);
  const handleSaveContent = async (data: Record<string, string>) => {
    setEditingSection(null);
    try {
      await api.put("/site-content", data);
      setContent((prev) => ({ ...prev, ...data }));
      toast.success("İçerik güncellendi");
    } catch (err) {
      console.error("Site içeriği kaydedilemedi:", err);
      toast.error("Kaydedilemedi — admin girişi gerekli olabilir");
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative z-10 theme-transition overflow-x-hidden">
      <AdminNavbar />

      <a href="#ana-icerik" className="skip-link">Ana içeriğe geç</a>
      <main id="ana-icerik" tabIndex={-1}>
      <section className="community-hero">
        <div className="container max-w-screen-xl mx-auto">
          <div className="hero-layout">
            <InlineEditWrapper onEdit={() => handleEditSection("hero")} className="hero-copy">
              <p className="section-eyebrow"><span /> SELÇUK ÜNİVERSİTESİ · AYZEK</p>
              <h1 className="hero-title whitespace-pre-line">{text("hero_title")}</h1>
              <p className="hero-description">{text("hero_subtitle")}</p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Button asChild size="lg" className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200 px-6 h-12">
                  <Link href="/join">{text("hero_cta_primary")}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl border-white/20 bg-white/[0.03] px-6 h-12">
                  <Link href="#etkinlikler">{text("hero_cta_secondary")}</Link>
                </Button>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">Merakın yeter. Birlikte öğrenmek için buradayız.</p>
            </InlineEditWrapper>
            <div className="hero-photo-wrap">
              <div className="hero-photo">
                <Image src="/toplu.jpg" alt="AYZEK topluluğu üyeleri bir arada" fill priority sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
                <div className="hero-photo-shade" />
                <span className="hero-photo-label">BİRLİKTE DAHA FAZLASI</span>
                <div className="hero-photo-caption">
                  <span>Bir topluluktan<br />çok daha fazlası.</span>
                  <a href="#ekibimiz" aria-label="AYZEK ekibiyle tanış" className="hero-photo-link"><ArrowRight className="h-5 w-5" /></a>
                </div>
              </div>
              <div className="hero-photo-note"><span className="text-cyan-300">✳</span> Fikirden projeye, kampüsten geleceğe.</div>
            </div>
          </div>
          <InlineEditWrapper onEdit={() => handleEditSection("stats")} className="hero-stats">
            {stats.map((stat, i) => (
              <div key={i} className="hero-stat">
                <stat.icon className="h-4 w-4 text-cyan-300 mb-3" aria-hidden="true" />
                <div className="text-3xl sm:text-4xl font-semibold tracking-tight"><CountUp value={stat.value} /></div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </InlineEditWrapper>
        </div>
      </section>
      <CommunityStart />

      <InlineEditWrapper className="relative py-3 sm:py-4 md:py-5 px-0 sm:px-4">
        <div className="container max-w-screen-xl mx-auto px-2 sm:px-4 md:px-0">
          <ScrollAnimation animation="fade-in">
            <AutoSlidingBanner />
          </ScrollAnimation>
        </div>
      </InlineEditWrapper>

      {/* ============ ETKİNLİKLER ============ */}
      <section id="etkinlikler" className="scroll-mt-header">
        <InlineEditWrapper onEdit={() => handleEditSection("events")} className="py-10 sm:py-14 md:py-18 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto">
            <ScrollAnimation animation="fade-up" className="text-center mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-2 text-foreground">{text("events_title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-2 leading-snug">
                {text("events_description")}
              </p>
            </ScrollAnimation>
            <div className="mb-10 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.03] p-5 sm:p-7">
              <div className="flex items-center gap-3 mb-4"><Calendar className="h-5 w-5 text-cyan-300" /><h3 className="text-xl font-semibold">Sıradaki buluşmamız</h3></div>
              {eventsStatus === "loading" ? (
                <p role="status" className="text-muted-foreground">Etkinlik takvimi yükleniyor…</p>
              ) : eventsStatus === "error" ? (
                <p role="status" className="text-muted-foreground">Etkinlik takvimine şu anda ulaşılamıyor. Biraz sonra tekrar deneyebilir veya <a href="https://www.instagram.com/20ayzek22" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-4">Instagram hesabımızdaki duyurulara</a> göz atabilirsin.</p>
              ) : upcomingEvents.length > 0 ? (
                <EventsCalendar events={upcomingEvents} loading={false} />
              ) : (
                <p className="text-muted-foreground leading-relaxed">Yeni etkinlikler duyurulduğunda burada yer alacak. Bu sırada <Link href="/join" className="text-cyan-300 underline underline-offset-4">topluluğa katılabilir</Link> ve geçmiş buluşmalarımızı keşfedebilirsin.</p>
              )}
            </div>
            <CommunityEventHighlights />
          </div>
        </InlineEditWrapper>

        <div id="etkinlik-galerisi" className="scroll-mt-header">
          <InlineEditWrapper onEdit={() => handleEditSection("gallery")} className="section-band py-6 sm:py-8 md:py-12 px-3 sm:px-4">
            <div className="container max-w-screen-xl mx-auto">
              <ScrollAnimation animation="fade-up" className="text-center mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-2 text-foreground">{text("gallery_title")}</h2>
                <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base md:text-lg mt-1.5 leading-snug">
                  {text("gallery_description")}
                </p>
              </ScrollAnimation>
              <ScrollAnimation animation="fade-up" delay={200}>
                <EventGallery />
              </ScrollAnimation>
            </div>
          </InlineEditWrapper>
        </div>

        <InlineEditWrapper onEdit={() => handleEditSection("suggest")} className="py-10 sm:py-12 md:py-16 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto text-center">
            <ScrollAnimation animation="fade-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold mb-2 sm:mb-3 md:mb-4 text-foreground">{text("suggest_title")}</h2>
              <p className="text-muted-foreground mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-2">
                {text("suggest_description")}
              </p>
            </ScrollAnimation>
            <ScrollAnimation animation="scale-up" delay={200}>
              <Dialog open={isEventSuggestOpen} onOpenChange={setIsEventSuggestOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-full text-sm sm:text-base px-6 sm:px-8 h-10 sm:h-12 bg-ayzek-gradient hover:opacity-90">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Etkinlik öner
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Etkinlik önerisi gönder</DialogTitle>
                    <DialogDescription>
                      Etkinlik fikrini bizimle paylaş. Tüm öneriler değerlendirilir ve sana geri dönüş yapılır.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEventSuggestSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="es-title">Etkinlik başlığı</Label>
                      <Input
                        id="es-title"
                        value={eventSuggestForm.title}
                        onChange={(e) => setEventSuggestForm({ ...eventSuggestForm, title: e.target.value })}
                        placeholder="Örn: React ile Modern Web Geliştirme"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="es-description">Etkinlik açıklaması</Label>
                      <Textarea
                        id="es-description"
                        value={eventSuggestForm.description}
                        onChange={(e) => setEventSuggestForm({ ...eventSuggestForm, description: e.target.value })}
                        placeholder="Etkinliğinin içeriği, hedefleri ve katılımcıların neler öğreneceği hakkında detaylı bilgi ver..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="es-contact">İletişim bilgisi</Label>
                      <Input
                        id="es-contact"
                        type="email"
                        value={eventSuggestForm.contact}
                        onChange={(e) => setEventSuggestForm({ ...eventSuggestForm, contact: e.target.value })}
                        placeholder="E-posta adresin"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={() => setIsEventSuggestOpen(false)}>
                        İptal
                      </Button>
                      <Button type="submit" className="bg-ayzek-gradient hover:opacity-90">
                        <Send className="w-4 h-4 mr-2" />
                        Önerimi gönder
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </ScrollAnimation>
          </div>
        </InlineEditWrapper>
      </section>

      <section id="hakkimizda" className="scroll-mt-header about-story-section">
        <div className="container max-w-screen-xl mx-auto">
          <InlineEditWrapper onEdit={() => handleEditSection("about")} className="about-story-intro">
            <div>
              <p className="story-kicker">BİZİ TANI</p>
              <h2>{text("about_title")}<span aria-hidden="true">.</span></h2>
              <p className="about-story-tagline">Aynı merak.<br />Binbir farklı fikir.</p>
            </div>
            <div className="about-story-text">
              <p>{text("about_description")}</p>
              <p>{text("about_extra")}</p>
              <a href="#ekibimiz" className="story-text-link">Bu topluluğun insanlarıyla tanış <ArrowRight size={17} /></a>
            </div>
          </InlineEditWrapper>
          <MissionValues />
        </div>
      </section>

      <section id="odullerimiz" className="scroll-mt-header awards-story-section">
        <div className="container max-w-screen-xl mx-auto">
          <InlineEditWrapper onEdit={() => handleEditSection("awards")} className="awards-story-heading">
            <div><p className="story-kicker">03 / BİRLİKTE BAŞARDIK</p><h2>{text("awards_title")}</h2></div>
            <p>{text("awards_description")}</p>
          </InlineEditWrapper>
          <AwardsSection />
        </div>
      </section>

      {/* ============ BİZİM EKİBİMİZ ============ */}
      <section id="ekibimiz" className="scroll-mt-header">
        <InlineEditWrapper onEdit={() => handleEditSection("crew")} className="section-band py-10 sm:py-14 md:py-18 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto">
            <ScrollAnimation animation="fade-up" className="text-center mb-8 sm:mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-2 text-foreground">{text("crew_title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-2 leading-snug">
                {text("crew_description")}
              </p>
            </ScrollAnimation>
            <CrewSection />
          </div>
        </InlineEditWrapper>
      </section>

      {/* === Kapanış CTA bandı — sade dark glass panel === */}
      <InlineEditWrapper onEdit={() => handleEditSection("cta")} className="relative block px-3 sm:px-4 py-10 sm:py-14 md:py-20">
        <div className="container max-w-screen-xl mx-auto">
          <ScrollAnimation animation="fade-in">
            {/* İnce cyan→mor gradyan kenarlık için dıştaki 1px dolgulu sarmalayıcı */}
            <div className="rounded-2xl bg-gradient-to-r from-[#22D3EE]/40 via-white/10 to-[#8B5CF6]/40 p-[1px]">
              <div className="relative overflow-hidden rounded-2xl bg-[#0B1220]/90 backdrop-blur-xl px-6 sm:px-10 md:px-14 py-10 sm:py-12 md:py-14">
                {/* Merkeze yaklaşan ışık noktaları — çok ince */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -bottom-16 w-72 h-72 rounded-full opacity-25"
                  style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full opacity-20"
                  style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)" }}
                />

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#F8FAFC] leading-tight">
                      {text("cta_title")}
                    </h2>
                    <p className="text-[#94A3B8] max-w-md mx-auto md:mx-0 text-sm sm:text-base mt-2 leading-relaxed">
                      {text("cta_description")}
                    </p>
                  </div>
                  <div className="flex justify-center md:justify-end flex-shrink-0">
                    <MagneticButton className="inline-block">
                      <Button
                        asChild
                        size="lg"
                        className="rounded-full px-7 font-semibold bg-[#22D3EE] text-[#061018] hover:bg-[#22D3EE] hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_rgba(34,211,238,0.5)] transition-all duration-200"
                      >
                        <Link href="/join">
                          {text("cta_button")}
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Link>
                      </Button>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </InlineEditWrapper>

      </main>
      <SiteFooter />

      {editingSection && SECTION_FIELDS[editingSection] && (
        <ContentEditModal
          isOpen={true}
          onClose={() => setEditingSection(null)}
          onSave={handleSaveContent}
          title={SECTION_TITLES[editingSection] ?? "Bölümü Düzenle"}
          initialData={Object.fromEntries(SECTION_FIELDS[editingSection].map((f) => [f.key, text(f.key)]))}
          fields={SECTION_FIELDS[editingSection].map((f) => ({ ...f, required: true }))}
        />
      )}
    </div>
  );
}
