## Kılavuzlar

### 👤 Admin (Müşteri) Kullanım Kılavuzu
**Dosya:** [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- Admin paneli nasıl kullanılır
- Haber, etkinlik, proje yönetimi
- İletişim mesajları
- Ayarlar ve veri yönetimi
- SSS

### 👨‍💻 Geliştiriciler README
**Dosya:** [DEVELOPER_README.md](DEVELOPER_README.md)
- Proje kurulumu ve yapısı
- Teknoloji stack detayları
- Supabase konfigürasyonu
- Güvenlik bilgileri
- API endpoints
- Deployment yönergeleri
- Sorun giderme

---

## Setup

- Requirements:
	- Node.js 18+
	- Vercel (for hosting) or local `npm run dev`
	- Supabase project (URL + publishable anon key)

- Environment:
	- Copy `.env.example` to `.env.local` and fill values:
		- `VITE_SUPABASE_URL`
		- `VITE_SUPABASE_PUBLISHABLE_KEY`

- Development:
	- Install dependencies: `npm install`
	- Start dev server: `npm run dev`

## Supabase

- CLI link & migrations (already linked in this repo):
	- Push migrations: `npx supabase db push`
	- Schema includes tables: events, news, blog, projects, files, categories, board, bank_info, settings
	- RLS Policies: ✅ Authenticated-only (admin) for write operations
	- Contact Messages: Public insert (form), authenticated read/delete (admin)

## Deploy (Vercel)

1) In Vercel Project Settings → Environment Variables:
	 - `VITE_SUPABASE_URL` → https://<project-ref>.supabase.co
	 - `VITE_SUPABASE_PUBLISHABLE_KEY` → sb-publishable-...
2) Redeploy the project.
3) Verify admin CRUD and homepage slider items (showInSlider).

## Security

✅ **Implemented:**
- RLS (Row Level Security) policies - authenticated-only
- Supabase Auth session-based
- No hardcoded credentials in code
- Console logs removed in production build
- HTTPS on Vercel

⚠️ **Important SQL Scripts:**
- `supabase/fix_rls_security.sql` - Run this in Supabase SQL Editor!
- `supabase/create_contact_messages_table.sql`
- `supabase/add_is_read_to_contact_messages.sql`

## Project Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 7 |
| UI | Shadcn/UI + Tailwind CSS |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Maps | Leaflet + OpenStreetMap |
| Hosting | Vercel |
| Package Manager | Bun |

## Key Features

✅ Admin Dashboard with real-time stats  
✅ News, Events, Projects, Blog management  
✅ Contact form with message notifications  
✅ OpenStreetMap location picker  
✅ Activity logging  
✅ Data export/import  
✅ SEO optimized  
✅ Responsive design  
✅ Dark mode ready  

## Notes

- Media/Files currently store base64 in DB (`files.file_url`). For production at scale, move to Supabase Storage and save public URLs in `files`.
- Contact messages are stored in `contact_messages` table with `is_read` flag for notifications
- President message in `/hakkimizda` page is managed in Settings table



