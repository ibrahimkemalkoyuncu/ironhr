CREATE TABLE PerformanceEvaluations (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EmployeeId UNIQUEIDENTIFIER NOT NULL,
    EvaluatorId UNIQUEIDENTIFIER NULL, -- Değerlendirmeyi yapan yönetici (Opsiyonel: Sistem de yapabilir)
    PeriodTitle NVARCHAR(100) NOT NULL, -- Örn: "2025 Yıl Sonu", "2026 Q1"
    EvaluationDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Puanlama (1-5 arası bir skala varsayıyoruz)
    Score DECIMAL(3, 2) NOT NULL, 
    
    -- Detaylı Notlar
    ReviewNotes NVARCHAR(MAX) NULL,
    
    -- Kriter Bazlı Puanlar (JSON olarak saklanabilir veya basitlik için şimdilik toplam puan)
    -- İleride kriter tablosu eklenebilir.
    
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_Evaluations_Employees FOREIGN KEY (EmployeeId) REFERENCES Employees(Id)
);

CREATE INDEX IX_Evaluations_EmployeeId ON PerformanceEvaluations (EmployeeId);
