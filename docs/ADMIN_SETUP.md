# 🔐 Admin Kullanıcı Kurulum Kılavuzu

> **Not:** Bu belge daha önce Supabase RLS (Row Level Security) / `auth.users`
> `app_metadata.role` tabanlı bir sisteme göre yazılmıştı. Site artık Supabase
> kullanmıyor; admin yetkisi kendi `admin_users` tablomuzdaki bir satırla ve
> JWT tabanlı bir session cookie'siyle yönetiliyor. Aşağıdaki içerik güncel
> mimariyi anlatır.

## Admin Kullanıcı Nasıl Oluşturulur?

Admin kullanıcılar `admin_users` tablosunda bcrypt ile hash'lenmiş bir şifre
olarak tutulur. Supabase Dashboard yoktur; kullanıcı sunucu üzerinde küçük bir
script ile oluşturulur/sıfırlanır.

### Yöntem 1: İlk kurulumda (`npm run seed:admin`)

```bash
cd server
ADMIN_EMAIL="admin@spolder.org" ADMIN_PASSWORD="güçlü_bir_şifre" npm run seed:admin
```

Bu script `admin_users` tablosunda o e-posta için bir satır yoksa oluşturur,
varsa şifresini günceller.

### Yöntem 2: Şifre sıfırlama (SSH erişimi gerekir)

Panelden "Şifre Değiştir" mevcut şifreyi bilmeyi gerektirir. Hiç giriş
yapılamıyorsa, sunucuya SSH ile bağlanıp doğrudan çalıştırın:

```bash
cd /var/www/spolder
node server/reset-password.js admin@spolder.org YeniGucluSifre123
```

## Erişim Kontrolü Nasıl Çalışır?

RLS yoktur — tüm erişim kontrolü `server/index.js` içindeki Express
middleware'lerinde yapılır:

- Geçerli bir `spolder_session` JWT çerezi taşıyan istekler `requireAdmin`
  middleware'inden geçerek yazma (`POST`/`PUT`/`DELETE`) uçlarına erişebilir.
- Oturumsuz istekler sadece `PUBLIC_READ_TABLES` listesindeki tablolardan
  okuma yapabilir (`contact_messages` hariç — o sadece admin'e açık).
- `settings` tablosunda ayrıca `PUBLIC_SETTINGS_KEYS` allowlist'i vardır:
  oturumsuz istekler bu listedeki anahtarlar dışında hiçbir satırı göremez.

Şu an tek bir admin rolü vardır (ayrıcalık seviyesi yok); `admin_users`
tablosunda bir satırı olan herkes tam yönetici yetkisine sahiptir.

## Sıkça Sorulan Sorular (SSS)

**S: Admin kullanıcı nasıl oluşturulur?**
C: `npm run seed:admin` komutunu yukarıdaki gibi çalıştırın.

**S: Mevcut admin kullanıcımın yetkilerini nasıl kaldırırım?**
C: `admin_users` tablosundan ilgili satırı silin (veritabanına doğrudan
erişimle).

**S: Birden fazla admin kullanıcı olabilir mi?**
C: Evet — `admin_users` tablosuna istediğiniz kadar satır ekleyebilirsiniz
(her biri için `seed:admin` çalıştırarak veya doğrudan veritabanı üzerinden).

**S: Admin olmayan bir kullanıcı giriş yapabilir mi?**
C: Hayır — giriş sistemi sadece `admin_users` tablosundaki hesaplarla
çalışır, ayrı bir "normal kullanıcı" girişi yoktur. Herkes zaten public
tabloları oturum açmadan okuyabilir.

## Destek ve İletişim

Herhangi bir sorun yaşarsanız:
- **GitHub Issues:** Proje repository'sinde issue açabilirsiniz
- **Teknik Destek:** Sistem yöneticinize başvurun

---

**Son Güncelleme:** 31 Ağustos 2026
**Versiyon:** 2.0 (Natro self-hosted mimari)
**Yazar:** SPOLDER Geliştirici Ekibi
