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

## 🏗️ Mimari Prensipler

Bu proje, **Mete Bey**'in liderliğinde aşağıdaki prensipler üzerine inşa edilmiştir:

- **Vertical Slice:** Her özellik (Feature) kendi dilimi içinde izoledir. Shared service ve karmaşık katman bağımlılıkları minimize edilmiştir.
- **Result Pattern:** İş mantığı hataları `Result` nesnesi ile yönetilir, exception-driven geliştirme yerine deterministik akış tercih edilir.
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

## 🛠️ Kurulum ve Çalıştırma

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
