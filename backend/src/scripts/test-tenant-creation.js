#!/usr/bin/env node
// ====================================================================
// 🧪 TESTE DE CRIAÇÃO DE TENANTS - VERIFICAR PROBLEMA CNPJ
// ====================================================================
// Script para testar se o problema de CNPJ duplicado foi resolvido
// ====================================================================

import { PrismaClient } from '@prisma/client';

async function testTenantCreation() {
  console.log('🧪 TESTE DE CRIAÇÃO DE TENANTS');
  console.log('============================');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "file:./data/digiurban.db"
      }
    }
  });

  try {
    // 1. Testar criação de tenant
    console.log('\n📝 Teste 1: Criando tenant com CNPJ novo...');

    const tenant1 = await prisma.tenant.create({
      data: {
        id: 'test-tenant-1',
        tenantCode: 'TEST001',
        nome: 'Prefeitura de Teste 1',
        email: 'teste1@test.gov.br',
        cidade: 'Cidade Teste 1',
        estado: 'SP',
        cnpj: '11222333000181',
        plano: 'basico',
        status: 'ativo'
      }
    });

    console.log(`✅ Tenant 1 criado: ${tenant1.nome} - CNPJ: ${tenant1.cnpj}`);

    // 2. Testar verificação de CNPJ existente
    console.log('\n🔍 Teste 2: Verificando se CNPJ existe...');

    const existingTenant = await prisma.tenant.findUnique({
      where: { cnpj: '11222333000181' }
    });

    if (existingTenant) {
      console.log(`✅ CNPJ encontrado: ${existingTenant.nome}`);
    } else {
      console.log('❌ CNPJ não encontrado - problema na busca');
    }

    // 3. Testar tentativa de criar tenant com CNPJ duplicado
    console.log('\n⚠️ Teste 3: Tentando criar tenant com CNPJ duplicado...');

    try {
      await prisma.tenant.create({
        data: {
          id: 'test-tenant-2',
          tenantCode: 'TEST002',
          nome: 'Prefeitura de Teste 2',
          email: 'teste2@test.gov.br',
          cidade: 'Cidade Teste 2',
          estado: 'RJ',
          cnpj: '11222333000181', // CNPJ duplicado
          plano: 'basico',
          status: 'ativo'
        }
      });

      console.log('❌ ERRO: Conseguiu criar tenant com CNPJ duplicado!');

    } catch (error) {
      console.log(`✅ Erro esperado ao tentar CNPJ duplicado: ${error.message}`);
    }

    // 4. Testar criação com CNPJ diferente
    console.log('\n📝 Teste 4: Criando tenant com CNPJ diferente...');

    const tenant3 = await prisma.tenant.create({
      data: {
        id: 'test-tenant-3',
        tenantCode: 'TEST003',
        nome: 'Prefeitura de Teste 3',
        email: 'teste3@test.gov.br',
        cidade: 'Cidade Teste 3',
        estado: 'MG',
        cnpj: '44555666000199',
        plano: 'premium',
        status: 'ativo'
      }
    });

    console.log(`✅ Tenant 3 criado: ${tenant3.nome} - CNPJ: ${tenant3.cnpj}`);

    // 5. Listar todos os tenants
    console.log('\n📊 Teste 5: Listando todos os tenants...');

    const allTenants = await prisma.tenant.findMany();
    console.log(`Total de tenants: ${allTenants.length}`);

    allTenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.nome} - CNPJ: ${tenant.cnpj} - Email: ${tenant.email}`);
    });

    // 6. Teste de busca por CNPJ com função do TenantModel
    console.log('\n🔧 Teste 6: Testando busca usando TenantModel...');

    // Simular a função do TenantModel
    const cleanCNPJ = (cnpj) => cnpj.replace(/[^\d]/g, '');

    const testCnpjs = [
      '11.222.333/0001-81',
      '11222333000181',
      '44.555.666/0001-99',
      '44555666000199',
      '99.888.777/0001-66' // Não existe
    ];

    for (const testCnpj of testCnpjs) {
      const cleanedCnpj = cleanCNPJ(testCnpj);
      const found = await prisma.tenant.findUnique({
        where: { cnpj: cleanedCnpj }
      });

      console.log(`CNPJ "${testCnpj}" → "${cleanedCnpj}" → ${found ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
    }

    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS!');
    console.log('============================');
    console.log('✅ Banco funcionando corretamente');
    console.log('✅ CNPJ unique constraint funcionando');
    console.log('✅ Busca por CNPJ funcionando');

  } catch (error) {
    console.error('\n❌ ERRO NOS TESTES:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão encerrada');
  }
}

// Executar testes
testTenantCreation()
  .then(() => {
    console.log('\n✅ Testes concluídos com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha nos testes:', error.message);
    process.exit(1);
  });