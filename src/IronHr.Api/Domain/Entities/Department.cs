namespace IronHr.Api.Domain.Entities;

/// <summary>
/// Departman bilgilerini temsil eden domain varligi.
/// Her departman mutlaka bir subeye (Branch) baglidir.
/// </summary>
public class Department
{
    public Guid Id { get; init; } // Benzersiz kayıt numarası

    public Guid BranchId { get; init; } // Bagli oldugu subenin ID'si

    public string Name { get; init; } = string.Empty; // Departman adi (Orn: Muhasebe)

    public string? Code { get; init; } // Departman kodu (Orn: DEP-ACC)

    public bool IsActive { get; init; } = true; // Departmanin aktiflik durumu

    public DateTime CreatedAt { get; init; } = DateTime.UtcNow; // Kayıt oluşturulma tarihi
}
