using Dapper;
using FluentValidation;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace IronHr.Api.Features.Branches.Create;

/// <summary>
/// Yeni bir sube olusturma istegi.
/// </summary>
public record CreateBranchCommand(
    Guid CompanyId, // Bagli oldugu sirket
    string Name,    // Sube adi
    string? Code,   // Sube kodu
    string? Address // Sube adresi
) : IRequest<Guid>;

/// <summary>
/// Sube olusturma kurallari.
/// </summary>
public class CreateBranchValidator : AbstractValidator<CreateBranchCommand>
{
    public CreateBranchValidator()
    {
        RuleFor(x => x.CompanyId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).MaximumLength(50);
    }
}

public class CreateBranchHandler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<CreateBranchCommand, Guid>
{
    public async Task<Guid> Handle(CreateBranchCommand request, CancellationToken ct)
    {
        using var connection = await dbConnectionFactory.CreateConnectionAsync(ct);

        const string sql = @"
            INSERT INTO Branches (Id, CompanyId, Name, Code, Address, IsActive, CreatedAt)
            VALUES (@Id, @CompanyId, @Name, @Code, @Address, @IsActive, @CreatedAt);";

        var newBranch = new global::IronHr.Api.Domain.Entities.Branch
        {
            Id = Guid.NewGuid(),
            CompanyId = request.CompanyId,
            Name = request.Name,
            Code = request.Code,
            Address = request.Address,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await connection.ExecuteAsync(sql, newBranch);

        return newBranch.Id;
    }
}

/// <summary>
/// Sube olusturma API ucu.
/// </summary>
public static class CreateBranchEndpoint
{
    public static void MapCreateBranch(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/branches", async (CreateBranchCommand command, IMediator mediator) =>
        {
            var id = await mediator.Send(command);
            return Results.Created($"/api/branches/{id}", id);
        })
        .WithName("CreateBranch")
        .WithTags("Branches");
    }
}
