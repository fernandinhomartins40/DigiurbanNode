#!/usr/bin/env node
// ====================================================================
// 🧪 TESTE DE EXCLUSÃO DE TENANT - VERIFICAR SOFT DELETE
// ====================================================================
// Script para testar se o problema de tenants reaparecendo foi corrigido
// ====================================================================

const API_BASE = 'http://localhost:3021/api';

// Headers básicos para as requisições
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// ====================================================================
// FUNÇÕES AUXILIARES
// ====================================================================

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers,
    ...options
  });

  const data = await response.json();

  console.log(`${options.method || 'GET'} ${url}`);
  console.log(`Status: ${response.status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  console.log('---');

  return { response, data };
}

// ====================================================================
// TESTES
// ====================================================================

async function testTenantDeletion() {
  console.log('🧪 INICIANDO TESTE DE EXCLUSÃO DE TENANT\n');

  try {
    // 1. Criar um tenant de teste
    console.log('1. Criando tenant de teste...');
    const createResult = await makeRequest(`${API_BASE}/tenants`, {
      method: 'POST',
      body: JSON.stringify({
        nome: 'Prefeitura Teste Delete',
        email: 'teste-delete@example.com',
        cidade: 'Cidade Teste',
        estado: 'SP',
        cnpj: '12345678000123',
        plano: 'basico'
      })
    });

    if (!createResult.data.success) {
      console.error('❌ Falha ao criar tenant de teste');
      return;
    }

    const tenantId = createResult.data.data.id;
    console.log(`✅ Tenant criado: ${tenantId}\n`);

    // 2. Listar tenants antes da exclusão
    console.log('2. Listando tenants antes da exclusão...');
    const beforeResult = await makeRequest(`${API_BASE}/tenants`);
    const beforeCount = beforeResult.data.data?.tenants?.length || 0;
    console.log(`📊 Total de tenants antes: ${beforeCount}\n`);

    // 3. Excluir o tenant (soft delete)
    console.log('3. Excluindo tenant (soft delete)...');
    const deleteResult = await makeRequest(`${API_BASE}/tenants/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'suspenso'
      })
    });

    if (!deleteResult.data.success) {
      console.error('❌ Falha ao excluir tenant');
      return;
    }

    console.log('✅ Tenant marcado como suspenso\n');

    // 4. Listar tenants após exclusão (deve filtrar suspensos)
    console.log('4. Listando tenants após exclusão...');
    const afterResult = await makeRequest(`${API_BASE}/tenants`);
    const afterCount = afterResult.data.data?.tenants?.length || 0;
    console.log(`📊 Total de tenants após: ${afterCount}\n`);

    // 5. Verificar se tenant aparece na listagem com include_suspended
    console.log('5. Verificando se tenant aparece com include_suspended=true...');
    const suspendedResult = await makeRequest(`${API_BASE}/tenants?include_suspended=true`);
    const suspendedCount = suspendedResult.data.data?.tenants?.length || 0;
    const foundSuspended = suspendedResult.data.data?.tenants?.find(t => t.id === tenantId);
    console.log(`📊 Total com suspensos: ${suspendedCount}`);
    console.log(`🔍 Tenant suspenso encontrado: ${foundSuspended ? 'SIM' : 'NÃO'}\n`);

    // 6. Análise dos resultados
    console.log('📋 ANÁLISE DOS RESULTADOS:');
    console.log(`- Tenants antes da exclusão: ${beforeCount}`);
    console.log(`- Tenants após exclusão: ${afterCount}`);
    console.log(`- Diferença: ${beforeCount - afterCount}`);
    console.log(`- Tenant suspenso ainda existe no banco: ${foundSuspended ? 'SIM' : 'NÃO'}`);

    if (beforeCount > afterCount && foundSuspended) {
      console.log('✅ TESTE PASSOU: Soft delete funcionando corretamente!');
      console.log('✅ Tenant não aparece na listagem padrão');
      console.log('✅ Tenant existe quando solicitado explicitamente');
    } else if (beforeCount === afterCount) {
      console.log('❌ TESTE FALHOU: Tenant ainda aparece na listagem padrão');
    } else {
      console.log('⚠️ RESULTADO INCONCLUSIVO: Verificar logs');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// ====================================================================
// EXECUTAR TESTE
// ====================================================================

testTenantDeletion().catch(console.error);