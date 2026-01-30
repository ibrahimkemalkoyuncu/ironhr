/*
    IRONHR - İzin Yönetimi Tabloları
*/

-- 1. İzin Türleri (Yıllık İzin, Mazeret, Hastalık vb.)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LeaveTypes')
BEGIN
    CREATE TABLE LeaveTypes (
        Id UNIQUEIDENTIFIER PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        IsPaid BIT NOT NULL DEFAULT 1, -- Ücretli/Ücretsiz
        Description NVARCHAR(500),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        IsActive BIT NOT NULL DEFAULT 1
    );

    -- Varsayılan İzin Türleri
    INSERT INTO LeaveTypes (Id, Name, IsPaid, Description) VALUES 
    (NEWID(), 'Yıllık İzin', 1, 'Kanuni yıllık ücretli izin'),
    (NEWID(), 'Mazeret İzni', 1, 'Özel durumlar için mazeret izni'),
    (NEWID(), 'Hastalık/Rapor', 1, 'Sağlık raporu ile alınan izin'),
    (NEWID(), 'Ücretsiz İzin', 0, 'Ücret kesintisi yapılan izin');
END

-- 2. İzin Talepleri
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LeaveRequests')
BEGIN
    CREATE TABLE LeaveRequests (
        Id UNIQUEIDENTIFIER PRIMARY KEY,
        EmployeeId UNIQUEIDENTIFIER NOT NULL,
        LeaveTypeId UNIQUEIDENTIFIER NOT NULL,
        StartDate DATE NOT NULL,
        EndDate DATE NOT NULL,
        DurationDays INT NOT NULL, -- İş günü hesabı yapılabilir
        Status INT NOT NULL DEFAULT 0, -- 0: Beklemede, 1: Onaylandı, 2: Reddedildi
        Description NVARCHAR(500),
        ApproverId UNIQUEIDENTIFIER NULL, -- Onaylayan yönetici
        ApprovedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),

        CONSTRAINT FK_LeaveRequests_Employees FOREIGN KEY (EmployeeId) REFERENCES Employees(Id),
        CONSTRAINT FK_LeaveRequests_LeaveTypes FOREIGN KEY (LeaveTypeId) REFERENCES LeaveTypes(Id)
    );

    CREATE INDEX IX_LeaveRequests_EmployeeId ON LeaveRequests(EmployeeId);
END
GO
