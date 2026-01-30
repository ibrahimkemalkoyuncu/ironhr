# ============================================================================
# IRONHR - PARALEL BASLATMA BETIGI (POWERSHELL)
# Bu script Backend ve Frontend projelerini ayri pencerelerde ayni anda calistirir.
# ============================================================================

$Host.UI.RawUI.WindowTitle = "IRONHR Başlatıcı"

Write-Host "--- IRONHR Uygulamasi Baslatiliyor ---" -ForegroundColor Cyan

# 1. Backend (ASP.NET 10 API) Baslatma
Write-Host ">> Backend API ayaga kaldiriliyor (Port: 5118)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src/IronHr.Api; dotnet run"

# 2. Frontend (Angular 21 UI) Baslatma
Write-Host ">> Frontend UI ayaga kaldiriliyor (Port: 4200)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src/IronHr.Ui; npm start"

Write-Host "----------------------------------------------------" -ForegroundColor Green
Write-Host "ISLEM BASLATILDI. Lutfen acilan pencereleri takip edin." -ForegroundColor Green
Write-Host "Swagger: http://localhost:5118/swagger" -ForegroundColor Blue
Write-Host "App UI : http://localhost:4200" -ForegroundColor Blue
Write-Host "----------------------------------------------------" -ForegroundColor Green
