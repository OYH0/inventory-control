# =====================================================
# SCRIPT: Aplicar Migrations Automaticamente
# Descrição: Executa migrations do Supabase de forma segura
# Plataforma: PowerShell (Windows)
# =====================================================

# Configuração de cores
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param($Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Header {
    param($Message)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host " $Message" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""
}

# =====================================================
# VERIFICAÇÕES INICIAIS
# =====================================================

Write-Header "SISTEMA DE MIGRATIONS - INVENTORY CONTROL"

# Verificar se está na raiz do projeto
if (-not (Test-Path "package.json")) {
    Write-Error "Execute este script na raiz do projeto (onde está package.json)"
    exit 1
}

Write-Success "Diretório do projeto OK"

# Verificar se Supabase CLI está instalado
Write-Info "Verificando Supabase CLI..."
$supabasePath = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabasePath) {
    Write-Error "Supabase CLI não encontrado!"
    Write-Warning "Instale com: npm install -g supabase"
    Write-Warning "Ou: npx supabase --help (para usar local)"
    exit 1
}

Write-Success "Supabase CLI encontrado: $($supabasePath.Source)"

# Verificar se arquivo de config existe
if (-not (Test-Path "supabase/config.toml")) {
    Write-Error "Arquivo supabase/config.toml não encontrado!"
    exit 1
}

Write-Success "Configuração do Supabase OK"

# =====================================================
# MENU DE OPÇÕES
# =====================================================

Write-Header "ESCOLHA UMA OPÇÃO"

Write-Host "1. 🔧 Aplicar FIX de Recursão RLS (FIX_RLS_RECURSION.sql)"
Write-Host "2. 📦 Aplicar Migration Completa Multi-Tenant"
Write-Host "3. 📊 Aplicar Sistema de Análise ABC (NOVO)"
Write-Host "4. 🔍 Diagnóstico do banco de dados"
Write-Host "5. ⚡ Aplicar Solução Emergencial (dev only)"
Write-Host "6. 📋 Listar migrations aplicadas"
Write-Host "7. 🆕 Aplicar todas as migrations pendentes"
Write-Host "8. 🚪 Sair"
Write-Host ""

$choice = Read-Host "Digite o número da opção"

