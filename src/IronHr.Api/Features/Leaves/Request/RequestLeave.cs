using Dapper;
using FluentValidation;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Leaves.Request;

/// <summary>
/// Yeni bir izin talebi oluşturma özelliği.
/// </summary>
public static class RequestLeave
{
    public record Command(
        Guid EmployeeId,
        Guid LeaveTypeId,
        DateTime StartDate,
        DateTime EndDate,
        string? Description) : IRequest<Result<Guid>>;

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.StartDate).NotEmpty().GreaterThanOrEqualTo(DateTime.Today).WithMessage("İzin başlangıç tarihi bugünden eski olamaz.");
            RuleFor(x => x.EndDate).NotEmpty().GreaterThan(x => x.StartDate).WithMessage("İzin bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
        }
    }

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, Result<Guid>>
    {
        public async Task<Result<Guid>> Handle(Command request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            // 1. Personel ve İşe Giriş Tarihi Kontrolü
            const string empSql = "SELECT HireDate FROM Employees WHERE Id = @Id AND IsActive = 1";
            var hireDate = await connection.ExecuteScalarAsync<DateTime?>(empSql, new { Id = request.EmployeeId });

            if (hireDate == null)
                return Result.Failure<Guid>(new Error("Leave.EmployeeNotFound", "Aktif personel bulunamadı."));

            // 2. Süre Hesabı (Basit gün hesabı - Hafta sonları hariç tutulabilir)
            var duration = (request.EndDate - request.StartDate).Days + 1;

            // 3. Talep Kaydı
            var leaveId = Guid.NewGuid();
            const string insertSql = @"
                INSERT INTO LeaveRequests (Id, EmployeeId, LeaveTypeId, StartDate, EndDate, DurationDays, Description, Status)
                VALUES (@Id, @EmployeeId, @LeaveTypeId, @StartDate, @EndDate, @DurationDays, @Description, 0)";

            await connection.ExecuteAsync(insertSql, new
            {
                Id = leaveId,
                request.EmployeeId,
                request.LeaveTypeId,
                request.StartDate,
                request.EndDate,
                DurationDays = duration,
                request.Description
            });

            return Result.Success(leaveId);
        }
    }
}

public static class RequestLeaveEndpoint
{
    public static void MapRequestLeave(this IEndpointRouteBuilder app)
    {
        app.MapPost("api/leaves", async (RequestLeave.Command command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Leaves")
        .WithName("RequestLeave")
        .WithSummary("Yeni bir izin talebi oluşturur.");
    }
}
