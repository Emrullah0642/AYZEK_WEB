"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Açık/koyu tema geçiş butonu. Hydration uyumsuzluğunu önlemek için mount olana kadar sabit ikon gösterir. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className ?? "w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5"}
    >
      {mounted ? (
        isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4 opacity-0" />
      )}
    </Button>
  )
}
