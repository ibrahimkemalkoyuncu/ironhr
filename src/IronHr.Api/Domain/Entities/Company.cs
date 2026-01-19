namespace IronHr.Api.Domain.Entities;

/// <summary>
/// Şirket bilgilerini temsil eden ana varlık (Domain Entity) sınıfı.
/// Organizasyon hiyerarşisinin en üst düğümünü temsil eder.
/// </summary>
public class Company
{
    public Guid Id { get; init; } // Benzersiz kayıt numarası

    public string Name { get; init; } = string.Empty; // Şirketin resmi adı

    public string TaxNumber { get; init; } = string.Empty; // Vergi numarası (Mükerrer olamaz)

    public string TaxOffice { get; init; } = string.Empty; // Bağlı olduğu vergi dairesi

    public string Address { get; init; } = string.Empty; // Şirket merkez adresi

    public bool IsActive { get; init; } = true; // Şirket aktiflik durumu

    public DateTime CreatedAt { get; init; } = DateTime.UtcNow; // Kayıt oluşturulma tarihi
}
