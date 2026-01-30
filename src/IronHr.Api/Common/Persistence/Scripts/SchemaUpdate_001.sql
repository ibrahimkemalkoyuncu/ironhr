-- ============================================================================
-- IRONHR SCHEMA UPDATE 001 - BRANCHES & DEPARTMENTS
-- ============================================================================

-- Subeler (Branches) tablosunu olusturur.
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Branches')
BEGIN
    CREATE TABLE Branches (
        Id UNIQUEIDENTIFIER PRIMARY KEY,           -- Kayit anahtari (GUID)
        CompanyId UNIQUEIDENTIFIER NOT NULL,       -- Bagli oldugu Sirket ID
        Name NVARCHAR(200) NOT NULL,               -- Sube Adi
        Code NVARCHAR(50),                         -- Sube Kodu (Opsiyonel)
        Address NVARCHAR(MAX),                     -- Sube Adresi
        IsActive BIT NOT NULL DEFAULT 1,           -- Aktiflik durumu
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(), -- Olusturulma Tarihi
        
        CONSTRAINT FK_Branches_Companies FOREIGN KEY (CompanyId) REFERENCES Companies(Id)
    );
    
    CREATE INDEX IX_Branches_CompanyId ON Branches (CompanyId);
END

-- Departmanlar (Departments) tablosunu olusturur.
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departments')
BEGIN
    CREATE TABLE Departments (
        Id UNIQUEIDENTIFIER PRIMARY KEY,           -- Kayit anahtari (GUID)
        BranchId UNIQUEIDENTIFIER NOT NULL,        -- Bagli oldugu Sube ID
        Name NVARCHAR(200) NOT NULL,               -- Departman Adi
        Code NVARCHAR(50),                         -- Departman Kodu (Opsiyonel)
        IsActive BIT NOT NULL DEFAULT 1,           -- Aktiflik durumu
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(), -- Olusturulma Tarihi
        
        CONSTRAINT FK_Departments_Branches FOREIGN KEY (BranchId) REFERENCES Branches(Id)
    );
    
    CREATE INDEX IX_Departments_BranchId ON Departments (BranchId);
END
GO
