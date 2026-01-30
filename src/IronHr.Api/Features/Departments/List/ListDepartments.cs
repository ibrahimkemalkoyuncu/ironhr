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

namespace IronHr.Api.Features.Departments.List;

/// <summary>
/// Departman listeleme özelliği.
/// </summary>
public static class ListDepartments
{
    public record Query(Guid? BranchId = null) : IRequest<Result<IEnumerable<Response>>>;

    public record Response(
        Guid Id, 
        Guid BranchId, 
        string Name, 
        string Code, 
        bool IsActive, 
        string BranchName);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            string sql = @"
                SELECT d.Id, d.BranchId, d.Name, d.Code, d.IsActive, b.Name as BranchName 
                FROM Departments d
                JOIN Branches b ON d.BranchId = b.Id
                WHERE 1=1";
                
            if (request.BranchId.HasValue)
            {
                sql += " AND d.BranchId = @BranchId";
            }
            sql += " ORDER BY d.Name";

            var departments = await connection.QueryAsync<Response>(sql, new { request.BranchId });
            return Result.Success(departments);
        }
    }
}

public static class ListDepartmentsEndpoint
{
    public static void MapListDepartments(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/departments", async (Guid? branchId, IMediator mediator) =>
        {
            var result = await mediator.Send(new ListDepartments.Query(branchId));
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Departments")
        .WithName("ListDepartments")
        .WithSummary("Departmanları listeler (Şube bazlı filtrelenebilir)");
    }
}
