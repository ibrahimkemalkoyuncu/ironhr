-- =============================================
-- Kurum: Afney Software House
-- Proje: IRONHR
-- Yazar: Mete Bey (Backend Uzmanı)
-- Açıklama: Personel (Employee) tablosunun oluşturulması.
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees')
BEGIN
    CREATE TABLE Employees (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), -- Personel Benzersiz Kimliği
        BranchId UNIQUEIDENTIFIER NOT NULL,             -- Bağlı Olduğu Şube (Zorunlu)
        DepartmentId UNIQUEIDENTIFIER NOT NULL,         -- Bağlı Olduğu Departman (Zorunlu)
        FirstName NVARCHAR(100) NOT NULL,                -- Personel Adı
        LastName NVARCHAR(100) NOT NULL,                 -- Personel Soyadı
        IdentityNumber CHAR(11) NOT NULL,               -- T.C. Kimlik No (11 Hane - Tekil)
        RegistrationNumber NVARCHAR(20) NOT NULL,        -- Sicil No (Kurum İçi)
        Email NVARCHAR(255) NULL,                       -- E-Posta
        PhoneNumber NVARCHAR(20) NULL,                  -- Telefon
        BirthDate DATE NOT NULL,                        -- Doğum Tarihi
        HireDate DATE NOT NULL,                         -- İşe Giriş Tarihi
        IsActive BIT NOT NULL DEFAULT 1,                -- Aktiflik Durumu
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(), -- Kayıt Tarihi
        
        -- Dış Anahtar Kısıtlamaları (Foreign Keys)
        CONSTRAINT FK_Employees_Branches FOREIGN KEY (BranchId) REFERENCES Branches(Id),
        CONSTRAINT FK_Employees_Departments FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
    );

    -- T.C. Kimlik No Üzerinden Hızlı Arama ve Tekillik Kontrolü İçin İndeks
    CREATE UNIQUE INDEX IX_Employees_IdentityNumber ON Employees (IdentityNumber) WHERE IsActive = 1;
    
    -- Şube ve Departman Bazlı Raporlama İçin İndeksler
    CREATE INDEX IX_Employees_BranchId ON Employees (BranchId);
    CREATE INDEX IX_Employees_DepartmentId ON Employees (DepartmentId);
END
GO
