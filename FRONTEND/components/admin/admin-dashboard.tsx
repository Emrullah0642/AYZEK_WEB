"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Lightbulb, LogOut, FileText, Lock, ShieldCheck, QrCode, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Alt Bileşenler (Dosya yollarını kontrol et)
import EventsTab from "@/components/admin/admin-etkinlikler";
import ContentManagementTab from "@/components/admin/admin-icerik-yonetim";
import { api } from "@/lib/api";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pendingSuggestions: 0
  });
  
  const [clientLoaded, setClientLoaded] = useState(false);

  // --- 2FA STATE ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ secret: string; qr_code: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // --- BAŞLANGIÇ YÜKLEMELERİ ---
  useEffect(() => {
    setClientLoaded(true);
    fetchAdminProfile();
    fetchDashboardStats();
  }, []);

  const getAuthHeader = () => {
    // lib/api.ts zaten cookie kullanıyor ama manuel header gerekiyorsa:
    // const token = localStorage.getItem("admin_token");
    // return { headers: { Authorization: `Bearer ${token}` } };
    return {}; // Cookie tabanlı sistemde gerek yok
  };

  const fetchAdminProfile = async () => {
    try {
      const { data } = await api.get("/admin/me");
      setIs2FAEnabled(data.is_2fa_enabled);
    } catch (e) {
      console.error("Admin bilgisi alınamadı", e);
    }
  };

  // Sadece istatistik sayıları için (Listeler alt bileşenlerde çekiliyor)
  const fetchDashboardStats = async () => {
    try {
      const [eventsRes] = await Promise.all([
        api.get("/events"),
        // api.get("/event-suggestions") // Backend'de varsa ekle
      ]);

      const events = eventsRes.data || [];
      const suggestions = []; // suggestionsRes.data || [];

      const upcoming = events.filter((e: any) => new Date(e.start_at) > new Date()).length;
      const pending = 0; // suggestions.filter((s: any) => s.status === "pending").length;

      setStats({
        totalEvents: events.length,
        upcomingEvents: upcoming,
        pendingSuggestions: pending
      });
    } catch (e) {
      console.error("İstatistikler alınamadı:", e);
    }
  };

  // --- 2FA İŞLEMLERİ ---
  const handleStart2FASetup = async () => {
    try {
      const { data } = await api.post("/admin/2fa/setup");
      setQrCodeData(data);
    } catch (e: any) {
      toast.error("QR Kod oluşturulamadı.");
    }
  };

  const handleVerify2FA = async () => {
    if (!qrCodeData || verifyCode.length !== 6) return;
    setIsVerifying(true);
    try {
      await api.post("/admin/2fa/enable", {
        secret: qrCodeData.secret,
        code: verifyCode
      });
      
      setIs2FAEnabled(true);
      setQrCodeData(null);
      setVerifyCode("");
      setShowSecurityDialog(false);
      toast.success("İki aşamalı doğrulama aktif!");
    } catch (e: any) {
      toast.error("Kod doğrulanamadı.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm("İki aşamalı doğrulamayı kapatmak istiyor musunuz?")) return;
    try {
      await api.post("/admin/2fa/disable");
      setIs2FAEnabled(false);
      toast.success("İki aşamalı doğrulama kapatıldı.");
    } catch (e) {
      toast.error("İşlem başarısız.");
    }
  };

  if (!clientLoaded) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted dark">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-xl items-center justify-between">
          <div className="relative flex items-center h-10 rounded px-3">
            <div className="absolute inset-0 rounded bg-ayzek-gradient" />
            <div className="relative z-10 flex items-center gap-2">
              <span className="text-white text-lg font-display font-bold tracking-wide">AYZEK</span>
              <span className="text-white/70">•</span>
              <span className="text-white text-lg font-display font-semibold tracking-wide">Yönetici Paneli</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* GÜVENLİK BUTONU */}
            <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10 bg-transparent gap-2">
                  {is2FAEnabled ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-yellow-500" />}
                  Güvenlik
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Güvenlik Ayarları</DialogTitle>
                  <DialogDescription>Hesap güvenliğinizi yönetin.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {is2FAEnabled ? (
                    <div className="text-center space-y-4">
                      <ShieldCheck className="w-16 h-16 text-green-500 mx-auto" />
                      <p>2FA Aktif ve hesabınız güvende.</p>
                      <Button variant="destructive" onClick={handleDisable2FA} className="w-full">Devre Dışı Bırak</Button>
                    </div>
                  ) : (
                    !qrCodeData ? (
                      <div className="text-center space-y-4">
                        <Lock className="w-16 h-16 text-yellow-500 mx-auto" />
                        <p>Google Authenticator ile hesabınızı koruyun.</p>
                        <Button onClick={handleStart2FASetup} className="w-full bg-gradient-to-r from-primary to-accent">
                          <QrCode className="w-4 h-4 mr-2" /> Kurulumu Başlat
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 text-center">
                        <img src={qrCodeData.qr_code} alt="QR Code" className="mx-auto w-40 h-40" />
                        <Input 
                          value={verifyCode} 
                          onChange={(e) => setVerifyCode(e.target.value.slice(0, 6))} 
                          placeholder="000000" 
                          className="text-center text-lg tracking-widest" 
                        />
                        <Button onClick={handleVerify2FA} disabled={verifyCode.length !== 6 || isVerifying} className="w-full">
                          {isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Doğrula
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={onLogout} className="border-primary/20 hover:bg-primary/10 bg-transparent">
              <LogOut className="w-4 h-4 mr-2" /> Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-screen-xl mx-auto p-6">
        {/* İSTATİSTİKLER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-card/80 to-card/50 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Toplam Etkinlik</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card/80 to-card/50 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Yaklaşan</CardTitle>
              <Calendar className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{stats.upcomingEvents}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card/80 to-card/50 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Öneriler</CardTitle>
              <Lightbulb className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{stats.pendingSuggestions}</div>
            </CardContent>
          </Card>
        </div>

        {/* ANA SEKMELER */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 border border-primary/10">
            <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" /> Etkinlikler
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" /> İçerik Yönetimi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            {/* !!! DEĞİŞİKLİK BURADA: events={...} gitti, sadece onNotify kaldı !!! */}
            <EventsTab onNotify={(msg) => toast.success(msg)} />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentManagementTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}