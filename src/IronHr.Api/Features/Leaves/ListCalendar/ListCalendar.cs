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

namespace IronHr.Api.Features.Leaves.ListCalendar;

/// <summary>
/// Takvim görünümü için tüm aktif izinleri listeler.
/// </summary>
public static class ListCalendar
{
    public record Query() : IRequest<Result<IEnumerable<Response>>>;

    public record Response(
        Guid Id,
        string EmployeeName,
        string LeaveTypeName,
        DateTime StartDate,
        DateTime EndDate,
        int Status);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                SELECT 
                    lr.Id, (e.FirstName + ' ' + e.LastName) as EmployeeName, 
                    lt.Name as LeaveTypeName, lr.StartDate, lr.EndDate, lr.Status
                FROM LeaveRequests lr
                JOIN Employees e ON lr.EmployeeId = e.Id
                JOIN LeaveTypes lt ON lr.LeaveTypeId = lt.Id
                WHERE lr.Status IN (0, 1) -- Bekleyen ve Onaylananlar
                AND lr.EndDate >= DATEADD(month, -1, GETDATE()) -- Son 1 ay ve gelecek izinler";

            var calendarData = await connection.QueryAsync<Response>(sql);

            return Result.Success(calendarData);
        }
    }
}

public static class ListCalendarEndpoint
{
    public static void MapListCalendar(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/leaves/calendar", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new ListCalendar.Query());
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Leaves")
        .WithName("ListCalendar")
        .WithSummary("Takvim için izin verilerini döner.");
    }
}
