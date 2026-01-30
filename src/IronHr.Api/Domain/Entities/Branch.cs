namespace IronHr.Api.Domain.Entities;

/// <summary>
/// Sube bilgilerini temsil eden domain varligi.
/// Her sube mutlaka bir sirkete (Company) baglidir.
/// </summary>
public class Branch
{
    public Guid Id { get; init; } // Benzersiz kayıt numarası

    public Guid CompanyId { get; init; } // Bagli oldugu sirketin ID'si

    public string Name { get; init; } = string.Empty; // Sube adi (Orn: Ankara Subesi)

    public string? Code { get; init; } // Sube kodu (Orn: SUB-001)

    public string? Address { get; init; } // Subenin adresi

    public bool IsActive { get; init; } = true; // Subenin aktiflik durumu

    public DateTime CreatedAt { get; init; } = DateTime.UtcNow; // Kayıt oluşturulma tarihi
}
