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

namespace IronHr.Api.Features.Employees.Create;

/// <summary>
/// IRONHR - Yeni Personel Oluşturma Özelliği (Vertical Slice)
/// </summary>
public static class CreateEmployee
{
    /// <summary>
    /// Personel oluşturma isteği için gerekli veriler.
    /// </summary>
    public record Command(
        Guid BranchId,
        Guid DepartmentId,
        string FirstName,
        string LastName,
        string IdentityNumber,
        string RegistrationNumber,
        string? Email,
        string? PhoneNumber,
        DateTime BirthDate,
        DateTime HireDate,
        decimal? BaseSalary,
        int? SalaryType) : IRequest<Result<Guid>>;

    /// <summary>
    /// Personel oluşturma isteği için doğrulama kuralları (Mete Bey ve Numan Bey onaylı).
    /// </summary>
    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.BranchId).NotEmpty().WithMessage("Şube seçimi zorunludur.");
            RuleFor(x => x.DepartmentId).NotEmpty().WithMessage("Departman seçimi zorunludur.");
            RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100).WithMessage("Ad alanı boş bırakılamaz ve en fazla 100 karakter olabilir.");
            RuleFor(x => x.LastName).NotEmpty().MaximumLength(100).WithMessage("Soyad alanı boş bırakılamaz ve en fazla 100 karakter olabilir.");

            RuleFor(x => x.IdentityNumber)
                .NotEmpty().WithMessage("T.C. Kimlik No zorunludur.")
                .Length(11).WithMessage("T.C. Kimlik No 11 hane olmalıdır.")
                .Must(BeAValidTcNo).WithMessage("Geçersiz T.C. Kimlik No.");

            RuleFor(x => x.RegistrationNumber).NotEmpty().MaximumLength(20).WithMessage("Sicil No zorunludur.");
            RuleFor(x => x.BirthDate).LessThan(DateTime.Now.AddYears(-15)).WithMessage("Personel en az 15 yaşında olmalıdır.");
            RuleFor(x => x.HireDate).NotEmpty().WithMessage("İşe giriş tarihi zorunludur.");

            RuleFor(x => x.Email).EmailAddress().WithMessage("Geçersiz e-posta adresi.").When(x => !string.IsNullOrEmpty(x.Email));
            RuleFor(x => x.BaseSalary).GreaterThanOrEqualTo(0).When(x => x.BaseSalary.HasValue).WithMessage("Maaş negatif olamaz.");
        }

        /// <summary>
        /// Türk Vatandaşlık No Doğrulama Algoritması.
        /// </summary>
        private bool BeAValidTcNo(string tcNo)
        {
            if (string.IsNullOrEmpty(tcNo) || tcNo.Length != 11 || !tcNo.All(char.IsDigit) || tcNo[0] == '0')
                return false;

            long tc = long.Parse(tcNo);
            int[] digits = tcNo.Select(c => int.Parse(c.ToString())).ToArray();

            int sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
            int sum2 = digits[1] + digits[3] + digits[5] + digits[7];

            int d10 = (sum1 * 7 - sum2) % 10;
            int d11 = (digits.Take(10).Sum()) % 10;

            return digits[9] == d10 && digits[10] == d11;
        }
    }

    /// <summary>
    /// Personel oluşturma işlemini yürüten iş mantığı (Handler).
    /// </summary>
    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, Result<Guid>>
    {
        public async Task<Result<Guid>> Handle(Command request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            // 1. Şirket/Şube ve Departman kontrolü (Numan Bey: "Başıboş personel olamaz")
            const string checkSql = @"
                SELECT (SELECT COUNT(1) FROM Branches WHERE Id = @BranchId) + 
                       (SELECT COUNT(1) FROM Departments WHERE Id = @DepartmentId)";

            var checkCount = await connection.ExecuteScalarAsync<int>(checkSql, new { request.BranchId, request.DepartmentId });
            if (checkCount < 2)
            {
                return Result.Failure<Guid>(new Error("Employee.OrganizationNotFound", "Seçilen şube veya departman sistemde bulunamadı."));
            }

            // 2. Mükerrer T.C. Kimlik No kontrolü
            const string duplicateSql = "SELECT COUNT(1) FROM Employees WHERE IdentityNumber = @IdentityNumber AND IsActive = 1";
            var isDuplicate = await connection.ExecuteScalarAsync<bool>(duplicateSql, new { request.IdentityNumber });

            if (isDuplicate)
            {
                return Result.Failure<Guid>(new Error("Employee.DuplicateIdentity", "Bu T.C. Kimlik numarasına sahip aktif bir personel zaten mevcut."));
            }

            // 3. Personel Kaydı
            var employeeId = Guid.NewGuid();
            const string insertSql = @"
                INSERT INTO Employees (Id, BranchId, DepartmentId, FirstName, LastName, IdentityNumber, RegistrationNumber, Email, PhoneNumber, BirthDate, HireDate, BaseSalary, SalaryType)
                VALUES (@Id, @BranchId, @DepartmentId, @FirstName, @LastName, @IdentityNumber, @RegistrationNumber, @Email, @PhoneNumber, @BirthDate, @HireDate, @BaseSalary, @SalaryType)";

            await connection.ExecuteAsync(insertSql, new
            {
                Id = employeeId,
                request.BranchId,
                request.DepartmentId,
                request.FirstName,
                request.LastName,
                request.IdentityNumber,
                request.RegistrationNumber,
                request.Email,
                request.PhoneNumber,
                request.BirthDate,
                request.HireDate,
                request.BaseSalary,
                request.SalaryType
            });

            return Result<Guid>.Success(employeeId);
        }
    }
}

public static class CreateEmployeeEndpoint
{
    public static void MapCreateEmployee(this IEndpointRouteBuilder app)
    {
        app.MapPost("api/employees", async (CreateEmployee.Command command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Employees")
        .WithName("CreateEmployee")
        .WithSummary("Yeni bir personel oluşturur")
        .WithDescription("T.C. Kimlik No ve Organizasyonel bağlılık kontrollerini yaparak personel kaydı açar.");
    }
}
