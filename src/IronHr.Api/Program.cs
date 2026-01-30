// ============================================================================
// IRONHR - ANA GİRİŞ NOKTASI (PROGRAM.CS)
// Bu dosya uygulama servislerini ve HTTP istek boru hattını (pipeline) yapılandırır.
// ============================================================================

using IronHr.Api.Common.Persistence;
using IronHr.Api.Extensions;
using IronHr.Api.Common.Behaviors;
using IronHr.Api.Common.Exceptions;
using FluentValidation;
using MediatR;

var builder = WebApplication.CreateBuilder(args);

// ----------------------------------------------------------------------------
// SERVİS KAYITLARI (DEPENDENCY INJECTION)
// ----------------------------------------------------------------------------

// Swagger/OpenAPI: Uygulama dokümantasyonu için gerekli servisler.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Dikey dilim mimarisinde (Vertical Slice) nested class kullanımı (Command, Response) 
    // çakışmalara yol açtığı için tam isim (FullName) kullanıyoruz.
    options.CustomSchemaIds(type => type.FullName?.Replace('+', '.'));
});

// VERİ ERİŞİM KATMANI (DAPPER)
// SQL Server bağlantısı için ConnectionFactory singleton olarak kaydedilir.
// Dapper doğrudan bu factory üzerinden bağlantı açarak SQL sorgularını çalıştırır.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\mssqllocaldb;Database=IronHrDb;Trusted_Connection=True;MultipleActiveResultSets=true";

builder.Services.AddSingleton<IDbConnectionFactory>(_ => new SqlDbConnectionFactory(connectionString));

// MEDIATR VE VALIDASYON
// Uygulama içi mesajlaşma (MediatR) ve otomatik doğrulama (ValidationBehavior) ayarları.
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
    // Her istek işlenmeden önce otomatik olarak validasyondan geçer.
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

// FluentValidation: Tüm sınıflardaki doğrulama kurallarını (Validator) otomatik bulur.
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);

// GLOBAL HATA YÖNETİMİ
// Uygulama genelinde oluşabilecek hataları yakalayan merkezi sistem.
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// CORS AYARI
// Frontend (Angular) uygulamasının API ile iletişim kurabilmesi için gerekli.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ----------------------------------------------------------------------------
// HTTP İSTEK BORU HATTI (MIDDLEWARE)
// ----------------------------------------------------------------------------

// Geliştirme ortamında Swagger arayüzünü aktif et.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Merkezi hata yöneticisini (Problem Details) devreye al.
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAngular");

// ENDPOINT TANIMLARI
app.MapApiEndpoints();

app.Run();
