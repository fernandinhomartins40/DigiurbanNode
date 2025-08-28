#!/bin/bash
# ====================================================================
# 🚀 SCRIPT DE DEPLOY - DIGIURBAN SYSTEM
# ====================================================================
# Deploy automatizado para produção na VPS
# ====================================================================

set -e

echo "🚀 Iniciando deploy do DigiUrban..."

# Parar containers existentes
echo "🔄 Parando containers existentes..."
docker-compose down

# Rebuildar imagens
echo "🏗️ Rebuilding images..."
docker-compose build --no-cache

# Subir containers
echo "🌟 Subindo containers..."
docker-compose up -d

# Verificar status
echo "📊 Verificando status dos containers..."
docker-compose ps

echo "✅ Deploy concluído!"
echo ""
echo "📍 URLs disponíveis:"
echo "   • Frontend: http://localhost:3020"
echo "   • Backend API: http://localhost:3021/api"
echo "   • Health Check: http://localhost:3021/api/health"
echo ""
echo "🔑 Credenciais de teste:"
echo "   • Super Admin: superadmin@digiurban.com / DigiUrban@2025!"
echo "   • Admin: admin@dev.digiurban.com / admin123"