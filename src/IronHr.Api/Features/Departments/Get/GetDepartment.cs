using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace IronHr.Api.Features.Departments.Get;

public static class GetDepartment
{
    public record Query(Guid Id) : IRequest<Result<Response>>;

    public record Response(
        Guid Id,
        Guid BranchId,
        string Name,
        string? Code,
        bool IsActive,
        string BranchName);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                SELECT d.Id, d.BranchId, d.Name, d.Code, d.IsActive, b.Name as BranchName
                FROM Departments d
                JOIN Branches b ON d.BranchId = b.Id
                WHERE d.Id = @Id";

            var dept = await connection.QueryFirstOrDefaultAsync<Response>(sql, new { request.Id });

            if (dept is null)
                return Result.Failure<Response>(new Error("Department.NotFound", "Departman bulunamadı."));

            return Result.Success(dept);
        }
    }
}

public static class GetDepartmentEndpoint
{
    public static void MapGetDepartment(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/departments/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetDepartment.Query(id));
            return result.IsSuccess ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithTags("Departments")
        .WithName("GetDepartment");
    }
}
