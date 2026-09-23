"use client"

import * as React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Linkedin } from "lucide-react"
import { API_BASE } from "@/lib/api"
import { ScrollAnimation } from "@/components/scroll-animations"
import { TiltCard } from "@/components/tilt-card"

// --- YENİ EKLENEN KISIMLAR ---

function normalizeImageUrl(v: string) {
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

// Frontend'de kullanılacak veri tipleri
type Member = {
  id: number | string
  name: string
  role?: string
  linkedin?: string
}

type Team = {
  id: number | string
  code: string
  name: string
  logoUrl?: string
  categories: string[]
  members: Member[]
  about?: string
}

function TeamCapsuleCard({ team, palette }: { team: Team; palette: { ring: string; glow: string; pill: string } }) {
  const [open, setOpen] = React.useState(false)
  // const shortCode = team.code

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={[
          "group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]",
          "w-full h-[240px] sm:h-[280px] md:h-[340px]",
          "bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60",
          "border border-foreground/15",
          "ring-1 ring-foreground/10",
          "hover:shadow-xl transition-shadow",
          "flex flex-col items-center justify-center p-4 sm:p-5 md:p-6",
        ].join(" ")}
        aria-label={`${team.name} kartı`}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[1.9rem] md:rounded-[2.4rem] p-[1px]">
          <div className={`h-full w-full rounded-[1.8rem] md:rounded-[2.3rem] bg-gradient-to-br ${palette.ring} opacity-40`} />
        </div>

        {/* DÜZENLEME: Anasayfadaki canlı görünüm için 'z-10', 'ring-black/20' ve 'dark:ring-black/40' sınıfları eklendi. */}
        <div className={`relative z-10 grid place-items-center size-20 sm:size-24 md:size-32 rounded-full bg-gradient-to-br ${palette.ring} shadow-xl ${palette.glow} ring-1 ring-black/20 dark:ring-black/40 overflow-hidden`}>
          {team.logoUrl ? (
            <Image
              // --- DEĞİŞİKLİK: normalizeImageUrl kullanıldı ---
              src={normalizeImageUrl(team.logoUrl)}
              alt={team.name}
              fill
              className="object-cover"
              quality={60}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <Users className="size-5 sm:size-6 md:size-7 text-white/90" />
          )}
        </div>

        <div className="relative z-10 mt-2 sm:mt-3 md:mt-4 w-full px-2 sm:px-3 text-center">
          {team.about ? (
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight line-clamp-3 break-words min-h-[3.6em]">
              {team.about}
            </p>
          ) : (
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground/60 line-clamp-3 break-words min-h-[3.6em]">&nbsp;</p>
          )}
        </div>

        <div className="relative z-10 mt-2 sm:mt-3 text-center">
          <div className={`inline-flex items-center rounded-full px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-white bg-gradient-to-r ${palette.ring} backdrop-blur-[2px] shadow-md`}>
            {team.name}
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={[
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-xl w-[94vw] sm:w-[92vw] md:w-full overflow-hidden",
            "bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60",
            "border border-foreground/15 ring-1 ring-foreground/10",
            "text-foreground",
            "[&>button]:text-foreground [&>button]:hover:bg-foreground/10",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/5 via-transparent to-transparent" />
            <div className={`absolute inset-0 bg-gradient-to-br ${palette.ring} opacity-25`} />
          </div>
          <div className="z-10">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-2">
                <span className="break-words">{team.name}</span>
                {/* Removed code display span as per instructions */}
                {/* <span className="text-xs font-normal text-muted-foreground">{team.code}</span> */}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              {team.about && (
                <p className="text-xs sm:text-sm leading-relaxed text-foreground/85 break-words whitespace-pre-wrap">{team.about}</p>
              )}
              {team.categories?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {team.categories.map((c) => (
                    <Badge key={c} variant="secondary" className="rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="space-y-1.5 sm:space-y-2">
                {team.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-md border border-foreground/10 bg-foreground/5 backdrop-blur px-2 sm:px-3 py-1.5 sm:py-2">
                    <div>
                      <div className="text-xs sm:text-sm font-medium leading-tight">{m.name}</div>
                      {m.role && <div className="text-[10px] sm:text-xs text-muted-foreground">{m.role}</div>}
                    </div>
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs md:text-sm text-primary hover:underline flex-shrink-0">
                        <Linkedin className="size-3 sm:size-4" /> <span className="hidden sm:inline">LinkedIn</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function TeamsPuzzleGrid({ items }: { items: Team[] }) {
  const PALETTE = [
    { ring: "from-emerald-400 to-green-600", glow: "shadow-emerald-500/30", pill: "bg-emerald-600" },
    { ring: "from-sky-400 to-blue-600", glow: "shadow-sky-500/30", pill: "bg-blue-600" },
    { ring: "from-fuchsia-400 to-violet-600", glow: "shadow-fuchsia-500/30", pill: "bg-violet-600" },
    { ring: "from-amber-400 to-orange-600", glow: "shadow-amber-500/30", pill: "bg-orange-600" },
    { ring: "from-rose-400 to-pink-600", glow: "shadow-rose-500/30", pill: "bg-pink-600" },
  ]

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-3">
      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-2 lg:grid-cols-4">
        {items.map((t, i) => (
          <ScrollAnimation key={t.id} animation="scale-up" delay={(i % 8) * 80}>
            <TiltCard maxTilt={6}>
              <TeamCapsuleCard team={t} palette={PALETTE[i % PALETTE.length]} />
            </TiltCard>
          </ScrollAnimation>
        ))}
      </div>
    </div>
  )
}

export function TeamExplorer() {
  const [teams, setTeams] = React.useState<Team[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        // --- DEĞİŞİKLİK: API_BASE kullanıldı ---
        const response = await fetch(`${API_BASE}/teams`)
        if (!response.ok) {
          throw new Error("Veriler alınamadı. Sunucu hatası.")
        }
        const dataFromBackend = await response.json()

        const formattedTeams: Team[] = dataFromBackend.map((team: any) => ({
          id: team.id,
          name: team.name,
          logoUrl: team.photo_url,
          about: team.description,
          categories: [team.category],
          code: team.name.toUpperCase(),
          members: team.members.map((member: any) => ({
            id: member.id,
            name: member.name,
            role: member.role,
            linkedin: member.linkedin_url
          }))
        }));

        setTeams(formattedTeams)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeams()
  }, [])

  if (isLoading) {
    return <div className="text-center p-10">Takımlar yükleniyor...</div>
  }

  if (error) {
    return <div className="text-center p-10 text-destructive">Hata: {error}</div>
  }

  return (
    <div className="relative w-full">
      <Separator className="my-6" />
      <TeamsPuzzleGrid items={teams} />
    </div>
  )
}