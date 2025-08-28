#!/bin/bash

# ====================================================================
# 🚀 SCRIPT DE DEPLOY SEGURO - DIGIURBAN
# ====================================================================
# Deploy com verificações de segurança obrigatórias
# ====================================================================

set -e # Parar em qualquer erro

echo "🚀 Iniciando deploy seguro do DigiUrban..."

# ====================================================================
# VERIFICAÇÕES PRÉ-DEPLOY
# ====================================================================

echo "🔍 Verificando pré-requisitos..."

# Verificar se é ambiente de produção
if [ "${NODE_ENV}" != "production" ]; then
    echo "⚠️ AVISO: NODE_ENV não está definido como 'production'"
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar variáveis críticas
REQUIRED_VARS=("JWT_SECRET" "JWT_REFRESH_SECRET" "CORS_ORIGIN")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ ERRO: Variável $var não está definida"
        echo "Configure no arquivo .env antes do deploy"
        exit 1
    fi
done

# Verificar tamanho das chaves JWT
if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "❌ ERRO: JWT_SECRET deve ter pelo menos 32 caracteres"
    exit 1
fi

if [ ${#JWT_REFRESH_SECRET} -lt 32 ]; then
    echo "❌ ERRO: JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres"
    exit 1
fi

# Verificar se CORS não contém localhost em produção
if [[ "$CORS_ORIGIN" == *"localhost"* ]] && [ "${NODE_ENV}" = "production" ]; then
    echo "❌ ERRO: CORS_ORIGIN contém localhost em produção!"
    exit 1
fi

echo "✅ Pré-requisitos verificados"

# ====================================================================
# BACKUP PRÉ-DEPLOY
# ====================================================================

echo "💾 Criando backup pré-deploy..."

# Criar backup do banco atual se existir
if [ -f "./data/database.sqlite" ]; then
    backup_name="pre-deploy-backup-$(date +%Y%m%d-%H%M%S).sqlite"
    mkdir -p ./data/backups
    cp ./data/database.sqlite "./data/backups/$backup_name"
    echo "✅ Backup criado: $backup_name"
fi

# ====================================================================
# BUILD E TESTES
# ====================================================================

echo "🔧 Executando build..."

# Build do backend
cd backend
npm ci --only=production
npm run build
cd ..

# Build do frontend
cd frontend
npm ci --only=production
npm run build
cd ..

echo "✅ Build concluído"

# ====================================================================
# VERIFICAÇÕES DE SEGURANÇA
# ====================================================================

echo "🔐 Executando verificações de segurança..."

# Verificar se não há segredos no código
echo "🔍 Verificando vazamentos de segredos..."
if grep -r "password.*=.*['\"][^'\"]*['\"]" --include="*.ts" --include="*.js" .; then
    echo "⚠️ POSSÍVEL SENHA HARDCODED encontrada!"
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar permissões de arquivos
echo "🔍 Verificando permissões..."
find . -name "*.env*" -exec chmod 600 {} \;
find . -name "*.key" -exec chmod 600 {} \;

echo "✅ Verificações de segurança concluídas"

# ====================================================================
# DEPLOY
# ====================================================================

echo "🚀 Iniciando deploy..."

# Parar containers existentes
docker-compose down

# Limpar imagens antigas
docker system prune -f

# Build e start dos novos containers
docker-compose up --build -d

# ====================================================================
# VERIFICAÇÕES PÓS-DEPLOY
# ====================================================================

echo "🔍 Verificando saúde do sistema..."

# Aguardar containers iniciarem
sleep 30

# Verificar se containers estão rodando
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ ERRO: Containers não estão rodando"
    docker-compose logs --tail=50
    exit 1
fi

# Verificar endpoint de saúde
max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "🏥 Verificando saúde (tentativa $attempt/$max_attempts)..."
    
    if curl -f http://localhost:3020/health >/dev/null 2>&1; then
        echo "✅ Sistema está saudável!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ ERRO: Sistema não respondeu após $max_attempts tentativas"
        echo "Logs dos containers:"
        docker-compose logs --tail=20
        exit 1
    fi
    
    sleep 10
    ((attempt++))
done

# ====================================================================
# RELATÓRIO FINAL
# ====================================================================

echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo ""
echo "📊 RESUMO:"
echo "   • Ambiente: ${NODE_ENV:-development}"
echo "   • URL: http://localhost:3020"
echo "   • Containers: $(docker-compose ps --services | wc -l)"
echo "   • Backup: $backup_name"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "   • Verificar logs: docker-compose logs -f"
echo "   • Monitorar métricas: docker stats"
echo "   • Verificar backups: ls -la ./data/backups/"
echo ""
echo "🔒 LEMBRETE DE SEGURANÇA:"
echo "   • Monitore logs regularmente"
echo "   • Verifique backups automatizados"
echo "   • Mantenha certificados SSL atualizados"
echo "   • Revise acessos periodicamente"
echo ""

# Mostrar estatísticas finais
docker-compose ps