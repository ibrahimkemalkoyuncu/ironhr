using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Payrolls.Calculate;

/// <summary>
/// IRONHR - Bordro Hesaplama Özelliği (Vertical Slice)
/// Personelin maaş verilerinden yasal kesintileri hesaplar ve kaydeder.
/// </summary>
public static class CalculatePayroll
{
    public record Command(Guid EmployeeId, int Year, int Month) : IRequest<Result<Guid>>;

    private record EmployeeSalaryData(decimal? BaseSalary, int? SalaryType);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, Result<Guid>>
    {
        public async Task<Result<Guid>> Handle(Command request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            // 1. Personel ve Maaş Bilgisi Getir
            const string empSql = "SELECT BaseSalary, SalaryType FROM Employees WHERE Id = @EmployeeId";
            var emp = await connection.QueryFirstOrDefaultAsync<EmployeeSalaryData>(empSql, new { request.EmployeeId });

            if (emp == null || emp.BaseSalary == null)
            {
                return Result.Failure<Guid>(new Error("Payroll.MissingSalary", "Personelin maaş bilgisi tanımlanmamış."));
            }

            decimal baseSalary = emp.BaseSalary.Value;
            int salaryType = emp.SalaryType ?? 0; // 0: Net, 1: Gross

            // 2. Hesaplama Parametreleri (Statik - Örnek Değerler)
            decimal gross = salaryType == 1 ? baseSalary : baseSalary / 0.71491m; // Basit netten brüte (yaklaşık %15 vergi dilimi için)

            decimal sgkEmployee = Math.Round(gross * 0.14m, 2);
            decimal unemploymentEmployee = Math.Round(gross * 0.01m, 2);
            decimal incomeTaxBase = gross - sgkEmployee - unemploymentEmployee;
            decimal incomeTax = Math.Round(incomeTaxBase * 0.15m, 2); // Basitleştirilmiş %15 vergi
            decimal stampTax = Math.Round(gross * 0.00759m, 2);
            decimal net = Math.Round(gross - sgkEmployee - unemploymentEmployee - incomeTax - stampTax, 2);

            // İşveren Maliyeti
            decimal sgkEmployer = Math.Round(gross * 0.155m, 2); // %5 indirimli hali
            decimal unemploymentEmployer = Math.Round(gross * 0.02m, 2);
            decimal totalCost = Math.Round(gross + sgkEmployer + unemploymentEmployer, 2);

            // 3. Veritabanına Kaydet (Eğer varsa güncelle)
            const string insertSql = @"
                IF EXISTS (SELECT 1 FROM Payrolls WHERE EmployeeId = @EmployeeId AND Year = @Year AND Month = @Month)
                BEGIN
                    UPDATE Payrolls 
                    SET GrossSalary = @GrossSalary, SgkEmployeeShare = @SgkEmployeeShare, 
                        UnemploymentEmployeeShare = @UnemploymentEmployeeShare, IncomeTaxBase = @IncomeTaxBase,
                        IncomeTax = @IncomeTax, StampTax = @StampTax, NetSalary = @NetSalary,
                        SgkEmployerShare = @SgkEmployerShare, UnemploymentEmployerShare = @UnemploymentEmployerShare,
                        TotalEmployerCost = @TotalEmployerCost, CreatedAt = GETDATE()
                    WHERE EmployeeId = @EmployeeId AND Year = @Year AND Month = @Month
                    
                    SELECT Id FROM Payrolls WHERE EmployeeId = @EmployeeId AND Year = @Year AND Month = @Month
                END
                ELSE
                BEGIN
                    INSERT INTO Payrolls (EmployeeId, Year, Month, GrossSalary, SgkEmployeeShare, 
                                        UnemploymentEmployeeShare, IncomeTaxBase, IncomeTax, StampTax, NetSalary,
                                        SgkEmployerShare, UnemploymentEmployerShare, TotalEmployerCost)
                    VALUES (@EmployeeId, @Year, @Month, @GrossSalary, @SgkEmployeeShare, 
                            @UnemploymentEmployeeShare, @IncomeTaxBase, @IncomeTax, @StampTax, @NetSalary,
                            @SgkEmployerShare, @UnemploymentEmployerShare, @TotalEmployerCost);
                    
                    SELECT SCOPE_IDENTITY(); -- Not usable for UNIQUEIDENTIFIER with default, use output or just select the ID
                    SELECT Id FROM Payrolls WHERE EmployeeId = @EmployeeId AND Year = @Year AND Month = @Month;
                END";

            var payrollId = await connection.ExecuteScalarAsync<Guid>(insertSql, new
            {
                request.EmployeeId,
                request.Year,
                request.Month,
                GrossSalary = gross,
                SgkEmployeeShare = sgkEmployee,
                UnemploymentEmployeeShare = unemploymentEmployee,
                IncomeTaxBase = incomeTaxBase,
                IncomeTax = incomeTax,
                StampTax = stampTax,
                NetSalary = net,
                SgkEmployerShare = sgkEmployer,
                UnemploymentEmployerShare = unemploymentEmployer,
                TotalEmployerCost = totalCost
            });

            return Result.Success(payrollId);
        }
    }
}

public static class CalculatePayrollEndpoint
{
    public static void MapCalculatePayroll(this IEndpointRouteBuilder app)
    {
        app.MapPost("api/payrolls/calculate", async (CalculatePayroll.Command command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Payrolls")
        .WithName("CalculatePayroll")
        .WithSummary("Personel için bordro hesaplar");
    }
}
