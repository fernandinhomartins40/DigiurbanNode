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
VPS_USER="root"
APP_DIR="/root/digiurban-unified"
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

# Build da aplicação
log "Fazendo build da aplicação..."
docker build -t digiurban-app .

# Salvar imagem Docker
log "Salvando imagem Docker..."
docker save digiurban-app | gzip > digiurban-app.tar.gz

# Deploy automático na VPS
log "Copiando arquivos para VPS..."
scp digiurban-app.tar.gz docker-compose.yml $VPS_USER@$VPS_IP:$APP_DIR/

log "Executando deploy na VPS..."
ssh $VPS_USER@$VPS_IP << EOF
cd $APP_DIR
docker load -i digiurban-app.tar.gz
docker compose down
docker compose up -d
docker system prune -f
rm digiurban-app.tar.gz
EOF

# Verificar se está rodando
log "Verificando status da aplicação..."
sleep 10
if curl -s https://$DOMAIN/health > /dev/null; then
    log "✅ Deploy realizado com sucesso!"
    echo -e "${GREEN}URLs disponíveis:${NC}"
    echo "   • Produção: https://$DOMAIN"
    echo "   • API: https://$DOMAIN/api"
    echo "   • Health: https://$DOMAIN/health"
else
    error "Aplicação não está respondendo em https://$DOMAIN"
    exit 1
fi

# Limpar arquivos locais
log "Limpando arquivos temporários..."
rm -f digiurban-app.tar.gz