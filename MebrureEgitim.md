# 🎨 Mebrure Hanım – Frontend Uzmanı Eğitim Dosyası

Bu dosya, **IRONHR** frontend mimarisinin (Angular 21) vizyonunu ve backend ile olan etkileşimini açıklamak için Kemal Bey'in talebiyle oluşturulmuştur.

---

## 💎 1. Tasarım Vizyonu: Premium & Endüstriyel

IRONHR sadece bir veri giriş ekranı değildir; kurumsal bir kimliktir.

- **AESTHETICS:** Koyu mod (Dark Mode) öncelikli, cam morfolojisi (Glassmorphism) etkileri kullanılan modern bir arayüz.
- **UX:** Personel listelerinde "Infinite Scroll", formlarda ise "Real-time Validation" (Gerçek zamanlı doğrulama).

---

## 🏗️ 2. Angular 21 Standartları

1.  **Feature-Based Architecture:** Backend'deki Vertical Slice yapısına paralel olarak, frontend'de her modül (`auth`, `organization`, `payroll`) kendi klasörü içinde izole olacaktır.
2.  **Standalone Components:** Modül bağımlılıklarını minimize etmek için her bileşen (component) bağımsız (standalone) olarak kurgulanacaktır.
3.  **Signals:** Angular 21 ile gelen yeni "Signals" yapısı kullanılacak, bu sayede state yönetimi daha performanslı ve okunabilir olacaktır.

---

## 🔗 3. Backend Entegrasyonu (Contract-First)

Backend'den gelen hatalar (RFC 7807 - Problem Details formatı) direkt kullanıcıya yansıtılacak şekilde bir `HttpInterceptor` kurulacaktır.

- **Status 400:** Form validasyon hataları (Input'ların altında gösterilecek).
- **Status 500:** Genel sistem hataları (Toast message olarak gösterilecek).

---

## 📋 Mevcut Durum

**[GÜNCEL]** Angular projesi `src/IronHr.Ui` dizini altında oluşturulmuştur. Temel bileşenler olan `main.ts`, `app.ts` ve `app.config.ts` dosyaları kurumsal standartta Türkçe yorumlarla hazır hale getirilmiştir. Bir sonraki adım, **Şirket Kayıt Ekranı** (Create Company) için tasarım çalışmalarına başlamaktır.
