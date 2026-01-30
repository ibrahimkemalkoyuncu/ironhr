using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Employees.DownloadDocument;

/// <summary>
/// Döküman indirme/görüntüleme özelliği.
/// </summary>
public static class DownloadDocument
{
    public record Query(Guid Id) : IRequest<Result<Response>>;

    public record Response(string FilePath, string ContentType, string FileName);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<Response>>
    {
        private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = "SELECT StoragePath, ContentType, FileName FROM EmployeeDocuments WHERE Id = @Id";
            var (storagePath, contentType, fileName) = await connection.QueryFirstOrDefaultAsync<(string StoragePath, string ContentType, string FileName)>(sql, new { request.Id });

            if (storagePath == null)
                return Result.Failure<Response>(new Error("Document.NotFound", "Döküman bulunamadı."));

            var fullPath = Path.Combine(_uploadPath, storagePath);
            if (!File.Exists(fullPath))
                return Result.Failure<Response>(new Error("Document.FileNotFound", "Dosya sunucuda bulunamadı."));

            return Result.Success(new Response(fullPath, contentType, fileName));
        }
    }
}

public static class DownloadDocumentEndpoint
{
    public static void MapDownloadDocument(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/documents/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new DownloadDocument.Query(id));
            if (!result.IsSuccess) return Results.NotFound(result);

            return Results.File(result.Value.FilePath, result.Value.ContentType, result.Value.FileName);
        })
        .WithTags("Documents")
        .WithName("DownloadDocument")
        .WithSummary("Dökümanı indirir");
    }
}
