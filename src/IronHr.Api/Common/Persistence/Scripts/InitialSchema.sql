-- ============================================================================
-- IRONHR VERİTABANI BAŞLANGIÇ ŞEMASI
-- Bu betik, sistemin temel tablolarını ve indekslerini oluşturur.
-- ============================================================================

-- Şirketler tablosu mevcut değilse oluşturur.
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Companies')
BEGIN
    CREATE TABLE Companies (
        Id UNIQUEIDENTIFIER PRIMARY KEY,           -- Kayıt anahtarı (GUID)
        Name NVARCHAR(200) NOT NULL,               -- Şirket Resmi Adı
        TaxNumber NVARCHAR(20) NOT NULL UNIQUE,    -- Vergi Numarası (Tekil olmalı)
        TaxOffice NVARCHAR(100),                   -- Vergi Dairesi
        Address NVARCHAR(MAX),                     -- Adres Bilgisi
        IsActive BIT NOT NULL DEFAULT 1,           -- Aktiflik durumu (1: Aktif, 0: Pasif)
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE() -- Oluşturulma Tarihi (UTC)
    );
    
    -- Vergi numarası üzerinden hızlı arama yapabilmek için indeks oluşturur.
    CREATE INDEX IX_Companies_TaxNumber ON Companies (TaxNumber);
END
GO
