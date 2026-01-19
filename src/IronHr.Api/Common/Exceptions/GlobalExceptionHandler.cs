using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;

namespace IronHr.Api.Common.Exceptions;

/// <summary>
/// Uygulama genelinde fırlatılan tüm istisnaları (Exception) yakalayan ve 
/// standart bir hata formatına (Problem Details) dönüştüren merkezi sınıf.
/// </summary>
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Bir hata oluştuğunda otomatik olarak tetiklenen metod.
    /// </summary>
    /// <param name="httpContext">HTTP istek bağlamı</param>
    /// <param name="exception">Oluşan hata</param>
    /// <param name="cancellationToken">İptal token'ı</param>
    /// <returns>Hatanın işlenip işlenmediği bilgisi</returns>
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        // Oluşan hata detaylarını loglama sistemine kaydeder.
        _logger.LogError(exception, "Beklenmedik bir hata oluştu: {Message}", exception.Message);

        // Varsayılan hata detayları (RFC 7807 standardı).
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "Sistem Hatası",
            Detail = "Sunucu tarafında beklenmedik bir hata oluştu. Lütfen sistem yöneticisine başvurun."
        };

        // Eğer hata bir validasyon (doğrulama) hatası ise, durumu 400 Bad Request olarak işaretle.
        if (exception is ValidationException validationException)
        {
            problemDetails.Status = StatusCodes.Status400BadRequest;
            problemDetails.Title = "Doğrulama Hatası";
            problemDetails.Detail = "Gönderilen veriler iş kurallarına uygun değil.";

            // Hatalı alanları ve hata mesajlarını listeye ekle.
            problemDetails.Extensions["errors"] = validationException.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(x => x.ErrorMessage).ToArray());
        }

        // Yanıtın HTTP durum kodunu belirle.
        httpContext.Response.StatusCode = problemDetails.Status.Value;

        // Problem detaylarını JSON formatında istemciye (Frontend) gönder.
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
