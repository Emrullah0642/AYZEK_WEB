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
  { href: "/#ekip", label: "Takımlarımız" },
]

export function AdminNavbar() {
  const { isAdminLoggedIn } = useAdmin()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => (href === "/" ? pathname === "/" && typeof window !== "undefined" && !window.location.hash : false)

  const { scrollYProgress } = useScroll()
  const progressX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 z-50 w-full border-b transition-[background-color,backdrop-filter,box-shadow] duration-300",
          scrolled
            ? "bg-[#2563EB]/70 backdrop-blur-md border-white/10 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]"
            : "bg-[#2563EB] border-black/10"
        )}
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-[2px] bg-ayzek-gradient origin-left z-10"
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
                  "relative rounded-full ring-1 ring-white/20 group-hover:ring-white/40 transition-all overflow-hidden",
                  scrolled ? "w-6 h-6 md:w-7 md:h-7" : "w-7 h-7 md:w-8 md:h-8"
                )}
              >
                <Image src="/ayzek-logo.png" alt="AYZEK" fill className="object-contain" priority />
              </div>
              <span className="text-lg md:text-xl font-display font-bold tracking-tight text-white whitespace-nowrap">
                AYZEK
              </span>
            </Link>
          </div>

          {/* Orta: Masaüstü menü */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative whitespace-nowrap py-1.5 transition-colors focus-ring",
                  isActive(l.href)
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-white" />
                )}
              </Link>
            ))}

            {isAdminLoggedIn && (
              <>
                <div className="h-4 w-px bg-white/20" />
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors focus-ring"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel
                </Link>
              </>
            )}
          </nav>

          {/* Sağ: Aksiyonlar */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <ThemeToggle className="w-9 h-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10" />

            <div className="hidden md:block h-5 w-px bg-white/20 mx-0.5" />

            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex bg-ayzek-gradient hover:opacity-90 btn-hover-scale btn-sweep rounded-lg text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              <Link href="/join">
                Topluluğa Katıl
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>

            {isAdminLoggedIn && (
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="w-9 h-9 rounded-lg p-0 hover:bg-primary/10 hidden md:inline-flex text-primary"
                title="Yönetici Paneli"
                aria-label="Yönetici Paneli"
              >
                <Link href="/admin">
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
              </Button>
            )}

            {/* Mobil: küçük POPUP menü (Dropdown) */}
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-lg md:hidden text-white hover:text-white hover:bg-white/10"
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
                className="w-64 p-2 rounded-2xl shadow-xl"
              >
                <DropdownMenuLabel className="px-2 py-1.5">Menü</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {links.map((l) => (
                  <DropdownMenuItem
                    key={l.href}
                    onClick={() => setOpen(false)}
                    className={cn("px-2 py-2 cursor-pointer rounded-lg", isActive(l.href) && "bg-foreground/5")}
                    asChild
                  >
                    <Link href={l.href} className="font-medium">
                      {l.label}
                    </Link>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setOpen(false)} className="px-2 py-2 cursor-pointer rounded-lg" asChild>
                  <Link href="/join" className="font-medium flex items-center gap-2 text-primary">
                    Topluluğa Katıl
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </DropdownMenuItem>

                {isAdminLoggedIn && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setOpen(false)}
                      className="px-2 py-2 cursor-pointer rounded-lg text-primary"
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
