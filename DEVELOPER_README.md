# 👨‍💻 SPOLDER Web Sitesi - Geliştiriciler README

## 📋 İçindekiler
1. [Proje Hakkında](#proje-hakkında)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Kurulum](#kurulum)
4. [Proje Yapısı](#proje-yapısı)
5. [Backend Kurulumu (Natro VPS)](#backend-kurulumu-natro-vps)
6. [Önemli Dosyalar](#önemli-dosyalar)
7. [Güvenlik Bilgileri](#güvenlik-bilgileri)
8. [API Endpoints](#api-endpoints)
9. [Deployment](#deployment)
10. [Sorun Giderme](#sorun-giderme)
11. [Katkıda Bulunma](#katkıda-bulunma)

---

## 🎯 Proje Hakkında

**SPOLDER** - Spor Politikaları Derneği'nin resmi web sitesidir.

> **Not:** Bu site 2026 başında Vercel + Supabase'ten tamamen ayrılıp Natro
> XCloud VPS üzerinde self-hosted bir Node/Express + PostgreSQL backend'e
> taşındı. Vercel ve Supabase artık hiçbir şekilde kullanılmıyor. Bu README
> güncel mimariyi anlatır.

### Özellikler
- ✅ Responsive Admin Dashboard
- ✅ Haber, Etkinlik, Proje, Blog Yönetimi
- ✅ İletişim Formu
- ✅ Harita İntegrasyonu (OpenStreetMap/Leaflet)
- ✅ SEO Optimizasyonu
- ✅ Activity Logging
- ✅ Multi-language ready (TR)

---

## 🛠 Teknoloji Stack

| Katman | Teknoloji | Versiyon |
|--------|-----------|---------|
| **Frontend** | React + TypeScript | 18.x |
| **Build** | Vite | 7.x |
| **UI Framework** | Shadcn/UI + Tailwind CSS | Latest |
| **Backend** | Node.js + Express + PostgreSQL (self-hosted) | Latest |
| **Auth** | Kendi JWT tabanlı oturum sistemi (`admin_users` tablosu) | Session cookie |
| **Maps** | Leaflet + React-Leaflet + OpenStreetMap | 4.x |
| **Hosting** | Natro XCloud VPS + Nginx + PM2 | - |
| **Package Manager** | npm | Latest |

---

## 📦 Kurulum

### Ön Gereksinimler
```bash
- Node.js 18+
- npm
- Git
- Erişimi olan bir PostgreSQL veritabanı (yerelde geliştirme için de gerekir)
```

### 1. Repository'i Clone Edin
```bash
git clone https://github.com/spolderdernegi-del/spolder-website-final.git
cd spolder-website-final
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
cd server && npm install && cd ..
```

### 3. Backend Environment Variables Ayarlayın
Frontend'in build zamanında ihtiyaç duyduğu bir env değişkeni yok — her şey
aynı origin'den relative path'lerle backend'e gidiyor. Sadece backend'in
kendi `.env` dosyası gerekiyor:

```bash
cp env.example server/.env
```

`server/.env` dosyasını doldurun (bkz. `env.example` içindeki açıklamalar):
`DATABASE_URL`, `SESSION_SECRET`, `ALLOWED_ORIGINS`, `NODE_ENV`, `PORT`.

### 4. Veritabanını Hazırlayın
`admin_users` tablosu ve diğer tablolar için bir migration/şema betiği
elle uygulanmalı (bkz. Backend Kurulumu bölümü). Sonra ilk admin kullanıcıyı
oluşturun:
```bash
cd server
ADMIN_EMAIL="admin@spolder.org" ADMIN_PASSWORD="güçlü_bir_şifre" npm run seed:admin
```

### 5. Development Server'ı Başlatın
```bash
# Terminal 1: backend
cd server && npm start

# Terminal 2: frontend (Vite dev server, backend'e proxy ayarı gerekebilir)
npm run dev
```

### 6. Build Yapın
```bash
npm run build
```
Backend, `dist/` klasörünü statik olarak servis eder ve API dışındaki tüm
yolları SPA fallback ile `index.html`'e yönlendirir (bkz. `server/index.js`
sonundaki static/fallback bloğu).

---

## 📁 Proje Yapısı

```
spolder-website-final/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   ├── about/           # About page components
│   │   ├── home/            # Home page components
│   │   ├── ui/              # Shadcn UI components
│   │   └── admin/           # Admin components (Map, Image Upload, etc)
│   │
│   ├── pages/
│   │   ├── Index.tsx        # Homepage
│   │   ├── Hakkimizda.tsx   # About page (Başkan mesajı burada)
│   │   ├── Haberler.tsx     # News listing
│   │   ├── HaberDetay.tsx   # News detail
│   │   ├── Etkinlikler.tsx  # Events listing
│   │   ├── EtkinlikDetay.tsx# Event detail
│   │   ├── Projeler.tsx     # Projects listing
│   │   ├── Blog.tsx         # Blog listing
│   │   ├── Yayinlar.tsx     # Publications
│   │   ├── Search.tsx       # Search page
│   │   ├── Iletisim.tsx     # Contact page (form + map)
│   │   └── admin/           # Admin pages
│   │       ├── Login.tsx    # Login page (kendi JWT session sistemi)
│   │       ├── Dashboard.tsx # Main dashboard
│   │       ├── Settings.tsx # Site settings + şifre değiştirme
│   │       ├── News.tsx     # News management
│   │       ├── Events.tsx   # Events management
│   │       ├── Projects.tsx # Projects management
│   │       ├── Blog.tsx     # Blog management
│   │       ├── Files.tsx    # Publications management
│   │       ├── Board.tsx    # Board members
│   │       ├── Categories.tsx
│   │       ├── ContactMessages.tsx
│   │       └── MediaLibrary.tsx
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts    # ⚠️ İsmine rağmen Supabase DEĞİL — kendi
│   │       │                #    backend'imize istek atan bir uyum
│   │       │                #    ("shim") katmanı. Bkz. dosyanın başındaki
│   │       │                #    açıklama.
│   │       └── types.ts     # TypeScript types
│   │
│   ├── lib/
│   │   ├── utils.ts         # Utility functions
│   │   ├── toast.ts         # Toast notifications
│   │   ├── logger.ts        # Production-safe logging
│   │   ├── activityLog.ts   # Activity logging
│   │   ├── dataManager.ts   # Export/Import
│   │   └── searchIndex.ts   # Search functionality
│   │
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   │
│   ├── App.tsx              # Main router
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
│
├── server/                   # Self-hosted backend (Natro VPS'te çalışır)
│   ├── index.js              # Express app: /api/auth/*, /api/db/*, static+SPA
│   ├── seed-admin.js         # İlk admin kullanıcıyı oluşturur/sıfırlar
│   ├── reset-password.js     # Acil durum şifre sıfırlama (SSH erişimi gerekir)
│   └── package.json
│
├── public/                   # Static assets
├── dist/                     # Build output (backend tarafından servis edilir)
├── .gitignore               # Git ignore rules
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind config
├── package.json             # Frontend dependencies
└── env.example              # Backend .env şablonu
```

---

## 🔌 Backend Kurulumu (Natro VPS)

Bu bölüm, sıfırdan yeni bir sunucuda backend'i ayağa kaldırmak için gereken
adımları özetler (mevcut production sunucusu zaten kurulu).

### 1. PostgreSQL Veritabanı Oluşturun
Sunucuda (veya yönetilen bir PostgreSQL servisinde) boş bir veritabanı
oluşturun ve `DATABASE_URL`'i buna göre ayarlayın.

### 2. Tabloları Oluşturun
`server/index.js` içindeki `PUBLIC_READ_TABLES` / `ALL_TABLES` listesi
uygulamanın kullandığı tabloları gösterir: `categories`, `board`,
`bank_info`, `events`, `news`, `blog`, `projects`, `files`, `settings`,
`contact_messages`, ayrıca girişler için `admin_users`. Bu projenin geçmişi
Supabase'ten geldiği için tabloların ilk şeması eski `supabase/*.sql`
dosyalarından türetilmiştir, ancak artık RLS (Row Level Security) veya
Supabase'e özgü hiçbir şey kullanılmıyor — tüm erişim kontrolü doğrudan
`server/index.js` içindeki Express middleware'lerinde yapılıyor.

### 3. İlk Admin Kullanıcıyı Oluşturun
```bash
cd server
ADMIN_EMAIL="admin@spolder.org" ADMIN_PASSWORD="güçlü_bir_şifre" npm run seed:admin
```

### 4. Şifremi unuttum / erişimi kaybettim
Panelden "Şifre Değiştir" mevcut şifreyi bilmeyi gerektirir. Hiç giriş
yapılamıyorsa, sunucuya SSH ile bağlanıp doğrudan çalıştırın:
```bash
cd /var/www/spolder
node server/reset-password.js admin@spolder.org YeniGucluSifre123
```

---

## 📄 Önemli Dosyalar

### src/integrations/supabase/client.ts
```typescript
// Adı yanıltıcı: bu dosya artık Supabase SDK'sını İÇERMİYOR.
// Supabase JS istemcisinin API yüzeyini (.from(table).select()... vb.)
// taklit eden küçük bir "shim" — gerçek istekler kendi backend'imizin
// /api/db/* ve /api/auth/* uçlarına relative path'lerle gidiyor.
```

### src/App.tsx
```typescript
// Router tanımı
// Tüm sayfaların routing'i burada yapılır
// /admin/* sayfaları ProtectedRoute ile korunur
```

### src/lib/logger.ts
```typescript
// Production-safe logging
// Development'ta console.log çalışır, production'da çalışmaz
// import { logger } from '@/lib/logger';
// logger.error('Error message');
```

### src/pages/admin/Login.tsx
```typescript
// Kendi backend'imizin /api/auth/login uç noktasını çağırır.
// Sunucu, httpOnly + secure çerezde bir JWT (spolder_session) döner.
// localStorage kullanılmıyor.
```

### server/index.js
```javascript
// Tüm backend burada: helmet + CORS + rate limiting, JWT tabanlı
// /api/auth/* uçları, whitelist'li tablolar üzerinde generic /api/db/*
// CRUD uçları, ve son olarak dist/ için statik dosya servisi + SPA fallback.
```

### src/components/admin/GoogleMapPicker.tsx
```typescript
// İsmine rağmen Google Maps KULLANMIYOR — OpenStreetMap/Leaflet
// entegrasyonu. Location picker for events and settings.
// Marker drag-and-drop + click-to-place.
```

---

## 🔒 Güvenlik Bilgileri

### Erişim kontrolü
- Tüm yazma uçları (`POST`/`PUT`/`DELETE` — `contact_messages`'a public
  form gönderimi hariç) `requireAdmin` middleware'i ile korunur: geçerli bir
  `spolder_session` JWT çerezi olmayan istekler 401 alır.
- Okuma (`GET /api/db/:table`) `PUBLIC_READ_TABLES` listesindeki tablolar
  için herkese açıktır (eski Supabase RLS "herkes okuyabilir" politikasının
  karşılığı) — `contact_messages` hariç, o sadece admin'e açık.
- `settings` tablosu karışıktır (halka açık iletişim/IBAN bilgileri +
  yalnızca admin'e ait değerler); `server/index.js` içinde
  `PUBLIC_SETTINGS_KEYS` allowlist'i, oturumsuz isteklerin bu listedeki
  anahtarlar dışında hiçbir satırı göremeyeceğini garanti eder.
- SQL enjeksiyonuna karşı: tüm değerler parametreli sorgularla geçilir,
  tablo/alan adları ise regex + whitelist ile sınırlandırılır (asla ham
  string birleştirme yok).

### Hardcoded Credentials
❌ **Kod içinde şifre/key yoktur**
- Admin şifreleri `admin_users` tablosunda bcrypt hash olarak tutulur
- `SESSION_SECRET`, `DATABASE_URL` gibi değerler yalnızca sunucudaki
  `.env` dosyasında bulunur (git'e commit edilmez — `.gitignore`'da)

> **Geçmişle ilgili not:** Bu repo daha önce Supabase/Vercel kullanırken
> `.env`, `supabase-tables.sql` ve eski `supabase/` klasörü içinde bazı
> değerler (Supabase anon key, ve artık kullanılmayan iki Google Maps API
> key'i) yanlışlıkla commit edilmişti. Repo public olduğu için bunlar
> GitHub'ın secret-scanning'i tarafından da tespit edildi. Güncel kodda bu
> değerlerin hiçbiri kullanılmıyor, ancak git geçmişinde hâlâ görünebilirler
> — ilgili API anahtarları Google Cloud Console'da iptal/rotate edilmelidir.

### Console Logs
✅ **Production'da otomatik kaldırılır**
- `vite.config.ts` → `esbuild.drop: ['console', 'debugger']`
- Development'ta normal şekilde çalışırlar

### HTTPS
✅ **Let's Encrypt ile gerçek SSL (Nginx üzerinde, certbot ile otomatik
yenilenir)**
- HSTS aktif (`server/index.js` → `helmet({ hsts: {...} })`)
- Production URL'si HTTPS kullanır

---

## 📡 API Endpoints

Frontend, `src/integrations/supabase/client.ts` shim'i üzerinden kendi
backend'imizin uçlarına relative path'lerle istek atar.

### Auth
```
GET  /api/auth/session          — mevcut oturumu döner
POST /api/auth/login            — { email, password } → session cookie
POST /api/auth/logout           — cookie'yi temizler
POST /api/auth/change-password  — { currentPassword, newPassword } (admin)
```

### Generic tablo uçları
```
GET    /api/db/:table                — filtre/sıralama/limit destekli okuma
POST   /api/db/:table                — tek veya çoklu satır ekleme (admin)
POST   /api/db/:table/upsert         — onConflict ile upsert (admin)
PUT    /api/db/:table/:id            — güncelleme (admin)
DELETE /api/db/:table/:id            — silme (admin)
DELETE /api/db/:table                — filtreye göre toplu silme (admin)
```

### Frontend'den örnek kullanım (shim üzerinden, Supabase-benzeri syntax)

```typescript
// Haber listesini getir
const { data: news, error } = await supabase
  .from('news')
  .select('*')
  .eq('yayin_durumu', 'yayinlandi')
  .order('created_at', { ascending: false });

// Etkinlik ekle
const { data, error } = await supabase
  .from('events')
  .insert([{ baslik, ozet, icerik, ... }]);

// Ayar getir
const { data, error } = await supabase
  .from('settings')
  .select('value')
  .eq('key', 'organization_lat')
  .single();

// İletişim mesajı ekle (public)
const { error } = await supabase
  .from('contact_messages')
  .insert([{ name, email, subject, message }]);

// İletişim mesajlarını listele (authenticated)
const { data, error } = await supabase
  .from('contact_messages')
  .select('*')
  .order('created_at', { ascending: false });
```

---

## 🚀 Deployment

Production, Natro XCloud VPS üzerinde Nginx (reverse proxy + SSL) ve PM2
(Node process manager, uygulama adı `spolder-backend`) ile çalışıyor.

**Önemli:** `/var/www/spolder` bir git reposu DEĞİL — dosyalar oraya elle
kopyalanmış. `git pull` çalışmaz. Güncelleme akışı:

```bash
# 1. Değişikliği GitHub'a push edin (bu repo)
git add .
git commit -m "Feature description"
git push origin main

# 2. VPS'te değişen dosyayı çekin
cd /var/www/spolder
curl -fsSL -o <değişen-dosya-yolu> \
  https://raw.githubusercontent.com/spolderdernegi-del/spolder-website-final/main/<değişen-dosya-yolu>

# 3. Frontend değiştiyse build alın
npm run build

# 4. Backend'i yeniden başlatın
pm2 restart spolder-backend
```

---

## 🐛 Sorun Giderme

### Problem: "DATABASE_URL environment variable is required"
**Çözüm:** `server/.env` dosyasını kontrol edin, `DATABASE_URL` ayarlı mı bakın.

### Problem: "E-posta veya şifre hatalı" (login çalışmıyor)
**Çözüm:**
- `admin_users` tablosunda ilgili e-posta ile bir satır var mı kontrol edin
- Gerekirse `server/seed-admin.js` veya `server/reset-password.js` ile
  şifreyi sıfırlayın

### Problem: "Harita marker'ı sürüklenemiyor"
**Çözüm:** `src/components/admin/GoogleMapPicker.tsx` dosyasında marker ref kontrol edin

### Problem: "Build başarısız oluyor"
```bash
# Node modules'ü temizleyin
rm -rf node_modules
npm install

# Yeniden build yapın
npm run build
```

### Problem: "404 Sayfası görünüyor"
**Çözüm:**
- Router konfigürasyonunu kontrol edin (`src/App.tsx`)
- Sayfa dosyasının doğru klasörde olduğundan emin olun
- Backend'deki SPA fallback route'unun (`server/index.js` sonunda) çalıştığını
  doğrulayın

---

## 🤝 Katkıda Bulunma

### Code Style
- TypeScript kullanın
- Shadcn/UI components'leri tercih edin
- Tailwind CSS'i utilities şeklinde kullanın

### Commit Messages
```
Format: [Type]: [Açıklama]

Örnekler:
- feat: Yeni haber yönetimi sayfası
- fix: Harita konumu kaydedilmiyor sorunu
- refactor: Login page iyileştirildi
- docs: README güncellendi
- security: Ayarlar okuma erişimi kısıtlandı
```

### Pull Request
1. Feature branch oluşturun: `git checkout -b feature/yeni-ozellik`
2. Değişiklikleri commit edin
3. Branch'i push edin: `git push origin feature/yeni-ozellik`
4. Pull Request açın

### Testing
- Component'i lokal'da test edin
- Responsive design'ı kontrol edin (mobile, tablet, desktop)
- Cross-browser test yapın (Chrome, Firefox, Safari)

---

## 📚 Faydalı Linkler

- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Shadcn/UI:** https://ui.shadcn.com
- **Leaflet:** https://leafletjs.com
- **Express:** https://expressjs.com
- **node-postgres (pg):** https://node-postgres.com

---

## 📞 İletişim

- **Issue'lar:** GitHub Issues kullanın
- **Email:** dev@spolder.org

---

## 📝 License

Bu proje SPOLDER Spor Politikaları Derneği tarafından yönetilmektedir.

---

**Son Güncelleme:** 31 Ağustos 2026
**Versiyon:** 2.0 (Natro self-hosted mimari)
**Bakım Yapan:** Geliştiriciler Ekibi
