using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Companies.Get;

public static class GetCompany
{
    public record Query(Guid Id) : IRequest<Result<Response>>;

    public record Response(
        Guid Id,
        string Name,
        string TaxNumber,
        string? TaxOffice,
        string? Address,
        bool IsActive);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<Response>>
    {
        public async Task<Result<Response>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = "SELECT Id, Name, TaxNumber, TaxOffice, Address, IsActive FROM Companies WHERE Id = @Id";
            var company = await connection.QueryFirstOrDefaultAsync<Response>(sql, new { request.Id });

            if (company is null)
                return Result.Failure<Response>(new Error("Company.NotFound", "Şirket bulunamadı."));

            return Result.Success(company);
        }
    }
}

public static class GetCompanyEndpoint
{
    public static void MapGetCompany(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/companies/{id:guid}", async (Guid id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetCompany.Query(id));
            return result.IsSuccess ? Results.Ok(result) : Results.NotFound(result);
        })
        .WithTags("Companies")
        .WithName("GetCompany");
    }
}
