#!/bin/bash

# ====================================================================
# 🚀 SCRIPT DE DEPLOY - DIGIURBAN
# ====================================================================
# Deploy automatizado para VPS 72.60.10.108
# Domínio: www.digiurban.com.br
# ====================================================================

set -e  # Parar em caso de erro

# Configurações
VPS_IP="72.60.10.108"
VPS_USER="root"  # Ajustar conforme necessário
APP_DIR="/var/www/digiurban"
DOMAIN="www.digiurban.com.br"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando deploy do DigiUrban para produção...${NC}"

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Verificar se a VPS está acessível
log "Testando conectividade com VPS $VPS_IP..."
if ping -c 1 $VPS_IP &> /dev/null; then
    log "VPS $VPS_IP está acessível"
else
    error "VPS $VPS_IP não está acessível"
    exit 1
fi

# Build local
log "Fazendo build da aplicação..."
npm run install:all
cd frontend && npm run build && cd ..
cd backend && npm run build && cd ..

# Criar arquivo de deploy
log "Criando pacote de deploy..."
tar -czf digiurban-deploy.tar.gz \
    backend/dist \
    backend/package*.json \
    backend/src/database/migrations \
    frontend/dist \
    .env.production \
    package.json \
    deploy-setup.sh \
    nginx-config.conf \
    digiurban.service \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=*.log

log "Pacote de deploy criado: digiurban-deploy.tar.gz"

echo -e "${BLUE}📋 Deploy preparado com sucesso!${NC}"
echo -e "${YELLOW}Próximos passos para deploy na VPS:${NC}"
echo ""
echo -e "${GREEN}1. Copiar arquivos para VPS:${NC}"
echo "   scp digiurban-deploy.tar.gz $VPS_USER@$VPS_IP:/tmp/"
echo ""
echo -e "${GREEN}2. Conectar na VPS e extrair:${NC}"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   cd /tmp && tar -xzf digiurban-deploy.tar.gz"
echo ""
echo -e "${GREEN}3. Executar setup na VPS:${NC}"
echo "   chmod +x deploy-setup.sh && ./deploy-setup.sh"
echo ""
echo -e "${GREEN}4. URLs após deploy:${NC}"
echo "   • Produção: https://$DOMAIN"
echo "   • API: https://$DOMAIN/api"
echo "   • Health: https://$DOMAIN/api/health"