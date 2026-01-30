using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Dashboard.GetSummary;

/// <summary>
/// IRONHR - Dashboard Özet Verileri (Vertical Slice)
/// </summary>
public static class GetDashboardSummary
{
    public record Query() : IRequest<Result<Response>>;

    public record Response(
        int TotalEmployees,
        int OnLeaveToday,
        int PendingLeaves,
        decimal MonthlyTotalCost,
        List<BranchStat> BranchDistribution,
        List<UpcomingEvent> UpcomingEvents);

    public record BranchStat(string Name, int Count);
    public record UpcomingEvent(string EmployeeName, DateTime Date, string Type, int DayCount);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            // 1. Temel Sayılar
            const string countsSql = @"
                SELECT 
                    (SELECT COUNT(1) FROM Employees WHERE IsActive = 1) as TotalEmployees,
                    (SELECT COUNT(1) FROM LeaveRequests WHERE Status = 1 AND GETDATE() BETWEEN StartDate AND EndDate) as OnLeaveToday,
                    (SELECT COUNT(1) FROM LeaveRequests WHERE Status = 0) as PendingLeaves";

            var counts = await connection.QueryFirstAsync(countsSql);

            // 2. Aylık Toplam Maliyet (Son hesaplanan ay)
            var now = DateTime.Now;
            const string costSql = @"
                SELECT SUM(TotalEmployerCost) 
                FROM Payrolls 
                WHERE Year = @Year AND Month = @Month";
            var monthlyCost = await connection.ExecuteScalarAsync<decimal?>(costSql, new { now.Year, now.Month }) ?? 0;

            // 3. Şube Dağılımı
            const string branchSql = @"
                SELECT b.Name, COUNT(e.Id) as Count 
                FROM Branches b 
                LEFT JOIN Employees e ON b.Id = e.BranchId AND e.IsActive = 1 
                GROUP BY b.Name";
            var branchStats = await connection.QueryAsync<BranchStat>(branchSql);

            // 4. Gelecek Etkinlikler (Doğum günleri ve Yıl dönümleri - Önümüzdeki 30 gün)
            // SQL Server'da gün/ay karşılaştırması biraz karmaşık olduğu için basitleştirilmiş bir yaklaşım
            const string eventsSql = @"
                SELECT FirstName + ' ' + LastName as EmployeeName, BirthDate as Date, 'Doğum Günü' as Type 
                FROM Employees 
                WHERE IsActive = 1 
                UNION ALL
                SELECT FirstName + ' ' + LastName as EmployeeName, HireDate as Date, 'İşe Giriş Yıl Dönümü' as Type 
                FROM Employees 
                WHERE IsActive = 1";

            var rawEvents = await connection.QueryAsync<dynamic>(eventsSql);
            var upcomingEvents = rawEvents
                .Select(e =>
                {
                    DateTime date = e.Date;
                    var nextDate = new DateTime(now.Year, date.Month, date.Day);
                    if (nextDate < now.Date) nextDate = nextDate.AddYears(1);
                    return new UpcomingEvent(e.EmployeeName, nextDate, e.Type, (nextDate - now.Date).Days);
                })
                .Where(e => e.DayCount <= 30)
                .OrderBy(e => e.DayCount)
                .Take(10)
                .ToList();

            return Result.Success(new Response(
                (int)counts.TotalEmployees,
                (int)counts.OnLeaveToday,
                (int)counts.PendingLeaves,
                monthlyCost,
                [.. branchStats],
                upcomingEvents));
        }
    }
}

public static class GetDashboardSummaryEndpoint
{
    public static void MapGetDashboardSummary(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/dashboard/summary", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetDashboardSummary.Query());
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Dashboard")
        .WithName("GetDashboardSummary")
        .WithSummary("Dashboard için özet istatistikleri getirir");
    }
}
