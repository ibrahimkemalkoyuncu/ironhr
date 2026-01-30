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

namespace IronHr.Api.Features.Leaves.ListTypes;

public static class ListLeaveTypes
{
    public record Query() : IRequest<Result<IEnumerable<Response>>>;

    public record Response(Guid Id, string Name, bool IsPaid, string? Description);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = "SELECT Id, Name, IsPaid, Description FROM LeaveTypes WHERE IsActive = 1";
            var types = await connection.QueryAsync<Response>(sql);

            return Result.Success(types);
        }
    }
}

public static class ListLeaveTypesEndpoint
{
    public static void MapListLeaveTypes(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/leave-types", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new ListLeaveTypes.Query());
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Leaves")
        .WithName("ListLeaveTypes")
        .WithSummary("Sistemdeki aktif izin türlerini listeler.");
    }
}
