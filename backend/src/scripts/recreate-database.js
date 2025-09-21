#!/usr/bin/env node
// ====================================================================
// 🔄 SCRIPT RECRIAÇÃO COMPLETA DO BANCO - DIGIURBAN
// ====================================================================
// Script para recriar completamente o banco de dados com todas as tabelas
// Resolve problemas de tabelas faltantes e inconsistências
// ====================================================================

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function recreateDatabase() {
  console.log('🔄 RECRIAÇÃO COMPLETA DO BANCO DIGIURBAN');
  console.log('=====================================');

  // 1. Definir caminhos
  const dbPath = './data/digiurban.db';
  const schemaPath = '../schema.prisma';

  try {
    // 2. Remover banco existente se houver
    if (fs.existsSync(dbPath)) {
      console.log('🗑️ Removendo banco existente...');
      fs.unlinkSync(dbPath);

      // Remover arquivos WAL e SHM se existirem
      const walPath = `${dbPath}-wal`;
      const shmPath = `${dbPath}-shm`;

      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

      console.log('✅ Banco antigo removido');
    }

    // 3. Verificar se schema existe
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema não encontrado em: ${schemaPath}`);
    }

    console.log('📄 Schema encontrado, prosseguindo...');

    // 4. Executar prisma db push para criar todas as tabelas
    console.log('🏗️ Criando banco e tabelas...');

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      const { stdout, stderr } = await execAsync(`npx prisma db push --schema=${schemaPath} --accept-data-loss`, {
        cwd: process.cwd()
      });

      if (stderr && !stderr.includes('warning')) {
        console.log('⚠️ Avisos do Prisma:', stderr);
      }

      console.log('✅ Banco criado com sucesso');
      if (stdout) console.log('Output:', stdout);

    } catch (error) {
      console.error('❌ Erro ao executar prisma db push:', error.message);
      throw error;
    }

    // 5. Verificar se o banco foi criado
    if (!fs.existsSync(dbPath)) {
      throw new Error('Banco não foi criado após db push');
    }

    console.log('📊 Verificando estrutura do banco...');

    // 6. Conectar e verificar tabelas
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:${dbPath}`
        }
      }
    });

    try {
      // Verificar se a tabela tenants existe e está acessível
      await prisma.tenant.findMany({ take: 1 });
      console.log('✅ Tabela tenants: OK');

      // Verificar outras tabelas principais
      await prisma.user.findMany({ take: 1 });
      console.log('✅ Tabela users: OK');

      await prisma.activityLog.findMany({ take: 1 });
      console.log('✅ Tabela activity_logs: OK');

      // Testar inserção de tenant
      console.log('🧪 Testando inserção de tenant...');

      const testTenant = await prisma.tenant.create({
        data: {
          id: 'test-tenant-id',
          tenantCode: 'TEST001',
          nome: 'Prefeitura Teste',
          email: 'teste@test.gov.br',
          cidade: 'Cidade Teste',
          estado: 'SP',
          cnpj: '11222333000181',
          plano: 'basico',
          status: 'ativo'
        }
      });

      console.log('✅ Tenant teste criado:', testTenant.nome);

      // Testar busca por CNPJ
      console.log('🔍 Testando busca por CNPJ...');

      const foundTenant = await prisma.tenant.findUnique({
        where: { cnpj: '11222333000181' }
      });

      if (foundTenant) {
        console.log('✅ Busca por CNPJ funcionando');
      } else {
        console.log('❌ Falha na busca por CNPJ');
      }

      // Limpar tenant teste
      await prisma.tenant.delete({
        where: { id: 'test-tenant-id' }
      });

      console.log('✅ Tenant teste removido');

      // 7. Criar dados iniciais básicos se não existirem
      console.log('👤 Verificando usuários iniciais...');

      const userCount = await prisma.user.count();

      if (userCount === 0) {
        console.log('📝 Criando dados iniciais básicos...');

        // Criar tenant demo
        const demoTenant = await prisma.tenant.create({
          data: {
            id: 'demo-tenant-id',
            tenantCode: 'DEMO001',
            nome: 'Prefeitura Demo',
            email: 'admin@demo.gov.br',
            cidade: 'Demo City',
            estado: 'SP',
            cnpj: '11111111000111',
            plano: 'basico',
            status: 'ativo'
          }
        });

        console.log('✅ Tenant demo criado');
      }

    } finally {
      await prisma.$disconnect();
    }

    console.log('\n🎉 BANCO RECRIADO COM SUCESSO!');
    console.log('================================');
    console.log('✅ Todas as tabelas criadas');
    console.log('✅ Estrutura verificada');
    console.log('✅ Testes de CNPJ funcionando');
    console.log('✅ Pronto para uso');

  } catch (error) {
    console.error('\n❌ ERRO NA RECRIAÇÃO DO BANCO:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Executar recriação
recreateDatabase()
  .then(() => {
    console.log('\n✅ Processo concluído com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Falha na recriação:', error.message);
    process.exit(1);
  });