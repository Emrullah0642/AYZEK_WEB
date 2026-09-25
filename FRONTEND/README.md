# AYZEK Platform - Frontend

AYZEK topluluk platformunun modern, performanslı ve responsive frontend uygulaması.

## 🚀 Teknoloji Stacki

- **Framework:** Next.js 14.2.12
- **React:** 18.3.1
- **TypeScript:** 5.9.3
- **Styling:** Tailwind CSS 4.1.9
- **Animasyonlar:** Framer Motion 12.23.26
- **UI Kütüphanesi:** Radix UI
- **Form Yönetimi:** React Hook Form + Zod
- **HTTP İstekleri:** Axios 1.11.0
- **Tema Yönetimi:** next-themes
- **İkonlar:** Lucide React + React Icons

## 📋 Gereksinimler

Projeyi çalıştırmak için sisteminizde aşağıdakilerin kurulu olması gerekmektedir:

- **Node.js:** v18.17.0 veya üzeri (önerilen: v20.x)
- **npm:** v9.0.0 veya üzeri VEYA
- **pnpm:** v8.0.0 veya üzeri (önerilen)
- **Git:** v2.0.0 veya üzeri

### Node.js Kurulumu

```bash
# macOS (Homebrew ile)
brew install node

# Linux (nvm ile)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Kurulumu kontrol et
node --version
npm --version
```

## 🔧 Kurulum

### 1. Depoyu Klonlayın

```bash
git clone [repository-url]
cd FRONTEND
```

### 2. Bağımlılıkları Yükleyin

#### npm kullanarak:
```bash
npm install
```

#### pnpm kullanarak (önerilen):
```bash
# pnpm kurulu değilse önce kurun
npm install -g pnpm

# Bağımlılıkları yükleyin
pnpm install
```

#### yarn kullanarak:
```bash
yarn install
```

### 3. Ortam Değişkenlerini Ayarlayın

Projenizin kök dizininde `.env.local` dosyası oluşturun:

```bash
# .env.local dosyası oluştur
touch .env.local
```

Aşağıdaki değişkenleri ekleyin:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.ayzek22.com.tr/api
NEXT_PUBLIC_API_BASE_URL=https://api.ayzek22.com.tr

# Admin Configuration
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password_here

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id

# Optional: Sentry (Hata Takibi)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## 🏃‍♂️ Çalıştırma

### Development Modu

```bash
npm run dev
# veya
pnpm dev
# veya
yarn dev
```

