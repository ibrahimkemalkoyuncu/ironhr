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

namespace IronHr.Api.Features.Employees.ListDocuments;

/// <summary>
/// Bir personelin dökümanlarını listeleme özelliği.
/// </summary>
public static class ListDocuments
{
    public record Query(Guid EmployeeId) : IRequest<Result<IEnumerable<Response>>>;

    public record Response(
        Guid Id,
        string FileName,
        string ContentType,
        long FileSize,
        string? Description,
        DateTime CreatedAt);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                SELECT Id, FileName, ContentType, FileSize, Description, CreatedAt
                FROM EmployeeDocuments
                WHERE EmployeeId = @EmployeeId AND IsActive = 1
                ORDER BY CreatedAt DESC";

            var documents = await connection.QueryAsync<Response>(sql, new { request.EmployeeId });
            return Result.Success(documents);
        }
    }
}

public static class ListDocumentsEndpoint
{
    public static void MapListDocuments(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/employees/{id:guid}/documents", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new ListDocuments.Query(id));
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Documents")
        .WithName("ListDocuments")
        .WithSummary("Personelin dökümanlarını listeler");
    }
}
