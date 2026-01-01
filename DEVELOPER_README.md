# 👨‍💻 SPOLDER Web Sitesi - Geliştiriciler README

## 📋 İçindekiler
1. [Proje Hakkında](#proje-hakkında)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Kurulum](#kurulum)
4. [Proje Yapısı](#proje-yapısı)
5. [Supabase Kurulumu](#supabase-kurulumu)
6. [Önemli Dosyalar](#önemli-dosyalar)
7. [Güvenlik Bilgileri](#güvenlik-bilgileri)
8. [API Endpoints](#api-endpoints)
9. [Deployment](#deployment)
10. [Sorun Giderme](#sorun-giderme)
11. [Katkıda Bulunma](#katkıda-bulunma)

---

## 🎯 Proje Hakkında

**SPOLDER** - Spor Politikaları Derneği'nin resmi web sitesidir.

### Özellikler
- ✅ Responsive Admin Dashboard
- ✅ Haber, Etkinlik, Proje, Blog Yönetimi
- ✅ İletişim Formu + Supabase Storage
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
| **Backend** | Supabase (PostgreSQL) | Latest |
| **Auth** | Supabase Auth | Session-based |
| **Maps** | Leaflet + React-Leaflet + OpenStreetMap | 4.x |
| **Deployment** | Vercel | - |
| **Package Manager** | Bun | Latest |

---

## 📦 Kurulum

### Ön Gereksinimler
```bash
- Node.js 18+
- Bun (veya npm/yarn)
- Git
- Supabase hesabı
```

### 1. Repository'i Clone Edin
```bash
git clone https://github.com/spolderdernegi-del/spolder-website-final.git
cd spolder-website-final
```

### 2. Bağımlılıkları Yükleyin
```bash
bun install
# veya
npm install
```

### 3. Environment Variables Ayarlayın
```bash
cp env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
VITE_SUPABASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_ANON_KEY"
```

> **Not:** Keys'i Supabase Dashboard → Settings → API'den alın

### 4. Development Server'ı Başlatın
```bash
bun run dev
# veya
npm run dev
```

Server açılacaktır: `http://localhost:8080`

### 5. Build Yapın
```bash
bun run build
# veya
npm run build
```

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
│   │       ├── Login.tsx    # Login page (Supabase Auth)
│   │       ├── Dashboard.tsx # Main dashboard
│   │       ├── Settings.tsx # Site settings
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
│   │       ├── client.ts    # Supabase client
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
├── supabase/
│   ├── supabase-tables.sql  # Database schema
│   ├── create_contact_messages_table.sql
│   ├── add_is_read_to_contact_messages.sql
│   ├── fix_rls_security.sql # ⚠️ GÜVENLIK: RLS policies
│   └── view_all_data.sql    # Debug query
│
├── public/                   # Static assets
├── dist/                     # Build output
├── .gitignore               # Git ignore rules
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind config
├── package.json             # Dependencies
└── env.example              # Environment template
```

---

## 🔌 Supabase Kurulumu

### 1. Supabase Projesini Oluşturun
```
supabase.com/dashboard → New Project
```

### 2. SQL Scripts'i Çalıştırın
Supabase Dashboard → SQL Editor'da:

1. **supabase-tables.sql** çalıştırın (ana tabloları oluşturur)
2. **create_contact_messages_table.sql** çalıştırın (iletişim mesajları)
3. **add_is_read_to_contact_messages.sql** çalıştırın (okunma durumu)
4. **fix_rls_security.sql** çalıştırın ⚠️ (RLS politikaları - ÖNEMLI!)

### 3. Supabase Auth User Oluşturun
```
Supabase Dashboard → Authentication → Manage Users → Add User
Email: admin@spolder.org
Password: güçlü_bir_şifre
```

### 4. Admin Settings Ekleyin
SQL Editor'da:
```sql
INSERT INTO public.settings (key, value, updated_at)
VALUES
    ('admin_email', 'admin@spolder.org', NOW()),
    ('contact_phone', '+90 212 XXX XXXX', NOW()),
    ('contact_email', 'info@spolder.org', NOW())
ON CONFLICT (key) DO NOTHING;
```

---

## 📄 Önemli Dosyalar

### src/integrations/supabase/client.ts
```typescript
// Supabase client tanımı
// Tüm database operasyonları buradan yapılır
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {...});
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
// Supabase Auth kullanır
// localStorage artık kullanılmıyor (güvenlik)
// Session-based authentication
```

### src/components/admin/GoogleMapPicker.tsx
```typescript
// OpenStreetMap/Leaflet entegrasyonu
// Location picker for events and settings
// Marker drag-and-drop + click-to-place
```

---

## 🔒 Güvenlik Bilgileri

### ⚠️ KRITIK: RLS (Row Level Security) Politikaları

**Dosya:** `supabase/fix_rls_security.sql`

**Kurallar:**
- ✅ Herkes (anonymous) sadece READ yapabilir
- ✅ Admin (authenticated) INSERT/UPDATE/DELETE yapabilir
- ✅ Settings tablosu RLS korumalıdır

**Çalıştırma:** SQL Editor'da `fix_rls_security.sql` dosyasını çalıştırın

### Hardcoded Credentials

❌ **Kod içinde şifre/key yoktur**
- Admin şifreleri Supabase Auth'ta tutulur
- API keys `.env.local` dosyasında (git'e commit edilmez)

### Console Logs

✅ **Production'da otomatik kaldırılır**
- `vite.config.ts` → `esbuild.drop: ['console', 'debugger']`
- Development'ta normal şekilde çalışırlar

### HTTPS

✅ **Vercel'de otomatik HTTPS**
- Production URL'si HTTPS kullanır
- Mixed content hatası yoktur

---

## 📡 API Endpoints

Tüm API'ler Supabase REST API'si üzerinden yapılır.

### Örek Queries

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

### Vercel'e Deploy Etme

1. **GitHub'a Push Edin**
```bash
git add .
git commit -m "Feature description"
git push origin main
```

2. **Vercel'e Bağlayın**
   - vercel.com → Import Project → GitHub repo seçin
   - Branch: `main`

3. **Environment Variables Ayarlayın**
   ```
   Vercel Project Settings → Environment Variables
   ```
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
   - VITE_SUPABASE_PROJECT_ID

4. **Deploy Edin**
   ```bash
   git push → Vercel otomatik deploy eder
   ```

### Vercel Konfigürasyonu

`vercel.json` dosyası zaten yapılandırılmıştır:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

---

## 🐛 Sorun Giderme

### Problem: "VITE_SUPABASE_URL is not defined"
**Çözüm:** `.env.local` dosyasını kontrol edin ve environment variables'ı yükleyin

### Problem: "Supabase giriş hatası"
**Çözüm:** 
- Supabase Auth user'ın mevcut olduğundan emin olun
- Email ve password doğru mu kontrol edin
- RLS policies'ler ayarlı mı kontrol edin

### Problem: "Harita marker'ı sürüklenemiyor"
**Çözüm:** `src/components/admin/GoogleMapPicker.tsx` dosyasında marker ref kontrol edin

### Problem: "Build başarısız oluyor"
```bash
# Node modules'ü temizleyin
rm -rf node_modules
bun install

# Yeniden build yapın
bun run build
```

### Problem: "404 Sayfası görünüyor"
**Çözüm:** 
- Router konfigürasyonunu kontrol edin (`src/App.tsx`)
- Sayfa dosyasının doğru klasörde olduğundan emin olun

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
- security: RLS policies düzeltildi
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

- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Shadcn/UI:** https://ui.shadcn.com
- **Leaflet:** https://leafletjs.com

---

## 📞 İletişim

- **Issue'lar:** GitHub Issues kullanın
- **Email:** dev@spolder.org
- **Slack:** #spolder-development

---

## 📝 License

Bu proje SPOLDER Spor Politikaları Derneği tarafından yönetilmektedir.

---

**Son Güncelleme:** 01 Ocak 2026  
**Versiyon:** 1.0  
**Bakım Yapan:** Geliştiriciler Ekibi
