using FluentValidation;
using MediatR;

namespace IronHr.Api.Common.Behaviors;

/// <summary>
/// MediatR üzerinden gelen her isteği (Command/Query) yakalayan ve 
/// iş mantığına girmeden önce otomatik olarak doğrulayan (Validation) boru hattı bileşeni.
/// </summary>
public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    /// <summary>
    /// Boru hattı üzerindeki adımı işler.
    /// </summary>
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Eğer ilgili istek (request) için bir doğrulayıcı (validator) yoksa bir sonraki adıma geç.
        if (!_validators.Any())
        {
            return await next();
        }

        // Doğrulama bağlamını oluştur.
        var context = new ValidationContext<TRequest>(request);

        // Tüm doğrulayıcıları asenkron olarak çalıştır.
        var validationFailures = await Task.WhenAll(
            _validators.Select(validator => validator.ValidateAsync(context, cancellationToken)));

        // Hatalı sonuçları topla.
        var errors = validationFailures
            .Where(validationResult => !validationResult.IsValid)
            .SelectMany(validationResult => validationResult.Errors)
            .Select(validationFailure => new FluentValidation.Results.ValidationFailure(
                validationFailure.PropertyName,
                validationFailure.ErrorMessage))
            .ToList();

        // Eğer en az bir doğrulama hatası varsa, ValidationException fırlat (GlobalExceptionHandler tarafından yakalanır).
        if (errors.Any())
        {
            throw new ValidationException(errors);
        }

        // Hata yoksa iş mantığına (Handler) devam et.
        return await next();
    }
}
