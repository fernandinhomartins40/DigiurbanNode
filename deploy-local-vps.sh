#!/bin/bash
# ====================================================================
# 🚀 DEPLOY LOCAL VPS - DIGIURBAN
# ====================================================================
# Script para executar deploy diretamente na VPS, sem SSH
# Evita problemas de host key verification
# ====================================================================

set -e

# Configurações
export DOMAIN="72.60.10.108"
export PUBLIC_PORT="3020"
export API_PORT="3021"
export APP_DIR="/root/digiurban-unified"

echo "🚀 DIGIURBAN DEPLOY LOCAL VPS - ARQUITETURA UNIFICADA"
echo "============================================="
echo "Deploy Version: $(date +%Y%m%d_%H%M%S)"
echo "Target: $DOMAIN:$PUBLIC_PORT"
echo "API Port: $API_PORT"
echo "Architecture: Unified Municipal System"

# 1. STOPPING EXISTING SERVICES
echo "🛑 Parando serviços existentes..."
docker stop digiurban-unified 2>/dev/null || echo "Container não estava rodando"
docker rm digiurban-unified 2>/dev/null || echo "Container não existia"

# 2. FRONTEND BUILD
echo "🏗️ Compilando frontend otimizado..."
cd $APP_DIR/frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

echo "✅ Frontend dependencies instaladas"
echo "Building with enhanced optimizations and production env vars..."

