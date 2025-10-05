# Script PowerShell para aplicar a migration de Orders via API do Supabase

$PROJECT_REF = "uygwwqhjhozyljuxcgkd"
$SUPABASE_URL = "https://$PROJECT_REF.supabase.co"

# Ler o arquivo SQL
$SQL_CONTENT = Get-Content -Path "supabase\migrations\20251005000001_orders_system.sql" -Raw

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "APLICANDO MIGRATION DE ORDERS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Para executar este script, você precisa:" -ForegroundColor Yellow
Write-Host "1. Obter sua Service Role Key do Supabase Dashboard" -ForegroundColor Yellow
Write-Host "2. Ir em: Settings > API > Service Role (secret)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ou execute manualmente no SQL Editor:" -ForegroundColor Green
Write-Host "1. Acesse: https://supabase.com/dashboard/project/$PROJECT_REF/sql" -ForegroundColor Green
Write-Host "2. Cole o conteúdo do arquivo: supabase\migrations\20251005000001_orders_system.sql" -ForegroundColor Green
Write-Host "3. Clique em RUN" -ForegroundColor Green
Write-Host ""

# Perguntar se o usuário tem a Service Role Key
$response = Read-Host "Você tem a Service Role Key? (S/N)"

if ($response -eq "S" -or $response -eq "s") {
    $SERVICE_ROLE_KEY = Read-Host "Cole a Service Role Key aqui" -AsSecureString
    $SERVICE_ROLE_KEY_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SERVICE_ROLE_KEY)
    )
    
    Write-Host ""
    Write-Host "Executando SQL..." -ForegroundColor Cyan
    
    try {
        $headers = @{
            "apikey" = $SERVICE_ROLE_KEY_PLAIN
            "Authorization" = "Bearer $SERVICE_ROLE_KEY_PLAIN"
            "Content-Type" = "application/json"
        }
        
        $body = @{
            query = $SQL_CONTENT
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec" -Method Post -Headers $headers -Body $body
        
        Write-Host ""
        Write-Host "✅ Migration aplicada com sucesso!" -ForegroundColor Green
    }
    catch {
        Write-Host ""
        Write-Host "❌ Erro ao executar via API: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Por favor, execute manualmente no SQL Editor:" -ForegroundColor Yellow
        Write-Host "https://supabase.com/dashboard/project/$PROJECT_REF/sql" -ForegroundColor Yellow
    }
}
else {
    Write-Host ""
    Write-Host "📋 Execute manualmente no SQL Editor:" -ForegroundColor Cyan
    Write-Host "https://supabase.com/dashboard/project/$PROJECT_REF/sql" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "O arquivo SQL está em: supabase\migrations\20251005000001_orders_system.sql" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pressione qualquer tecla para abrir o SQL Editor no navegador..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "https://supabase.com/dashboard/project/$PROJECT_REF/sql"

