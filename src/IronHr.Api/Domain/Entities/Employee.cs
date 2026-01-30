using System;

namespace IronHr.Api.Domain.Entities;

/// <summary>
/// IRONHR - Personel (Employee) Domain Varlığı.
/// Bir personelin sistem üzerindeki tüm kimlik ve kurum içi verilerini temsil eder.
/// </summary>
public class Employee
{
    /// <summary>
    /// Personel Benzersiz Kimliği (Guid).
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Personelin bağlı olduğu şubenin kimliği.
    /// Organizasyonel hiyerarşi için zorunludur.
    /// </summary>
    public Guid BranchId { get; set; }

    /// <summary>
    /// Personelin bağlı olduğu departmanın kimliği.
    /// İş süreçlerinin yönetimi için zorunludur.
    /// </summary>
    public Guid DepartmentId { get; set; }

    /// <summary>
    /// Personelin adı.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Personelin soyadı.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// T.C. Kimlik Numarası (11 Hane).
    /// Yasal bildirimler için birincil anahtardır.
    /// </summary>
    public string IdentityNumber { get; set; } = string.Empty;

    /// <summary>
    /// Kurum içi Sicil Numarası.
    /// </summary>
    public string RegistrationNumber { get; set; } = string.Empty;

    /// <summary>
    /// Personelin kurumsal veya kişiye özel e-posta adresi.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// İletişim telefon numarası.
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Doğum tarihi (Kimlik verisi).
    /// </summary>
    public DateTime BirthDate { get; set; }

    /// <summary>
    /// Kuruma ilk giriş tarihi.
    /// Kıdem ve hak ediş hesaplamalarında kullanılır.
    /// </summary>
    public DateTime HireDate { get; set; }

    /// <summary>
    /// Personelin baz maaşı.
    /// </summary>
    public decimal? BaseSalary { get; set; }

    /// <summary>
    /// Maaş tipi (0: Net, 1: Brüt).
    /// </summary>
    public int? SalaryType { get; set; }

    /// <summary>
    /// Kaydın aktiflik durumu (Soft Delete).
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Kaydın oluşturulma zamanı.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
