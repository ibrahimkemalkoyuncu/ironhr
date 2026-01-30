using System;

namespace IronHr.Api.Domain.Entities;

/// <summary>
/// Personel döküman bilgilerini temsil eden varlık.
/// </summary>
public class EmployeeDocument
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsActive { get; set; } = true;
}
