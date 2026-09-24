"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Loader2, Home, Zap, ShieldCheck, ArrowLeft } from "lucide-react"

// --- TİP TANIMLARI ---
interface LoginCredentials {
  email: string;
  password: string;
  totp_code?: string;
}

interface AdminLoginProps {
  onLogin: (credentials: LoginCredentials) => Promise<any>;
  isLoading?: boolean;
  error?: string;
}

export function AdminLogin({ onLogin, isLoading = false, error: propError }: AdminLoginProps) {
  // Login Aşamaları: 1=Email/Pass, 2=2FA Code
  const [step, setStep] = useState<1 | 2>(1)
  
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [totpCode, setTotpCode] = useState("")
  
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  // Giriş formu baştan görünür olsun — "fişi tak" animasyonu dekoratif kalsın,
  // kritik işlevselliği (e-posta/şifre alanları) bir tıklamanın arkasına gizlemesin.
  const [isPluggedIn, setIsPluggedIn] = useState(true)
  const [showSparkles, setShowSparkles] = useState(false)
  
  // Yerel hata state'i
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.add("dark")
  }, [])

  // Prop'tan gelen hatayı izle
  useEffect(() => {
    if (propError) {
        if (propError === "2FA_REQUIRED") {
            setStep(2);
            setLocalError(null);
        } else {
            setLocalError(propError);
        }
    }
  }, [propError]);

  // --- DÜZELTİLEN FONKSİYON BURASI ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    try {
        if (step === 1) {
            // --- ADIM 1: KULLANICI ADI & ŞİFRE ---
            if (!credentials.email || !credentials.password) {
                setShowErrorDialog(true)
                return
            }
            // Backend'e istek at (Kodsuz)
            await onLogin(credentials);
        } else {
            // --- ADIM 2: 2FA KODU ---
            if (totpCode.length < 6) {
                setLocalError("Kod 6 haneli olmalıdır");
                return;
            }
            // Backend'e istek at (Kodlu)
            await onLogin({ ...credentials, totp_code: totpCode });
        }
    } catch (err: any) {
        // Hata Yakalama (page.tsx'ten fırlatılan hatalar buraya düşer)
        if (err?.message === "2FA_REQUIRED") {
            setStep(2);
            setLocalError(null); // 2. adıma geçerken hata mesajını temizle
        } else {
            setLocalError(err?.message || "Giriş başarısız.");
        }
    }
  }

  const handlePlugToggle = () => {
    setShowSparkles(true)
    setTimeout(() => {
      setIsPluggedIn(!isPluggedIn)
      setShowSparkles(false)
      // Fiş çekilince state'leri sıfırla
      if (isPluggedIn) {
          setStep(1);
          setCredentials({ email: "", password: "" });
          setTotpCode("");
          setLocalError(null);
      }
    }, 400)
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-muted p-4 dark overflow-hidden relative">
        <Button
          variant="outline"
          size="sm"
          className="absolute top-6 left-6 bg-background/50 border-primary/20 hover:bg-background/70 z-50 transition-all"
          onClick={() => (window.location.href = "/")}
        >
          <Home className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Button>

        <div className="relative z-10 flex items-center justify-between w-full max-w-7xl mx-auto px-8">
          {/* Sol Taraf - Fiş ve Lamba Animasyonu */}
          <div className="flex items-center gap-24">
            {/* Priz Bölümü */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <p className="text-sm font-semibold text-cyan-400">Enerjiyi Verin</p>
              </motion.div>

              <div className="relative">
                <motion.button
                  onClick={handlePlugToggle}
                  className="relative w-20 h-28 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg shadow-2xl cursor-pointer hover:scale-105 transition-all duration-300 border-3 border-slate-400"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4">
                    <div className="flex gap-5 justify-center">
                      <motion.div
                        className={`w-2.5 h-6 rounded-full transition-all duration-300 ${
                          isPluggedIn ? "bg-cyan-400 shadow-lg shadow-cyan-400/50" : "bg-slate-700"
                        }`}
                        animate={{
                          boxShadow: isPluggedIn
                            ? ["0 0 10px rgba(34,211,238,0.5)", "0 0 20px rgba(34,211,238,0.8)", "0 0 10px rgba(34,211,238,0.5)"]
                            : "none",
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                      <motion.div
                        className={`w-2.5 h-6 rounded-full transition-all duration-300 ${
                          isPluggedIn ? "bg-cyan-400 shadow-lg shadow-cyan-400/50" : "bg-slate-700"
                        }`}
                        animate={{
                          boxShadow: isPluggedIn
                            ? ["0 0 10px rgba(34,211,238,0.5)", "0 0 20px rgba(34,211,238,0.8)", "0 0 10px rgba(34,211,238,0.5)"]
                            : "none",
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </div>
                    <div className="flex justify-center">
                      <motion.div
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          isPluggedIn ? "bg-cyan-400 shadow-lg shadow-cyan-400/50" : "bg-slate-700"
                        }`}
                        animate={{
                          boxShadow: isPluggedIn
                            ? ["0 0 10px rgba(34,211,238,0.5)", "0 0 20px rgba(34,211,238,0.8)", "0 0 10px rgba(34,211,238,0.5)"]
                            : "none",
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </div>
                  </div>

                  <motion.div
                    className={`absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      isPluggedIn ? "bg-green-500" : "bg-slate-500"
                    }`}
                    animate={{
                      opacity: isPluggedIn ? [0.5, 1, 0.5] : 0.3,
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </motion.button>

                <AnimatePresence>
                  {showSparkles && (
                    <>
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                          style={{
                            left: "50%",
                            top: "50%",
                          }}
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            x: Math.cos((i * Math.PI * 2) / 8) * 50,
                            y: Math.sin((i * Math.PI * 2) / 8) * 50,
                          }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.5 }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Masa Lambası Bölümü */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative flex flex-col items-center"
            >
              <div className="absolute -left-[140px] top-[150px] w-40 h-1">
                <svg width="147" height="80" viewBox="0 0 168 80" className="absolute -top-10">
                  <motion.path
                    d="M 0 40 Q 42 20, 84 40 T 168 40"
                    stroke={isPluggedIn ? "#22d3ee" : "#64748b"}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    animate={{
                      stroke: isPluggedIn ? ["#22d3ee", "#06b6d4", "#22d3ee"] : "#64748b",
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  {isPluggedIn && (
                    <motion.circle
                      r="3"
                      fill="#67e8f9"
                      initial={{ offsetDistance: "0%" }}
                      animate={{ offsetDistance: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    >
                      <animateMotion dur="1.5s" repeatCount="indefinite">
                        <mpath href="#cable-path" />
                      </animateMotion>
                    </motion.circle>
                  )}
                  <path id="cable-path" d="M 0 40 Q 42 20, 84 40 T 168 40" fill="none" />
                </svg>
              </div>

              <AnimatePresence>
                {isPluggedIn && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute inset-0 -z-10"
                  >
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative h-64 flex flex-col items-center justify-end">
                <div className="absolute bottom-0 w-40 h-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full shadow-2xl">
                  <div className="absolute inset-x-8 top-0 h-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full"></div>
                  <div className="absolute inset-x-14 top-0 h-full bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 rounded-full"></div>
                </div>

                <div className="absolute bottom-4 w-4 h-28 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 rounded-full shadow-xl">
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-slate-500/50 to-transparent rounded-l-full"></div>
                </div>

                <div className="absolute bottom-32 w-2 h-20 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full transform rotate-12 origin-bottom shadow-lg"></div>

                <div className="absolute bottom-44 -left-8 transform rotate-12">
                  <motion.div
                    className="relative w-32 h-24"
                    animate={{
                      filter: isPluggedIn ? "drop-shadow(0 8px 25px rgba(34,211,238,0.5))" : "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-t-3xl shadow-xl"
                         style={{
                           clipPath: "polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)"
                         }}>
                      <div className="absolute top-0 left-1/4 right-1/4 h-2 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 rounded-t-full"></div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
                      <motion.div
                        className="w-full h-full rounded-b-2xl"
                        animate={{
                          background: isPluggedIn
                            ? "linear-gradient(to bottom, #a5f3fc, #67e8f9, #22d3ee)"
                            : "linear-gradient(to bottom, #334155, #1e293b, #0f172a)",
                          boxShadow: isPluggedIn 
                            ? "inset 0 -10px 30px rgba(34,211,238,0.8)" 
                            : "inset 0 -5px 15px rgba(0,0,0,0.5)",
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        {isPluggedIn && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              className="w-16 h-16 bg-cyan-300 rounded-full blur-xl"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.6, 0.9, 0.6],
                              }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          </div>
                        )}
                      </motion.div>
                    </div>

                  </motion.div>
                </div>

                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-600 rounded-full shadow-inner"></div>
              </div>

              <AnimatePresence mode="wait">
                {isPluggedIn && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ 
                        opacity: [0, 0.45, 0.45],
                        scaleX: [0, 0, 1]
                      }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{
                        opacity: { duration: 0.3, times: [0, 0.3, 1] },
                        scaleX: { duration: 1.5, times: [0, 0.2, 1], ease: "easeOut" }
                      }}
                      className="absolute left-17 -top-40 w-[750px] h-[450px] -z-20 will-change-transform"
                      style={{ 
                        transformOrigin: "left center",
                        transform: "translate3d(0, 0, 0)"
                      }}
                    >
                      <div 
                        className="w-full h-full bg-gradient-to-r from-cyan-400/45 via-cyan-400/15 to-transparent blur-2xl"
                        style={{
                          clipPath: "polygon(0% 38%, 0% 62%, 100% 75%, 100% 25%)",
                          transform: "rotate(3deg) translate3d(0, 0, 0)",
                          willChange: "transform"
                        }}
                      ></div>
                    </motion.div>

                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 0.7, 0.5, 0],
                          x: [0, 200 + i * 150, 200 + i * 150, 200 + i * 150],
                          scale: [0, 1, 1, 0.5]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 2.2,
                          delay: 0.4 + i * 0.2,
                          times: [0, 0.2, 0.7, 1],
                          ease: "easeOut"
                        }}
                        className="absolute left-14 top-0 w-6 h-6 bg-cyan-300/50 rounded-full blur-sm -z-10 will-change-transform"
                        style={{ transform: "translate3d(0, 0, 0)" }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sağ Taraf - Giriş Formu */}
          <AnimatePresence>
            {isPluggedIn && (
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="relative ml-auto"
              >
                <div className="relative bg-card/50 backdrop-blur-xl p-8 rounded-3xl border border-cyan-500/20 shadow-2xl min-w-[400px]">
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 blur-xl -z-10"></div>

                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg"
                    >
                      {step === 1 ? (
                        <Zap className="w-8 h-8 text-white" />
                      ) : (
                        <ShieldCheck className="w-8 h-8 text-white" />
                      )}
                    </motion.div>
                    <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text mb-2">
                      {step === 1 ? "Welcome Back" : "Güvenlik Doğrulaması"}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {step === 1 ? "AYZEK Yönetici Paneline Hoş Geldiniz" : "Lütfen Authenticator kodunuzu girin"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ADIM 1: EMAİL & ŞİFRE */}
                    {step === 1 && (
                        <>
                            <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                            >
                            <Label htmlFor="email">E-posta Adresi</Label>
                            <Input
                                id="email"
                                type="email"
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                placeholder="ayzekselcukuni@gmail.com"
                                required
                                className="bg-background/50 border-cyan-500/20 focus:border-cyan-500 h-12 rounded-xl transition-all"
                            />
                            </motion.div>

                            <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-2"
                            >
                            <Label htmlFor="password">Şifre</Label>
                            <Input
                                id="password"
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                className="bg-background/50 border-cyan-500/20 focus:border-cyan-500 h-12 rounded-xl transition-all"
                            />
                            </motion.div>
                        </>
                    )}

                    {/* ADIM 2: 2FA KODU */}
                    {step === 2 && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-2"
                        >
                            <Label htmlFor="totp_code" className="text-center block mb-2">Authenticator Kodu</Label>
                            <Input
                                id="totp_code"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={totpCode}
                                onChange={(e) => {
                                    setTotpCode(e.target.value.replace(/[^0-9]/g, ""))
                                }}
                                placeholder="000000"
                                required
                                autoFocus
                                className="bg-background/50 border-cyan-500/20 focus:border-cyan-500 h-14 rounded-xl text-center text-2xl tracking-[0.5em] font-mono transition-all placeholder:tracking-normal"
                            />
                        </motion.div>
                    )}

                    <AnimatePresence>
                      {(localError) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 rounded-xl bg-destructive/10 border border-destructive/30"
                        >
                          <p className="text-sm text-destructive text-center">{localError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex flex-col gap-3"
                    >
                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Kontrol Ediliyor...
                          </>
                        ) : (
                          step === 1 ? "Giriş Yap" : "Doğrula ve Gir"
                        )}
                      </Button>

                      {step === 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => { setStep(1); setTotpCode(""); setLocalError(null); }}
                            className="w-full text-muted-foreground hover:text-cyan-400"
                          >
                              <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
                          </Button>
                      )}
                    </motion.div>

                    {step === 1 && (
                        <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-center mt-4"
                        >
                        <button
                            type="button"
                            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            onClick={() => setShowErrorDialog(true)}
                        >
                            Şifremi Unuttum?
                        </button>
                        </motion.div>
                    )}
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="max-w-md bg-card border-cyan-500/20">
          <DialogHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="mx-auto w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4"
            >
              <AlertCircle className="w-8 h-8 text-cyan-500" />
            </motion.div>
            <DialogTitle>Bilgi</DialogTitle>
            <DialogDescription>
              Şifrenizi sıfırlamak için lütfen ayzekselcukuni@gmail.com ile iletişime geçin.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowErrorDialog(false)}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Tamam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}