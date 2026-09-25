"use client";

import { useEffect, useMemo, useState } from "react";
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

// Yeni sunucudaki afiş kayıtları boşken repodaki gerçek fotoğrafları göster.
const FALLBACK_SLIDES: Poster[] = [
  { id: -1, title: "AYZEK ekibi", image_url: "/yeniekip1.JPG", is_active: true, order_index: 0 },
  { id: -2, title: "AYZEK TEKNOFEST'te", image_url: "/eskiekip3.JPG", is_active: true, order_index: 1 },
  { id: -3, title: "AYZEK proje standı", image_url: "/oryantasyon.jpg", is_active: true, order_index: 2 },
];


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
    () => (slides.length ? slides : FALLBACK_SLIDES).filter((s) => s.is_active !== false),
    [slides]
  );

  // Kesintisiz döngü için görsel dizisini bir kez tekrarlıyoruz.
  const loopSlides = activeSlides.length > 1 ? [...activeSlides, ...activeSlides] : activeSlides;
  const durationSeconds = Math.max(activeSlides.length * 6, 12);

  return (
    <div className="relative w-full h-[200px] sm:h-[240px] md:h-[300px] lg:h-[340px] xl:h-[380px] overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-primary/10 to-accent/10">
      <div
        className="flex h-full gap-3 sm:gap-4 w-max hover:[animation-play-state:paused]"
        style={
          activeSlides.length > 1
            ? { animation: `posterFlowRight ${durationSeconds}s linear infinite` }
            : undefined
        }
      >
        {loopSlides.map((slide, index) => {
          const imgSrc = buildImgSrc(slide.image_url);
          return (
            <div
              key={`${slide.id}-${index}`}
              className="relative h-full flex-shrink-0 w-[90vw] sm:w-[75vw] md:w-[62vw] lg:w-[50vw] xl:w-[42vw] rounded-lg md:rounded-xl overflow-hidden bg-black"
            >
              <Image
                src={imgSrc}
                alt={slide.title || "Poster"}
                fill
                className="object-contain"
                priority={index === 0 || index === 1}
                quality={90}
                sizes="(max-width: 640px) 90vw, (max-width: 768px) 75vw, (max-width: 1024px) 62vw, 42vw"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
