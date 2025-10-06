# Script PowerShell para aplicar fix das políticas RLS
# Execute este script para corrigir o erro 403 nos pedidos

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  FIX: Políticas RLS para Orders   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$sqlContent = @"
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view orders from their organization" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders from their organization" ON orders;
DROP POLICY IF EXISTS "Users can delete orders from their organization" ON orders;

-- Criar políticas corretas
CREATE POLICY "Users can view orders from their organization"
ON orders FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can update orders from their organization"
ON orders FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can delete orders from their organization"
ON orders FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
"@

# Salvar em arquivo temporário
$tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlContent | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "SQL gerado em: $tempFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "INSTRUÇÕES:" -ForegroundColor Green
Write-Host "1. Acesse: https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new" -ForegroundColor White
Write-Host "2. Copie o SQL abaixo e cole no editor" -ForegroundColor White
Write-Host "3. Clique em 'Run' ou pressione Ctrl+Enter" -ForegroundColor White
Write-Host ""
Write-Host "====== SQL PARA COPIAR ======" -ForegroundColor Cyan
Write-Host $sqlContent
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Enter para abrir o dashboard do Supabase..." -ForegroundColor Yellow
Read-Host

# Abrir browser
Start-Process "https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new"

Write-Host ""
Write-Host "✅ Dashboard aberto!" -ForegroundColor Green
Write-Host "Cole o SQL acima e execute." -ForegroundColor Green

