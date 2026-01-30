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

namespace IronHr.Api.Features.Leaves.Process;

public static class ProcessLeave
{
    public record Command(Guid RequestId, int Status, Guid? ApproverId = null) : IRequest<Result>;

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, Result>
    {
        public async Task<Result> Handle(Command request, CancellationToken cancellationToken)
        {
            if (request.Status != 1 && request.Status != 2)
                return Result.Failure(new Error("Leave.InvalidStatus", "Geçersiz izin durumu (Sadece Onay:1 veya Red:2 olabilir)."));

            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string updateSql = @"
                UPDATE LeaveRequests 
                SET Status = @Status, 
                    ApproverId = @ApproverId, 
                    ApprovedAt = GETDATE()
                WHERE Id = @RequestId AND Status = 0";

            var rowsAffected = await connection.ExecuteAsync(updateSql, request);

            if (rowsAffected == 0)
                return Result.Failure(new Error("Leave.NotFoundOrProcessed", "İzin talebi bulunamadı veya zaten işleme alınmış."));

            return Result.Success();
        }
    }
}

public static class ProcessLeaveEndpoint
{
    public static void MapProcessLeave(this IEndpointRouteBuilder app)
    {
        app.MapPost("api/leaves/{id:guid}/process", async (Guid id, int status, IMediator mediator) =>
        {
            var result = await mediator.Send(new ProcessLeave.Command(id, status));
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Leaves")
        .WithName("ProcessLeave")
        .WithSummary("İzin talebini onarlar veya reddeder.");
    }
}
