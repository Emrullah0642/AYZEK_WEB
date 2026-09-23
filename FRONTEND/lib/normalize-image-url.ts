import { API_BASE } from "@/lib/api"

/** Backend'den gelen göreli/eksik resim yollarını (R2, /public/uploads vb.) tam URL'e çevirir. */
export function normalizeImageUrl(v: string | null | undefined): string {
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
