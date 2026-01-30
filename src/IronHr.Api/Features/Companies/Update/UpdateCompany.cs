using Dapper;
using FluentValidation;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace IronHr.Api.Features.Companies.Update;

public static class UpdateCompany
{
    public record Command(
        Guid Id,
        string Name,
        string TaxNumber,
        string? TaxOffice,
        string? Address,
        bool IsActive) : IRequest<Result>;

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.TaxNumber).NotEmpty().Length(10).Must(x => x.All(char.IsDigit));
        }
    }

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, Result>
    {
        public async Task<Result> Handle(Command request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                UPDATE Companies 
                SET Name = @Name, 
                    TaxNumber = @TaxNumber, 
                    TaxOffice = @TaxOffice, 
                    Address = @Address, 
                    IsActive = @IsActive 
                WHERE Id = @Id";

            var rowsAffected = await connection.ExecuteAsync(sql, request);

            if (rowsAffected == 0)
                return Result.Failure(new Error("Company.NotFound", "Güncellenecek şirket bulunamadı."));

            return Result.Success();
        }
    }
}

public static class UpdateCompanyEndpoint
{
    public static void MapUpdateCompany(this IEndpointRouteBuilder app)
    {
        app.MapPut("api/companies/{id:guid}", async (Guid id, UpdateCompany.Command command, IMediator mediator) =>
        {
            if (id != command.Id) return Results.BadRequest();
            var result = await mediator.Send(command);
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Companies")
        .WithName("UpdateCompany");
    }
}
