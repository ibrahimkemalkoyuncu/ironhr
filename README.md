# ⚙️ IRONHR - İnsan Kaynakları Yönetim Sistemi

**IRONHR**, kurumsal ölçekli, yüksek performanslı ve uzun vadeli bakım hedefleriyle tasarlanmış bir İnsan Kaynakları Yönetim Yazılımıdır. Bu proje, **Afney Software House** bünyesinde, endüstriyel standartlarda geliştirilmektedir.

---

## 🚀 Teknoloji Yığını

- **Backend:** ASP.NET 10 (Minimal API)
- **Architecture:** Vertical Slice Architecture (Dikey Dilim Mimarisi)
- **Database:** MS SQL Server + Dapper (High Performance ORM)
- **Frontend:** Angular 21 (Signals Architecture & Standalone Components)
- **Validation:** FluentValidation
- **Messaging:** MediatR

---

## ✨ Öne Çıkan Son Özellikler (Ocak 2025)

- 🎨 **Premium UI/UX:** Glassmorphism efektleri, modern degradeler ve interaktif bileşenler ile tamamen yenilenen kullanıcı arayüzü.
- 📅 **İzin Takvimi 2.0:** Tüm şirketin izin durumunu tek bir bakışta gösteren, detaylı bilgilendirme balonlarına (tooltips) sahip modern takvim.
- 📊 **Dinamik Dashboard:** Canlı istatistikler, şube dağılım grafikleri ve "Yaklaşan Etkinlikler" zaman çizelgesi.
- ⚙️ **Refactored API:** Endpoint'lerin `MapApiEndpoints` extension metodu ile merkezi ve tertemiz yönetimi.
- 🛠️ **Geliştirici Dostu:** Tek komutla (`.\start-ironhr.ps1`) Backend ve Frontend'i aynı anda başlatma imkanı.

---

## 🏗️ Mimari Prensipler

Bu proje, **Mete Bey**'in liderliğinde aşağıdaki prensipler üzerine inşa edilmiştir:

- **Vertical Slice:** Her özellik (Feature) kendi dilimi içinde izoledir. Shared service ve karmaşık katman bağımlılıkları minimize edilmiştir.
- **Clean Program.cs:** Tüm API rotaları `EndpointExtensions` üzerinden yönetilir, böylece ana giriş noktası her zaman temiz ve okunabilir kalır.
- **Signals Architecture:** Angular tarafında state yönetimi modern Signal yapısı ile gerçekleştirilerek reaktif bir deneyim sunulur.
- **Result Pattern:** İş mantığı hataları `Result` nesnesi ile yönetilir.
- **Security First:** SQL Injection riskine karşı parametrik Dapper sorguları ve MediatR Pipeline üzerinden otomatik validasyon.

---

## 👥 Ekip ve Roller

- 👔 **Kemal Bey:** Firma Sahibi / İş Stratejisi
- 🧠 **Numan Bey:** İK Domain Expert (25+ Yıl Deneyim) - Süreç ve Mevzuat Kontrolü
- ⚙️ **Mete Bey:** Backend Mimarı - ASP.NET 10 & Dapper Uzmanı
- 🎨 **Mebrure Hanım:** Frontend Uzmanı - Angular 21 & UI/UX Tasarım

---

## 📚 Eğitim ve Süreç Dökümanları

Proje hakkında daha detaylı bilgi edinmek için role özel dökümanları inceleyebilirsiniz:

- [Numan Bey - İş Süreçleri ve Roadmap](./NumanEgitim.md)
- [Mete Bey - Backend Mimari Detayları](./MeteEgitim.md)
- [Mebrure Hanım - Frontend Vizyonu](./MebrureEgitim.md)

---

## 🚀 Hızlı Başlatma (Tavsiye Edilen)

Projeyi hem Backend hem Frontend olacak şekilde tek seferde çalıştırmak için ana dizindeki PowerShell betiğini kullanabilirsiniz:

```powershell
.\start-ironhr.ps1
```

_(Detaylar için Run.txt dosyasına bakabilirsiniz.)_

---

## 🛠️ Manuel Kurulum ve Çalıştırma

### Backend (API)

```bash
cd src/IronHr.Api
dotnet run
```

API çalıştıktan sonra `http://localhost:5118/swagger` adresinden dökümantasyona erişebilirsiniz.

### Frontend (UI)

```bash
cd src/IronHr.Ui
npm install
npm start
```

Uygulamaya `http://localhost:4200` adresinden erişebilirsiniz.

---

© 2026 Afney Software House - Tüm Hakları Saklıdır.
