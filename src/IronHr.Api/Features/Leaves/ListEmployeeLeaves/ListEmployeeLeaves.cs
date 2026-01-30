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

namespace IronHr.Api.Features.Leaves.ListEmployeeLeaves;

public static class ListEmployeeLeaves
{
    public record Query(Guid EmployeeId) : IRequest<Result<IEnumerable<Response>>>;

    public record Response(
        Guid Id,
        string LeaveTypeName,
        DateTime StartDate,
        DateTime EndDate,
        int DurationDays,
        int Status,
        string? Description,
        DateTime CreatedAt);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                SELECT 
                    lr.Id, lt.Name as LeaveTypeName, lr.StartDate, lr.EndDate, 
                    lr.DurationDays, lr.Status, lr.Description, lr.CreatedAt
                FROM LeaveRequests lr
                JOIN LeaveTypes lt ON lr.LeaveTypeId = lt.Id
                WHERE lr.EmployeeId = @EmployeeId
                ORDER BY lr.CreatedAt DESC";

            var leaves = await connection.QueryAsync<Response>(sql, new { request.EmployeeId });

            return Result.Success(leaves);
        }
    }
}

public static class ListEmployeeLeavesEndpoint
{
    public static void MapListEmployeeLeaves(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/employees/{id:guid}/leaves", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new ListEmployeeLeaves.Query(id));
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Leaves")
        .WithName("ListEmployeeLeaves")
        .WithSummary("Personelin tüm izin taleplerini listeler.");
    }
}
