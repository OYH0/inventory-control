@echo off
REM =====================================================
REM QUICK FIX: Aplicar FIX_RLS_RECURSION.sql rapidamente
REM Uso: scripts\quick-fix-rls.bat
REM =====================================================

chcp 65001 >nul
color 0B
title Quick Fix - Recursão RLS

echo.
echo ========================================
echo  QUICK FIX - Recursao RLS
echo ========================================
echo.

REM Voltar para raiz se estiver em scripts\
cd /d "%~dp0\.."

REM Verificar arquivo
if not exist "FIX_RLS_RECURSION.sql" (
    color 0C
    echo [ERRO] Arquivo FIX_RLS_RECURSION.sql nao encontrado!
    pause
    exit /b 1
)

echo [OK] Arquivo encontrado
echo [INFO] Aplicando fix...
echo.

REM Detectar se supabase está instalado
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    set SUPABASE_CMD=npx supabase
) else (
    set SUPABASE_CMD=supabase
)

REM Executar
%SUPABASE_CMD% db execute --file FIX_RLS_RECURSION.sql --project-ref uygwwqhjhozyljuxcgkd

if %errorlevel% equ 0 (
    color 0A
    echo.
    echo ========================================
    echo  FIX APLICADO COM SUCESSO!
    echo ========================================
    echo.
    echo Proximos passos:
    echo   1. Recarregue sua aplicacao (Ctrl+Shift+R)
    echo   2. Verifique o console (nao deve ter mais erro 42P17)
    echo.
) else (
    color 0C
    echo.
    echo [ERRO] Falha ao aplicar fix!
    echo.
    echo Dica: Voce fez login no Supabase?
    echo       Execute: supabase login
)

echo.
pause
exit /b %errorlevel%
