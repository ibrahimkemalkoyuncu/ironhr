using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace IronHr.Api.Features.Branches.Get;

public static class GetBranch
{
    public record Query(Guid Id) : IRequest<Result<Response>>;

    public record Response(
        Guid Id,
        Guid CompanyId,
        string Name,
        string? Code,
        string? Address,
        bool IsActive,
        string CompanyName);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                SELECT b.Id, b.CompanyId, b.Name, b.Code, b.Address, b.IsActive, c.Name as CompanyName
                FROM Branches b
                JOIN Companies c ON b.CompanyId = c.Id
                WHERE b.Id = @Id";

            var branch = await connection.QueryFirstOrDefaultAsync<Response>(sql, new { request.Id });

            if (branch is null)
                return Result.Failure<Response>(new Error("Branch.NotFound", "Şube bulunamadı."));

            return Result.Success(branch);
        }
    }
}

public static class GetBranchEndpoint
{
    public static void MapGetBranch(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/branches/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetBranch.Query(id));
            return result.IsSuccess ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithTags("Branches")
        .WithName("GetBranch");
    }
}
