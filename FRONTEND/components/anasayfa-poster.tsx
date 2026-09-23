"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";

type Poster = {
  id: number;
  title: string;
  subtitle?: string | null;
  content?: string | null;
  image_url?: string | null;
  is_active: boolean;
  order_index: number;
};


const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.ayzek.tr";


// --- GÜNCELLENMİŞ RESİM URL FONKSİYONU ---
function buildImgSrc(raw?: string | null) {
  if (!raw) return "/ayzek-logo.png";
  const url = raw.trim();

  // 1. R2 veya harici link kontrolü
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // 2. Backend'deki dosya kontrolü (/public/uploads/...)
  if (url.startsWith("/public/") || url.startsWith("/uploads/")) {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${API_BASE}${path}`;
  }

  // 3. Eğer manuel olarak "/" ile başlayan bir yol girildiyse (Frontend public klasörü için)
  if (url.startsWith("/")) {
    // Özel durum: /uploads veya /public ile başlamıyorsa, ama / ile başlıyorsa
    // Frontend asset'i olabilir.
    // Ancak legacy backend assetleri de olabilir. 
    // Garanti olsun diye fallback'i backend yapıyoruz,
    // ama frontend static assets (ayzek-logo.png gibi) bu fonksiyona girmiyor genelde.
    // Yine de, "/image.png" gibi bir şey gelirse frontend public'ten mi backend public'ten mi?
    // Kullanıcının isteği üzerine backend/public/uploads'a yönlendirelim.
    return url;
  }

  // 4. Fallback: Backend public/uploads
  return `${API_BASE}/public/uploads/${url}`;
}
// ------------------------------------------

export function AutoSlidingBanner() {
  const [slides, setSlides] = useState<Poster[]>([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // drag/swipe
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const deltaX = useRef(0);

  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/posters?active=true&limit=20`, {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!r.ok) throw new Error(`posters fetch failed: ${r.status}`);
        const d: Poster[] = await r.json();
        if (!cancelled && !ac.signal.aborted) setSlides(d);
      } catch (err: any) {
        if (err?.name !== "AbortError") console.error(err);
      }
    })();
    return () => {
      cancelled = true;
      try { ac.abort(); } catch { }
    };
  }, []);

  const activeSlides = useMemo(
    () => slides.filter((s) => s.is_active !== false),
    [slides]
  );

  useEffect(() => {
    if (!activeSlides.length) return;
    setCurrent((p) => Math.min(p, activeSlides.length - 1));
  }, [activeSlides.length]);

  useEffect(() => {
    if (!activeSlides.length || isPaused || dragging) return;
    const t = setInterval(
      () => setCurrent((p) => (p + 1) % activeSlides.length),
      5000
    );
    return () => clearInterval(t);
  }, [activeSlides.length, isPaused, dragging]);

  const pauseForManualNav = () => {
    setIsPaused(true);
    // kısa süre duraklat, sonra otomatiğe izin ver
    setTimeout(() => setIsPaused(false), 1500);
  };

  const goToNext = () => {
    if (!activeSlides.length) return;
    pauseForManualNav();
    setCurrent((p) => Math.min(p + 1, activeSlides.length - 1));
  };
  const goToPrev = () => {
    if (!activeSlides.length) return;
    pauseForManualNav();
    setCurrent((p) => Math.max(p - 1, 0));
  };
  const goToSlide = (i: number) => {
    if (!activeSlides.length) return;
    pauseForManualNav();
    setCurrent(Math.max(0, Math.min(i, activeSlides.length - 1)));
  };

  // --- swipe/drag handlers (pointer events) ---
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    // Button fix
    if ((e.target as HTMLElement).closest("button")) return;

    // sadece sol tık/primary veya touch
    if (e.button !== 0 && e.pointerType === "mouse") return;
    startX.current = e.clientX;
    deltaX.current = 0;
    setDragging(true);
    setIsPaused(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging) return;
    deltaX.current = e.clientX - startX.current;
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging) return;
    const dx = deltaX.current;
    setDragging(false);
    setIsPaused(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const THRESH = 48; // sürükleme eşiği ~48px
    if (Math.abs(dx) >= THRESH) {
      if (dx < 0) goToNext();
      else goToPrev();
    }
    deltaX.current = 0;
  };

  if (!activeSlides.length) {
    return (
      <div className="relative h-[280px] sm:h-[360px] md:h-[500px] lg:h-[650px] xl:h-[700px] rounded-2xl overflow-hidden border border-foreground/10 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(oklch(1 0 0 / 8%) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
          <div className="grid place-items-center size-12 sm:size-14 rounded-full bg-gradient-to-br from-primary/25 to-accent/15 ring-1 ring-foreground/15">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-xs">
            Yakında burada öne çıkan duyurular ve etkinlik afişleri olacak.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={[
        "relative w-full h-[280px] sm:h-[360px] md:h-[500px] lg:h-[650px] xl:h-[700px] overflow-hidden rounded-lg md:rounded-xl",
        "bg-gradient-to-r from-primary/10 to-accent/10",
        // drag sırasında seçim olmasın; dikey kaydırma engellenmesin
        dragging ? "select-none" : "",
        "touch-pan-y",
      ].join(" ")}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => !dragging && setIsPaused(false)}
      // drag / swipe
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {activeSlides.map((slide, index) => {
          const imgSrc = buildImgSrc(slide.image_url);
          return (
            <div
              key={slide.id}
              className="relative w-full h-full flex-shrink-0 flex items-end pb-8 sm:pb-12 md:pb-16 lg:pb-20"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-background/10 z-10" />
              <Image
                src={imgSrc}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0 || index === 1}
                quality={60}
                sizes="100vw"
              />

              <div className="relative z-20 container max-w-screen-xl mx-auto px-4 sm:px-6 w-full">
                <div className="max-w-3xl animate-fade-in">
                  {slide.subtitle && (
                    <h2 className="text-[10px] sm:text-[11px] md:text-sm font-medium text-primary mb-1 md:mb-2 tracking-wide uppercase">
                      {slide.subtitle}
                    </h2>
                  )}
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold mb-2 sm:mb-3 md:mb-6 text-foreground leading-tight">
                    {slide.title}
                  </h1>
                  {slide.content && (
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed md:leading-7 max-w-full md:max-w-2xl line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
                      {slide.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Silüet oklar (dolgusuz, sadece kontur). Her zaman görünür, sınırda disable. */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Önceki"
            disabled={current === 0}
            className={[
              "absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30",
              "inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full",
              "bg-transparent border border-foreground/35 hover:border-foreground/80",
              "backdrop-blur-0",
              "transition focus:outline-none focus:ring-2 focus:ring-foreground/40",
              current === 0 ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/80" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Sonraki"
            disabled={current === activeSlides.length - 1}
            className={[
              "absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30",
              "inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full",
              "bg-transparent border border-foreground/35 hover:border-foreground/80",
              "backdrop-blur-0",
              "transition focus:outline-none focus:ring-2 focus:ring-foreground/40",
              current === activeSlides.length - 1
                ? "opacity-50 cursor-not-allowed"
                : "",
            ].join(" ")}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/80" />
          </button>
        </>
      )}

      {/* Nokta göstergeleri */}
      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-1.5 sm:space-x-2">
        {activeSlides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToSlide(i)}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all ${i === current ? "bg-primary scale-125" : "bg-background/60"
              }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}