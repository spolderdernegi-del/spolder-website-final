# Admin Panel - Supabase Senkronizasyon Kurulumu

## 🎯 Yapılan Değişiklikler

Admin paneli artık tamamen Supabase ile senkronize çalışıyor. Giriş bilgileri Supabase'in `settings` tablosunda saklanıyor.

## 📋 Kurulum Adımları

### 1. Supabase'de Settings Tablosunu Oluşturun

Supabase Dashboard'unuza gidin:
1. **SQL Editor** sekmesine tıklayın
2. `supabase/init_admin_settings.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'e yapıştırın ve **RUN** butonuna basın

Veya alternatif olarak tüm tabloları oluşturmak için:
- `supabase-tables.sql` dosyasını çalıştırabilirsiniz (bu dosya zaten settings tablosunu içeriyor)

### 2. Varsayılan Giriş Bilgileri

SQL script'i çalıştırdıktan sonra varsayılan giriş bilgileri otomatik olarak eklenir:

- **E-posta:** `admin@spolder.org`
- **Şifre:** `spolder2024`

### 3. Giriş Bilgilerini Değiştirme

Admin paneline giriş yaptıktan sonra:
1. **Ayarlar** sayfasına gidin
2. **Giriş Bilgilerini Güncelle** bölümünde:
   - Yeni e-posta adresinizi girebilirsiniz
   - Yeni şifrenizi belirleyebilirsiniz
3. Değişiklikler anında Supabase'e kaydedilir

## 🔐 Güvenlik Özellikleri

- ✅ Giriş bilgileri Supabase'de güvenli şekilde saklanıyor
- ✅ Şifre minimum 6 karakter olmalı
- ✅ E-posta format kontrolü yapılıyor
- ✅ LocalStorage'da sadece giriş durumu tutuluyor (şifre tutulmuyor)

## 🛠️ Teknik Detaylar

### Login Sistemi
- Login sayfası (`src/pages/admin/Login.tsx`) Supabase'den admin bilgilerini çeker
- Girilen bilgiler veritabanındaki değerlerle karşılaştırılır
- Başarılı girişte localStorage'a sadece `adminAuth: "true"` kaydedilir

### Settings Sistemi
- Settings sayfası (`src/pages/admin/Settings.tsx`) şu özelliklere sahip:
  - E-posta adresi değiştirme
  - Şifre değiştirme
  - Aktivite logları
  - Veri import/export

### Supabase Tablosu
```sql
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Kayıtlar:
- `admin_email`: Admin e-posta adresi
- `admin_password`: Admin şifresi

## 🚀 Kullanım

1. Local development server'ı çalıştırın:
   ```bash
   npm run dev
   ```

2. Tarayıcınızda http://localhost:8080/admin/login adresine gidin

3. Varsayılan bilgilerle giriş yapın:
   - E-posta: admin@spolder.org
   - Şifre: spolder2024

4. İlk girişte mutlaka şifrenizi değiştirin!

## 📝 Notlar

- Her şifre veya e-posta değişikliği anında Supabase'e yansır
- Şifre değişikliklerinde minimum 6 karakter zorunluluğu var
- E-posta değişikliklerinde format kontrolü yapılıyor
- Tüm işlemler activity log'a kaydediliyor

## 🔄 Veri Senkronizasyonu

Admin panelindeki tüm işlemler (haberler, etkinlikler, projeler vb.) zaten Supabase ile senkronize çalışıyor. Artık admin girişi de tamamen Supabase üzerinden yönetiliyor.

## 📞 Sorun Giderme

Eğer giriş yapamıyorsanız:
1. Supabase Dashboard'da `settings` tablosunu kontrol edin
2. `admin_email` ve `admin_password` kayıtlarının olduğundan emin olun
3. Browser console'da hata mesajlarını kontrol edin
4. Supabase bağlantı bilgilerini `.env` dosyasında kontrol edin

## ✅ Yapılacaklar Listesi

- [x] Settings tablosu oluşturuldu
- [x] Login sistemi Supabase ile entegre edildi
- [x] Settings sayfasına e-posta değiştirme eklendi
- [x] Settings sayfasında şifre değiştirme Supabase ile çalışıyor
- [x] Güvenlik kontrolleri eklendi
- [x] SQL migration dosyaları oluşturuldu

---

**Önemli:** İlk kurulumda mutlaka `supabase/init_admin_settings.sql` dosyasını Supabase'de çalıştırın!
