# 📚 SPOLDER Admin Paneli - Müşteri Kullanım Kılavuzu

## İçindekiler
1. [Giriş Yapma](#giriş-yapma)
2. [Dashboard](#dashboard)
3. [Haberler Yönetimi](#haberler-yönetimi)
4. [Etkinlikler Yönetimi](#etkinlikler-yönetimi)
5. [Projeler Yönetimi](#projeler-yönetimi)
6. [Blog Yönetimi](#blog-yönetimi)
7. [Yayınlar (Dosyalar)](#yayınlar-dosyalar)
8. [Yönetim Kurulu](#yönetim-kurulu)
9. [Kategoriler](#kategoriler)
10. [İletişim Mesajları](#iletişim-mesajları)
11. [Ayarlar](#ayarlar)
12. [SSS](#sss)

---

## 🔐 Giriş Yapma

### Adım 1: Admin Paneline Erişim
```
URL: https://spolder.org/admin/login
```

### Adım 2: Kimlik Bilgilerini Girin
- **E-posta:** Supabase tarafından size verilen e-posta adresi
- **Şifre:** Supabase tarafından size verilen şifre

> **⚠️ ÖNEMLİ:** Kimlik bilgileriniz güvenli tutun. Başkasıyla paylaşmayın!

### Adım 3: Admin Dashboard'a Erişim
Başarılı giriş yaparsanız Dashboard sayfasına yönlendirileceksiniz.

---

## 📊 Dashboard

Admin panelinin ana sayfasıdır. Aşağıdaki bilgileri görürsünüz:

### Genel İstatistikler
- **Toplam Haber:** Yayınlanmış haber sayısı
- **Toplam Etkinlik:** Oluşturulmuş etkinlik sayısı
- **Toplam Proje:** Yayınlanmış proje sayısı
- **Toplam Blog:** Yayınlanmış blog yazısı sayısı
- **Okunmamış Mesajlar:** İletişim formu üzerinden gelen okunmamış mesaj sayısı

### Son Eklenen İçerikler
En son 10 eklenen haber, etkinlik, proje ve blog yazılarının önizlemesi görünür.

### Hızlı Bağlantılar
- 📝 Yeni Haber Ekle
- 📅 Yeni Etkinlik Ekle
- 💼 Yeni Proje Ekle
- ✍️ Yeni Blog Yazısı Ekle

---

## 📰 Haberler Yönetimi

### Yeni Haber Ekleme

1. **Admin Panel → Haberler** tıklayın
2. **+ Yeni Haber Ekle** butonuna tıklayın
3. Aşağıdaki alanları doldurun:

| Alan | Açıklama | Zorunlu |
|------|----------|---------|
| **Başlık** | Haber başlığı | ✅ |
| **Özet** | Haber özeti (liste sayfasında gösterilir) | ✅ |
| **İçerik** | Haber tam metni (detay sayfasında gösterilir) | ✅ |
| **Resim** | Haber görseli (JPG, PNG) | ✅ |
| **Kategori** | Haber kategorisi | ✅ |
| **Yazar** | Haberi yazan kişi adı | ✅ |
| **Tarih** | Haber yayın tarihi | ✅ |
| **Meta Başlığı** | SEO için başlık (70 karakter) | ❌ |
| **Meta Açıklaması** | SEO için açıklama (160 karakter) | ❌ |
| **Slider'da Göster** | Anasayfadaki slider'da gösterilsin mi? | ❌ |

4. **Yayınla** veya **Taslak Olarak Kaydet** seçeneğini seçin
5. **Kaydet** tıklayın

### Haber Düzenleme
1. Haberler listesinden düzenlemek istediğiniz haberi bulun
2. **✏️ Düzenle** tıklayın
3. İlgili alanları güncelleyin
4. **Güncelle** tıklayın

### Haber Silme
1. Haberler listesinden silmek istediğiniz haberi bulun
2. **🗑️ Sil** tıklayın
3. Onayı verin

---

## 📅 Etkinlikler Yönetimi

### Yeni Etkinlik Ekleme

1. **Admin Panel → Etkinlikler** tıklayın
2. **+ Yeni Etkinlik Ekle** butonuna tıklayın
3. Aşağıdaki alanları doldurun:

| Alan | Açıklama | Zorunlu |
|------|----------|---------|
| **Başlık** | Etkinlik adı | ✅ |
| **Özet** | Etkinlik özeti | ✅ |
| **İçerik** | Etkinlik tam tanımı | ✅ |
| **Resim** | Etkinlik görseli | ✅ |
| **Tarih** | Etkinlik tarihi (GG/AA/YYYY) | ✅ |
| **Saat** | Etkinlik saati (SS:DD) | ✅ |
| **Konum** | Etkinlik yeri (şehir/salon adı) | ✅ |
| **Konum (Harita)** | Harita üzerinde konumu işaretleyin | ✅ |
| **Kategori** | Etkinlik kategorisi | ✅ |
| **Kapasite** | Etkinlik kapasitesi (kişi sayısı) | ❌ |
| **Kayıtlı** | Şu ana kadar kayıtlı kişi sayısı | ❌ |
| **Durum** | Açık / Kapalı | ❌ |
| **Google Form Linki** | Kayıt formu linki | ❌ |

### Harita Üzerinde Konum Seçme
1. Harita alanına tıklayın veya marker'ı sürükleyin
2. Doğru konuma geldiğinde otomatik kaydedilir
3. Koordinatlar aşağıda gösterilir

---

## 💼 Projeler Yönetimi

Haberler ile benzer şekilde çalışır:

1. **Admin Panel → Projeler** tıklayın
2. **+ Yeni Proje Ekle** butonuna tıklayın
3. Proje bilgilerini doldurun:
   - Başlık
   - Açıklama
   - Resim
   - Kategori
   - Durum (Devam Ediyor / Tamamlandı)
   - Başlangıç ve Bitiş Tarihleri

---

## ✍️ Blog Yönetimi

Haberler ile benzer şekilde, blog yazıları ekleyebilirsiniz:

1. **Admin Panel → Blog** tıklayın
2. **+ Yeni Blog Yazısı Ekle** butonuna tıklayın
3. Blog yazısı bilgilerini doldurun

---

## 📄 Yayınlar (Dosyalar)

### Yayın/Dosya Ekleme

1. **Admin Panel → Yayınlar** tıklayın
2. **+ Yeni Dosya Ekle** butonuna tıklayın
3. Aşağıdaki bilgileri girin:

| Alan | Açıklama |
|------|----------|
| **Başlık** | Dosya adı |
| **Açıklama** | Dosya açıklaması |
| **Kategori** | Rapor / Araştırma / Politika Belgesi |
| **Dosya** | PDF, DOCX, ZIP vb. dosya yükleyin |

### Dosya Silme
1. Yayınlar listesinden silmek istediğiniz dosyayı bulun
2. **🗑️ Sil** tıklayın

---

## 👥 Yönetim Kurulu

### Başkanın Resmi ve İletişi Güncelleme

1. **Admin Panel → Yönetim Kurulu** tıklayın
2. **Başkan** satırında **✏️ Düzenle** tıklayın
3. Aşağıdaki bilgileri güncelleyin:
   - **Ad Soyad:** Başkanın adı
   - **Pozisyon:** "Başkan" (değişmesin)
   - **Biyografi:** Kısa yaşam bilgisi
   - **Resim:** Fotoğraf yükleyin

4. **Güncelle** tıklayın

### Kurulu Üye Ekleme/Silme

1. **+ Yeni Üye Ekle** tıklayın
2. Üyenin bilgilerini girin
3. **Kaydet** tıklayın

> **Not:** Başkan silinemez, sadece düzenlenebilir.

---

## 🏷️ Kategoriler

### Kategori Ekleme

1. **Admin Panel → Kategoriler** tıklayın
2. **+ Yeni Kategori Ekle** butonuna tıklayın
3. Kategori adını girin
4. Kategori türünü seçin (Haber / Etkinlik / Blog / Proje / Dosya)
5. Renk seçin (SEO ise mavi, Spor ise yeşil vb.)
6. **Kaydet** tıklayın

### Kategori Düzenleme/Silme
1. Kategoriler listesinden işlem yapın
2. **✏️ Düzenle** veya **🗑️ Sil** tıklayın

---

## 💬 İletişim Mesajları

### Gelen Mesajları Görüntüleme

1. **Admin Panel → İletişim Mesajları** tıklayın
2. Siteden gelen tüm mesajlar listelenir
3. Okunmamış mesajlar **kalın** gösterilir

### Mesajı Okuma

1. Mesajı listeden tıklayın
2. Mesaj detayını görün:
   - **Gönderen Adı:** Kişi adı
   - **E-posta:** İletişim adresi
   - **Konu:** Mesaj konusu
   - **Mesaj:** Tam mesaj metni

### Mesajı Silme

1. Mesajın sağında **🗑️ Sil** tıklayın
2. Onayı verin

> **💡 İpucu:** Önemli mesajları not alıp silmeyi unutmayın!

---

## ⚙️ Ayarlar

### İletişim Bilgilerini Güncelleme

1. **Admin Panel → Ayarlar** tıklayın
2. **İletişim Bilgileri** bölümünü açın
3. Aşağıdaki bilgileri güncelleyin:

| Bilgi | Kullanım Yeri |
|-------|--------------|
| **Telefon** | Footer'da gösterilir |
| **E-posta** | Footer'da gösterilir |
| **Çalışma Saatleri** | Footer'da gösterilir |
| **IBAN (TL)** | Banka transferi bilgisi |
| **IBAN (EUR)** | Uluslararası transfer |

4. **Kaydet** tıklayın

### Konum Bilgisi Güncelleme

1. **Ayarlar** sayfasında **Konum** bölümünü bulun
2. Harita üzerinde konumu işaretleyin
3. Koordinatlar otomatik kaydedilir

### Veri Yedekleme

1. **Ayarlar** → **Dışa Aktar** tıklayın
2. JSON dosyası indirilecektir
3. Bu dosyayı güvenli bir yerde saklayın

### Veri Geri Yükleme

1. **Ayarlar** → **İçe Aktar** tıklayın
2. Daha önce indirdiğiniz JSON dosyasını seçin
3. **Yükle** tıklayın

> **⚠️ DİKKAT:** Bu işlem mevcut verilerin üzerine yazacaktır!

---

## ❓ SSS

### S: Resim yükleyemiyorum?
**C:** Dosya formatı PNG veya JPG olmalıdır. Dosya boyutu 5MB'den küçük olmalıdır.

### S: Etkinlik tarihi nasıl format olmalı?
**C:** GG/AA/YYYY formatında girin. Örnek: 15/01/2026

### S: Harita üzerinde konum nasıl işaretlerim?
**C:** Harita üzerine tıklayın veya marker'ı sürükleyin. Konum otomatik kaydedilir.

### S: Mesajı yanlışlıkla sildim, geri yükleyebilir miyim?
**C:** Hayır. Silinen mesajlar geri yüklenemez. Önemli mesajları kopyalayıp not edin.

### S: Şifremi unuttum?
**C:** Supabase Dashboard'da parolanızı sıfırlayabilirsiniz. Sistem yöneticisine iletişim kurun.

### S: Kaç kişi aynı anda giriş yapabilir?
**C:** Birden fazla kullanıcı aynı anda giriş yapabilir. Ancak tüm değişiklikler herkese görünür.

### S: Draft (Taslak) olarak kaydettiğim içerik sitede görünmez mi?
**C:** Doğru! Draft içerikler sadece admin panelinde görünür. Sitede göstermek için "Yayınla" seçeneğini seçin.

### S: Slider'da gösterilmesi ne demek?
**C:** Anasayfadaki büyük resim galerisi slider'ıdır. Bu kutuyu işaretlerseniz içerik orada gösterilir.

---

## 📞 Destek

Herhangi bir sorunla karşılaşırsanız:
- Email: admin@spolder.org
- Supabase Dashboard: https://supabase.com/dashboard

---

**Son Güncelleme:** 01 Ocak 2026
**Versiyon:** 1.0
