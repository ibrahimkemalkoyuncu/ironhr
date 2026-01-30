using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Employees.List;

/// <summary>
/// Tüm personelleri departman ve şube bilgileriyle listeleme özelliği.
/// </summary>
public static class ListEmployees
{
    public record Query() : IRequest<Result<IEnumerable<Response>>>;

    public record Response(
        Guid Id,
        string FirstName,
        string LastName,
        string IdentityNumber,
        string RegistrationNumber,
        string BranchName,
        string DepartmentName,
        DateTime HireDate,
        bool IsActive);

    public class Handler : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        private readonly IDbConnectionFactory _dbConnectionFactory;

        public Handler(IDbConnectionFactory dbConnectionFactory)
        {
            _dbConnectionFactory = dbConnectionFactory;
        }

        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await _dbConnectionFactory.CreateConnectionAsync();

            const string sql = @"
                SELECT 
                    e.Id, e.FirstName, e.LastName, e.IdentityNumber, e.RegistrationNumber, 
                    b.Name as BranchName, d.Name as DepartmentName, e.HireDate, e.IsActive
                FROM Employees e
                JOIN Branches b ON e.BranchId = b.Id
                JOIN Departments d ON e.DepartmentId = d.Id
                WHERE e.IsActive = 1
                ORDER BY e.CreatedAt DESC";

            var employees = await connection.QueryAsync<Response>(sql);
            return Result.Success(employees);
        }
    }
}

public static class ListEmployeesEndpoint
{
    public static void MapListEmployees(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/employees", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new ListEmployees.Query());
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Employees")
        .WithName("ListEmployees")
        .WithSummary("Tüm aktif personelleri listeler");
    }
}
