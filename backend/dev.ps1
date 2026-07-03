# Food Recipe Backend - Development Scripts
# PowerShell script for Windows development

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "Food Recipe Backend - Available Commands:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  install      Install dependencies with Poetry" -ForegroundColor Green
    Write-Host "  dev          Start development server with hot reload" -ForegroundColor Green
    Write-Host "  prod         Start production server" -ForegroundColor Green
    Write-Host "  clean        Clean up cache and temporary files" -ForegroundColor Green
    Write-Host "  test         Run tests" -ForegroundColor Green
    Write-Host "  lint         Run linting (flake8)" -ForegroundColor Green
    Write-Host "  format       Format code (black + isort)" -ForegroundColor Green
    Write-Host "  check-format Check code formatting" -ForegroundColor Green
    Write-Host "  type-check   Run type checking (mypy)" -ForegroundColor Green
    Write-Host "  db-init      Initialize database tables" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 install" -ForegroundColor White
    Write-Host "  .\dev.ps1 dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Quick start:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 install  # Install dependencies" -ForegroundColor White
    Write-Host "  .\dev.ps1 dev      # Start development server" -ForegroundColor White
}

function Install-Dependencies {
    Write-Host "📦 Installing dependencies with Poetry..." -ForegroundColor Blue
    poetry install
}

function Start-DevServer {
    Write-Host "🚀 Starting development server..." -ForegroundColor Blue
    poetry run python run.py
}

function Start-ProdServer {
    Write-Host "🏭 Starting production server..." -ForegroundColor Blue
    poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
}

function Clean-Project {
    Write-Host "🧹 Cleaning up..." -ForegroundColor Blue
    Get-ChildItem -Path . -Recurse -Name "__pycache__" -Directory | Remove-Item -Recurse -Force
    Get-ChildItem -Path . -Recurse -Name "*.pyc" -File | Remove-Item -Force
    Get-ChildItem -Path . -Recurse -Name ".pytest_cache" -Directory | Remove-Item -Recurse -Force
    Get-ChildItem -Path . -Recurse -Name ".mypy_cache" -Directory | Remove-Item -Recurse -Force
}

function Run-Tests {
    Write-Host "🧪 Running tests..." -ForegroundColor Blue
    poetry run pytest -v
}

function Run-Lint {
    Write-Host "🔍 Running linting..." -ForegroundColor Blue
    poetry run flake8 app/
}

function Format-Code {
    Write-Host "✨ Formatting code..." -ForegroundColor Blue
    poetry run black app/
    poetry run isort app/
}

function Check-Format {
    Write-Host "🔍 Checking code formatting..." -ForegroundColor Blue
    poetry run black --check app/
    poetry run isort --check-only app/
}

function Check-Types {
    Write-Host "🔍 Running type checks..." -ForegroundColor Blue
    poetry run mypy app/
}

function Initialize-Database {
    Write-Host "🗃️ Initializing database..." -ForegroundColor Blue
    poetry run python create_db.py
}

# Execute command based on parameter
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "install" { Install-Dependencies }
    "dev" { Start-DevServer }
    "prod" { Start-ProdServer }
    "clean" { Clean-Project }
    "test" { Run-Tests }
    "lint" { Run-Lint }
    "format" { Format-Code }
    "check-format" { Check-Format }
    "type-check" { Check-Types }
    "db-init" { Initialize-Database }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}