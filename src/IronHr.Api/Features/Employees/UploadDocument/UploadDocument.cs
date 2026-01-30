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

namespace IronHr.Api.Features.Employees.UploadDocument;

/// <summary>
/// Personel döküman yükleme özelliği.
/// </summary>
public static class UploadDocument
{
    public record Command(
        Guid EmployeeId,
        string Description,
        IFormFile File) : IRequest<Result<Guid>>;

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, Result<Guid>>
    {
        private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

        public async Task<Result<Guid>> Handle(Command request, CancellationToken cancellationToken)
        {
            if (!Directory.Exists(_uploadPath)) Directory.CreateDirectory(_uploadPath);

            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            // 1. Personel kontrolü
            const string existsSql = "SELECT COUNT(1) FROM Employees WHERE Id = @EmployeeId";
            var exists = await connection.ExecuteScalarAsync<bool>(existsSql, new { request.EmployeeId });
            if (!exists) return Result.Failure<Guid>(new Error("Employee.NotFound", "Personel bulunamadı."));

            // 2. Dosya Kaydetme
            var fileId = Guid.NewGuid();
            var extension = Path.GetExtension(request.File.FileName);
            var safeFileName = $"{fileId}{extension}";
            var fullPath = Path.Combine(_uploadPath, safeFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream, cancellationToken);
            }

            // 3. Veritabanı Kaydı
            const string insertSql = @"
                INSERT INTO EmployeeDocuments (Id, EmployeeId, FileName, ContentType, FileSize, StoragePath, Description)
                VALUES (@Id, @EmployeeId, @FileName, @ContentType, @FileSize, @StoragePath, @Description)";

            await connection.ExecuteAsync(insertSql, new
            {
                Id = fileId,
                request.EmployeeId,
                request.File.FileName,
                request.File.ContentType,
                FileSize = request.File.Length,
                StoragePath = safeFileName, // Sadece dosya adını saklıyoruz, yol konfigüre edilebilir
                request.Description
            });

            return Result.Success(fileId);
        }
    }
}

public static class UploadDocumentEndpoint
{
    public static void MapUploadDocument(this IEndpointRouteBuilder app)
    {
        app.MapPost("api/employees/{id:guid}/documents", async (Guid id, IFormFile file, string? description, IMediator mediator) =>
        {
            var result = await mediator.Send(new UploadDocument.Command(id, description ?? "", file));
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .DisableAntiforgery() // Local test için antiforgery devre dışı
        .WithTags("Documents")
        .WithName("UploadDocument")
        .WithSummary("Personel için döküman yükler.");
    }
}
