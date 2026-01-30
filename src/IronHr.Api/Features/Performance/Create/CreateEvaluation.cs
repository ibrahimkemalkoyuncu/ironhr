using Dapper;
using FluentValidation;
using IronHr.Api.Common.Persistence;
using IronHr.Api.Common.Results;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.Performance.Create;

public static class CreateEvaluation
{
    public record Command(
        Guid EmployeeId,
        Guid? EvaluatorId,
        string PeriodTitle,
        decimal Score,
        string? ReviewNotes) : IRequest<Result<Guid>>;

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.EmployeeId).NotEmpty().WithMessage("Personel seçimi zorunludur.");
            RuleFor(x => x.PeriodTitle).NotEmpty().MaximumLength(100).WithMessage("Dönem başlığı zorunludur.");
            RuleFor(x => x.Score).InclusiveBetween(1, 5).WithMessage("Puan 1 ile 5 arasında olmalıdır.");
        }
    }

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, Result<Guid>>
    {
        public async Task<Result<Guid>> Handle(Command request, CancellationToken cancellationToken)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(cancellationToken);

            const string sql = @"
                INSERT INTO PerformanceEvaluations (EmployeeId, EvaluatorId, PeriodTitle, Score, ReviewNotes, EvaluationDate)
                OUTPUT INSERTED.Id
                VALUES (@EmployeeId, @EvaluatorId, @PeriodTitle, @Score, @ReviewNotes, GETDATE())";

            var id = await connection.ExecuteScalarAsync<Guid>(sql, request);
            return Result.Success(id);
        }
    }
}

public static class CreateEvaluationEndpoint
{
    public static void MapCreateEvaluation(this IEndpointRouteBuilder app)
    {
        app.MapPost("api/performance/evaluations", async (CreateEvaluation.Command command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return result.IsSuccess ? Results.Ok(result) : Results.BadRequest(result);
        })
        .WithTags("Performance")
        .WithName("CreateEvaluation")
        .WithSummary("Yeni bir performans değerlendirmesi oluşturur.");
    }
}
