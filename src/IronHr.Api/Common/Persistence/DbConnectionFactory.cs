using System.Data;
using Microsoft.Data.SqlClient;

namespace IronHr.Api.Common.Persistence;

/// <summary>
/// Veritabanı bağlantılarının nasıl oluşturulacağını tanımlayan arayüz.
/// Bağımlılığı tersine çevirmek ve test edilebilirliği artırmak için kullanılır.
/// </summary>
public interface IDbConnectionFactory
{
    /// <summary>
    /// Yeni ve açık bir SQL bağlantısı oluşturur.
    /// </summary>
    Task<IDbConnection> CreateConnectionAsync(CancellationToken ct = default);
}

/// <summary>
/// SQL Server için veritabanı bağlantı fabrikası implementasyonu.
/// </summary>
public class SqlDbConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString; // Veritabanı bağlantı cümlesi

    public SqlDbConnectionFactory(string connectionString)
    {
        _connectionString = connectionString;
    }

    /// <summary>
    /// Veritabanına bir bağlantı açar ve döner. 
    /// Kullanım sonrası 'using' bloğu ile kapatılması beklenir.
    /// </summary>
    public async Task<IDbConnection> CreateConnectionAsync(CancellationToken ct = default)
    {
        var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync(ct);
        return connection;
    }
}
