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

namespace IronHr.Api.Features.Payrolls.List;

public static class ListEmployeePayrolls
{
    public record Query(Guid EmployeeId) : IRequest<Result<IEnumerable<Response>>>;

    public record Response(
        Guid Id,
        int Year,
        int Month,
        decimal GrossSalary,
        decimal NetSalary,
        decimal TotalEmployerCost,
        DateTime CreatedAt);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                SELECT Id, Year, Month, GrossSalary, NetSalary, TotalEmployerCost, CreatedAt 
                FROM Payrolls 
                WHERE EmployeeId = @EmployeeId 
                ORDER BY Year DESC, Month DESC";

            var payrolls = await connection.QueryAsync<Response>(sql, new { request.EmployeeId });
            return Result.Success(payrolls);
        }
    }
}

public static class ListEmployeePayrollsEndpoint
{
    public static void MapListEmployeePayrolls(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/employees/{employeeId:guid}/payrolls", async (Guid employeeId, IMediator mediator) =>
        {
            var result = await mediator.Send(new ListEmployeePayrolls.Query(employeeId));
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Payrolls")
        .WithName("ListEmployeePayrolls")
        .WithSummary("Personelin bordro geçmişini listeler");
    }
}
