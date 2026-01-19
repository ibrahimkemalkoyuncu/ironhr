using Dapper;
using FluentValidation;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace IronHr.Api.Features.Companies.Create;

/// <summary>
/// Şirket oluşturma isteği için gerekli verileri taşıyan nesne (Command).
/// </summary>
public record CreateCompanyCommand(
    string Name,        // Şirket Adı
    string TaxNumber,   // Vergi Numarası
    string TaxOffice,   // Vergi Dairesi
    string Address) : IRequest<Guid>;

/// <summary>
/// Şirket oluşturma isteğinin iş kurallarına uygunluğunu denetleyen sınıf.
/// </summary>
public class CreateCompanyValidator : AbstractValidator<CreateCompanyCommand>
{
    public CreateCompanyValidator()
    {
        // Şirket adı boş olamaz ve en fazla 200 karakter olabilir.
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);

        // Vergi numarası 10 haneli ve sadece rakamlardan oluşmalıdır (TR standardı).
        RuleFor(x => x.TaxNumber)
            .NotEmpty()
            .Length(10)
            .Must(x => x.All(char.IsDigit))
            .WithMessage("Vergi Numarası 10 haneli ve sadece rakam olmalıdır.");

        // Vergi dairesi en fazla 100 karakter olabilir.
        RuleFor(x => x.TaxOffice).MaximumLength(100);
    }
}

/// <summary>
/// Şirket oluşturma işlemini gerçekleştiren iş mantığı sınıfı (Handler).
/// </summary>
public class CreateCompanyHandler : IRequestHandler<CreateCompanyCommand, Guid>
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public CreateCompanyHandler(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    /// <summary>
    /// MediatR tarafından çağrılan, veritabanı kaydını yapan metod.
    /// </summary>
    public async Task<Guid> Handle(CreateCompanyCommand request, CancellationToken ct)
    {
        // Veritabanı bağlantısı açılır (Dapper).
        using var connection = await _dbConnectionFactory.CreateConnectionAsync(ct);

        // Şirket kaydı için ham SQL sorgusu.
        // Performans için Dapper kullanılarak doğrudan SQL çalıştırılır.
        const string sql = @"
            INSERT INTO Companies (Id, Name, TaxNumber, TaxOffice, Address, IsActive, CreatedAt)
            VALUES (@Id, @Name, @TaxNumber, @TaxOffice, @Address, @IsActive, @CreatedAt);";

        // Domain entity oluşturulur.
        var company = new Company
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            TaxNumber = request.TaxNumber,
            TaxOffice = request.TaxOffice,
            Address = request.Address,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // SQL Injection riskine karşı parametrik olarak sorgu çalıştırılır.
        await connection.ExecuteAsync(sql, company);

        return company.Id;
    }
}

/// <summary>
/// Şirket oluşturma özelliğini API dış dünyasına açan uç nokta (Endpoint) tanımı.
/// </summary>
public static class CreateCompanyEndpoint
{
    public static void MapCreateCompany(this IEndpointRouteBuilder app)
    {
        // POST /api/companies endpoint'i tanımlanır.
        app.MapPost("/api/companies", async (CreateCompanyCommand command, IMediator mediator) =>
        {
            // Gelen istek MediatR üzerinden Handler'a iletilir.
            var id = await mediator.Send(command);

            // HTTP 201 Created yanıtı dönülür.
            return Results.Created($"/api/companies/{id}", id);
        })
        .WithName("CreateCompany")
        .WithTags("Companies");
    }
}
