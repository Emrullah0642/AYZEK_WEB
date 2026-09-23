"use client"

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin } from "lucide-react"
import Image from "next/image"
import { ScrollAnimation } from "@/components/scroll-animations"
import { TiltCard } from "@/components/tilt-card"

// --- YENİ EKLENEN KISIMLAR ---

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.ayzek.tr"


function normalizeImageUrl(v: string | null) {
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
// -----------------------------

const CATEGORIES = [
  { key: "Başkan ve Yardımcılar", title: "Başkan ve Yardımcılar" },
  { key: "Sosyal Medya ve Tasarım", title: "Sosyal Medya ve Tasarım" },
  { key: "Etkinlik ve Organizasyon", title: "Etkinlik ve Organizasyon" },
  { key: "Eğitim ve Proje", title: "Eğitim ve Proje" },
  { key: "Sponsorluk ve Reklam", title: "Sponsorluk ve Reklam" },
] as const;

type CrewMember = {
  id: number;
  name: string;
  role: string;
  description: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  category: string;
  order_index: number;
}

type GroupedCrewMembers = Record<string, CrewMember[]>;

export function TeamSection() {
  const [groupedMembers, setGroupedMembers] = useState<GroupedCrewMembers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndexes, setCurrentIndexes] = useState<Record<string, number>>({});
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchCrewMembers = async () => {
      try {
        // --- DEĞİŞİKLİK: API_BASE kullanıldı ---
        const response = await fetch(`${API_BASE}/crew/`);
        if (!response.ok) throw new Error("Ekip üyeleri verisi alınamadı.");
        const data: GroupedCrewMembers = await response.json();
        setGroupedMembers(data);

        // Initialize current indexes for each category
        const initialIndexes: Record<string, number> = {};
        Object.keys(data).forEach(key => {
          initialIndexes[key] = 0;
        });
        setCurrentIndexes(initialIndexes);
      } catch (err: any) {
        setError(err.message);
        console.error("Ekip üyeleri çekilirken hata:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCrewMembers();
  }, []);

  const scrollToIndex = (categoryKey: string, index: number) => {
    const container = scrollRefs.current[categoryKey];
    if (container) {
      const cardWidth = container.scrollWidth / (groupedMembers[categoryKey]?.length || 1);
      container.scrollTo({
        left: cardWidth * index,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const handleScroll = (categoryKey: string) => {
      const container = scrollRefs.current[categoryKey];
      if (!container) return;

      const cardWidth = container.scrollWidth / (groupedMembers[categoryKey]?.length || 1);
      const newIndex = Math.round(container.scrollLeft / cardWidth);
      setCurrentIndexes(prev => ({ ...prev, [categoryKey]: newIndex }));
    };

    Object.keys(groupedMembers).forEach(key => {
      const container = scrollRefs.current[key];
      if (container) {
        const scrollHandler = () => handleScroll(key);
        container.addEventListener("scroll", scrollHandler);
        return () => container.removeEventListener("scroll", scrollHandler);
      }
    });
  }, [groupedMembers]);

  if (isLoading) return <div className="text-center py-20">Ekibimiz yükleniyor...</div>;
  if (error) return <div className="text-center py-20 text-destructive">Hata: {error}</div>;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold mb-2 gradient-text">Ekibimizle Tanışın</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-snug">
          AYZEK'i teknoloji meraklıları ve yenilikçiler için canlı bir topluluk haline getiren tutkulu bireylerdir.
        </p>
      </div>

      {CATEGORIES.map(({ key, title }) => {
        const members = groupedMembers[key] || [];
        if (members.length === 0) return null;

        return (
          <section key={key} className="space-y-3">
            <h3 className="inline-block text-sm sm:text-base md:text-lg font-semibold px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary shadow-sm">
              {title}
            </h3>

            <div className="space-y-4">
              {/* Mobil: yatay kaydırma + küçük kartlar | md+: eski grid */}
              <div
                ref={(el) => { scrollRefs.current[key] = el; }}
                className="
                  flex gap-2.5 sm:gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4
                  md:mx-0 md:px-0 md:overflow-visible md:snap-none
                  md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6
                  scrollbar-hide
                "
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {members.map((member, i) => (
                  <ScrollAnimation
                    key={member.id}
                    animation="scale-up"
                    delay={(i % 8) * 80}
                    className="
                      flex-none w-[65vw] sm:w-[55vw] snap-center
                      md:w-auto md:h-full
                    "
                  >
                  <TiltCard maxTilt={5} className="h-full">
                    <Card className="group hover:shadow-[0_0_30px_-8px_oklch(0.62_0.21_258_/_0.5)] transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 bg-white/90 dark:bg-card/70 border border-black/10 dark:border-foreground/10 backdrop-blur-sm rounded-xl h-full">
                      <CardHeader className="text-center p-3 md:p-4">
                        <div className="relative w-16 h-16 md:w-28 md:h-28 mx-auto mb-2">
                          {/* --- DEĞİŞİKLİK: next/image kullanıldı --- */}
                          <Image
                            src={normalizeImageUrl(member.photo_url) || "/placeholder.svg"}
                            alt={member.name}
                            fill
                            sizes="(max-width: 768px) 64px, 112px"
                            className="rounded-full object-cover transition-transform duration-300 group-hover:scale-110"
                            quality={60}
                          />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <CardTitle className="font-display text-sm md:text-xl">
                          {member.name}
                        </CardTitle>
                        <CardDescription className="text-primary font-medium text-xs md:text-base">
                          {member.role}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-3 pt-0 md:p-4 md:pt-0 space-y-2">
                        <p className="text-[10px] md:text-sm text-muted-foreground leading-tight text-center min-h-[5em] line-clamp-4 overflow-hidden break-words whitespace-pre-wrap">
                          {member.description || ""}
                        </p>
                        <div className="flex justify-center gap-2 md:gap-3 pt-1">
                          {member.github_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={member.github_url} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <Github className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </a>
                            </Button>
                          )}
                          {member.linkedin_url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <Linkedin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TiltCard>
                  </ScrollAnimation>
                ))}
              </div>

              {/* Dot Navigation - Mobile only */}
              {members.length > 1 && (
                <div className="flex justify-center gap-2 md:hidden">
                  {members.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => scrollToIndex(key, index)}
                      className={`
                        w-2 h-2 rounded-full transition-all duration-300
                        ${index === (currentIndexes[key] || 0) ? "bg-primary scale-125" : "bg-muted-foreground/40"}
                      `}
                      aria-label={`${index + 1}. üyeye git`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  )
}