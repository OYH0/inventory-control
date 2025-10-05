# =====================================================
# QUICK FIX: Aplicar FIX_RLS_RECURSION.sql rapidamente
# Uso: .\scripts\quick-fix-rls.ps1
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " QUICK FIX - Recursão RLS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Voltar para raiz se estiver em scripts/
if ((Get-Location).Path -like "*\scripts") {
    Set-Location ..
    Write-Host "📂 Mudando para raiz do projeto..." -ForegroundColor Yellow
}

# Verificar arquivo
if (-not (Test-Path "FIX_RLS_RECURSION.sql")) {
    Write-Host "❌ Arquivo FIX_RLS_RECURSION.sql não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Arquivo encontrado" -ForegroundColor Green
Write-Host "⏳ Aplicando fix..." -ForegroundColor Yellow
Write-Host ""

# Executar
try {
    $output = supabase db execute --file FIX_RLS_RECURSION.sql --project-ref uygwwqhjhozyljuxcgkd 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ FIX APLICADO COM SUCESSO!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
        Write-Host "  1. Recarregue sua aplicação (Ctrl+Shift+R)" -ForegroundColor White
        Write-Host "  2. Verifique o console (não deve ter mais erro 42P17)" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ ERRO ao aplicar fix!" -ForegroundColor Red
        Write-Host $output
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "❌ ERRO:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Dica: Você fez login no Supabase?" -ForegroundColor Yellow
    Write-Host "   Execute: supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
