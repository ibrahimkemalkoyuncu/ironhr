using Dapper;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Companies.List;

/// <summary>
/// Şirket listeleme özelliği (Dropdownlar ve listeleme ekranları için).
/// </summary>
public static class ListCompanies
{
    public record Query() : IRequest<Result<IEnumerable<Response>>>;

    public record Response(Guid Id, string Name, string TaxNumber, string? TaxOffice, string? Address, bool IsActive);

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Query, Result<IEnumerable<Response>>>
    {
        public async Task<Result<IEnumerable<Response>>> Handle(Query request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);
            const string sql = "SELECT Id, Name, TaxNumber, TaxOffice, Address, IsActive FROM Companies ORDER BY Name";
            var companies = await connection.QueryAsync<Response>(sql);
            return Result.Success(companies);
        }
    }
}

public static class ListCompaniesEndpoint
{
    public static void MapListCompanies(this IEndpointRouteBuilder app)
    {
        app.MapGet("api/companies", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new ListCompanies.Query());
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Companies")
        .WithName("ListCompanies")
        .WithSummary("Tüm aktif şirketleri listeler");
    }
}
