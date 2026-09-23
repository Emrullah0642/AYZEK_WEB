"use client"

import { useMemo, useRef, useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.ayzek.tr"


function normalizeImageUrl(v: string) {
  const s = (v || "").trim()
  if (!s) return ""
  if (s.startsWith("http://") || s.startsWith("https://")) return s
  const path = s.startsWith("/") ? s : `/${s}`

  if (path.startsWith("/public/") || path.startsWith("/uploads/")) {
    return `${API_BASE}${path}`
  }

  // Fallback
  return `${API_BASE}/public/uploads${path}`
}

type Leader = {
  id: string | number
  name: string
  role: string
  avatar?: string
  about?: string
}

type YearSlide = {
  year: number
  leaders: Leader[]
}

function PersonCard({ leader }: { leader: Leader }) {
  return (
    <Card className="bg-white/90 dark:bg-black/70 border border-black/10 dark:border-foreground/10 backdrop-blur-sm transition-shadow hover:shadow-lg h-full">
      <CardHeader className="text-center p-2.5 sm:p-3 md:p-4">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-2.5 md:mb-3">
          <Image
            src={normalizeImageUrl(leader.avatar || "") || "/placeholder.svg"}
            alt={leader.name}
            fill
            className="rounded-full object-cover"
            sizes="64px"
            quality={60}
          />
        </div>
        <CardTitle className="font-display text-xs sm:text-sm md:text-base lg:text-lg leading-tight">{leader.name}</CardTitle>
        <p className="text-[10px] sm:text-xs text-muted-foreground">{leader.role}</p>
      </CardHeader>
      {leader.about && (
        <CardContent className="pt-0 px-2.5 pb-3 sm:px-3 sm:pb-4 md:px-4">
          <p className="text-[10px] sm:text-xs md:text-sm text-center italic line-clamp-3 min-h-[3.75em] break-words whitespace-pre-wrap">&quot;{leader.about}&quot;</p>
        </CardContent>
      )}
    </Card>
  )
}

export function CommunityJourney() {
  const [slides, setSlides] = useState<YearSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0)

  // Framer motion drag constraints
  const dragX = useMotionValue(0)

  useEffect(() => {
    const fetchJourneyData = async () => {
      try {
        const response = await fetch(`${API_BASE}/journey/`);
        if (!response.ok) throw new Error("Veriler alınamadı. Sunucu yanıt vermiyor.");
        const dataFromBackend: Record<string, any[]> = await response.json();

        const formattedSlides: YearSlide[] = Object.entries(dataFromBackend)
          .map(([year, leaders]) => ({
            year: parseInt(year, 10),
            leaders: (leaders as any[]).map(leader => ({
              id: leader.id,
              name: leader.name,
              role: leader.role,
              avatar: leader.photo_url,
              about: leader.description,
            })),
          }))
          .sort((a, b) => a.year - b.year);

        if (formattedSlides.length === 0) {
          setSlides([]);
        } else {
          setSlides(formattedSlides);
          const currentYear = new Date().getFullYear();
          let initialIndex = formattedSlides.findIndex(s => s.year === currentYear);
          if (initialIndex === -1) initialIndex = formattedSlides.length - 1;
          setActiveIdx(initialIndex);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("CommunityJourney fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJourneyData();
  }, []);

  const go = (dir: -1 | 1) => {
    const next = Math.min(Math.max(activeIdx + dir, 0), slides.length - 1)
    setActiveIdx(next)
  }

  const onDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x
    const swipeThreshold = 10000

    // Swipe left logic (next slide)
    if (swipe < -swipeThreshold || offset.x < -100) {
      if (activeIdx < slides.length - 1) setActiveIdx(activeIdx + 1)
    }
    // Swipe right logic (prev slide)
    else if (swipe > swipeThreshold || offset.x > 100) {
      if (activeIdx > 0) setActiveIdx(activeIdx - 1)
    }
  }

  if (isLoading) return <div className="text-center py-16 text-sm text-muted-foreground">Zaman çizelgesi yükleniyor...</div>
  if (error) return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-16 text-center px-4">
      <p className="text-muted-foreground text-sm">Topluluk yolculuğu şu anda yüklenemedi.</p>
      <p className="text-muted-foreground/60 text-xs">Birazdan tekrar dene.</p>
    </div>
  )
  if (slides.length === 0) return <div className="text-center py-16 text-sm text-muted-foreground">Gösterilecek &quot;Yolculuğumuz&quot; verisi bulunamadı.</div>

  const currentYear = slides[activeIdx]?.year ?? slides[0]?.year;
  const slide = slides[activeIdx];

  return (
    <section className="relative py-10 sm:py-12 md:py-16">
      <div className="text-center mb-6 sm:mb-8 md:mb-10 px-2">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold mb-3 sm:mb-4 text-foreground">Zaman çizelgemiz</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          AYZEK&apos;i teknoloji meraklıları ve yenilikçiler için canlı bir topluluk haline getiren tutkulu bireylerdir.
        </p>
      </div>

      {/* timeline bar ve yıl balonları */}
      <div className="relative h-16 mb-8 select-none">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(59,130,246,0.55) 0 32px, transparent 32px 64px)",
          }}
        />
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-primary/40" />

        {/* CURRENT YEAR BADGE */}
        <motion.div
          key={currentYear}
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute left-1/2 -translate-x-1/2 -top-2 sm:-top-2.5 md:-top-3"
        >
          <div className="px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2 rounded-xl sm:rounded-2xl bg-ayzek-gradient text-primary-foreground text-base sm:text-lg md:text-xl font-bold shadow-lg border border-foreground/20">
            {currentYear}
          </div>
        </motion.div>

        {/* PREV YEAR */}
        {slides[activeIdx - 1] && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 0.6 }}
            className="absolute top-1/2 -translate-y-1/2 left-[12%] sm:left-[14%] md:left-[16%] cursor-pointer"
            onClick={() => setActiveIdx(activeIdx - 1)}
          >
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 rounded-lg sm:rounded-xl border bg-background/80 backdrop-blur font-medium text-primary shadow-sm text-xs sm:text-sm md:text-base">
              {slides[activeIdx - 1].year}
            </div>
          </motion.div>
        )}

        {/* NEXT YEAR */}
        {slides[activeIdx + 1] && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 0.6 }}
            className="absolute top-1/2 -translate-y-1/2 right-[12%] sm:right-[14%] md:right-[16%] cursor-pointer"
            onClick={() => setActiveIdx(activeIdx + 1)}
          >
            <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 rounded-lg sm:rounded-xl border bg-background/80 backdrop-blur font-medium text-primary shadow-sm text-xs sm:text-sm md:text-base">
              {slides[activeIdx + 1].year}
            </div>
          </motion.div>
        )}
      </div>

      <div className="relative overflow-hidden px-1">
        <Button
          variant="secondary"
          size="icon"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full shadow transition-transform hover:scale-105 active:scale-95 w-10 h-10"
          onClick={() => go(-1)}
          disabled={activeIdx === 0}
          aria-label="Önceki yıl"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full shadow transition-transform hover:scale-105 active:scale-95 w-10 h-10"
          onClick={() => go(1)}
          disabled={activeIdx === slides.length - 1}
          aria-label="Sonraki yıl"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* SLIDE CONTAINER */}
        <div className="w-full max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
              className="w-full touch-pan-x"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 pb-4 px-2">
                {slide?.leaders.map(ld => (
                  <motion.div key={ld.id} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <PersonCard leader={ld} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-4 text-center text-[10px] sm:text-xs text-muted-foreground md:hidden px-2">
          Yıllar arasında gezinmek için sağa/sola kaydırın.
        </p>
      </div>
    </section>
  )
}