-- =============================================
-- Kurum: Afney Software House
-- Proje: IRONHR
-- Yazar: Mete Bey (Backend Uzmanı)
-- Açıklama: Bordro (Payrolls) tablosunun oluşturulması.
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Payrolls')
BEGIN
    CREATE TABLE Payrolls (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        EmployeeId UNIQUEIDENTIFIER NOT NULL,
        Year INT NOT NULL,
        Month INT NOT NULL,
        
        -- Hesaplama Detayları
        GrossSalary DECIMAL(18, 2) NOT NULL,
        SgkEmployeeShare DECIMAL(18, 2) NOT NULL,
        UnemploymentEmployeeShare DECIMAL(18, 2) NOT NULL,
        IncomeTaxBase DECIMAL(18, 2) NOT NULL,
        IncomeTax DECIMAL(18, 2) NOT NULL,
        StampTax DECIMAL(18, 2) NOT NULL,
        NetSalary DECIMAL(18, 2) NOT NULL,
        
        -- İşveren Maliyeti (Ekstra)
        SgkEmployerShare DECIMAL(18, 2) NOT NULL,
        UnemploymentEmployerShare DECIMAL(18, 2) NOT NULL,
        TotalEmployerCost DECIMAL(18, 2) NOT NULL,

        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        
        CONSTRAINT FK_Payrolls_Employees FOREIGN KEY (EmployeeId) REFERENCES Employees(Id),
        CONSTRAINT UK_Payrolls_Employee_Period UNIQUE (EmployeeId, Year, Month)
    );

    CREATE INDEX IX_Payrolls_YearMonth ON Payrolls (Year, Month);
END
GO
