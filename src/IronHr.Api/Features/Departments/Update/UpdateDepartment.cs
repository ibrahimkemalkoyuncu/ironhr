using Dapper;
using FluentValidation;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace IronHr.Api.Features.Departments.Update;

public static class UpdateDepartment
{
    public record Command(
        Guid Id,
        Guid BranchId,
        string Name,
        string? Code,
        bool IsActive) : IRequest<Result>;

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.BranchId).NotEmpty();
        }
    }

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, Result>
    {
        public async Task<Result> Handle(Command request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                UPDATE Departments 
                SET BranchId = @BranchId, 
                    Name = @Name, 
                    Code = @Code, 
                    IsActive = @IsActive 
                WHERE Id = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, request);

            if (rowsAffected == 0)
                return Result.Failure(new Error("Department.NotFound", "Güncellenecek departman bulunamadı."));

            return Result.Success();
        }
    }
}

public static class UpdateDepartmentEndpoint
{
    public static void MapUpdateDepartment(this IEndpointRouteBuilder app)
    {
        app.MapPut("api/departments/{id:guid}", async (Guid id, UpdateDepartment.Command command, IMediator mediator) =>
        {
            if (id != command.Id) return Results.BadRequest();
            var result = await mediator.Send(command);
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Departments")
        .WithName("UpdateDepartment");
    }
}