Uygulama [http://ayzek22.com.tr](http://ayzek22.com.tr) adresinde çalışmaya başlayacaktır.

### Production Build

```bash
# Build oluştur
npm run build

# Production server'ı başlat
npm run start
```

### Linting

```bash
npm run lint
```

## 📦 Yüklü Ana Paketler

### Core Dependencies

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| next | ^14.2.12 | React framework |
| react | ^18.3.1 | UI kütüphanesi |
| react-dom | ^18.3.1 | React DOM renderer |
| typescript | ^5.9.3 | TypeScript desteği |

### UI & Styling

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| tailwindcss | ^4.1.9 | CSS framework |
| @radix-ui/* | ~1.x | UI primitive'leri |
| framer-motion | ^12.23.26 | Animasyon kütüphanesi |
| lucide-react | ^0.454.0 | İkon seti |
| next-themes | ^0.4.6 | Dark/Light tema |
| class-variance-authority | ^0.7.1 | CSS variant yönetimi |
| tailwind-merge | ^2.5.5 | Tailwind class birleştirme |

### Form & Validation

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| react-hook-form | ^7.60.0 | Form yönetimi |
| @hookform/resolvers | ^3.10.0 | Form resolver'ları |
| zod | 3.25.67 | Schema validation |

### Data & API

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| axios | ^1.11.0 | HTTP client |
| date-fns | 4.1.0 | Tarih işlemleri |

### UI Components & Effects

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| @tsparticles/react | ^3.0.0 | Parçacık efektleri |
| three | ^0.180.0 | 3D grafik kütüphanesi |
| vanta | ^0.5.24 | Animated backgrounds |
| embla-carousel-react | 8.5.1 | Carousel component |
| recharts | 2.15.4 | Grafik/chart kütüphanesi |

### Notifications & Toasts

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| sonner | ^1.7.4 | Toast notifications |
| react-hot-toast | ^2.6.0 | Toast notifications |

### Fonts

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| @fontsource/inter | ^5.2.8 | Inter font |
| @fontsource/orbitron | ^5.2.8 | Orbitron font |
| geist | ^1.3.1 | Geist font |

## 📁 Proje Yapısı

```
FRONTEND/
├── app/                      # Next.js App Router
│   ├── about/               # Hakkımızda sayfası
│   ├── admin/               # Admin paneli
│   ├── blog/                # Blog sayfası
│   ├── events/              # Etkinlikler sayfası
│   ├── join/                # Katılım formu
│   ├── teams/               # Takımlar sayfası
│   ├── layout.tsx           # Ana layout
│   ├── page.tsx             # Ana sayfa
│   └── globals.css          # Global stiller
├── components/              # React bileşenleri
│   ├── admin/              # Admin bileşenleri
│   ├── ui/                 # UI primitive'leri
│   └── ...                 # Diğer bileşenler
├── contexts/               # React Context'leri
├── hooks/                  # Custom React hooks
├── lib/                    # Utility fonksiyonlar
│   ├── api.ts             # API client
│   └── utils.ts           # Helper fonksiyonlar
├── public/                 # Statik dosyalar
├── styles/                # CSS dosyaları
├── package.json           # Bağımlılıklar
├── tsconfig.json          # TypeScript config
├── tailwind.config.js     # Tailwind config
└── next.config.mjs        # Next.js config
```

## 🌐 Sayfalar

- `/` - Ana sayfa
- `/about` - Hakkımızda
- `/blog` - Blog yazıları
- `/events` - Etkinlikler ve takvim
- `/teams` - Takım üyeleri
- `/join` - Katılım formu
- `/admin` - Admin paneli

## 🔐 Admin Paneli

Admin paneline erişim için:
1. `/admin` sayfasına gidin
2. `.env.local` dosyasında belirlediğiniz şifre ile giriş yapın

Admin panelinde yapabilecekleriniz:
- Blog yazıları yönetimi
- Etkinlik yönetimi
- Takım üyeleri yönetimi
- Galeri yönetimi
- İçerik düzenleme
- Timeline yönetimi

## 🎨 Tema

Uygulama dark/light tema desteğine sahiptir. Tema değiştirme butonu navbar'da bulunmaktadır.

## 🚀 Deployment

### Vercel (Önerilen)

```bash
# Vercel CLI kurulumu
npm i -g vercel

# Deploy
vercel
```

### Manuel Build

```bash
# Production build
npm run build

# Build çıktısı .next/ klasöründe oluşur
# Bu klasörü ve package.json'ı sunucunuza yükleyin

# Sunucuda:
npm install --production
npm start
```

## 🔧 Yapılandırma Dosyaları

- `next.config.mjs` - Next.js yapılandırması
- `tsconfig.json` - TypeScript yapılandırması
- `tailwind.config.js` - Tailwind CSS yapılandırması
- `postcss.config.cjs` - PostCSS yapılandırması
- `components.json` - shadcn/ui yapılandırması

## 🐛 Sorun Giderme

### Port zaten kullanımda

```bash
# 3000 portunu kullanan süreci bul ve durdur
lsof -ti:3000 | xargs kill -9

# Alternatif port ile çalıştır
PORT=3001 npm run dev
```

### Node modülleri problemi

```bash
# node_modules ve lock dosyalarını sil
rm -rf node_modules package-lock.json pnpm-lock.yaml

# Yeniden yükle
npm install
# veya
pnpm install
```

### Build hatası

```bash
# Cache'i temizle
rm -rf .next

# Yeniden build et
npm run build
```

## 📝 Geliştirme Notları

### Code Style

- ESLint ve TypeScript kurallarına uyun
- Component'ler functional component olmalı
- Hooks düzgün kullanılmalı
- Type safety önemlidir

### Commit Mesajları

```
feat: Yeni özellik
fix: Hata düzeltmesi
docs: Dokümantasyon
style: Stil değişiklikleri
refactor: Kod refactoring
test: Test ekleme/düzeltme
chore: Genel bakım
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

AYZEK Topluluğu
- Website: [ayzek22.com.tr](https://ayzek22.com.tr)
- Email: info@ayzek.com

## 📄 Lisans

Bu proje [MIT] lisansı altında lisanslanmıştır.

---

**Not:** Backend API'nin çalışır durumda olması gerekmektedir. Backend kurulumu için backend README dosyasına bakınız.