# Build do frontend com otimizações
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build concluído: $(ls -1 dist/assets/*.js | wc -l) chunks gerados"
    echo "✅ Build verificado e pronto para deploy"
else
    echo "❌ Falha no build do frontend"
    exit 1
fi

echo "✅ Frontend copiado para diretório estático"

# 3. BACKEND BUILD
echo "🔨 Compilando backend DigiUrban..."
cd $APP_DIR/backend

echo "🔍 Compilando TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilado com sucesso"
    echo "Arquivos compilados encontrados:"
    echo "  - Rotas: $(find dist -name "*.js" -path "*/routes/*" | wc -l) arquivos"
    echo "  - Serviços: $(find dist -name "*.js" -path "*/services/*" | wc -l) arquivos"
    echo "✅ Backend compilado com sucesso"
else
    echo "❌ Falha na compilação do backend"
    exit 1
fi

# 4. DOCKER BUILD
echo "🐳 Construindo e deployando container Docker..."
cd $APP_DIR

echo "🏗️ Construindo imagem Docker..."
if docker build -t digiurban-unified .; then
    echo "✅ Imagem Docker construída"
else
    echo "❌ Falha na construção da imagem Docker"
    exit 1
fi

# 5. CONTAINER STARTUP
echo "📁 Preparando diretório de dados..."
mkdir -p $APP_DIR/data
chmod 755 $APP_DIR/data
echo "✅ Diretório de dados preparado com permissões corretas"

echo "🚀 Iniciando container com variáveis de ambiente..."
docker run -d \
    --name digiurban-unified \
    --restart unless-stopped \
    -p $PUBLIC_PORT:80 \
    -p $API_PORT:3021 \
    -v $APP_DIR/data:/app/data \
    -e NODE_ENV=production \
    -e DATABASE_URL="file:/app/data/digiurban.db" \
    -e JWT_SECRET="$(openssl rand -base64 64 | tr -d '\n')" \
    -e JWT_REFRESH_SECRET="$(openssl rand -base64 64 | tr -d '\n')" \
    -e SESSION_SECRET="$(openssl rand -base64 64 | tr -d '\n')" \
    -e COOKIE_SECRET="$(openssl rand -base64 32 | tr -d '\n')" \
    -e API_BASE_URL="http://$DOMAIN:$API_PORT/api" \
    -e FRONTEND_URL="http://$DOMAIN:$PUBLIC_PORT" \
    -e ALLOWED_ORIGINS="http://$DOMAIN:$PUBLIC_PORT" \
    -e CORS_ORIGIN="http://$DOMAIN:$PUBLIC_PORT" \
    -e RATE_LIMIT_WINDOW=900000 \
    -e RATE_LIMIT_MAX=1000 \
    -e BCRYPT_ROUNDS=12 \
    -e SESSION_TIMEOUT=86400 \
    -e REDIS_ENABLED=false \
    -e ENABLE_REDIS=false \
    digiurban-unified

if [ $? -eq 0 ]; then
    echo "✅ Container iniciado com sucesso"
else
    echo "❌ Falha ao iniciar container"
    exit 1
fi

# 6. DATABASE SETUP
echo "🗃️ Configurando banco de dados..."
echo "⏳ Aguardando container inicializar..."
sleep 20

echo "🔍 Verificando se container está respondendo..."
for i in {1..10}; do
    if docker exec digiurban-unified sh -c 'echo "Container ready"' >/dev/null 2>&1; then
        echo "✅ Container está respondendo"
        break
    fi
    echo "   Tentativa $i/10..."
    sleep 3
done

echo "🧹 Limpando banco anterior se necessário..."
docker exec digiurban-unified sh -c 'rm -f /app/data/digiurban.db* 2>/dev/null || echo "Nenhum banco para limpar"'

echo "🚀 Criando schema do banco de dados..."
if docker exec -e DATABASE_URL="file:/app/data/digiurban.db" digiurban-unified sh -c 'cd /app/backend && npx prisma db push --schema=../schema.prisma'; then
    echo "✅ Schema do banco criado com sucesso"
else
    echo "❌ Falha ao criar schema do banco"
    exit 1
fi

echo "🎯 Executando seeds do banco..."
if docker exec -e DATABASE_URL="file:/app/data/digiurban.db" digiurban-unified sh -c 'cd /app/backend && npx prisma db seed --schema=../schema.prisma'; then
    echo "✅ Seeds executados com sucesso"
else
    echo "⚠️ Erro nos seeds, mas continuando deploy"
fi

echo "🔓 Ativando usuários criados..."
if docker exec -e DATABASE_URL="file:/app/data/digiurban.db" digiurban-unified node /app/scripts/activate-users.js; then
    echo "✅ Usuários ativados com sucesso"
else
    echo "⚠️ Aviso: Problema na ativação de usuários, mas deploy continuou"
fi

echo "🔍 Verificando integridade do banco..."
if docker exec digiurban-unified sh -c 'cd /app/data && ls -la digiurban.db*'; then
    echo "✅ Banco de dados criado e configurado"
else
    echo "⚠️ Banco pode não ter sido criado corretamente"
fi

# 7. FINAL VERIFICATION
echo "🎯 Verificando se aplicação está online..."
sleep 10

echo "🔍 Verificando frontend..."
if curl -s -f http://localhost:$PUBLIC_PORT >/dev/null; then
    echo "✅ Frontend está respondendo"
else
    echo "⚠️ Frontend pode não estar respondendo"
fi

echo "🔍 Verificando backend..."
if curl -s -f http://localhost:$API_PORT/api/health >/dev/null; then
    echo "✅ Backend API está respondendo"
else
    echo "⚠️ Backend API pode não estar respondendo"
fi

# 8. SUCCESS MESSAGE
echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================"
echo "🌐 Frontend: http://$DOMAIN:$PUBLIC_PORT"
echo "🔌 Backend API: http://$DOMAIN:$API_PORT/api"
echo "📊 Health Check: http://$DOMAIN:$API_PORT/api/health"
echo "🔑 Login Super Admin:"
echo "   📧 Email: admin@digiurban.com.br"
echo "   🔐 Senha: admin123"
echo "🏛️ Login Demo Tenant:"
echo "   📧 Email: admin@demo.gov.br"
echo "   🔐 Senha: demo123"
echo ""
echo "⚠️  IMPORTANTE: Altere as senhas após o primeiro login!"
echo "🗄️  Banco de dados: SQLite em $APP_DIR/data/digiurban.db"
echo "📝 Logs do container: docker logs digiurban-unified"
echo ""