switch ($choice) {
    "1" {
        Write-Header "APLICANDO FIX DE RECURSÃO RLS"
        
        if (-not (Test-Path "FIX_RLS_RECURSION.sql")) {
            Write-Error "Arquivo FIX_RLS_RECURSION.sql não encontrado!"
            exit 1
        }
        
        Write-Info "Conectando ao Supabase..."
        Write-Warning "Você precisará fazer login no Supabase se ainda não estiver autenticado."
        Write-Host ""
        
        # Ler o conteúdo do arquivo
        $sqlContent = Get-Content "FIX_RLS_RECURSION.sql" -Raw
        
        # Criar arquivo temporário
        $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
        Set-Content -Path $tempFile -Value $sqlContent
        
        Write-Info "Executando migration..."
        
        # Executar via Supabase CLI
        supabase db execute --file $tempFile --project-ref uygwwqhjhozyljuxcgkd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "FIX de Recursão RLS aplicado com sucesso!"
            Write-Info "Recarregue sua aplicação (Ctrl+Shift+R)"
        } else {
            Write-Error "Erro ao aplicar migration. Código: $LASTEXITCODE"
        }
        
        # Limpar arquivo temporário
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
    
    "2" {
        Write-Header "APLICANDO MIGRATION MULTI-TENANT COMPLETA"
        
        if (-not (Test-Path "MULTI_TENANT_COMPLETE_MIGRATION.sql")) {
            Write-Error "Arquivo MULTI_TENANT_COMPLETE_MIGRATION.sql não encontrado!"
            exit 1
        }
        
        Write-Warning "⚠️  ATENÇÃO: Esta migration é extensa e modificará toda estrutura!"
        $confirm = Read-Host "Tem certeza? (Digite 'SIM' para confirmar)"
        
        if ($confirm -ne "SIM") {
            Write-Info "Operação cancelada pelo usuário."
            exit 0
        }
        
        Write-Info "Conectando ao Supabase..."
        
        # Ler o conteúdo do arquivo
        $sqlContent = Get-Content "MULTI_TENANT_COMPLETE_MIGRATION.sql" -Raw
        
        # Criar arquivo temporário
        $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
        Set-Content -Path $tempFile -Value $sqlContent
        
        Write-Info "Executando migration (pode levar até 60 segundos)..."
        
        # Executar via Supabase CLI
        supabase db execute --file $tempFile --project-ref uygwwqhjhozyljuxcgkd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Migration Multi-Tenant aplicada com sucesso!"
            Write-Info "Próximo passo: Execute a opção 1 (FIX de Recursão RLS)"
        } else {
            Write-Error "Erro ao aplicar migration. Código: $LASTEXITCODE"
        }
        
        # Limpar arquivo temporário
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
    
    "3" {
        Write-Header "APLICANDO SISTEMA DE ANÁLISE ABC"
        
        Write-Info "Este sistema implementa:"
        Write-Host "  ✓ Classificação ABC (Princípio de Pareto 80/20)" -ForegroundColor White
        Write-Host "  ✓ Cálculo de EOQ (Economic Order Quantity)" -ForegroundColor White
        Write-Host "  ✓ 3 novas tabelas + colunas em todas tabelas de itens" -ForegroundColor White
        Write-Host "  ✓ Funções SQL automáticas de classificação" -ForegroundColor White
        Write-Host ""
        
        Write-Warning "⚠️  Esta é uma migration grande que modificará todas as tabelas de itens!"
        $confirm = Read-Host "Deseja continuar? (Digite 'SIM' para confirmar)"
        
        if ($confirm -ne "SIM") {
            Write-Info "Operação cancelada pelo usuário."
            exit 0
        }
        
        Write-Info "Conectando ao Supabase..."
        Write-Info "Aplicando migration ABC (pode levar até 30 segundos)..."
        
        # Executar via push de migrations
        supabase db push --project-ref uygwwqhjhozyljuxcgkd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Sistema de Análise ABC instalado com sucesso!"
            Write-Host ""
            Write-Info "Próximos passos:"
            Write-Host "  1. Configurar custos unitários (unit_cost) nos produtos" -ForegroundColor White
            Write-Host "  2. Definir demanda anual (annual_demand) nos produtos" -ForegroundColor White
            Write-Host "  3. Executar primeira classificação ABC" -ForegroundColor White
            Write-Host ""
            Write-Info "Documentação completa em: ABC_ANALYSIS_IMPLEMENTATION.md"
        } else {
            Write-Error "Erro ao aplicar migration ABC. Código: $LASTEXITCODE"
        }
    }
    
    "4" {
        Write-Header "DIAGNÓSTICO DO BANCO DE DADOS"
        
        if (-not (Test-Path "DIAGNOSTICO_RLS.sql")) {
            Write-Error "Arquivo DIAGNOSTICO_RLS.sql não encontrado!"
            exit 1
        }
        
        Write-Info "Conectando ao Supabase..."
        
        # Ler o conteúdo do arquivo
        $sqlContent = Get-Content "DIAGNOSTICO_RLS.sql" -Raw
        
        # Criar arquivo temporário
        $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
        Set-Content -Path $tempFile -Value $sqlContent
        
        Write-Info "Executando diagnóstico..."
        
        # Executar via Supabase CLI
        supabase db execute --file $tempFile --project-ref uygwwqhjhozyljuxcgkd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Diagnóstico executado! Verifique os resultados acima."
        } else {
            Write-Error "Erro ao executar diagnóstico. Código: $LASTEXITCODE"
        }
        
        # Limpar arquivo temporário
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
    
    "5" {
        Write-Header "SOLUÇÃO EMERGENCIAL (DEV ONLY)"
        
        if (-not (Test-Path "SOLUCAO_EMERGENCIAL_RLS.sql")) {
            Write-Error "Arquivo SOLUCAO_EMERGENCIAL_RLS.sql não encontrado!"
            exit 1
        }
        
        Write-Warning "⚠️  ATENÇÃO: Esta solução DESABILITA segurança RLS!"
        Write-Warning "⚠️  Use APENAS em ambiente de desenvolvimento!"
        Write-Warning "⚠️  Você DEVE aplicar FIX_RLS_RECURSION.sql depois!"
        Write-Host ""
        $confirm = Read-Host "Confirma que está em DEV? (Digite 'DEV' para confirmar)"
        
        if ($confirm -ne "DEV") {
            Write-Info "Operação cancelada pelo usuário."
            exit 0
        }
        
        Write-Info "Conectando ao Supabase..."
        
        # Ler o conteúdo do arquivo
        $sqlContent = Get-Content "SOLUCAO_EMERGENCIAL_RLS.sql" -Raw
        
        # Criar arquivo temporário
        $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
        Set-Content -Path $tempFile -Value $sqlContent
        
        Write-Info "Executando solução emergencial..."
        
        # Executar via Supabase CLI
        supabase db execute --file $tempFile --project-ref uygwwqhjhozyljuxcgkd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Solução emergencial aplicada!"
            Write-Warning "⚠️  LEMBRE-SE: Execute FIX_RLS_RECURSION.sql depois!"
        } else {
            Write-Error "Erro ao aplicar solução. Código: $LASTEXITCODE"
        }
        
        # Limpar arquivo temporário
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
    
    "6" {
        Write-Header "LISTANDO MIGRATIONS APLICADAS"
        
        Write-Info "Conectando ao Supabase..."
        
        # Listar migrations
        supabase migration list --project-ref uygwwqhjhozyljuxcgkd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Lista de migrations obtida com sucesso!"
        } else {
            Write-Error "Erro ao listar migrations. Código: $LASTEXITCODE"
        }
    }
    
    "7" {
        Write-Header "APLICANDO MIGRATIONS PENDENTES"
        
        Write-Info "Verificando migrations pendentes..."
        
        # Aplicar migrations da pasta supabase/migrations
        Write-Info "Sincronizando com banco de dados remoto..."
        
        supabase db push --project-ref uygwwqhjhozyljuxcgkd
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Migrations aplicadas com sucesso!"
        } else {
            Write-Error "Erro ao aplicar migrations. Código: $LASTEXITCODE"
        }
    }
    
    "8" {
        Write-Info "Saindo..."
        exit 0
    }
    
    default {
        Write-Error "Opção inválida!"
        exit 1
    }
}

Write-Host ""
Write-Header "OPERAÇÃO CONCLUÍDA"
Write-Info "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
