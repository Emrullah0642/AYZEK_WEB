# ⚡ Hızlı Başlangıç Kılavuzu

AYZEK Platform frontend projesini 5 dakikada çalıştırın!

## 🎯 Minimum Gereksinimler

✅ Node.js 18.17.0+ (Önerilen: 20.x)  
✅ npm, pnpm veya yarn  
✅ Git

### Node.js Kurulu mu Kontrol Et

```bash
node --version  # v18.17.0 veya üzeri olmalı
npm --version   # v9.0.0 veya üzeri olmalı
```

## 📦 3 Adımda Kurulum

### 1️⃣ Bağımlılıkları Yükle

```bash
# npm ile
npm install

# VEYA pnpm ile (daha hızlı - önerilen)
npm install -g pnpm
pnpm install

# VEYA yarn ile
yarn install
```

### 2️⃣ Ortam Değişkenlerini Ayarla

`.env.local` dosyası oluştur:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.ayzek22.com.tr/api
NEXT_PUBLIC_API_BASE_URL=https://api.ayzek22.com.tr
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

### 3️⃣ Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

🎉 **Hazır!** [http://ayzek22.com.tr](http://ayzek22.com.tr) adresini tarayıcınızda açın.

---

## 🚀 Komutlar

```bash
# Geliştirme modunda çalıştır (hot reload ile)
npm run dev

# Production build oluştur
npm run build

# Production modunda çalıştır
npm run start

# Lint kontrolü
npm run lint
```

---

## 📍 Önemli Sayfalar

| Sayfa       | URL       | Açıklama          |
| ----------- | --------- | ----------------- |
| Ana Sayfa   | `/`       | Landing page      |
| Hakkımızda  | `/about`  | Topluluk hakkında |
| Blog        | `/blog`   | Blog yazıları     |
| Etkinlikler | `/events` | Etkinlik takvimi  |
| Takımlar    | `/teams`  | Ekip üyeleri      |
| Katıl       | `/join`   | Üyelik formu      |
| **Admin**   | `/admin`  | Yönetim paneli    |

---

## 🔐 Admin Paneli Erişimi

1. Tarayıcıda `/admin` sayfasına git
2. `.env.local` dosyasındaki şifreyi gir
3. İçerik yönetimine başla!

**Admin Paneli Özellikleri:**

- ✏️ Blog yazıları yönetimi
- 📅 Etkinlik yönetimi
- 👥 Takım üyeleri yönetimi
- 🖼️ Galeri yönetimi
- 📝 İçerik düzenleme
- ⏱️ Timeline yönetimi

---

## 🐛 Sorun mu Yaşıyorsun?

### Port 3000 kullanımda hatası

```bash
# Port'u kullanan işlemi durdur
lsof -ti:3000 | xargs kill -9

# Farklı port ile çalıştır
PORT=3001 npm run dev
```

### Module bulunamadı hatası

```bash
# Temiz kurulum
rm -rf node_modules package-lock.json
npm install
```

### Build hatası

```bash
# Cache temizle
rm -rf .next
npm run build
```

### TypeScript hataları

```bash
# TypeScript kontrolü
npx tsc --noEmit
```

---

## 🔧 Proje Yapısı (Basitleştirilmiş)

```
FRONTEND/
├── app/              # Sayfalar (Next.js App Router)
├── components/       # React bileşenleri
│   ├── admin/       # Admin panel bileşenleri
│   └── ui/          # UI bileşenleri (buttons, cards, vb.)
├── lib/             # Utility fonksiyonlar
│   ├── api.ts       # API client
│   └── utils.ts     # Helper'lar
├── public/          # Statik dosyalar (resimler, vb.)
└── .env.local       # Ortam değişkenleri (GİZLİ!)
```

---

## 📱 Development İpuçları

### Hot Reload Çalışmıyor

- Dosyayı kaydet (Cmd/Ctrl + S)
- Tarayıcıyı yenile
- Sunucuyu yeniden başlat

### Yeni Bileşen Ekleme

```bash
# components/ klasörüne yeni dosya ekle
touch components/yeni-bileşen.tsx
```

### Yeni Sayfa Ekleme

```bash
# app/ klasörüne klasör ve page.tsx ekle
mkdir app/yeni-sayfa
touch app/yeni-sayfa/page.tsx
```

### Tailwind CSS Kullanımı

```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">Merhaba Dünya!</div>
```

---

## 🎨 Tema Değiştirme

Uygulama otomatik dark/light tema desteğine sahip.  
Navbar'daki tema değiştirme butonunu kullanabilirsiniz!

---

## 📦 Yeni Paket Ekleme

```bash
# Production dependency
npm install paket-adi

# Development dependency
npm install -D paket-adi
```

---

## 🚢 Production'a Alma

### Vercel (En Kolay - Önerilen)

1. GitHub'a push et
2. [Vercel'e](https://vercel.com) import et
3. Ortam değişkenlerini ekle
4. Deploy!

```bash
# CLI ile (Vercel hesabı gerekli)
npm i -g vercel
vercel
```

### Manuel Deploy

```bash
# Build oluştur
npm run build

# Sunucuda çalıştır
npm start
```

---

## ✅ Checklist

Projeyi çalıştırmadan önce:

- [ ] Node.js 18.17.0+ kurulu
- [ ] `npm install` çalıştırıldı
- [ ] `.env.local` dosyası oluşturuldu
- [ ] Backend API çalışıyor (varsa)
- [ ] Port 3000 boş
- [ ] `npm run dev` çalıştırıldı
- [ ] http://ayzek22.com.tr açıldı

---

## 🆘 Daha Fazla Yardım

- 📖 **Detaylı Dokümantasyon:** `README.md`
- 📦 **Bağımlılık Listesi:** `DEPENDENCIES.md`
- 🚀 **Deploy Rehberi:** `DEPLOYMENT_CHECKLIST.md`

---

## 📞 İletişim

Sorularınız için:

- 🌐 Website: [ayzek22.com.tr](https://ayzek22.com.tr)
- 📧 Email: info@ayzek.com
- 💬 Discord: [AYZEK Community]

---

**İyi Kodlamalar! 🚀**

---

### 🎯 Pro Tip

pnpm kullanırsanız bağımlılıklar ~3x daha hızlı yüklenir:

```bash
npm install -g pnpm
pnpm install
pnpm dev
```

Node.js 20.x kullanmak da performansı artırır! 🔥
