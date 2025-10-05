# Script de Teste - Sistema de Pedidos
# Execute este script após aplicar a migration

Write-Host "`n" -NoNewline
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║        🧪 TESTE DO SISTEMA DE PEDIDOS 🧪               ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Projeto encontrado!" -ForegroundColor Green
Write-Host "`n"

# Verificar arquivos necessários
$files = @(
    "src/types/orders.ts",
    "src/services/OrdersService.ts",
    "src/hooks/useOrders.tsx",
    "src/components/orders/OrdersDashboard.tsx",
    "src/pages/Index.tsx"
)

Write-Host "🔍 Verificando arquivos..." -ForegroundColor Cyan
$allFilesExist = $true

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file - FALTANDO!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host "`n"

if (-not $allFilesExist) {
    Write-Host "❌ Alguns arquivos estão faltando!" -ForegroundColor Red
    Write-Host "Execute a implementação completa primeiro." -ForegroundColor Yellow
    exit 1
}

# Perguntar se aplicou a migration
Write-Host "📋 CHECKLIST ANTES DE TESTAR:" -ForegroundColor Yellow
Write-Host "`n"
Write-Host "  1. [ ] Migration SQL aplicada no Supabase" -ForegroundColor White
Write-Host "  2. [ ] Servidor de desenvolvimento funcionando" -ForegroundColor White
Write-Host "  3. [ ] Produtos cadastrados no inventário" -ForegroundColor White
Write-Host "`n"

$migrationApplied = Read-Host "Você aplicou a migration SQL no Supabase? (S/N)"

if ($migrationApplied -ne "S" -and $migrationApplied -ne "s") {
    Write-Host "`n"
    Write-Host "⚠️  Aplique a migration primeiro!" -ForegroundColor Yellow
    Write-Host "`n"
    Write-Host "Execute no SQL Editor do Supabase:" -ForegroundColor Cyan
    Write-Host "https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql" -ForegroundColor Yellow
    Write-Host "`n"
    Write-Host "Arquivo: ORDERS_MIGRATION.sql" -ForegroundColor Green
    Write-Host "`n"
    
    $openSql = Read-Host "Deseja abrir o SQL Editor agora? (S/N)"
    if ($openSql -eq "S" -or $openSql -eq "s") {
        Start-Process "https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql"
    }
    
    exit 0
}

# Verificar se o servidor está rodando
Write-Host "`n"
Write-Host "🚀 Verificando servidor de desenvolvimento..." -ForegroundColor Cyan

$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method HEAD -TimeoutSec 2 -ErrorAction SilentlyContinue
    $serverRunning = $true
    Write-Host "  ✅ Servidor rodando em http://localhost:8080" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Servidor não está rodando" -ForegroundColor Yellow
}

Write-Host "`n"

if (-not $serverRunning) {
    Write-Host "💡 Iniciando servidor de desenvolvimento..." -ForegroundColor Cyan
    Write-Host "`n"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    
    Write-Host "⏳ Aguardando servidor iniciar (15 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

# Abrir documentação de teste
Write-Host "📖 Abrindo guia de testes..." -ForegroundColor Cyan
notepad "TESTE_PEDIDOS.md"

Start-Sleep -Seconds 2

# Abrir aplicação no navegador
Write-Host "🌐 Abrindo aplicação no navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:8080"

Write-Host "`n"
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║           ✅ AMBIENTE DE TESTE PRONTO! ✅              ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`n"

Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "`n"
Write-Host "  1. Faça login no sistema" -ForegroundColor White
Write-Host "  2. Clique em 'Pedidos' no menu lateral" -ForegroundColor White
Write-Host "  3. Clique em 'Novo Pedido'" -ForegroundColor White
Write-Host "  4. Siga o guia em TESTE_PEDIDOS.md" -ForegroundColor White
Write-Host "`n"

Write-Host "💡 DICA: Para obter IDs de produtos, execute no SQL Editor:" -ForegroundColor Yellow
Write-Host "`n"
Write-Host "SELECT id, nome, preco_unitario" -ForegroundColor Gray
Write-Host "FROM estoque_seco_items" -ForegroundColor Gray
Write-Host "LIMIT 5;" -ForegroundColor Gray
Write-Host "`n"

Write-Host "🎯 Tudo pronto para começar os testes!" -ForegroundColor Green
Write-Host "`n"

# Manter janela aberta
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

