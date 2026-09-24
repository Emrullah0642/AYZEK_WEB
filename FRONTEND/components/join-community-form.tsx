"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function JoinCommunityForm() {
  return (
    <Card className="max-w-4xl mx-auto bg-[#bfbfbf] border border-foreground/10">
      <CardHeader className="text-center p-4 sm:p-5 md:p-6">
        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-display text-black">AYZEK Topluluğuna Katıl</CardTitle>
        <CardDescription className="text-sm sm:text-base md:text-lg text-black/80">
          Başvurunu aşağıdaki form üzerinden tamamlayabilirsin. Gönderdiğinde bilgiler doğrudan değerlendirme sistemimize düşecektir.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full overflow-hidden rounded-lg sm:rounded-xl">
          <iframe
            src="https://forms.gle/9jLTrgpc5uSZCuVu8"
            className="w-full h-[1700px] sm:h-[1400px] md:h-[1150px] lg:h-[950px]"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            loading="lazy"
          >
            Yükleniyor…
          </iframe>
        </div>
      </CardContent>
    </Card>
  )
}
