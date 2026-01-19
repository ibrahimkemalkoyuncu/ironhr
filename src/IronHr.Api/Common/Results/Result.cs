namespace IronHr.Api.Common.Results;

/// <summary>
/// İş mantığı sonuçlarını kapsülleyen temel sınıf.
/// Exception tabanlı olmayan hata yönetimini (Result Pattern) sağlar.
/// </summary>
public class Result
{
    public bool IsSuccess { get; } // İşlem başarılı mı?
    public bool IsFailure => !IsSuccess; // İşlem başarısız mı?
    public Error Error { get; } // Eğer başarısızsa hata detayı

    protected Result(bool isSuccess, Error error)
    {
        // Başarılı işlemde hata olamaz, başarısız işlemde hata boş olamaz.
        if (isSuccess && error != Error.None)
            throw new InvalidOperationException();

        if (!isSuccess && error == Error.None)
            throw new InvalidOperationException();

        IsSuccess = isSuccess;
        Error = error;
    }

    // Yardımcı üretim metodları
    public static Result Success() => new(true, Error.None);
    public static Result Failure(Error error) => new(false, error);
    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Error.None);
    public static Result<TValue> Failure<TValue>(Error error) => new(default!, false, error);
}

/// <summary>
/// Bir değer dönen başarılı veya başarısız işlem sonucu.
/// </summary>
public class Result<TValue> : Result
{
    private readonly TValue _value;

    protected internal Result(TValue value, bool isSuccess, Error error)
        : base(isSuccess, error)
    {
        _value = value;
    }

    /// <summary>
    /// Eğer işlem başarılıysa dönülen değer. Başarısızsa erişilemez.
    /// </summary>
    public TValue Value => IsSuccess
        ? _value
        : throw new InvalidOperationException("Başarısız sonucun değerine erişilemez.");

    public static implicit operator Result<TValue>(TValue value) => Success(value);
}

/// <summary>
/// Sistem genelindeki hataları tanımlayan kayıt yapısı.
/// </summary>
public record Error(string Code, string Message)
{
    public static readonly Error None = new(string.Empty, string.Empty);
    public static readonly Error NullValue = new("Error.NullValue", "Belirtilen değer null olamaz.");
}
