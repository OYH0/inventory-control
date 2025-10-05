# =====================================================
# SETUP: Configurar Supabase CLI e fazer login
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SETUP - Supabase CLI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Supabase está instalado
Write-Host "🔍 Verificando Supabase CLI..." -ForegroundColor Yellow

$supabasePath = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabasePath) {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Instalando Supabase CLI globalmente..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        npm install -g supabase
        Write-Host ""
        Write-Host "✅ Supabase CLI instalado com sucesso!" -ForegroundColor Green
    }
    catch {
        Write-Host ""
        Write-Host "❌ Erro ao instalar Supabase CLI" -ForegroundColor Red
        Write-Host "💡 Você pode usar: npx supabase <comando>" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Supabase CLI já instalado: $($supabasePath.Source)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " LOGIN NO SUPABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔐 Iniciando processo de login..." -ForegroundColor Yellow
Write-Host "   Seu navegador será aberto para autenticação" -ForegroundColor White
Write-Host ""

try {
    supabase login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
        Write-Host "  1. Execute: .\scripts\apply-migrations.ps1" -ForegroundColor White
        Write-Host "  2. Ou: .\scripts\quick-fix-rls.ps1 (para fix rápido)" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Erro ao fazer login" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Erro ao fazer login:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
