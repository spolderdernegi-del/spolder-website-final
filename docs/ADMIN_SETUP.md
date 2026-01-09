# 🔐 Admin Kullanıcı Kurulum Kılavuzu

## Admin Rolü Nasıl Verilir?

Supabase'de bir kullanıcıya admin rolü vermek için iki yöntem vardır:

### Yöntem 1: Supabase Dashboard Üzerinden (Önerilen)

1. **Supabase Dashboard'a gidin:** https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **Authentication > Users** bölümüne gidin
4. Admin yapmak istediğiniz kullanıcıyı bulun ve tıklayın
5. Kullanıcı detay sayfasında, **Raw User Meta Data** bölümünü bulun
6. **Edit** butonuna tıklayın
7. `app_metadata` alanını aşağıdaki şekilde düzenleyin:

```json
{
  "role": "admin"
}
```

8. **Save** butonuna basın
9. Kullanıcı artık admin yetkilerine sahiptir

### Yöntem 2: SQL Query Editor Üzerinden

1. **Supabase Dashboard'a gidin:** https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **SQL Editor** bölümüne gidin
4. Aşağıdaki SQL komutunu çalıştırın (e-posta adresini kendi admin kullanıcınızla değiştirin):

```sql
UPDATE auth.users
SET raw_app_meta_data = 
  raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@spolder.org';
```

5. Query'yi çalıştırın (Run veya F5)
6. Başarılı mesajını gördüğünüzde, kullanıcı artık admin yetkilerine sahiptir

---

## Güvenlik Notları

### 🔒 Rol Tabanlı Erişim Kontrolü (RBAC)

Bu güvenlik güncellemesi ile birlikte, tüm Supabase tabloları artık rol tabanlı erişim kontrolü (RBAC) kullanmaktadır:

#### ✅ Admin Kullanıcılar (role: "admin")
- ✅ Tüm verileri **okuyabilir** (SELECT)
- ✅ Yeni veri **ekleyebilir** (INSERT)
- ✅ Mevcut verileri **güncelleyebilir** (UPDATE)
- ✅ Verileri **silebilir** (DELETE)

#### 👥 Normal/Anonim Kullanıcılar
- ✅ Tüm verileri **okuyabilir** (SELECT)
- ❌ Yeni veri **ekleyemez** (INSERT)
- ❌ Mevcut verileri **güncelleyemez** (UPDATE)
- ❌ Verileri **silemez** (DELETE)

#### 📝 İstisna: İletişim Mesajları (contact_messages)
İletişim formu herkese açıktır, bu nedenle:
- ✅ **Herkes** mesaj **gönderebilir** (INSERT)
- ❌ Sadece **adminler** mesajları **görebilir** (SELECT)
- ❌ Sadece **adminler** mesajları **düzenleyebilir** (UPDATE)
- ❌ Sadece **adminler** mesajları **silebilir** (DELETE)

---

## Etkilenen Tablolar

Aşağıdaki tablolar artık admin-only erişim kontrolü altındadır:

1. **bank_info** - Banka bilgileri
2. **blog** - Blog yazıları
3. **board** - Yönetim kurulu üyeleri
4. **categories** - Kategoriler
5. **contact_messages** - İletişim mesajları (özel kural: herkes mesaj gönderebilir)
6. **events** - Etkinlikler
7. **files** - Dosyalar/Yayınlar
8. **news** - Haberler
9. **projects** - Projeler
10. **settings** - Site ayarları

---

## Sıkça Sorulan Sorular (SSS)

### S: Admin kullanıcı nasıl oluşturulur?
**C:** Önce Supabase Dashboard'da **Authentication > Users** bölümünden yeni bir kullanıcı oluşturun. Ardından yukarıdaki yöntemlerden birini kullanarak kullanıcıya `role: "admin"` metadatasını ekleyin.

### S: Mevcut admin kullanıcımın yetkilerini nasıl kaldırırım?
**C:** Kullanıcının `app_metadata` alanından `role: "admin"` satırını silin veya değerini değiştirin.

### S: Birden fazla admin kullanıcı olabilir mi?
**C:** Evet! İstediğiniz kadar kullanıcıya admin rolü verebilirsiniz.

### S: Admin olmayan bir kullanıcı giriş yapabilir mi?
**C:** Evet, ancak sadece okuma yetkisine sahip olacaktır. Admin panelinde işlem yapamayacaktır.

### S: Migration dosyasını nasıl çalıştırırım?
**C:** Supabase Dashboard'da **SQL Editor** bölümüne gidin ve `supabase/migrations/20260105_fix_rls_policies.sql` dosyasının içeriğini kopyalayıp çalıştırın.

### S: Mevcut RLS politikaları ne olacak?
**C:** Migration dosyası eski güvenlik politikalarını otomatik olarak kaldırıp yenileriyle değiştirecektir.

---

## Teknik Detaylar

### is_admin() Fonksiyonu

Migration dosyası aşağıdaki yardımcı fonksiyonu oluşturur:

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Bu fonksiyon, kullanıcının JWT token'ındaki `app_metadata.role` değerini kontrol eder ve değer `"admin"` ise `true`, değilse `false` döner.

### RLS Politika Yapısı

Her tablo için dört temel politika oluşturulur:

1. **SELECT Policy** - Herkes okuyabilir
   ```sql
   CREATE POLICY "Public can view [table]"
     ON public.[table] FOR SELECT
     USING (true);
   ```

2. **INSERT Policy** - Sadece adminler ekleyebilir
   ```sql
   CREATE POLICY "Only admins can insert [table]"
     ON public.[table] FOR INSERT
     WITH CHECK (public.is_admin());
   ```

3. **UPDATE Policy** - Sadece adminler güncelleyebilir
   ```sql
   CREATE POLICY "Only admins can update [table]"
     ON public.[table] FOR UPDATE
     USING (public.is_admin());
   ```

4. **DELETE Policy** - Sadece adminler silebilir
   ```sql
   CREATE POLICY "Only admins can delete [table]"
     ON public.[table] FOR DELETE
     USING (public.is_admin());
   ```

---

## Destek ve İletişim

Herhangi bir sorun yaşarsanız:
- **E-posta:** admin@spolder.org
- **Teknik Destek:** dev@spolder.org

---

**Son Güncelleme:** 05 Ocak 2026  
**Versiyon:** 1.0  
**Yazar:** SPOLDER Geliştirici Ekibi
