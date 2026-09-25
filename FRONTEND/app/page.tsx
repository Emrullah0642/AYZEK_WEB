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
import { KineticHeading } from "@/components/kinetic-heading";
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

/** "Satır 1\nSatır 2" → KineticHeading'in beklediği kelime kelime dizi (yeni satır = breakBefore). */
function toKineticWords(text: string): { text: string; breakBefore?: boolean }[] {
  const words: { text: string; breakBefore?: boolean }[] = [];
  text.split("\n").forEach((line, lineIndex) => {
    line
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w, wordIndex) => {
        words.push({ text: w, breakBefore: lineIndex > 0 && wordIndex === 0 });
      });
  });
  return words;
}

export default function HomePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Yönetim panelinde duyurulan yaklaşan etkinlikler; geçmiş etkinlikler galeri arşivinden gösterilir.
  const [events, setEvents] = useState<Event[]>([]);

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
      } catch (err: any) {
        console.error("Etkinlikler çekilirken bir hata oluştu:", err);
      }
    };
    fetchAllEvents();
  }, []);

  const upcomingEvents = events.filter((event) => new Date(event.date).getTime() >= Date.now());

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

  // Hero arka plan glow'ları için hafif mouse parallax — birkaç piksel, abartısız
  const handleHeroParallax = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    e.currentTarget.style.setProperty("--mx", `${x * 16}px`);
    e.currentTarget.style.setProperty("--my", `${y * 16}px`);
  };
  const handleHeroParallaxReset = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--mx", "0px");
    e.currentTarget.style.setProperty("--my", "0px");
  };

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

      {/* HERO — sol metin, sağda yörüngeli logo paneli */}
      <section
        className="relative px-4 pt-16 sm:pt-20 md:pt-24 pb-14 sm:pb-20 overflow-hidden"
        onMouseMove={handleHeroParallax}
        onMouseLeave={handleHeroParallaxReset}
      >
        {/* Ambiyans glow — yalnızca hero'ya özel, blur burada bilinçli ve tek seferlik kullanılıyor. Mouse ile birkaç piksel kayar (hafif parallax). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[110vw] max-w-[900px] h-[560px] opacity-90 transition-transform duration-500 ease-out"
          style={{
            background: "radial-gradient(ellipse 50% 55% at 50% 30%, rgba(37,99,235,0.16), transparent 70%)",
            transform: "translate(var(--mx, 0px), var(--my, 0px))",
          }}
        />
        <div
          className="dark:block hidden pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[110vw] max-w-[1000px] h-[620px] transition-transform duration-500 ease-out"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 45% 55% at 50% 25%, rgba(34,211,238,0.22), transparent 70%)",
            transform: "translate(calc(var(--mx, 0px) * -1), calc(var(--my, 0px) * -1))",
          }}
        />

        <div className="container max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] lg:grid-rows-[auto_auto] gap-10 lg:gap-8 items-center">
            {/* Sol: başlık + alt metin */}
            <InlineEditWrapper
              onEdit={() => handleEditSection("hero")}
              className="relative flex flex-col items-center text-center lg:items-start lg:text-left order-1 lg:col-start-1 lg:row-start-1"
            >
              <KineticHeading
                className="font-display font-bold tracking-tight text-4xl sm:text-6xl md:text-7xl leading-[1.05] max-w-2xl text-foreground dark:drop-shadow-[0_0_40px_rgba(34,211,238,0.25)]"
                words={toKineticWords(text("hero_title"))}
              />

              <p className="text-muted-foreground max-w-xl text-lg sm:text-xl leading-relaxed mt-5 sm:mt-6">
                {text("hero_subtitle")}
              </p>
            </InlineEditWrapper>

            {/* Sağ: logo, ışıklı kaide ve yörüngede dönen üye fotoğrafları */}
            <div className="relative w-full h-[300px] sm:h-[360px] lg:h-[440px] order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2">
              {/* eş merkezli halkalar */}
              <div className="absolute inset-[6%] rounded-full border border-primary/10" />
              <div className="absolute inset-[16%] rounded-full border border-primary/15" />
              <div className="absolute inset-[26%] rounded-full border border-primary/10" />

              {/* ışıklı kaide */}
              <div className="absolute left-1/2 bottom-[14%] -translate-x-1/2 w-52 sm:w-60 h-14 rounded-[50%] bg-primary/30 blur-2xl" />
              <div className="absolute left-1/2 bottom-[16%] -translate-x-1/2 w-40 sm:w-48 h-8 rounded-[50%] bg-gradient-to-b from-primary/70 to-accent/50 border border-primary/40" />

              {/* logo — kaidenin üzerinde hafifçe yüzüyor */}
              <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 animate-float">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48">
                  <Image src="/ayzek-logo.png" alt="AYZEK" fill priority className="object-contain dark:drop-shadow-[0_0_45px_rgba(34,211,238,0.55)]" />
                </div>
              </div>
            </div>

            {/* Butonlar — mobilde logonun altında, masaüstünde metnin altında (sol sütun) */}
            <InlineEditWrapper
              onEdit={() => handleEditSection("hero")}
              className="order-3 lg:col-start-1 lg:row-start-2 flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              <MagneticButton className="flex-shrink-0">
                <Button asChild size="lg" className="rounded-full bg-ayzek-gradient hover:opacity-90 btn-hover-scale btn-sweep text-primary-foreground px-7 shadow-[0_0_30px_-6px_rgba(37,99,235,0.55)] whitespace-nowrap">
                  <Link href="/join">
                    {text("hero_cta_primary")}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </MagneticButton>
              <Button asChild size="lg" variant="outline" className="rounded-full border-foreground/20 text-foreground hover:bg-foreground/[0.06] px-6 flex-shrink-0 whitespace-nowrap">
                <Link href="/#etkinlikler">{text("hero_cta_secondary")}</Link>
              </Button>
            </InlineEditWrapper>
          </div>

          {/* İstatistikler — ortalanmış, ayraçsız */}
          <InlineEditWrapper onEdit={() => handleEditSection("stats")} className="mt-14 sm:mt-16">
            <ScrollAnimation animation="fade-in" delay={150} className="relative grid grid-cols-2 sm:grid-cols-4 justify-items-center gap-y-6 gap-x-6 sm:gap-x-12 md:gap-x-16">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="font-display font-bold text-4xl sm:text-5xl text-primary leading-none">
                    <CountUp value={s.value} />
                  </div>
                  <div className="text-xs sm:text-sm font-medium tracking-wide text-muted-foreground mt-2 uppercase">
                    {s.label}
                  </div>
                </div>
              ))}
            </ScrollAnimation>
          </InlineEditWrapper>
        </div>
      </section>

      <InlineEditWrapper className="relative py-3 sm:py-4 md:py-5 px-0 sm:px-4">
        <div className="container max-w-screen-xl mx-auto px-2 sm:px-4 md:px-0">
          <ScrollAnimation animation="fade-in">
            <AutoSlidingBanner />
          </ScrollAnimation>
        </div>
      </InlineEditWrapper>

      {/* ============ HAKKIMIZDA ============ */}
      <section id="hakkimizda" className="scroll-mt-header">
        <InlineEditWrapper onEdit={() => handleEditSection("about")} className="section-band py-10 sm:py-14 md:py-18 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto">
            <ScrollAnimation animation="fade-up" className="max-w-3xl mb-8 sm:mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">{text("about_title")}</h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                {text("about_description")}
              </p>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mt-4">
                {text("about_extra")}
              </p>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={150}>
              <MissionValues />
            </ScrollAnimation>
          </div>
        </InlineEditWrapper>
      </section>

      {/* ============ ÖDÜLLERİMİZ ============ */}
      <section id="odullerimiz" className="scroll-mt-header">
        <InlineEditWrapper onEdit={() => handleEditSection("awards")} className="section-band py-10 sm:py-14 md:py-18 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto">
            <ScrollAnimation animation="fade-up" className="text-center mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-2 text-foreground">{text("awards_title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-2 leading-snug">
                {text("awards_description")}
              </p>
            </ScrollAnimation>
            <AwardsSection />
          </div>
        </InlineEditWrapper>
      </section>

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
            <ScrollAnimation animation="fade-up" delay={200}>
              <CommunityEventHighlights />
            </ScrollAnimation>
            {upcomingEvents.length > 0 && (
              <div className="mt-12">
                <h3 className="mb-5 font-display text-xl font-semibold text-foreground sm:text-2xl">Yaklaşan etkinlikler</h3>
                <EventsCalendar events={upcomingEvents} loading={false} />
              </div>
            )}
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
