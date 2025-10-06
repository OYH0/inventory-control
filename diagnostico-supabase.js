/**
 * Diagnóstico Completo do Supabase
 * Verifica conexão, tabelas, RLS, dados e possíveis erros
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Configuração
const SUPABASE_URL = 'https://uygwwqhjhozyljuxcgkd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Z3d3cWhqaG96eWxqdXhjZ2tkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzg3MDEsImV4cCI6MjA2NDkxNDcwMX0.6dCc0bIuHKS1xtk7OzkIqrRQKkG43ecTeBsWdLz8aok';

// Cores
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader(title) {
  console.log('');
  log('='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
  console.log('');
}

const tabelas = [
  'camara_fria_items',
  'bebidas_items',
  'estoque_seco_items',
  'descartaveis_items',
  'camara_refrigerada_items',
];

const historicoTabelas = [
  'camara_fria_historico',
  'bebidas_historico',
  'estoque_seco_historico',
  'descartaveis_historico',
  'camara_refrigerada_historico',
];

async function testConnection(supabase) {
  printHeader('1️⃣  TESTE DE CONEXÃO');
  
  try {
    const { data, error } = await supabase.from('camara_fria_items').select('count', { count: 'exact', head: true });
    
    if (error && error.code === 'PGRST116') {
      log('⚠️  Tabela camara_fria_items não existe', 'yellow');
      return false;
    } else if (error) {
      log(`❌ Erro na conexão: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Conexão estabelecida com sucesso!', 'green');
    return true;
  } catch (error) {
    log(`❌ Erro fatal: ${error.message}`, 'red');
    return false;
  }
}

async function checkTables(supabase) {
  printHeader('2️⃣  VERIFICAÇÃO DE TABELAS');
  
  const results = [];
  
  for (const tabela of tabelas) {
    try {
      const { count, error } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        log(`❌ ${tabela.padEnd(30)} : ERRO - ${error.message}`, 'red');
        results.push({ tabela, status: 'erro', count: 0, error: error.message });
      } else {
        log(`✅ ${tabela.padEnd(30)} : ${count} registros`, 'green');
        results.push({ tabela, status: 'ok', count, error: null });
      }
    } catch (error) {
      log(`❌ ${tabela.padEnd(30)} : EXCEÇÃO - ${error.message}`, 'red');
      results.push({ tabela, status: 'excecao', count: 0, error: error.message });
    }
  }
  
  return results;
}

async function checkABCFields(supabase) {
  printHeader('3️⃣  VERIFICAÇÃO DE CAMPOS ABC');
  
  const tabelasABC = ['camara_fria_items', 'bebidas_items', 'estoque_seco_items', 'descartaveis_items'];
  
  for (const tabela of tabelasABC) {
    try {
      const { data, error } = await supabase
        .from(tabela)
        .select('unit_cost, annual_demand, ordering_cost, carrying_cost_percentage, lead_time_days, abc_category')
        .limit(1);
      
      if (error) {
        log(`❌ ${tabela}`, 'red');
        log(`   Erro: ${error.message}`, 'red');
        continue;
      }
      
      if (data && data.length > 0) {
        const item = data[0];
        const campos = [];
        
        if (item.unit_cost !== null) campos.push('✅ unit_cost');
        else campos.push('❌ unit_cost');
        
        if (item.annual_demand !== null) campos.push('✅ annual_demand');
        else campos.push('❌ annual_demand');
        
        if (item.ordering_cost !== null) campos.push('✅ ordering_cost');
        else campos.push('❌ ordering_cost');
        
        if (item.carrying_cost_percentage !== null) campos.push('✅ carrying_cost_%');
        else campos.push('❌ carrying_cost_%');
        
        if (item.lead_time_days !== null) campos.push('✅ lead_time');
        else campos.push('❌ lead_time');
        
        if (item.abc_category !== null) campos.push('✅ abc_category');
        else campos.push('❌ abc_category');
        
        log(`📊 ${tabela}:`, 'cyan');
        log(`   ${campos.join(', ')}`, 'reset');
      } else {
        log(`⚠️  ${tabela}: Sem dados para verificar`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${tabela}: ${error.message}`, 'red');
    }
  }
}

async function checkRLSPolicies(supabase) {
  printHeader('4️⃣  TESTE DE POLÍTICAS RLS');
  
  log('⚠️  Testando acesso sem autenticação...', 'yellow');
  
  for (const tabela of tabelas) {
    try {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(1);
      
      if (error && error.code === '42501') {
        log(`✅ ${tabela.padEnd(30)} : RLS funcionando (acesso negado)`, 'green');
      } else if (error) {
        log(`⚠️  ${tabela.padEnd(30)} : ${error.message}`, 'yellow');
      } else if (data && data.length === 0) {
        log(`✅ ${tabela.padEnd(30)} : RLS funcionando (sem dados)`, 'green');
      } else {
        log(`⚠️  ${tabela.padEnd(30)} : RLS pode estar desabilitado`, 'yellow');
      }
    } catch (error) {
      log(`❌ ${tabela.padEnd(30)} : ${error.message}`, 'red');
    }
  }
}

async function checkHistorico(supabase) {
  printHeader('5️⃣  VERIFICAÇÃO DE HISTÓRICO');
  
  for (const tabela of historicoTabelas) {
    try {
      const { count, error } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      
      if (error && error.code === 'PGRST116') {
        log(`⚠️  ${tabela.padEnd(35)} : Tabela não existe`, 'yellow');
      } else if (error) {
        log(`❌ ${tabela.padEnd(35)} : ${error.message}`, 'red');
      } else {
        log(`✅ ${tabela.padEnd(35)} : ${count} registros`, 'green');
      }
    } catch (error) {
      log(`❌ ${tabela.padEnd(35)} : ${error.message}`, 'red');
    }
  }
}

async function checkExpiryAlerts(supabase) {
  printHeader('6️⃣  VERIFICAÇÃO DE ALERTAS DE VENCIMENTO');
  
  try {
    // Verificar configurações
    const { count: configCount, error: configError } = await supabase
      .from('expiry_alert_configs')
      .select('*', { count: 'exact', head: true });
    
    if (configError) {
      log(`❌ Erro ao verificar configurações: ${configError.message}`, 'red');
    } else {
      log(`✅ Configurações de alertas: ${configCount} registros`, 'green');
    }
    
    // Verificar produtos vencendo
    const hoje = new Date().toISOString().split('T')[0];
    const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    for (const tabela of ['camara_fria_items', 'bebidas_items', 'estoque_seco_items']) {
      const { count, error } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true })
        .gte('data_validade', hoje)
        .lte('data_validade', em30Dias);
      
      if (!error) {
        if (count > 0) {
          log(`⚠️  ${tabela.padEnd(25)} : ${count} produtos vencendo em 30 dias`, 'yellow');
        } else {
          log(`✅ ${tabela.padEnd(25)} : Sem produtos vencendo em breve`, 'green');
        }
      }
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
}

async function checkOrders(supabase) {
  printHeader('7️⃣  VERIFICAÇÃO DO SISTEMA DE PEDIDOS');
  
  try {
    const { count, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (error && error.code === 'PGRST116') {
      log(`⚠️  Tabela orders não existe`, 'yellow');
    } else if (error) {
      log(`❌ Erro: ${error.message}`, 'red');
    } else {
      log(`✅ Total de pedidos: ${count}`, 'green');
      
      // Verificar por status
      const { data: orders } = await supabase
        .from('orders')
        .select('status');
      
      if (orders) {
        const statusCount = {};
        orders.forEach(o => {
          statusCount[o.status] = (statusCount[o.status] || 0) + 1;
        });
        
        Object.entries(statusCount).forEach(([status, count]) => {
          log(`   ${status.padEnd(15)} : ${count}`, 'cyan');
        });
      }
    }
  } catch (error) {
    log(`❌ Erro: ${error.message}`, 'red');
  }
}

async function checkDataIntegrity(supabase) {
  printHeader('8️⃣  VERIFICAÇÃO DE INTEGRIDADE DE DADOS');
  
  let erros = 0;
  
  for (const tabela of tabelas.slice(0, 4)) { // Excluir camara_refrigerada
    try {
      // Produtos sem nome
      const { count: semNome } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true })
        .or('nome.is.null,nome.eq.');
      
      if (semNome > 0) {
        log(`⚠️  ${tabela}: ${semNome} produtos sem nome`, 'yellow');
        erros++;
      }
      
      // Produtos com quantidade negativa
      const { count: qtdNegativa } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true })
        .lt('quantidade', 0);
      
      if (qtdNegativa > 0) {
        log(`⚠️  ${tabela}: ${qtdNegativa} produtos com quantidade negativa`, 'yellow');
        erros++;
      }
      
      // Produtos sem unidade
      const { count: semUnidade } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true })
        .or('unidade.is.null,unidade.eq.');
      
      if (semUnidade > 0) {
        log(`⚠️  ${tabela}: ${semUnidade} produtos sem unidade`, 'yellow');
        erros++;
      }
      
    } catch (error) {
      log(`❌ ${tabela}: ${error.message}`, 'red');
    }
  }
  
  if (erros === 0) {
    log('✅ Nenhum problema de integridade encontrado!', 'green');
  } else {
    log(`⚠️  ${erros} problemas de integridade encontrados`, 'yellow');
  }
}

async function generateSummary(tableResults) {
  printHeader('📊 RESUMO DO DIAGNÓSTICO');
  
  const totalTabelas = tableResults.length;
  const tabelasOk = tableResults.filter(t => t.status === 'ok').length;
  const tabelasErro = tableResults.filter(t => t.status === 'erro').length;
  const totalRegistros = tableResults.reduce((sum, t) => sum + t.count, 0);
  
  log(`Total de tabelas verificadas: ${totalTabelas}`, 'cyan');
  log(`Tabelas funcionando: ${tabelasOk} ✅`, 'green');
  log(`Tabelas com erro: ${tabelasErro} ${tabelasErro > 0 ? '❌' : ''}`, tabelasErro > 0 ? 'red' : 'green');
  log(`Total de registros: ${totalRegistros}`, 'cyan');
  
  console.log('');
  
  if (tabelasErro === 0 && tabelasOk > 0) {
    log('🎉 SISTEMA OPERACIONAL - Nenhum erro crítico encontrado!', 'green');
  } else if (tabelasErro > 0) {
    log('⚠️  ATENÇÃO - Alguns problemas foram encontrados', 'yellow');
  } else {
    log('❌ ERRO - Sistema não está operacional', 'red');
  }
}

async function main() {
  console.clear();
  log('╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     🔍 DIAGNÓSTICO COMPLETO DO SUPABASE                 ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝', 'cyan');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const connectionOk = await testConnection(supabase);
  
  if (!connectionOk) {
    log('\n❌ Não foi possível continuar. Verifique a conexão.', 'red');
    process.exit(1);
  }
  
  const tableResults = await checkTables(supabase);
  await checkABCFields(supabase);
  await checkRLSPolicies(supabase);
  await checkHistorico(supabase);
  await checkExpiryAlerts(supabase);
  await checkOrders(supabase);
  await checkDataIntegrity(supabase);
  await generateSummary(tableResults);
  
  console.log('');
  log('='.repeat(60), 'cyan');
  log('✅ Diagnóstico concluído!', 'green');
  log('='.repeat(60), 'cyan');
  console.log('');
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});

