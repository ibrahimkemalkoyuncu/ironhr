# ⚙️ Mete Bey – Backend Uzmanı Eğitim Dosyası

Bu dosya, **IRONHR** backend mimarisinin teknik detaylarını ve neden bu kararların alındığını açıklamak için Kemal Bey'in talebiyle oluşturulmuştur.

---

## 🏗️ 1. Mimari Karar: Vertical Slice Architecture (Dikey Dilim Mimarisi)

**Neden?**
Geleneksel katmanlı mimarilerde (Layered Architecture) bir özellik eklemek için 5-6 farklı projede/klasörde değişiklik yapmanız gerekir. Bu da zamanla "God Class" (Her şeyi yapan dev sınıflar) oluşmasına neden olur.

**Nasıl Çalışır?**
`Features` klasörü altında her iş özelliği (Örn: `CreateCompany`) kendi Command, Handler, Mapping ve API Endpoint dosyasını barındırır. Bu sayede bir özelliği değiştirmek diğerlerini bozmaz.

---

## 💾 2. Veri Erişimi: Dapper

**Neden?**
EF Core yüksek seviyeli bir kontrol sağlasa da, karmaşık İK raporlarında (Örn: 5000 personellik bordro hesaplaması) SQL kontrolünün bizde olması gerekir. Dapper, en performanslı (lightweight) ORM aracıdır.

**Örnek Yaklaşım (CreateCompany):**

```sql
INSERT INTO Companies (Id, Name, TaxNumber, TaxOffice, Address, IsActive, CreatedAt)
VALUES (@Id, @Name, @TaxNumber, @TaxOffice, @Address, @IsActive, @CreatedAt);
```

SQL sorguları açık ve okunabilirdir. "Magic mapping" yoktur, ne yazdığımızı biliriz.

---

## 🛡️ 3. Dayanıklılık ve Güvenlik (Resilience & Safety)

1.  **MediatR Pipeline (ValidationBehavior):** Bir istek handler'a ulaşmadan önce otomatik olarak doğrulanır. Eğer veri kirliyse (Örn: Vergi no 10 haneli değilse), işlem başlamadan reddedilir.
2.  **Global Exception Handling:** Uygulamanın herhangi bir yerinde hata oluşursa, sistem çökmez. `GlobalExceptionHandler` bunu yakalar ve frontend'e standart bir hata mesajı (Problem Details) döner.
3.  **Result Pattern:** Metodlar `void` veya ham data dönmek yerine `Result` nesnesi döner. Bu sayede "Success/Failure" durumu net bir şekilde kontrol edilir.

---

## 🛠️ Teknik Sözlük

- **Command:** Bir şeyi yapma isteği (Yazma işlemi).
- **Handler:** İsteği yerine getiren iş mantığı.
- **Pipeline:** İsteğin geçtiği boru hattı (Loglama, Validasyon vb. burada yapılır).
