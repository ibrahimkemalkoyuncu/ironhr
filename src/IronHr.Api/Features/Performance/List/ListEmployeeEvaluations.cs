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

namespace IronHr.Api.Features.Performance.List;

public static class ListEmployeeEvaluations
{
    public record Query(Guid EmployeeId) : IRequest<Result<IEnumerable<Response>>>;

    public record Response(
        Guid Id,
        string PeriodTitle,
        DateTime EvaluationDate,
        decimal Score,
        string? ReviewNotes,
        string? EvaluatorName);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                SELECT 
                    pe.Id, 
                    pe.PeriodTitle, 
                    pe.EvaluationDate, 
                    pe.Score, 
                    pe.ReviewNotes,
                    (e2.FirstName + ' ' + e2.LastName) as EvaluatorName
                FROM PerformanceEvaluations pe
                LEFT JOIN Employees e2 ON pe.EvaluatorId = e2.Id
                WHERE pe.EmployeeId = @EmployeeId
                ORDER BY pe.EvaluationDate DESC";

            var evaluations = await connection.QueryAsync<Response>(sql, new { request.EmployeeId });
            return Result.Success(evaluations);
        }
    }
}

public static class ListEmployeeEvaluationsEndpoint
{
    public static void MapListEmployeeEvaluations(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/employees/{employeeId:guid}/performance", async (Guid employeeId, IMediator mediator) =>
        {
            var result = await mediator.Send(new ListEmployeeEvaluations.Query(employeeId));
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Performance")
        .WithName("ListEmployeeEvaluations")
        .WithSummary("Bir personelin performans geçmişini listeler.");
    }
}
