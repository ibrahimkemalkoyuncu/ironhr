using Dapper;
using FluentValidation;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace IronHr.Api.Features.Departments.Create;

/// <summary>
/// Yeni bir departman olusturma istegi.
/// </summary>
public record CreateDepartmentCommand(
    Guid BranchId, // Bagli oldugu sube
    string Name,   // Departman adi
    string? Code   // Departman kodu
) : IRequest<Guid>;

/// <summary>
/// Departman olusturma kurallari.
/// </summary>
public class CreateDepartmentValidator : AbstractValidator<CreateDepartmentCommand>
{
    public CreateDepartmentValidator()
    {
        RuleFor(x => x.BranchId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).MaximumLength(50);
    }
}

/// <summary>
/// Departman olusturma islemini yoneten sinif.
/// </summary>
public class CreateDepartmentHandler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<CreateDepartmentCommand, Guid>
{
    public async Task<Guid> Handle(CreateDepartmentCommand request, CancellationToken ct)
    {
        using var connection = await dbConnectionFactory.CreateConnectionAsync(ct);

        const string sql = @"
            INSERT INTO Departments (Id, BranchId, Name, Code, IsActive, CreatedAt)
            VALUES (@Id, @BranchId, @Name, @Code, @IsActive, @CreatedAt);";

        var newDepartment = new global::IronHr.Api.Domain.Entities.Department
        {
            Id = Guid.NewGuid(),
            BranchId = request.BranchId,
            Name = request.Name,
            Code = request.Code,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await connection.ExecuteAsync(sql, newDepartment);

        return newDepartment.Id;
    }
}

/// <summary>
/// Departman olusturma API ucu.
/// </summary>
public static class CreateDepartmentEndpoint
{
    public static void MapCreateDepartment(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/departments", async (CreateDepartmentCommand command, IMediator mediator) =>
        {
            var id = await mediator.Send(command);
            return Results.Created($"/api/departments/{id}", id);
        })
        .WithName("CreateDepartment")
        .WithTags("Departments");
    }
}
