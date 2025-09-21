#!/usr/bin/env node
// ====================================================================
// 🔍 SCRIPT DEBUG CNPJ - INVESTIGAR PROBLEMA DE DUPLICAÇÃO
// ====================================================================
// Script para investigar o problema de CNPJ sempre retornando como duplicado
// ====================================================================

import { PrismaClient } from '@prisma/client';

async function debugCnpj() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "file:./data/digiurban.db"
      }
    }
  });

  try {
    console.log('🔍 INVESTIGANDO PROBLEMA DE CNPJ DUPLICADO');
    console.log('==========================================');

    // 1. Listar todos os tenants e seus CNPJs
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        nome: true,
        cnpj: true,
        email: true
      }
    });

    console.log(`\n📊 Total de tenants encontrados: ${tenants.length}`);

    if (tenants.length === 0) {
      console.log('✅ Nenhum tenant encontrado - problema pode estar na validação');
      return;
    }

    // 2. Mostrar todos os CNPJs
    console.log('\n📋 CNPJs cadastrados:');
    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.nome} - CNPJ: "${tenant.cnpj}" (${tenant.cnpj.length} chars)`);
    });

    // 3. Verificar CNPJs vazios ou inválidos
    const problematicCnpjs = tenants.filter(t =>
      !t.cnpj ||
      t.cnpj.trim() === '' ||
      t.cnpj.replace(/[^\d]/g, '').length === 0
    );

    if (problematicCnpjs.length > 0) {
      console.log('\n⚠️ CNPJS PROBLEMÁTICOS ENCONTRADOS:');
      problematicCnpjs.forEach(tenant => {
        console.log(`- ${tenant.nome}: CNPJ = "${tenant.cnpj}"`);
      });
    }

    // 4. Verificar CNPJs limpos duplicados
    const cleanedCnpjs = {};
    tenants.forEach(tenant => {
      const cleaned = tenant.cnpj.replace(/[^\d]/g, '');
      if (cleanedCnpjs[cleaned]) {
        cleanedCnpjs[cleaned].push(tenant);
      } else {
        cleanedCnpjs[cleaned] = [tenant];
      }
    });

    const duplicates = Object.entries(cleanedCnpjs).filter(([cnpj, tenants]) => tenants.length > 1);

    if (duplicates.length > 0) {
      console.log('\n🚨 CNPJS DUPLICADOS ENCONTRADOS (após limpeza):');
      duplicates.forEach(([cnpj, tenants]) => {
        console.log(`CNPJ limpo "${cnpj}":`);
        tenants.forEach(tenant => {
          console.log(`  - ${tenant.nome}: CNPJ original = "${tenant.cnpj}"`);
        });
      });
    }

    // 5. Testar verificação com CNPJ exemplo
    const testCnpj = '11.222.333/0001-81';
    const cleanedTest = testCnpj.replace(/[^\d]/g, '');

    console.log(`\n🧪 TESTE COM CNPJ: "${testCnpj}"`);
    console.log(`CNPJ limpo: "${cleanedTest}"`);

    const existing = await prisma.tenant.findUnique({
      where: { cnpj: cleanedTest }
    });

    console.log(`Resultado da busca: ${existing ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
    if (existing) {
      console.log(`Tenant encontrado: ${existing.nome} (${existing.email})`);
    }

    // 6. Verificar se existe algum tenant com CNPJ vazio que pode estar causando problemas
    const emptyOrInvalidCnpjs = await prisma.tenant.findMany({
      where: {
        OR: [
          { cnpj: '' },
          { cnpj: null },
          { cnpj: '00000000000000' },
          { cnpj: '11111111111111' },
          { cnpj: '22222222222222' },
          { cnpj: '33333333333333' },
          { cnpj: '44444444444444' },
          { cnpj: '55555555555555' },
          { cnpj: '66666666666666' },
          { cnpj: '77777777777777' },
          { cnpj: '88888888888888' },
          { cnpj: '99999999999999' }
        ]
      }
    });

    if (emptyOrInvalidCnpjs.length > 0) {
      console.log('\n🚨 TENANTS COM CNPJ INVÁLIDO/VAZIO:');
      emptyOrInvalidCnpjs.forEach(tenant => {
        console.log(`- ${tenant.nome}: CNPJ = "${tenant.cnpj}"`);
      });
    }

  } catch (error) {
    console.error('❌ Erro na investigação:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão encerrada');
  }
}

// Executar investigação
debugCnpj()
  .then(() => {
    console.log('\n✅ Investigação concluída');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na investigação:', error);
    process.exit(1);
  });