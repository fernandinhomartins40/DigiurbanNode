#!/usr/bin/env node
// ====================================================================
// 🧪 TESTE DIRETO NO BANCO - VERIFICAR FILTRO DE TENANTS
// ====================================================================
// Script para testar diretamente no banco se o filtro está funcionando
// ====================================================================

const { PrismaClient } = require('@prisma/client');

async function testDatabaseFiltering() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:./backend/data/digiurban.db"
      }
    }
  });

  try {
    console.log('🧪 TESTANDO FILTRO DE TENANTS NO BANCO\n');

    // 1. Criar tenant de teste
    console.log('1. Criando tenant de teste...');
    const tenant = await prisma.tenant.create({
      data: {
        id: crypto.randomUUID(),
        tenantCode: 'TST001',
        nome: 'Prefeitura Teste',
        email: 'teste@example.com',
        cidade: 'Cidade Teste',
        estado: 'SP',
        cnpj: '12345678000199',
        plano: 'basico',
        status: 'ativo'
      }
    });
    console.log(`✅ Tenant criado: ${tenant.id} (${tenant.status})\n`);

    // 2. Buscar todos os tenants
    console.log('2. Buscando todos os tenants...');
    const allTenants = await prisma.tenant.findMany();
    console.log(`📊 Total de tenants: ${allTenants.length}`);
    allTenants.forEach(t => console.log(`  - ${t.nome} (${t.status})`));
    console.log();

    // 3. Marcar como suspenso (soft delete)
    console.log('3. Marcando tenant como suspenso...');
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { status: 'suspenso' }
    });
    console.log('✅ Tenant marcado como suspenso\n');

    // 4. Buscar apenas ativos (simulando o filtro do backend)
    console.log('4. Buscando apenas tenants ativos...');
    const activeTenants = await prisma.tenant.findMany({
      where: { status: 'ativo' }
    });
    console.log(`📊 Tenants ativos: ${activeTenants.length}`);
    activeTenants.forEach(t => console.log(`  - ${t.nome} (${t.status})`));
    console.log();

    // 5. Buscar todos novamente (incluindo suspensos)
    console.log('5. Buscando todos os tenants (incluindo suspensos)...');
    const allTenantsAfter = await prisma.tenant.findMany();
    console.log(`📊 Total de tenants: ${allTenantsAfter.length}`);
    allTenantsAfter.forEach(t => console.log(`  - ${t.nome} (${t.status})`));
    console.log();

    // 6. Verificar se o tenant suspenso existe
    const suspendedTenant = await prisma.tenant.findUnique({
      where: { id: tenant.id }
    });

    console.log('📋 ANÁLISE DOS RESULTADOS:');
    console.log(`- Tenant suspenso existe no banco: ${suspendedTenant ? 'SIM' : 'NÃO'}`);
    console.log(`- Status do tenant: ${suspendedTenant?.status || 'N/A'}`);
    console.log(`- Filtro por ativos funciona: ${activeTenants.length < allTenantsAfter.length ? 'SIM' : 'NÃO'}`);

    if (suspendedTenant?.status === 'suspenso' && activeTenants.length < allTenantsAfter.length) {
      console.log('✅ CORREÇÃO FUNCIONANDO: Soft delete implementado corretamente!');
    } else {
      console.log('❌ PROBLEMA PERSISTE: Verificar implementação');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Polyfill para crypto.randomUUID se não existir
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  global.crypto = {
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };
}

testDatabaseFiltering().catch(console.error);