@echo off
REM =====================================================
REM SCRIPT: Aplicar Migrations Automaticamente
REM Descrição: Executa migrations do Supabase de forma segura
REM Plataforma: CMD/Batch (Windows)
REM =====================================================

chcp 65001 >nul
color 0A
title Sistema de Migrations - Inventory Control

echo.
echo ========================================
echo  SISTEMA DE MIGRATIONS
echo  Inventory Control System
echo ========================================
echo.

REM Verificar se está na raiz do projeto
if not exist "package.json" (
    color 0C
    echo [ERRO] Execute este script na raiz do projeto!
    echo [ERRO] Onde está o arquivo package.json
    pause
    exit /b 1
)

echo [OK] Diretório do projeto verificado
echo.

REM Verificar se Supabase está instalado
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    color 0E
    echo [AVISO] Supabase CLI não encontrado globalmente
    echo [INFO] Tentando usar via npx...
    set SUPABASE_CMD=npx supabase
) else (
    echo [OK] Supabase CLI encontrado
    set SUPABASE_CMD=supabase
)

echo.
echo ========================================
echo  MENU DE OPCOES
echo ========================================
echo.
echo 1. Aplicar FIX de Recursao RLS (Recomendado)
echo 2. Aplicar Migration Multi-Tenant Completa
echo 3. Diagnostico do Banco de Dados
echo 4. Solucao Emergencial (DEV ONLY)
echo 5. Listar Migrations Aplicadas
echo 6. Aplicar Todas Migrations Pendentes
echo 7. Sair
echo.

set /p choice="Digite o numero da opcao: "

if "%choice%"=="1" goto fix_recursion
if "%choice%"=="2" goto multi_tenant
if "%choice%"=="3" goto diagnostico
if "%choice%"=="4" goto emergencial
if "%choice%"=="5" goto list_migrations
if "%choice%"=="6" goto apply_pending
if "%choice%"=="7" goto end

echo [ERRO] Opcao invalida!
pause
exit /b 1

:fix_recursion
cls
echo ========================================
echo  APLICANDO FIX DE RECURSAO RLS
echo ========================================
echo.

if not exist "FIX_RLS_RECURSION.sql" (
    color 0C
    echo [ERRO] Arquivo FIX_RLS_RECURSION.sql nao encontrado!
    pause
    exit /b 1
)

echo [INFO] Conectando ao Supabase...
echo [INFO] Executando migration...
echo.

%SUPABASE_CMD% db execute --file FIX_RLS_RECURSION.sql --project-ref uygwwqhjhozyljuxcgkd

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo [SUCESSO] FIX de Recursao RLS aplicado com sucesso!
    echo [INFO] Recarregue sua aplicacao (Ctrl+Shift+R)
) else (
    color 0C
    echo.
    echo [ERRO] Falha ao aplicar migration!
)

echo.
pause
goto end

:multi_tenant
cls
echo ========================================
echo  MIGRATION MULTI-TENANT COMPLETA
echo ========================================
echo.

if not exist "MULTI_TENANT_COMPLETE_MIGRATION.sql" (
    color 0C
    echo [ERRO] Arquivo MULTI_TENANT_COMPLETE_MIGRATION.sql nao encontrado!
    pause
    exit /b 1
)

color 0E
echo [ATENCAO] Esta migration modificara toda estrutura do banco!
echo.
set /p confirm="Tem certeza? Digite SIM para confirmar: "

if not "%confirm%"=="SIM" (
    echo [INFO] Operacao cancelada
    pause
    goto end
)

echo.
echo [INFO] Conectando ao Supabase...
echo [INFO] Executando migration (pode levar ate 60 segundos)...
echo.

%SUPABASE_CMD% db execute --file MULTI_TENANT_COMPLETE_MIGRATION.sql --project-ref uygwwqhjhozyljuxcgkd

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo [SUCESSO] Migration Multi-Tenant aplicada com sucesso!
    echo [INFO] Proximo passo: Execute a opcao 1 (FIX de Recursao RLS)
) else (
    color 0C
    echo.
    echo [ERRO] Falha ao aplicar migration!
)

echo.
pause
goto end

:diagnostico
cls
echo ========================================
echo  DIAGNOSTICO DO BANCO DE DADOS
echo ========================================
echo.

if not exist "DIAGNOSTICO_RLS.sql" (
    color 0C
    echo [ERRO] Arquivo DIAGNOSTICO_RLS.sql nao encontrado!
    pause
    exit /b 1
)

echo [INFO] Conectando ao Supabase...
echo [INFO] Executando diagnostico...
echo.

%SUPABASE_CMD% db execute --file DIAGNOSTICO_RLS.sql --project-ref uygwwqhjhozyljuxcgkd

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo [SUCESSO] Diagnostico executado! Verifique os resultados acima.
) else (
    color 0C
    echo.
    echo [ERRO] Falha ao executar diagnostico!
)

echo.
pause
goto end

:emergencial
cls
color 0E
echo ========================================
echo  SOLUCAO EMERGENCIAL (DEV ONLY)
echo ========================================
echo.
echo [ATENCAO] Esta solucao DESABILITA seguranca RLS!
echo [ATENCAO] Use APENAS em ambiente de desenvolvimento!
echo [ATENCAO] Voce DEVE aplicar FIX_RLS_RECURSION.sql depois!
echo.

if not exist "SOLUCAO_EMERGENCIAL_RLS.sql" (
    color 0C
    echo [ERRO] Arquivo SOLUCAO_EMERGENCIAL_RLS.sql nao encontrado!
    pause
    exit /b 1
)

set /p confirm="Confirma que esta em DEV? Digite DEV para confirmar: "

if not "%confirm%"=="DEV" (
    echo [INFO] Operacao cancelada
    pause
    goto end
)

echo.
echo [INFO] Conectando ao Supabase...
echo [INFO] Executando solucao emergencial...
echo.

%SUPABASE_CMD% db execute --file SOLUCAO_EMERGENCIAL_RLS.sql --project-ref uygwwqhjhozyljuxcgkd

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo [SUCESSO] Solucao emergencial aplicada!
    color 0E
    echo [ATENCAO] LEMBRE-SE: Execute FIX_RLS_RECURSION.sql depois!
) else (
    color 0C
    echo.
    echo [ERRO] Falha ao aplicar solucao!
)

echo.
pause
goto end

:list_migrations
cls
echo ========================================
echo  LISTANDO MIGRATIONS APLICADAS
echo ========================================
echo.

echo [INFO] Conectando ao Supabase...
echo.

%SUPABASE_CMD% migration list --project-ref uygwwqhjhozyljuxcgkd

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo [SUCESSO] Lista obtida com sucesso!
) else (
    color 0C
    echo.
    echo [ERRO] Falha ao listar migrations!
)

echo.
pause
goto end

:apply_pending
cls
echo ========================================
echo  APLICANDO MIGRATIONS PENDENTES
echo ========================================
echo.

echo [INFO] Verificando migrations pendentes...
echo [INFO] Sincronizando com banco de dados remoto...
echo.

%SUPABASE_CMD% db push --project-ref uygwwqhjhozyljuxcgkd

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo [SUCESSO] Migrations aplicadas com sucesso!
) else (
    color 0C
    echo.
    echo [ERRO] Falha ao aplicar migrations!
)

echo.
pause
goto end

:end
cls
echo.
echo ========================================
echo  OPERACAO CONCLUIDA
echo ========================================
echo.
echo Obrigado por usar o Sistema de Migrations!
echo.
pause
exit /b 0
