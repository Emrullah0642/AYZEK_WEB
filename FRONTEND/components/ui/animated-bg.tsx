"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import Aurora from "@/components/aurora"

/**
 * Site geneli arka plan — reactbits.dev "Aurora" efekti (WebGL, ogl).
 * Sabit (fixed), tüm sayfalarda scroll boyunca arkada kalır. Metin okunurluğunu
 * bozmaması için düşük opasitede — asıl gösterişi hero'daki gibi boş alanlarda yapar.
 */
export default function AnimatedBg() {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (pathname?.startsWith("/admin")) return null
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-background overflow-hidden" aria-hidden="true">
      <div className={isDark ? "absolute inset-0 opacity-30" : "absolute inset-0 opacity-20"}>
        <Aurora
          colorStops={["#2563EB", "#22D3EE", "#8B5CF6"]}
          amplitude={0.9}
          blend={0.55}
          speed={0.4}
          lightMode={!isDark}
        />
      </div>
    </div>
  )
}
