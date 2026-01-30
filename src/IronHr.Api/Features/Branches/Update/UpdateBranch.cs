using Dapper;
using FluentValidation;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace IronHr.Api.Features.Branches.Update;

public static class UpdateBranch
{
    public record Command(
        Guid Id,
        Guid CompanyId,
        string Name,
        string? Code,
        string? Address,
        bool IsActive) : IRequest<Result>;

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.CompanyId).NotEmpty();
        }
    }

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, Result>
    {
        public async Task<Result> Handle(Command request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                UPDATE Branches 
                SET CompanyId = @CompanyId, 
                    Name = @Name, 
                    Code = @Code, 
                    Address = @Address, 
                    IsActive = @IsActive 
                WHERE Id = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, request);

            if (rowsAffected == 0)
                return Result.Failure(new Error("Branch.NotFound", "Güncellenecek şube bulunamadı."));

            return Result.Success();
        }
    }
}

public static class UpdateBranchEndpoint
{
    public static void MapUpdateBranch(this IEndpointRouteBuilder app)
    {
        app.MapPut("api/branches/{id:guid}", async (Guid id, UpdateBranch.Command command, IMediator mediator) =>
        {
            if (id != command.Id) return Results.BadRequest();
            var result = await mediator.Send(command);
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Branches")
        .WithName("UpdateBranch");
    }
}
