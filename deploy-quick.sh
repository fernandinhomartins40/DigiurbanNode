#!/bin/bash

# ====================================================================
# 🚀 DEPLOY RÁPIDO - DIGIURBAN
# ====================================================================
# Deploy direto sem verificações extensas
# ====================================================================

set -e

# Configurações
VPS_IP="72.60.10.108"
VPS_USER="root"
APP_DIR="/root/digiurban-unified"
DOMAIN="www.digiurban.com.br"

echo "🚀 Iniciando deploy rápido..."

# Build e deploy
echo "📦 Fazendo build da aplicação..."
docker build -t digiurban-app .

echo "💾 Salvando imagem..."
docker save digiurban-app | gzip > digiurban-app.tar.gz

echo "🌐 Enviando para VPS..."
scp digiurban-app.tar.gz docker-compose.yml root@72.60.10.108:/root/digiurban-unified/

echo "🔄 Atualizando na VPS..."
ssh root@72.60.10.108 << 'EOF'
cd /root/digiurban-unified
docker load -i digiurban-app.tar.gz
docker compose down
docker compose up -d
docker system prune -f
rm digiurban-app.tar.gz
EOF

echo "✅ Deploy concluído!"
echo "🌐 Aplicação: https://www.digiurban.com.br"

# Limpeza
rm -f digiurban-app.tar.gz

echo "✨ Pronto! Aplicação atualizada e rodando."