"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/contexts/admin-context"
import { LayoutDashboard, Menu, ArrowRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

// Tek sayfa: tüm bölümler anasayfada, navbar oraya kaydırıyor. Sadece "Topluluğa Katıl" ayrı bir sayfa (/join).
const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/#hakkimizda", label: "Hakkımızda" },
  { href: "/#etkinlikler", label: "Etkinlikler" },
  { href: "/#ekibimiz", label: "Ekibimiz" },
]

const SECTION_IDS = ["hakkimizda", "etkinlikler", "ekibimiz"]

export function AdminNavbar() {
  const { isAdminLoggedIn } = useAdmin()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (pathname !== "/") return false
    if (href === "/") return !activeSection
    if (href.startsWith("/#")) return activeSection === href.slice(2)
    return false
  }

  const { scrollYProgress } = useScroll()
  const progressX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)

      // Scroll-spy — navbar yüksekliğinin hemen altından geçen son bölüm aktif kabul edilir
      const offset = 110
      let current = ""
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top - offset <= 0) {
          current = id
        }
      }
      setActiveSection(current)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  return (
    <>
      {/* Koyu şeffaf cam navbar — üstte hero ile bütünleşik/hafif, scroll'da daha koyu ve kompakt */}
      <header
        className={cn(
          "fixed top-0 left-0 z-50 w-full border-b backdrop-blur-xl transition-[background-color,backdrop-filter,box-shadow,height] duration-300",
          scrolled
            ? "bg-[rgba(7,11,20,0.85)] border-white/[0.08] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
            : "bg-[rgba(7,11,20,0.45)] border-white/[0.06]"
        )}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-[2px] bg-[#22D3EE] origin-left z-10"
          style={{ scaleX: progressX }}
        />
        <div
          className={cn(
            "container mx-auto flex max-w-screen-xl items-center justify-between px-3 sm:px-4 md:px-6 transition-[height] duration-300",
            scrolled ? "h-12 md:h-14" : "h-14 md:h-16"
          )}
        >
          {/* Sol: Logo */}
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div
                className={cn(
                  "relative rounded-full ring-1 ring-white/20 group-hover:ring-[#67E8F9]/50 transition-all overflow-hidden",
                  scrolled ? "w-6 h-6 md:w-7 md:h-7" : "w-7 h-7 md:w-8 md:h-8"
                )}
              >
                <Image src="/ayzek-logo.png" alt="AYZEK" fill className="object-contain" priority />
              </div>
              <span className="text-lg md:text-xl font-display font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap">
                AYZEK
              </span>
            </Link>
          </div>

          {/* Orta: Masaüstü menü */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[15px] font-medium">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative whitespace-nowrap py-1.5 transition-colors focus-ring",
                  isActive(l.href)
                    ? "text-[#F8FAFC]"
                    : "text-[#94A3B8] hover:text-[#67E8F9]"
                )}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-[#22D3EE] shadow-[0_0_8px_1px_rgba(34,211,238,0.7)]" />
                )}
              </Link>
            ))}

            {isAdminLoggedIn && (
              <>
                <div className="h-4 w-px bg-white/15" />
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-[#67E8F9] hover:text-[#22D3EE] transition-colors focus-ring"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel
                </Link>
              </>
            )}
          </nav>

          {/* Sağ: Aksiyonlar */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <ThemeToggle className="w-9 h-9 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06]" />

            <div className="hidden md:block h-5 w-px bg-white/15 mx-0.5" />

            <MagneticNavCta />

            {isAdminLoggedIn && (
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="w-9 h-9 rounded-lg p-0 hover:bg-white/[0.06] hidden md:inline-flex text-[#67E8F9]"
                title="Yönetici Paneli"
                aria-label="Yönetici Paneli"
              >
                <Link href="/admin">
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
              </Button>
            )}

            {/* Mobil: sağdan açılan koyu cam panel */}
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-lg md:hidden text-[#F8FAFC] hover:bg-white/[0.06]"
                  aria-label="Menüyü aç"
                  title="Menü"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="w-64 p-2 rounded-2xl shadow-xl bg-[rgba(7,11,20,0.92)] backdrop-blur-xl border-white/[0.08] text-[#F8FAFC]"
              >
                <DropdownMenuLabel className="px-2 py-1.5 text-[#94A3B8]">Menü</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/[0.08]" />

                {links.map((l) => (
                  <DropdownMenuItem
                    key={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-2 py-2 cursor-pointer rounded-lg focus:bg-white/[0.06] focus:text-[#67E8F9]",
                      isActive(l.href) && "bg-white/[0.06] text-[#67E8F9]"
                    )}
                    asChild
                  >
                    <Link href={l.href} className="font-medium">
                      {l.label}
                    </Link>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="bg-white/[0.08]" />
                <DropdownMenuItem
                  onClick={() => setOpen(false)}
                  className="px-2 py-2 cursor-pointer rounded-lg focus:bg-white/[0.06]"
                  asChild
                >
                  <Link href="/join" className="font-medium flex items-center gap-2 text-[#22D3EE]">
                    Topluluğa Katıl
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </DropdownMenuItem>

                {isAdminLoggedIn && (
                  <>
                    <DropdownMenuSeparator className="bg-white/[0.08]" />
                    <DropdownMenuItem
                      onClick={() => setOpen(false)}
                      className="px-2 py-2 cursor-pointer rounded-lg text-[#67E8F9] focus:bg-white/[0.06]"
                      asChild
                    >
                      <Link href="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Yönetici Paneli
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Spacer to prevent the fixed navbar from overlapping page content */}
      <div className="h-14 md:h-16" />
    </>
  )
}

/** Navbar CTA — sabit glow yok, sadece hover'da ışık + hafif yukarı hareket. */
function MagneticNavCta() {
  return (
    <Button
      asChild
      size="sm"
      className={cn(
        "hidden md:inline-flex rounded-full px-4 font-semibold transition-all duration-200",
        "bg-[#22D3EE] text-[#061018] hover:bg-[#22D3EE] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_-6px_rgba(34,211,238,0.55)]"
      )}
    >
      <Link href="/join">
        Topluluğa Katıl
        <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </Link>
    </Button>
  )
}
