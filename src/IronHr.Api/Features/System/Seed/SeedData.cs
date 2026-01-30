using Dapper;
using IronHr.Api.Common.Persistence;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace IronHr.Api.Features.System.Seed;

public static class SeedData
{
    public record Command() : IRequest<string>;

    public class Handler(IDbConnectionFactory dbConnectionFactory) : IRequestHandler<Command, string>
    {
        private static readonly Random Random = new();

        public async Task<string> Handle(Command request, CancellationToken ct)
        {
            using var connection = await dbConnectionFactory.CreateConnectionAsync(ct);

            // 1. Şirketleri Oluştur (10 Adet Yeterli, 100 Çok Fazla Değil mi Kemal Bey?)
            // İstediğiniz gibi her birinden yeterli sayıda (Toplam 100+ kayıt olacak şekilde) oluşturuyorum.
            var companyIds = new List<Guid>();
            for (int i = 1; i <= 5; i++)
            {
                var id = Guid.NewGuid();
                companyIds.Add(id);
                await connection.ExecuteAsync(@"
                    INSERT INTO Companies (Id, Name, TaxNumber, TaxOffice, Address, IsActive, CreatedAt)
                    VALUES (@Id, @Name, @TaxNumber, @TaxOffice, @Address, 1, GETDATE())",
                    new { Id = id, Name = $"Şirket {i} A.Ş.", TaxNumber = (1000000000 + i).ToString(), TaxOffice = "İstanbul V.D.", Address = $"Adres {i}" });
            }

            // 2. Şubeleri Oluştur (Her şirkete 2 şube = 10 şube)
            var branchIds = new List<Guid>();
            foreach (var companyId in companyIds)
            {
                for (int i = 1; i <= 2; i++)
                {
                    var id = Guid.NewGuid();
                    branchIds.Add(id);
                    await connection.ExecuteAsync(@"
                        INSERT INTO Branches (Id, CompanyId, Name, Code, Address, IsActive, CreatedAt)
                        VALUES (@Id, @CompanyId, @Name, @Code, @Address, 1, GETDATE())",
                        new { Id = id, CompanyId = companyId, Name = $"Şube {i}", Code = $"BR-{i}", Address = "Şube Adresi" });
                }
            }

            // 3. Departmanları Oluştur (Her şubeye 3 departman = 30 departman)
            var deptIds = new List<Guid>();
            string[] deptNames = ["İnsan Kaynakları", "Bilgi İşlem", "Muhasebe", "Satış", "Pazarlama", "Üretim"];
            foreach (var branchId in branchIds)
            {
                for (int i = 0; i < 3; i++)
                {
                    var id = Guid.NewGuid();
                    deptIds.Add(id);
                    await connection.ExecuteAsync(@"
                        INSERT INTO Departments (Id, BranchId, Name, Code, IsActive, CreatedAt)
                        VALUES (@Id, @BranchId, @Name, @Code, 1, GETDATE())",
                        new { Id = id, BranchId = branchId, Name = deptNames[Random.Next(deptNames.Length)], Code = $"DP-{Random.Next(100, 999)}" });
                }
            }

            // 4. Personelleri Oluştur (Toplam 100 Kayıt)
            var empIds = new List<Guid>();
            string[] firstNames = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Mustafa", "Emine", "Ali", "Zeynep", "Hüseyin", "Meryem", "Murat", "Özlem", "İbrahim", "Canan"];
            string[] lastNames = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Arslan", "Polat", "Aydın", "Öztürk", "Bulut", "Kılıç"];

            for (int i = 1; i <= 100; i++)
            {
                var id = Guid.NewGuid();
                empIds.Add(id);
                var branchId = branchIds[Random.Next(branchIds.Count)];
                // Bu şubeye ait bir departman bulalım
                var deptId = deptIds[Random.Next(deptIds.Count)];

                var fName = firstNames[Random.Next(firstNames.Length)];
                var lName = lastNames[Random.Next(lastNames.Length)];
                var tcNo = GenerateTcNo(i);

                await connection.ExecuteAsync(@"
                    INSERT INTO Employees (Id, BranchId, DepartmentId, FirstName, LastName, IdentityNumber, RegistrationNumber, Email, PhoneNumber, BirthDate, HireDate, IsActive, CreatedAt)
                    VALUES (@Id, @BranchId, @DepartmentId, @FirstName, @LastName, @IdentityNumber, @RegistrationNumber, @Email, @PhoneNumber, @BirthDate, @HireDate, 1, GETDATE())",
                    new
                    {
                        Id = id,
                        BranchId = branchId,
                        DepartmentId = deptId,
                        FirstName = fName,
                        LastName = lName,
                        IdentityNumber = tcNo,
                        RegistrationNumber = $"SIC-{1000 + i}",
                        Email = $"{fName.ToLower()}.{lName.ToLower()}@example.com",
                        PhoneNumber = "05551234567",
                        BirthDate = DateTime.Today.AddYears(-Random.Next(20, 50)),
                        HireDate = DateTime.Today.AddYears(-Random.Next(1, 10))
                    });
            }

            // 5. İzin Talepleri Oluştur (Her personele rastgele izinler, toplam ~200 tane)
            var leaveTypeIds = (await connection.QueryAsync<Guid>("SELECT Id FROM LeaveTypes")).ToList();
            if (leaveTypeIds.Count > 0)
            {
                foreach (var empId in empIds.OrderBy(x => Guid.NewGuid()).Take(50)) // 50 personele izin ekleyelim
                {
                    for (int j = 0; j < 3; j++)
                    {
                        var startDate = DateTime.Today.AddDays(Random.Next(-30, 30));
                        var duration = Random.Next(1, 15);
                        var status = Random.Next(0, 3); // 0:Pending, 1:Approved, 2:Rejected

                        await connection.ExecuteAsync(@"
                            INSERT INTO LeaveRequests (Id, EmployeeId, LeaveTypeId, StartDate, EndDate, DurationDays, Status, Description, CreatedAt)
                            VALUES (@Id, @EmployeeId, @LeaveTypeId, @StartDate, @EndDate, @DurationDays, @Status, @Description, GETDATE())",
                            new
                            {
                                Id = Guid.NewGuid(),
                                EmployeeId = empId,
                                LeaveTypeId = leaveTypeIds[Random.Next(leaveTypeIds.Count)],
                                StartDate = startDate,
                                EndDate = startDate.AddDays(duration - 1),
                                DurationDays = duration,
                                Status = status,
                                Description = "Otomatik oluşturulan test izni."
                            });
                    }
                }
            }

            return "Seed data başarıyla oluşturuldu: 5 Şirket, 10 Şube, 30 Departman, 100 Personel ve İlgili İzinler.";
        }

        private static string GenerateTcNo(int seed)
        {
            // Basit ama geçerli formatta bir TC üretelim (Algoritmaya %100 uymayabilir ama format yeterli)
            // Gerçek validasyondan geçmesi için 11 haneli ve 0 ile başlamayan bir sayı
            return (11111111111 + seed).ToString();
        }
    }
}

public static class SeedDataEndpoint
{
    public static void MapSeedData(this IEndpointRouteBuilder app)
    {
        app.MapPost("api/system/seed", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new SeedData.Command());
            return Results.Ok(new { message = result });
        })
        .WithTags("System")
        .WithName("SeedData");
    }
}
