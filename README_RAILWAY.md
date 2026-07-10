Railway deploy talimatları

Adımlar (kısa):

1. Repository'yi Railway'e bağlayın.
2. Railway üzerinde bir PostgreSQL hizmeti oluşturup `DATABASE_URL` ortam değişkenini alın.
3. Railway proje ayarlarında aşağıdaki ortam değişkenlerini ekleyin:
   - `DATABASE_URL` — Railway Postgres bağlantu stringi
   - `SESSION_SECRET` — Rastgele güçlü bir secret
   - `VITE_API_BASE_URL` — Uygulamanın base URL'si, örn. `https://<your-railway-app>.up.railway.app`
   - `ADMIN_EMAIL` — Yönetici e-posta (opsiyonel, yoksa `settings` tablosundan okunur)
   - `ADMIN_PASSWORD` — Yönetici şifresi (opsiyonel)
   - `NODE_ENV` — `production`

4. Build & Start konfigürasyonu:
   - `package.json` içinde `start` script zaten `npm run build && npm run serve` olarak ayarlı.
   - Railway otomatik olarak `npm install` ve `npm start` çalıştıracaktır.

5. Veritabanı tablolarını oluşturun:
   - Projede `supabase-tables.sql` ve `supabase/create_contact_messages_table.sql` gibi SQL dosyaları var.
   - Railway Postgres konsoluna bağlanıp bu SQL'leri çalıştırarak gerekli tabloları oluşturun.

6. Deploy:
   - Repo'yu push edin, Railway deploy işlemini tetikleyin.

Yerel test (opsiyonel):
```
npm install
npm run start
```

Notlar:
- `Procfile` içerisine `web: npm start` eklendi, Railway bunu kullanır.
- `server/index.js` uygulamayı `process.env.PORT` üzerinde dinliyor ve `DATABASE_URL` zorunlu.
