/**
 * Script para aplicar fix das políticas RLS
 * Executa SQL diretamente no banco de dados
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://uygwwqhjhozyljuxcgkd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Z3d3cWhqaG96eWxqdXhjZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzg3MDEsImV4cCI6MjA2NDkxNDcwMX0.6dCc0bIuHKS1xtk7OzkIqrRQKkG43ecTeBsWdLz8aok';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const sqlCommands = [
  // Remover políticas antigas
  `DROP POLICY IF EXISTS "Users can view orders from their organization" ON orders`,
  `DROP POLICY IF EXISTS "Users can create orders" ON orders`,
  `DROP POLICY IF EXISTS "Users can update orders from their organization" ON orders`,
  `DROP POLICY IF EXISTS "Users can delete orders from their organization" ON orders`,
  
  // Criar SELECT policy
  `CREATE POLICY "Users can view orders from their organization"
   ON orders FOR SELECT
   USING (
     organization_id IN (
       SELECT organization_id FROM organization_members 
       WHERE user_id = auth.uid() AND is_active = true
     )
   )`,
  
  // Criar INSERT policy
  `CREATE POLICY "Users can create orders"
   ON orders FOR INSERT
   WITH CHECK (
     organization_id IN (
       SELECT organization_id FROM organization_members 
       WHERE user_id = auth.uid() AND is_active = true
     )
   )`,
  
  // Criar UPDATE policy
  `CREATE POLICY "Users can update orders from their organization"
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
   )`,
  
  // Criar DELETE policy
  `CREATE POLICY "Users can delete orders from their organization"
   ON orders FOR DELETE
   USING (
     organization_id IN (
       SELECT organization_id FROM organization_members 
       WHERE user_id = auth.uid() AND is_active = true
     )
   )`,
  
  // Habilitar RLS
  `ALTER TABLE orders ENABLE ROW LEVEL SECURITY`
];

async function executarFix() {
  console.log('🔧 Aplicando correção das políticas RLS...\n');
  
  let sucessos = 0;
  let erros = 0;
  
  for (let i = 0; i < sqlCommands.length; i++) {
    const comando = sqlCommands[i];
    const tipo = comando.includes('DROP') ? '🗑️  DROP' : 
                 comando.includes('CREATE') ? '✨ CREATE' : 
                 comando.includes('ALTER') ? '⚙️  ALTER' : '📝 SQL';
    
    try {
      console.log(`${tipo} - Executando comando ${i + 1}/${sqlCommands.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: comando 
      });
      
      if (error) {
        // Tentar método alternativo
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ sql_query: comando })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      }
      
      console.log(`   ✅ Sucesso\n`);
      sucessos++;
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
      erros++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Resultado:`);
  console.log(`   ✅ Sucessos: ${sucessos}`);
  console.log(`   ❌ Erros: ${erros}`);
  console.log('='.repeat(50) + '\n');
  
  if (erros > 0) {
    console.log('⚠️  ATENÇÃO: A API Supabase não permite executar DDL via REST API.');
    console.log('');
    console.log('📋 SOLUÇÃO MANUAL:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new');
    console.log('2. Cole o conteúdo do arquivo fix_orders_rls.sql');
    console.log('3. Clique em "Run" ou pressione Ctrl+Enter');
    console.log('');
    console.log('Abrindo dashboard do Supabase...');
    
    // Abrir browser no Windows
    const { exec } = await import('child_process');
    exec('start https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new');
  } else {
    console.log('🎉 Correção aplicada com sucesso!');
    console.log('');
    console.log('✅ Próximos passos:');
    console.log('1. Recarregue a página da aplicação (F5)');
    console.log('2. Tente atualizar o status do pedido');
    console.log('3. Deve funcionar sem erro 403!');
  }
}

// Executar
executarFix().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  console.log('\n📋 Execute manualmente no dashboard:');
  console.log('https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/sql/new');
  process.exit(1);
});

