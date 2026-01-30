using IronHr.Api.Features.Companies.Create;
using IronHr.Api.Features.Companies.List;
using IronHr.Api.Features.Companies.Get;
using IronHr.Api.Features.Companies.Update;
using IronHr.Api.Features.Branches.Create;
using IronHr.Api.Features.Branches.List;
using IronHr.Api.Features.Branches.Get;
using IronHr.Api.Features.Branches.Update;
using IronHr.Api.Features.Departments.Create;
using IronHr.Api.Features.Departments.List;
using IronHr.Api.Features.Departments.Get;
using IronHr.Api.Features.Departments.Update;
using IronHr.Api.Features.Employees.Create;
using IronHr.Api.Features.Employees.List;
using IronHr.Api.Features.Employees.Get;
using IronHr.Api.Features.Employees.Update;
using IronHr.Api.Features.Employees.UploadDocument;
using IronHr.Api.Features.Employees.ListDocuments;
using IronHr.Api.Features.Employees.DownloadDocument;
using IronHr.Api.Features.Leaves.Request;
using IronHr.Api.Features.Leaves.GetBalance;
using IronHr.Api.Features.Leaves.ListTypes;
using IronHr.Api.Features.Leaves.ListEmployeeLeaves;
using IronHr.Api.Features.Leaves.ListPending;
using IronHr.Api.Features.Leaves.Process;
using IronHr.Api.Features.Dashboard.GetSummary;
using IronHr.Api.Features.Leaves.ListCalendar;
using IronHr.Api.Features.Payrolls.Calculate;
using IronHr.Api.Features.Payrolls.List;
using IronHr.Api.Features.Performance.Create;
using IronHr.Api.Features.Performance.List;
using IronHr.Api.Features.System.Seed;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Builder;

namespace IronHr.Api.Extensions;

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        // --- Şirket & Organizasyon ---
        app.MapCreateCompany();
        app.MapListCompanies();
        app.MapGetCompany();
        app.MapUpdateCompany();

        app.MapCreateBranch();
        app.MapListBranches();
        app.MapGetBranch();
        app.MapUpdateBranch();

        app.MapCreateDepartment();
        app.MapListDepartments();
        app.MapGetDepartment();
        app.MapUpdateDepartment();

        // --- Personel & Doküman Yönetimi ---
        app.MapCreateEmployee();
        app.MapListEmployees();
        app.MapGetEmployee();
        app.MapUpdateEmployee();
        app.MapUploadDocument();
        app.MapListDocuments();
        app.MapDownloadDocument();

        // --- İzin Süreçleri ---
        app.MapRequestLeave();
        app.MapGetLeaveBalance();
        app.MapListLeaveTypes();
        app.MapListEmployeeLeaves();
        app.MapListPendingLeaves();
        app.MapProcessLeave();
        app.MapListCalendar();

        // --- Finans & Bordro ---
        app.MapCalculatePayroll();
        app.MapListEmployeePayrolls();

        // --- Performans & Dashboard ---
        app.MapGetDashboardSummary();
        app.MapCreateEvaluation();
        app.MapListEmployeeEvaluations();

        // --- Veri Tohumlama ---
        app.MapSeedData();

        return app;
    }
}
