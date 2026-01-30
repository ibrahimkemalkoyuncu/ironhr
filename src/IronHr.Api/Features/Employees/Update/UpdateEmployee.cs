using Dapper;
using FluentValidation;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Employees.Update;

/// <summary>
/// IRONHR - Personel Bilgilerini Güncelleme Özelliği (Vertical Slice)
/// </summary>
public static class UpdateEmployee
{
    public record Command(
        Guid Id,
        Guid BranchId,
        Guid DepartmentId,
        string FirstName,
        string LastName,
        string RegistrationNumber,
        string? Email,
        string? PhoneNumber,
        DateTime BirthDate,
        DateTime HireDate,
        bool IsActive,
        decimal? BaseSalary,
        int? SalaryType) : IRequest<Result>;

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100).WithMessage("Ad alanı zorunludur.");
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(100).WithMessage("Soyad alanı zorunludur.");
            RuleFor(x => x.RegistrationNumber).NotEmpty().WithMessage("Sicil No zorunludur.");
            RuleFor(x => x.BirthDate).NotEmpty().LessThan(DateTime.Today.AddYears(-18)).WithMessage("Personel 18 yaşından küçük olamaz.");
            RuleFor(x => x.HireDate).NotEmpty().WithMessage("İşe giriş tarihi zorunludur.");
            RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email)).WithMessage("Geçerli bir e-posta adresi giriniz.");
            RuleFor(x => x.BaseSalary).GreaterThanOrEqualTo(0).When(x => x.BaseSalary.HasValue).WithMessage("Maaş negatif olamaz.");
        }
    }

    public class Handler : IRequestHandler<Command, Result>
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public Handler(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<Result> Handle(Command request, CancellationToken cancellationToken)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();

            // 1. Organizasyonel varlık kontrolü
            const string checkSql = @"
                SELECT (SELECT COUNT(1) FROM Branches WHERE Id = @BranchId) + 
                       (SELECT COUNT(1) FROM Departments WHERE Id = @DepartmentId)";

            var checkCount = await connection.ExecuteScalarAsync<int>(checkSql, new { request.BranchId, request.DepartmentId });
            if (checkCount < 2)
            {
                return Result.Failure(new Error("Employee.OrganizationNotFound", "Seçilen şube veya departman sistemde bulunamadı."));
            }

            // 2. Personel varlık kontrolü
            const string existsSql = "SELECT COUNT(1) FROM Employees WHERE Id = @Id";
            var exists = await connection.ExecuteScalarAsync<bool>(existsSql, new { request.Id });
            if (!exists)
            {
                return Result.Failure(new Error("Employee.NotFound", "Güncellenecek personel bulunamadı."));
            }

            // 3. Güncelleme İşlemi (IdentityNumber -TC No- güvenlik gerekçesiyle bu ekrandan güncellenmez diye varsayıyoruz)
            const string updateSql = @"
                UPDATE Employees 
                SET BranchId = @BranchId, 
                    DepartmentId = @DepartmentId, 
                    FirstName = @FirstName, 
                    LastName = @LastName, 
                    RegistrationNumber = @RegistrationNumber, 
                    Email = @Email, 
                    PhoneNumber = @PhoneNumber, 
                    BirthDate = @BirthDate, 
                    HireDate = @HireDate,
                    IsActive = @IsActive,
                    BaseSalary = @BaseSalary,
                    SalaryType = @SalaryType,
                    UpdatedAt = GETDATE()
                WHERE Id = @Id";

            await connection.ExecuteAsync(updateSql, request);

            return Result.Success();
        }
    }
}

public static class UpdateEmployeeEndpoint
{
    public static void MapUpdateEmployee(this IEndpointRouteBuilder app)
    {
        app.MapPut("api/employees/{id:guid}", async (Guid id, UpdateEmployee.Command command, ISender sender) =>
        {
            if (id != command.Id)
            {
                return Results.BadRequest(Result.Failure(new Error("Employee.IdMismatch", "URL'deki ID ile gövdedeki ID uyuşmuyor.")));
            }

            var result = await sender.Send(command);
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Employees")
        .WithName("UpdateEmployee")
        .WithSummary("Personel bilgilerini günceller")
        .WithDescription("Organizasyonel ve iletişim bilgilerini revize eder.");
    }
}
