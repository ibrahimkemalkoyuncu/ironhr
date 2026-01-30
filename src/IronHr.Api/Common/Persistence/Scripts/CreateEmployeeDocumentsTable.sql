/*
    IRONHR - Personel Dökümanları Tablosu
    Personellere ait diploma, sertifika, kimlik fotokopisi vb. dosyaların meta verilerini tutar.
*/

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EmployeeDocuments')
BEGIN
    CREATE TABLE EmployeeDocuments (
        Id UNIQUEIDENTIFIER PRIMARY KEY,
        EmployeeId UNIQUEIDENTIFIER NOT NULL,
        FileName NVARCHAR(255) NOT NULL,
        ContentType NVARCHAR(100) NOT NULL,
        FileSize BIGINT NOT NULL,
        StoragePath NVARCHAR(MAX) NOT NULL, -- Fiziksel dosya yolu veya Cloud URL
        Description NVARCHAR(500),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        IsActive BIT NOT NULL DEFAULT 1,

        CONSTRAINT FK_EmployeeDocuments_Employees FOREIGN KEY (EmployeeId) REFERENCES Employees(Id)
    );

    CREATE INDEX IX_EmployeeDocuments_EmployeeId ON EmployeeDocuments(EmployeeId);
END
GO
