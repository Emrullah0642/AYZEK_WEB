"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminLogin } from "@/components/admin/admin-login"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { api } from "@/lib/api" // <-- ÖNEMLİ: Fetch yerine bunu kullanacağız
import { useAdmin } from "@/contexts/admin-context"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { setIsAdminLoggedIn } = useAdmin()

  // Sayfa yenilendiğinde cookie sayesinde otomatik giriş kontrolü
  const checkAuth = useCallback(async () => {
    try {
      await api.get("/admin/me")
      setIsAuthenticated(true)
      setIsAdminLoggedIn(true)
    } catch (e) {
      setIsAuthenticated(false)
      setIsAdminLoggedIn(false)
    }
  }, [setIsAdminLoggedIn])

  useEffect(() => {
    document.documentElement.classList.add("dark")
    checkAuth()
  }, [checkAuth])

  const handleLogin = async (credentials: { email: string; password: string; totp_code?: string }) => {
    setIsLoading(true)
    setError("")

    try {
      // FETCH YERİNE API KULLANIYORUZ
      // Çünkü api.ts içinde 'withCredentials: true' ayarı var.
      // Bu sayede HttpOnly Cookie çalışır.
      const response = await api.post("/admin/login", credentials)

      if (response.status === 200) {
        setIsAuthenticated(true)
        setIsAdminLoggedIn(true)
      }
    } catch (err: any) {
      // Axios hata yapısı fetch'ten farklıdır
      const detail = err.response?.data?.detail

      if (detail === "2FA_REQUIRED") {
        // Bu hata değil, bir sinyaldir. Bunu yukarı fırlatıp AdminLogin'in yakalamasını sağlıyoruz.
        throw new Error("2FA_REQUIRED")
      }
      
      const msg = detail || "Giriş başarısız. Lütfen tekrar deneyin."
      setError(msg)
      
      // Hata olduğunu login bileşenine bildir
      throw err 
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post("/admin/logout")
    } catch (error) {
      console.error("Çıkış hatası", error)
    }
    setIsAuthenticated(false)
    setIsAdminLoggedIn(false)
    setError("")
    // Çıkış sonrası sayfayı yenilemek cookie temizliği için en garanti yoldur
    window.location.href = "/admin"
  }
 
  if (!isAuthenticated) {
    // onLogin prop'una dikkat et, async işlem sonucunu bekliyor
    return <AdminLogin onLogin={handleLogin} isLoading={isLoading} error={error} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}