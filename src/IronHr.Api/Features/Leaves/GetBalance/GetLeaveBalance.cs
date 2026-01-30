using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Leaves.GetBalance;

/// <summary>
/// Personelin güncel izin bakiye bilgilerini getirme özelliği.
/// </summary>
public static class GetLeaveBalance
{
    public record Query(Guid EmployeeId) : IRequest<Result<Response>>;

    public record Response(
        int EntitledDaysPerYear,
        int TotalUsedDays,
        int RemainingDays);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            // 1. Personel İşe Giriş Tarihi
            const string empSql = "SELECT HireDate FROM Employees WHERE Id = @Id";
            var hireDate = await connection.ExecuteScalarAsync<DateTime?>(empSql, new { Id = request.EmployeeId });

            if (hireDate == null)
                return Result.Failure<Response>(new Error("Leave.EmployeeNotFound", "Personel bulunamadı."));

            // 2. Kıdem Hesaplama (Yıl bazında)
            var tenure = DateTime.Today.Year - hireDate.Value.Year;
            if (hireDate.Value > DateTime.Today.AddYears(-tenure)) tenure--;

            // 3. Kanuni Hak Hesaplama
            int entitled = 0;
            if (tenure >= 1)
            {
                if (tenure < 5) entitled = 14;
                else if (tenure < 15) entitled = 20;
                else entitled = 26;
            }

            // 4. Kullanılan İzinleri Bul (Sadece onaylı 'Yıllık İzin' türü için - Sabit ID varsayımı yerine isimden gidelim)
            const string usedSql = @"
                SELECT ISNULL(SUM(DurationDays), 0) 
                FROM LeaveRequests lr
                JOIN LeaveTypes lt ON lr.LeaveTypeId = lt.Id
                WHERE lr.EmployeeId = @EmployeeId 
                AND lr.Status = 1 -- Onaylandı
                AND lt.Name = 'Yıllık İzin'";

            var used = await connection.ExecuteScalarAsync<int>(usedSql, new { request.EmployeeId });

            // Not: Gerçek bir sistemde her çalışma yılı için hakediş birikir. 
            // Burada basitlik adına "yıllık hak" ve "toplam kullanılan" üzerinden bakiye dönüyoruz.
            // MVP için toplam hak = tenure * entitled (Çok kaba bir hesap)
            int totalEntitled = 0;
            for (int i = 1; i <= tenure; i++)
            {
                if (i < 5) totalEntitled += 14;
                else if (i < 15) totalEntitled += 20;
                else totalEntitled += 26;
            }

            return Result.Success(new Response(entitled, used, totalEntitled - used));
        }
    }
}

public static class GetLeaveBalanceEndpoint
{
    public static void MapGetLeaveBalance(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/employees/{id:guid}/leave-balance", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetLeaveBalance.Query(id));
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Leaves")
        .WithName("GetLeaveBalance")
        .WithSummary("Personelin kalan izin bakiyesini hesaplar.");
    }
}
