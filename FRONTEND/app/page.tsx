"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { AutoSlidingBanner } from "@/components/anasayfa-poster";
import { ScrollAnimation } from "@/components/scroll-animations";
import { ParallaxSection } from "@/components/parallax-section";
import { HorizontalTimeline } from "@/components/horizontal-timeline";
import EventGallery from "@/components/event-gallery";
import { EventsCalendar, type Event } from "@/components/events-calendar";
import { TeamExplorer } from "@/components/team";
import { MissionValues } from "@/components/mission-values";
import { CommunityJourney } from "@/components/community-journey";
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

// --- YENİ EKLENEN KISIMLAR ---

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.ayzek.tr";


function normalizeImageUrl(v: string | null | undefined) {
  const s = (v || "").trim();
  if (!s) return "";

  // 1. R2 veya harici link kontrolü
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // 2. Başında slash yoksa ekle
  const path = s.startsWith("/") ? s : `/${s}`;

  // 3. Backend'deki dosya kontrolü
  if (path.startsWith("/public/") || path.startsWith("/uploads/")) {
    return `${API_BASE}${path}`;
  }

  // 4. Default fallback: Backend public/uploads
  return `${API_BASE}/public/uploads${path}`;
}
// -----------------------------

export default function HomePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Etkinlikler (events sayfasından taşındı) — tüm etkinlikler, takvim + galeri burada
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<any>(null);

  const [isEventSuggestOpen, setIsEventSuggestOpen] = useState(false);
  const [eventSuggestForm, setEventSuggestForm] = useState({ title: "", description: "", contact: "" });

  // Hero'daki yörüngedeki üye fotoğrafları — hata olursa sessizce boş kalır, ikon placeholder gösterilir
  const [heroMembers, setHeroMembers] = useState<{ id: number; name: string; photoUrl: string }[]>([]);
  useEffect(() => {
    const fetchHeroMembers = async () => {
      try {
        const response = await axios.get(`${API_BASE}/teams/featured`);
        const formatted = response.data.slice(0, 4).map((team: any) => ({
          id: team.id,
          name: team.name,
          photoUrl: normalizeImageUrl(team.photo_url),
        }));
        setHeroMembers(formatted);
      } catch {
        setHeroMembers([]);
      }
    };
    fetchHeroMembers();
  }, []);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setEventsLoading(true);
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
        setEventsError(err);
        console.error("Etkinlikler çekilirken bir hata oluştu:", err);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchAllEvents();
  }, []);

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

  // Statik veriler
  const [stats, setStats] = useState([
    { value: "150+", label: "Topluluk Üyesi", icon: Users },
    { value: "25+", label: "Düzenlenen Etkinlik", icon: Calendar },
    { value: "10+", label: "Tamamlanan Proje", icon: Rocket },
    { value: "3", label: "Yıl Aktif", icon: Clock },
  ]);
  const [aboutPreview, setAboutPreview] = useState({
    title: "Hakkımızda",
    description: "AYZEK, teknoloji tutkunu bireylerden oluşan bir topluluktur. Birlikte öğrenir, gelişir ve geleceği şekillendiririz.",
  });

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
  const handleEditStats = () => setEditingSection("stats");
  const handleEditAbout = () => setEditingSection("about");
  const handleSaveContent = (data: any) => {
    if (editingSection === "stats") {
      setStats(data.stats || stats);
    } else if (editingSection === "about") {
      setAboutPreview(data);
    }
    setEditingSection(null);
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
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-8 items-center">
            {/* Sol: metin */}
            <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
              <KineticHeading
                className="font-display font-bold tracking-tight text-4xl sm:text-6xl md:text-7xl leading-[1.05] max-w-2xl text-foreground dark:drop-shadow-[0_0_40px_rgba(34,211,238,0.25)]"
                words={[
                  { text: "Teknolojiyi" },
                  { text: "birlikte" },
                  { text: "öğreniyor," },
                  { text: "üretiyoruz.", breakBefore: true },
                ]}
              />

              <p className="text-muted-foreground max-w-xl text-base sm:text-lg leading-relaxed mt-5 sm:mt-6">
                AYZEK; hackathonlardan açık kaynağa, atölyelerden networking etkinliklerine kadar
                teknoloji tutkunlarını bir araya getiren, Selçuk Üniversitesi teknoloji topluluğu.
                Birlikte öğreniyor, birlikte üretiyor, birlikte büyüyoruz.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-7 sm:mt-8">
                <MagneticButton>
                  <Button asChild size="lg" className="rounded-full bg-ayzek-gradient hover:opacity-90 btn-hover-scale btn-sweep text-primary-foreground px-7 shadow-[0_0_30px_-6px_rgba(37,99,235,0.55)]">
                    <Link href="/join">
                      Topluluğa katıl
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                </MagneticButton>
                <Button asChild size="lg" variant="outline" className="rounded-full border-foreground/20 text-foreground hover:bg-foreground/[0.06] px-6">
                  <Link href="/events">Etkinlikleri gör</Link>
                </Button>
              </div>
            </div>

            {/* Sağ: logo, ışıklı kaide ve yörüngede dönen üye fotoğrafları */}
            <div className="relative w-full h-[300px] sm:h-[360px] lg:h-[440px]">
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

              {/* yörüngedeki üye fotoğrafları */}
              {heroMembers.map((m, i) => {
                const pos = [
                  "left-[4%] top-[8%]",
                  "right-[2%] top-[14%]",
                  "left-[0%] bottom-[8%]",
                  "right-[6%] bottom-[2%]",
                ][i];
                return (
                  <div
                    key={m.id}
                    className={`absolute ${pos} animate-float`}
                    style={{ animationDelay: `${i * 0.45}s` }}
                  >
                    <div className="relative size-12 sm:size-14 rounded-full ring-2 ring-primary/40 bg-card overflow-hidden shadow-[0_0_20px_-6px_rgba(34,211,238,0.45)]">
                      {m.photoUrl ? (
                        <Image src={m.photoUrl} alt={m.name} fill className="object-cover" quality={60} />
                      ) : (
                        <div className="w-full h-full grid place-items-center">
                          <Users className="w-5 h-5 text-primary/70" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* İstatistikler — ortalanmış, ayraçsız */}
          <ScrollAnimation animation="fade-in" delay={150} className="relative flex flex-wrap items-start justify-center gap-x-10 gap-y-6 sm:gap-x-16 mt-14 sm:mt-16">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="font-display font-bold text-3xl sm:text-4xl text-primary leading-none">
                  <CountUp value={s.value} />
                </div>
                <div className="text-[10px] sm:text-[11px] font-medium tracking-wide text-muted-foreground mt-2 uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </ScrollAnimation>
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
        <InlineEditWrapper onEdit={handleEditAbout} className="section-band py-10 sm:py-14 md:py-18 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto">
            <ScrollAnimation animation="fade-up" className="max-w-3xl mb-8 sm:mb-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">{aboutPreview.title}</h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                {aboutPreview.description || "AYZEK, Selçuk Üniversitesi'nde teknolojiye meraklı öğrencileri bir araya getiren bir topluluk."}
              </p>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mt-4">
                Hackathonlardan açık kaynağa, atölyelerden networking etkinliklerine kadar birlikte
                öğreniyor, birlikte üretiyoruz. Herkesin fikrini özgürce paylaşabildiği, birbirinden
                öğrenmenin normalleştiği bir ortam kuruyoruz — deneyim seviyesi fark etmeksizin.
              </p>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={150}>
              <MissionValues />
            </ScrollAnimation>
          </div>
        </InlineEditWrapper>

        <InlineEditWrapper>
          <ParallaxSection className="py-6 sm:py-8 md:py-12 px-3 sm:px-4" speed={0.3}>
            <div className="container max-w-screen-xl mx-auto">
              <ScrollAnimation animation="fade-up" className="text-center mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-2 text-foreground">Zaman kapsülü</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto text-xs sm:text-sm md:text-base leading-snug px-2">
                  Topluluğumuzun yolculuğunu interaktif kilometre taşları, başarılar ve bugün kim olduğumuzu şekillendiren unutulmaz anlar aracılığıyla keşfedin.
                </p>
              </ScrollAnimation>
              <ScrollAnimation animation="fade-up" delay={200}>
                <div className="py-2 sm:py-4 md:py-6">
                  <HorizontalTimeline />
                </div>
              </ScrollAnimation>
            </div>
          </ParallaxSection>
        </InlineEditWrapper>

        <InlineEditWrapper className="section-band py-10 sm:py-14 md:py-18 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto">
            <ScrollAnimation animation="fade-up">
              <CommunityJourney />
            </ScrollAnimation>
          </div>
        </InlineEditWrapper>
      </section>

      {/* ============ ETKİNLİKLER ============ */}
      <section id="etkinlikler" className="scroll-mt-header">
        <InlineEditWrapper className="py-10 sm:py-14 md:py-18 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto">
            <ScrollAnimation animation="fade-up" className="text-center mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-2 text-foreground">Topluluk etkinlikleri</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-snug">
                Teknoloji topluluğumuzu ilham vermeye, eğitmeye ve birbirine bağlamaya yönelik tasarlanmış atölyeler,
                buluşmalar, konferanslar ve hackathonları keşfedin. Geçmiş ve gelecek tüm etkinliklerimize göz atın, türe göre filtreleyin.
              </p>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={200}>
              {eventsLoading ? (
                <p className="text-center text-muted-foreground">Etkinlikler yükleniyor...</p>
              ) : eventsError ? (
                <p className="text-center text-destructive">Etkinlikler çekilirken bir hata oluştu.</p>
              ) : events.length > 0 ? (
                <EventsCalendar events={events} loading={eventsLoading} />
              ) : (
                <p className="text-center text-muted-foreground">Henüz etkinlik bulunmuyor.</p>
              )}
            </ScrollAnimation>
          </div>
        </InlineEditWrapper>

        <InlineEditWrapper className="section-band py-6 sm:py-8 md:py-12 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto">
            <ScrollAnimation animation="fade-up" className="text-center mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-2 text-foreground">Etkinlik galerisi</h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm md:text-base mt-1.5 leading-snug">
                Geçmiş etkinliklerimizden kareler ve unutulmaz anlar.
              </p>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={200}>
              <EventGallery />
            </ScrollAnimation>
          </div>
        </InlineEditWrapper>

        <InlineEditWrapper className="py-10 sm:py-12 md:py-16 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto text-center">
            <ScrollAnimation animation="fade-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold mb-2 sm:mb-3 md:mb-4 text-foreground">Etkinlik düzenlemek ister misin?</h2>
              <p className="text-muted-foreground mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2">
                Atölye, buluşma veya sunum için bir fikrin mi var? Bilgini topluluğumuzla paylaşmana yardımcı olmaktan memnuniyet duyarız.
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

      {/* ============ TAKIMLARIMIZ ============ */}
      <section id="ekip" className="scroll-mt-header">
        <InlineEditWrapper className="section-band py-10 sm:py-14 md:py-18 px-3 sm:px-4">
          <div className="container max-w-screen-xl mx-auto">
            <ScrollAnimation animation="fade-up" className="text-center mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-2 text-foreground">Takımlarımız</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-snug">
                Farklı alanlarda çalışan yetenekli takımlarımızla tanış. Her takım, kendi alanında öncü projeler geliştirerek topluluğumuzu güçlendiriyor.
              </p>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={200}>
              <TeamExplorer />
            </ScrollAnimation>
          </div>
        </InlineEditWrapper>
      </section>

      {/* === Kapanış CTA bandı === */}
      <section className="relative px-3 sm:px-4 py-10 sm:py-14 md:py-20">
        <div className="container max-w-screen-xl mx-auto">
          <ScrollAnimation animation="fade-in">
            <div className="relative overflow-hidden border-2 border-foreground bg-ayzek-gradient px-5 sm:px-10 md:px-16 py-10 sm:py-14 md:py-16 text-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage: "radial-gradient(oklch(0.17 0.012 60) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative">
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground max-w-2xl mx-auto leading-tight mt-2">
                  Sen de bu hikayenin bir parçası ol
                </h2>
                <p className="text-foreground/75 max-w-xl mx-auto text-sm sm:text-base mt-3 sm:mt-4 leading-relaxed">
                  Hackathonlardan açık kaynağa, atölyelerden networking'e — AYZEK ailesine katılmak için tek adım kaldı.
                </p>
                <div className="mt-6 sm:mt-8">
                  <MagneticButton className="inline-block">
                    <Button asChild size="lg" className="bg-foreground text-background hover:opacity-85 btn-hover-scale btn-sweep px-8">
                      <Link href="/join">
                        Topluluğa katıl
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <SiteFooter />

      <ContentEditModal
        isOpen={editingSection === "about"}
        onClose={() => setEditingSection(null)}
        onSave={handleSaveContent}
        title="Hakkımızda Önizlemesini Düzenle"
        description="Hakkımızda bölümünün önizleme içeriğini güncelleyin"
        initialData={aboutPreview}
        fields={[
          { key: "title", label: "Başlık", type: "text", required: true },
          { key: "description", label: "Açıklama", type: "textarea", required: true },
        ]}
      />
    </div>
  );
}