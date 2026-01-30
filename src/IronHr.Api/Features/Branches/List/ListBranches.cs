using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Branches.List;

/// <summary>
/// Şube listeleme özelliği.
/// </summary>
public static class ListBranches
{
    public record Query(Guid? CompanyId = null) : IRequest<Result<IEnumerable<Response>>>;

    public record Response(
        Guid Id, 
        Guid CompanyId, 
        string Name, 
        string Code, 
        string? Address, 
        bool IsActive, 
        string CompanyName);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            string sql = @"
                SELECT b.Id, b.CompanyId, b.Name, b.Code, b.Address, b.IsActive, c.Name as CompanyName 
                FROM Branches b
                JOIN Companies c ON b.CompanyId = c.Id
                WHERE 1=1";
                
            if (request.CompanyId.HasValue)
            {
                sql += " AND b.CompanyId = @CompanyId";
            }
            sql += " ORDER BY b.Name";

            var branches = await connection.QueryAsync<Response>(sql, new { request.CompanyId });
            return Result.Success(branches);
        }
    }
}

public static class ListBranchesEndpoint
{
    public static void MapListBranches(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/branches", async (Guid? companyId, IMediator mediator) =>
        {
            var result = await mediator.Send(new ListBranches.Query(companyId));
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Branches")
        .WithName("ListBranches")
        .WithSummary("Şubeleri listeler (Şirket bazlı filtrelenebilir)");
    }
}
