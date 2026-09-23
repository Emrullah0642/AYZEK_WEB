"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"

const SPLASH_KEY = "ayzek-splash-shown"
const HOLD_MS = 700
const FADE_MS = 400

/** İlk açılışta AYZEK logosunu düz bir şekilde gösterip sade bir fade ile siteye geçen ekran. Oturum başına bir kez çalışır. */
export function SplashScreen() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(SPLASH_KEY)) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    sessionStorage.setItem(SPLASH_KEY, "1")

    if (reduceMotion) return

    setVisible(true)
    const fadeTimer = setTimeout(() => setFading(true), HOLD_MS)
    const hideTimer = setTimeout(() => setVisible(false), HOLD_MS + FADE_MS)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity ease-out"
      style={{ transitionDuration: `${FADE_MS}ms`, opacity: fading ? 0 : 1 }}
    >
      <div className="relative w-14 h-14 sm:w-16 sm:h-16">
        <Image src="/ayzek-logo.png" alt="AYZEK" fill className="object-contain" priority />
      </div>
    </div>
  )
}
