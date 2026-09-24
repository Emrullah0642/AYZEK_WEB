"use client"

import { useState } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Images, UsersIcon, Trophy } from "lucide-react"
import { PosterManagement } from "@/components/admin/poster-management"
import { GalleryManagement } from "@/components/admin/gallery-management"
import { CrewManagement } from "@/components/admin/crew-management"
import { AwardsManagement } from "@/components/admin/awards-management"

export default function ContentManagementTab() {
  const { addNotification } = useAdmin()


  const handleNotify = (message: string) => {
    const isError = /hata|başarısız|yetkiniz yok|seçin/i.test(message)
    addNotification({
      type: "system",
      title: isError ? "Hata" : "Başarılı",
      message,
      read: false,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Ana Sayfa Poster Alanı */}
      <Card className="bg-gradient-to-br from-card/80 to-card/50 border-primary/20 hover:border-primary/40 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Home className="w-5 h-5 text-primary" />
            </div>
            Ana Sayfa Poster Alanı
          </CardTitle>
          <CardDescription>Ana sayfa banner ve hero bölümünü yönetin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PosterManagement onNotify={handleNotify} />
        </CardContent>
      </Card>

      {/* Etkinlik Galerisi */}
      <Card className="bg-gradient-to-br from-card/80 to-card/50 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Images className="w-5 h-5 text-orange-500" />
            </div>
            Etkinlik Galerisi
          </CardTitle>
          <CardDescription>Ana sayfa ve etkinlik sayfası galerilerini yönetin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GalleryManagement onNotify={handleNotify} />
        </CardContent>
      </Card>

      {/* Ekibimiz */}
      <Card className="bg-gradient-to-br from-card/80 to-card/50 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <UsersIcon className="w-5 h-5 text-pink-500" />
            </div>
            Ekibimiz
          </CardTitle>
          <CardDescription>Kategorilere göre ekip üyelerini yönetin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-3 py-2 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">4 kategori: Başkan, Sosyal Medya, Etkinlik, Eğitim</p>
          </div>
          <CrewManagement onNotify={handleNotify} />
        </CardContent>
      </Card>

      {/* Ödüllerimiz */}
      <Card className="bg-gradient-to-br from-card/80 to-card/50 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            Ödüllerimiz
          </CardTitle>
          <CardDescription>Topluluğun aldığı ödül ve başarıları yönetin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AwardsManagement onNotify={handleNotify} />
        </CardContent>
      </Card>
    </div>
  )
}
