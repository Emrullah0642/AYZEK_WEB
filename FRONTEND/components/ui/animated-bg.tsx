"use client"

import { usePathname } from "next/navigation"

/**
 * Zemin: düz kağıt/mürekkep rengi + ince nokta-grid. Blur, glow veya cam efekti yok —
 * kağıda basılmış bir teknik döküman gibi keskin ve düz durur.
 */
export default function AnimatedBg() {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0 bg-background overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 block dark:hidden"
        style={{
          backgroundImage: "radial-gradient(oklch(0.17 0.012 60 / 7%) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: "radial-gradient(oklch(1 0 0 / 7%) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  )
}
