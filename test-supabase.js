/**
 * Script de Teste - Conexão Supabase
 * Testa login e conexão com o banco de dados
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

// Configuração
const SUPABASE_URL = 'https://uygwwqhjhozyljuxcgkd.supabase.co';
const SENHA_PADRAO = 'cecOYH09118';

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader() {
  console.clear();
  log('╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🔐 TESTE DE CONEXÃO SUPABASE - INVENTORY CONTROL    ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝', 'cyan');
  console.log('');
  log(`📡 Projeto: uygwwqhjhozyljuxcgkd`, 'blue');
  log(`🌐 URL: ${SUPABASE_URL}`, 'blue');
  log(`🔑 Senha padrão: ${SENHA_PADRAO}`, 'blue');
  console.log('');
}

async function promptForInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function testSupabaseConnection(anonKey) {
  log('🔄 Criando cliente Supabase...', 'yellow');
  
  try {
    const supabase = createClient(SUPABASE_URL, anonKey);
    log('✅ Cliente criado com sucesso!', 'green');
    return supabase;
  } catch (error) {
    log('❌ Erro ao criar cliente:', 'red');
    log(error.message, 'red');
    return null;
  }
}

async function testLogin(supabase, email, password) {
  log('\n🔄 Tentando fazer login...', 'yellow');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) throw error;

    log('✅ Login realizado com sucesso!', 'green');
    console.log('');
    log('📋 Informações do Usuário:', 'bright');
    log(`   • ID: ${data.user.id}`, 'cyan');
    log(`   • Email: ${data.user.email}`, 'cyan');
    log(`   • Role: ${data.user.role}`, 'cyan');
    log(`   • Criado em: ${new Date(data.user.created_at).toLocaleString('pt-BR')}`, 'cyan');
    log(`   • Último login: ${new Date(data.user.last_sign_in_at).toLocaleString('pt-BR')}`, 'cyan');
    console.log('');
    log('📋 Informações da Sessão:', 'bright');
    log(`   • Access Token: ${data.session.access_token.substring(0, 50)}...`, 'cyan');
    log(`   • Expira em: ${new Date(data.session.expires_at * 1000).toLocaleString('pt-BR')}`, 'cyan');
    
    return { success: true, data };
  } catch (error) {
    log('❌ Erro no login:', 'red');
    
    if (error.message.includes('Invalid login credentials')) {
      log('   Email ou senha incorretos', 'red');
    } else if (error.message.includes('Email not confirmed')) {
      log('   Email não confirmado', 'red');
    } else {
      log(`   ${error.message}`, 'red');
    }
    
    return { success: false, error };
  }
}

async function testDatabaseAccess(supabase) {
  log('\n🔄 Testando acesso ao banco de dados...', 'yellow');
  
  const tables = [
    'camara_fria_items',
    'bebidas_items',
    'estoque_seco_items',
    'descartaveis_items',
    'camara_refrigerada_items',
  ];

  let successCount = 0;
  let totalCount = 0;

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        log(`   ❌ ${table}: ${error.message}`, 'red');
      } else {
        log(`   ✅ ${table}: ${count} itens`, 'green');
        successCount++;
        totalCount += count;
      }
    } catch (error) {
      log(`   ❌ ${table}: ${error.message}`, 'red');
    }
  }

  console.log('');
  log('📊 Resumo do Banco de Dados:', 'bright');
  log(`   • Tabelas acessíveis: ${successCount}/${tables.length}`, 'cyan');
  log(`   • Total de itens: ${totalCount}`, 'cyan');

  return successCount > 0;
}

async function createTestData(supabase) {
  log('\n🔄 Tentando criar item de teste...', 'yellow');
  
  try {
    const testItem = {
      nome: 'Produto Teste - ' + new Date().toISOString(),
      quantidade: 10,
      unidade: 'kg',
      categoria: 'teste',
      notas: 'Item criado automaticamente pelo script de teste',
    };

    const { data, error } = await supabase
      .from('camara_fria_items')
      .insert([testItem])
      .select();

    if (error) throw error;

    log('✅ Item de teste criado com sucesso!', 'green');
    log(`   • ID: ${data[0].id}`, 'cyan');
    log(`   • Nome: ${data[0].nome}`, 'cyan');
    
    // Limpar item de teste
    await supabase.from('camara_fria_items').delete().eq('id', data[0].id);
    log('   ✅ Item de teste removido', 'green');
    
    return true;
  } catch (error) {
    log('❌ Erro ao criar item de teste:', 'red');
    log(`   ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  printHeader();

  // Solicitar chave anon
  log('⚠️  IMPORTANTE: Você precisa da chave anon do Supabase', 'yellow');
  log('   Obtenha em: https://supabase.com/dashboard/project/uygwwqhjhozyljuxcgkd/settings/api', 'yellow');
  console.log('');

  const anonKey = await promptForInput('🔑 Cole a chave anon aqui: ');
  
  if (!anonKey || anonKey.trim() === '') {
    log('\n❌ Chave anon é obrigatória!', 'red');
    process.exit(1);
  }

  console.log('');

  // Testar conexão
  const supabase = await testSupabaseConnection(anonKey.trim());
  if (!supabase) {
    log('\n❌ Não foi possível continuar sem conexão válida', 'red');
    process.exit(1);
  }

  // Solicitar email
  const email = await promptForInput('\n📧 Digite o email para login: ');
  
  if (!email || email.trim() === '') {
    log('\n❌ Email é obrigatório!', 'red');
    process.exit(1);
  }

  // Usar senha padrão ou solicitar nova
  const useDefaultPassword = await promptForInput(`\n🔑 Usar senha padrão (${SENHA_PADRAO})? (S/n): `);
  
  let password = SENHA_PADRAO;
  if (useDefaultPassword.toLowerCase() === 'n') {
    password = await promptForInput('🔑 Digite a senha: ');
  }

  // Testar login
  const loginResult = await testLogin(supabase, email.trim(), password);
  
  if (!loginResult.success) {
    log('\n❌ Não foi possível fazer login', 'red');
    process.exit(1);
  }

  // Testar acesso ao banco
  const dbAccessOk = await testDatabaseAccess(supabase);

  if (!dbAccessOk) {
    log('\n⚠️  Aviso: Problemas de acesso ao banco de dados', 'yellow');
    log('   Verifique as políticas RLS', 'yellow');
  }

  // Testar criação de dados
  const canCreateData = await createTestData(supabase);

  // Resumo final
  console.log('');
  log('╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    📊 RESUMO FINAL                       ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝', 'cyan');
  console.log('');
  log(`   ✅ Conexão Supabase: OK`, 'green');
  log(`   ${loginResult.success ? '✅' : '❌'} Login: ${loginResult.success ? 'OK' : 'FALHOU'}`, loginResult.success ? 'green' : 'red');
  log(`   ${dbAccessOk ? '✅' : '❌'} Acesso ao Banco: ${dbAccessOk ? 'OK' : 'VERIFICAR'}`, dbAccessOk ? 'green' : 'yellow');
  log(`   ${canCreateData ? '✅' : '❌'} Criação de Dados: ${canCreateData ? 'OK' : 'VERIFICAR'}`, canCreateData ? 'green' : 'yellow');
  console.log('');

  if (loginResult.success && dbAccessOk && canCreateData) {
    log('🎉 SUCESSO! Sistema totalmente funcional!', 'green');
    log('', 'reset');
    log('📝 Próximos passos:', 'bright');
    log('   1. Criar arquivo .env.local com as credenciais', 'cyan');
    log('   2. Reiniciar servidor: npm run dev', 'cyan');
    log('   3. Acessar: http://localhost:8081', 'cyan');
  } else {
    log('⚠️  Sistema parcialmente funcional', 'yellow');
    log('   Verifique os logs acima para detalhes', 'yellow');
  }

  console.log('');

  // Fazer logout
  await supabase.auth.signOut();
  log('👋 Logout realizado', 'cyan');
}

// Executar
main().catch((error) => {
  console.error('');
  log('❌ Erro fatal:', 'red');
  console.error(error);
  process.exit(1);
});


