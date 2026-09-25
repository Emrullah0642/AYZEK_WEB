import axios from "axios"

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "https://api.ayzek22.com.tr").replace(/\/+$/, "")

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // <--- KRİTİK AYAR: Tarayıcının Cookie göndermesini sağlar
  headers: { "Content-Type": "application/json" },
})

// ---- Journey Types ----
export type JourneyAchievement = {
  id?: number
  item_text: string
  sort_order?: number
}

export type JourneyEntry = {
  id: number
  year: number
  title: string
  description: string
  order_index: number
  achievements: JourneyAchievement[]
}

// ---- Journey API Calls ----
export async function getJourney(): Promise<JourneyEntry[]> {
  const { data } = await api.get<JourneyEntry[]>("/api/journey")
  return data
}

export async function createJourney(entry: Omit<JourneyEntry, "id">) {
  const { data } = await api.post<JourneyEntry>("/api/journey", entry)
  return data
}

export async function deleteJourney(id: number) {
  await api.delete(`/api/journey/${id}`)
}
