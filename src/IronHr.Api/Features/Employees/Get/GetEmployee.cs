using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Employees.Get;

/// <summary>
/// Belirli bir personelin detaylarını getirme özelliği.
/// </summary>
public static class GetEmployee
{
    public record Query(Guid Id) : IRequest<Result<Response>>;

    public record Response(
        Guid Id,
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
        bool IsActive,
        decimal? BaseSalary,
        int? SalaryType,
        string BranchName,
        string DepartmentName);

    public class Handler : IRequestHandler<Query, Result<Response>>
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public Handler(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();

            const string sql = @"
                SELECT 
                    e.Id, e.BranchId, e.DepartmentId, e.FirstName, e.LastName, 
                    e.IdentityNumber, e.RegistrationNumber, e.Email, e.PhoneNumber, 
                    e.BirthDate, e.HireDate, e.IsActive, e.BaseSalary, e.SalaryType,
                    b.Name as BranchName, 
                    d.Name as DepartmentName
                FROM Employees e
                JOIN Branches b ON e.BranchId = b.Id
                JOIN Departments d ON e.DepartmentId = d.Id
                WHERE e.Id = @Id";

            var employee = await connection.QueryFirstOrDefaultAsync<Response>(sql, new { Id = request.Id });

            if (employee is null)
                return Result.Failure<Response>(new Error("Employee.NotFound", "Personel bulunamadı."));

            return Result.Success(employee);
        }
    }
}

public static class GetEmployeeEndpoint
{
    public static void MapGetEmployee(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/employees/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetEmployee.Query(id));
            return result.IsSuccess ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithTags("Employees")
        .WithName("GetEmployee")
        .WithSummary("Belirli bir personelin detaylarını getirir");
    }
}
