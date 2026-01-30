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

namespace IronHr.Api.Features.Leaves.ListPending;

public static class ListPendingLeaves
{
    public record Query() : IRequest<Result<IEnumerable<Response>>>;

    public record Response(
        Guid Id,
        Guid EmployeeId,
        string FirstName,
        string LastName,
        string LeaveTypeName,
        DateTime StartDate,
        DateTime EndDate,
        int DurationDays,
        string? Description,
        DateTime CreatedAt);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                SELECT 
                    lr.Id, e.Id as EmployeeId, e.FirstName, e.LastName, 
                    lt.Name as LeaveTypeName, lr.StartDate, lr.EndDate, 
                    lr.DurationDays, lr.Description, lr.CreatedAt
                FROM LeaveRequests lr
                JOIN Employees e ON lr.EmployeeId = e.Id
                JOIN LeaveTypes lt ON lr.LeaveTypeId = lt.Id
                WHERE lr.Status = 0 -- Sadece Bekleyenler (Pending)
                ORDER BY lr.CreatedAt ASC";

            var leaves = await connection.QueryAsync<Response>(sql);

            return Result.Success(leaves);
        }
    }
}

public static class ListPendingLeavesEndpoint
{
    public static void MapListPendingLeaves(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/leaves/pending", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new ListPendingLeaves.Query());
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Leaves")
        .WithName("ListPendingLeaves")
        .WithSummary("Onay bekleyen tüm izin taleplerini listeler.");
    }
}
