#!/bin/bash

# ====================================================================
# 🚀 DEPLOY LOCAL - DIGIURBAN UNIFIED SYSTEM
# ====================================================================
# Execute deployments localmente e acompanhe em tempo real
# Requer: sshpass, rsync, curl, jq
# ====================================================================

set -e

# ====================================================================
# CONFIGURAÇÕES E VARIÁVEIS
# ====================================================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configurações do servidor (mesmas do workflow)
VPS_HOST="${VPS_HOST:-72.60.10.108}"
VPS_USER="${VPS_USER:-root}"
APP_DIR="${APP_DIR:-/root/digiurban-unified}"
APP_PORT="${APP_PORT:-3020}"
CONTAINER_NAME="${CONTAINER_NAME:-digiurban-unified}"

# Verificar senha VPS
if [ -z "$VPS_PASSWORD" ]; then
    echo -e "${RED}❌ ERRO: Variável VPS_PASSWORD não definida${NC}"
    echo -e "${YELLOW}💡 Configure com: export VPS_PASSWORD='sua-senha'${NC}"
    exit 1
fi

# Tracking de tempo
DEPLOY_START_TIME=$(date +%s)

# ====================================================================
# FUNÇÕES UTILITÁRIAS
# ====================================================================

# Função para logs coloridos
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%H:%M:%S')

    case $level in
        "INFO")  echo -e "${BLUE}[${timestamp}] ℹ️  ${message}${NC}" ;;
        "SUCCESS") echo -e "${GREEN}[${timestamp}] ✅ ${message}${NC}" ;;
        "WARN")  echo -e "${YELLOW}[${timestamp}] ⚠️  ${message}${NC}" ;;
        "ERROR") echo -e "${RED}[${timestamp}] ❌ ${message}${NC}" ;;
        "STEP")  echo -e "${PURPLE}[${timestamp}] 🔧 ${message}${NC}" ;;
        "DEPLOY") echo -e "${CYAN}[${timestamp}] 🚀 ${message}${NC}" ;;
    esac
}

# Função para executar comandos SSH
ssh_exec() {
    local command="$1"
    local description="$2"

    if [ -n "$description" ]; then
        log "STEP" "$description"
    fi

    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$VPS_USER@$VPS_HOST" "$command"
}

# Função para rsync
rsync_transfer() {
    local source="$1"
    local destination="$2"
    local description="$3"

    log "STEP" "$description"
    sshpass -p "$VPS_PASSWORD" rsync -avz --progress --delete \
        --exclude='.git/' \
        --exclude='node_modules/' \
        --exclude='frontend/node_modules/' \
        --exclude='backend/node_modules/' \
        --exclude='.claude/' \
        -e "ssh -o StrictHostKeyChecking=no" \
        "$source" "$VPS_USER@$VPS_HOST:$destination"
}

# Função para health check
health_check() {
    local url="$1"
    local name="$2"
    local max_attempts=20
    local delay=15

    log "INFO" "Verificando $name..."

    for attempt in $(seq 1 $max_attempts); do
        local total_wait=$((attempt * delay))
        log "INFO" "Tentativa $attempt/$max_attempts (${total_wait}s total) - $name"

        if curl -f -s "$url" >/dev/null 2>&1; then
            log "SUCCESS" "$name: Respondendo corretamente"
            return 0
        fi

        if [ $attempt -lt $max_attempts ]; then
            sleep $delay
        fi
    done

    log "ERROR" "$name: Falhou após $max_attempts tentativas"
    return 1
}

# Função para mostrar progresso
show_progress() {
    local current=$1
    local total=$2
    local step_name="$3"

    local percent=$((current * 100 / total))
    local filled=$((percent / 5))
    local empty=$((20 - filled))

    printf "\r${CYAN}[%s] %s [" "$(date '+%H:%M:%S')"
    printf "%*s" $filled | tr ' ' '█'
    printf "%*s" $empty | tr ' ' '░'
    printf "] %d%% - %s${NC}" $percent "$step_name"

    if [ $current -eq $total ]; then
        echo
    fi
}

# ====================================================================
# VERIFICAÇÕES PRÉ-DEPLOY
# ====================================================================

log "DEPLOY" "INICIANDO DEPLOY DIGIURBAN UNIFIED SYSTEM"
echo "=============================================="
log "INFO" "Target: $VPS_HOST:$APP_PORT"
log "INFO" "Container: $CONTAINER_NAME"
log "INFO" "Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "=============================================="

# Verificar dependências
log "STEP" "Verificando dependências locais..."
for cmd in sshpass rsync curl jq; do
    if ! command -v $cmd >/dev/null 2>&1; then
        log "ERROR" "Comando '$cmd' não encontrado. Instale: sudo apt-get install $cmd"
        exit 1
    fi
done
log "SUCCESS" "Todas as dependências encontradas"

# Testar conexão SSH
log "STEP" "Testando conexão SSH..."
if ssh_exec "echo 'SSH funcionando'" >/dev/null 2>&1; then
    log "SUCCESS" "Conexão SSH estabelecida"
else
    log "ERROR" "Falha na conexão SSH"
    exit 1
fi

# ====================================================================
# ANÁLISE PRÉ-DEPLOY
# ====================================================================

log "STEP" "Analisando estrutura do projeto local..."
show_progress 1 12 "Verificando arquivos locais"

if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    log "ERROR" "Diretórios backend ou frontend não encontrados"
    exit 1
fi

if [ ! -f "schema.prisma" ]; then
    log "ERROR" "Schema Prisma não encontrado na raiz"
    exit 1
fi

if [ ! -f "Dockerfile" ] || [ ! -f "docker-compose.yml" ]; then
    log "ERROR" "Arquivos Docker não encontrados"
    exit 1
fi

log "SUCCESS" "Estrutura do projeto validada"

# ====================================================================
# BUILD LOCAL
# ====================================================================

show_progress 2 12 "Build local do backend"
log "STEP" "Executando build local do backend..."
cd backend
if npm install --no-optional && npm run db:generate && npm run build; then
    log "SUCCESS" "Build do backend concluído"
else
    log "ERROR" "Falha no build do backend"
    exit 1
fi
cd ..

show_progress 3 12 "Build local do frontend"
log "STEP" "Executando build local do frontend..."
cd frontend
if npm install && npm run build; then
    log "SUCCESS" "Build do frontend concluído"
else
    log "ERROR" "Falha no build do frontend"
    exit 1
fi
cd ..

# ====================================================================
# PREPARAÇÃO DA VPS
# ====================================================================

show_progress 4 12 "Preparando ambiente VPS"
log "STEP" "Preparando ambiente na VPS..."

ssh_exec "
    echo '🔄 Atualizando sistema...'
    apt-get update -y >/dev/null 2>&1 || echo 'Falha na atualização'

    echo '🟢 Verificando Node.js...'
    if ! command -v node >/dev/null 2>&1; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
        apt-get install -y nodejs >/dev/null 2>&1
    fi

    echo '🐳 Verificando Docker...'
    if ! command -v docker >/dev/null 2>&1; then
        apt-get install -y docker.io docker-compose-plugin >/dev/null 2>&1
        systemctl start docker
        systemctl enable docker
    fi

    echo '✅ Ambiente preparado'
" "Configurando dependências na VPS"

# ====================================================================
# LIMPEZA DE CONTAINERS
# ====================================================================

show_progress 5 12 "Removendo containers antigos"
log "STEP" "Limpando containers e imagens antigas..."

ssh_exec "
    echo '🛑 Parando containers DigiUrban...'
    docker stop digiurban-frontend digiurban-backend $CONTAINER_NAME 2>/dev/null || echo 'Nenhum container rodando'
    docker rm digiurban-frontend digiurban-backend $CONTAINER_NAME 2>/dev/null || echo 'Nenhum container para remover'

    echo '🗑️  Removendo imagens antigas...'
    docker rmi digiurban-frontend:latest digiurban-backend:latest digiurban-unified:latest 2>/dev/null || echo 'Nenhuma imagem para remover'

    echo '📁 Preparando diretório...'
    rm -rf $APP_DIR
    mkdir -p $APP_DIR
    echo '✅ Limpeza concluída'
" "Limpando ambiente"

# ====================================================================
# TRANSFERÊNCIA DE CÓDIGO
# ====================================================================

show_progress 6 12 "Transferindo código"
log "STEP" "Transferindo código para VPS..."
rsync_transfer "./" "$APP_DIR/" "Sincronizando arquivos"
log "SUCCESS" "Código transferido com sucesso"

# ====================================================================
# BUILD E DEPLOY DO CONTAINER
# ====================================================================

show_progress 7 12 "Construindo container"
log "STEP" "Construindo container na VPS..."

ssh_exec "
    cd $APP_DIR
    echo '🏗️ Construindo container...'
    if docker compose build --no-cache; then
        echo '✅ Container construído'
    else
        echo '❌ Falha na construção'
        exit 1
    fi
" "Construindo imagem Docker"

show_progress 8 12 "Iniciando container"
log "STEP" "Iniciando container..."

ssh_exec "
    cd $APP_DIR
    if docker compose up -d; then
        echo '✅ Container iniciado'
        docker compose ps
    else
        echo '❌ Falha ao iniciar'
        exit 1
    fi
" "Iniciando serviços"

# ====================================================================
# MIGRATIONS
# ====================================================================

show_progress 9 12 "Executando migrations"
log "STEP" "Executando migrations do banco..."

ssh_exec "
    cd $APP_DIR
    echo '🧹 Limpando banco anterior...'
    docker exec $CONTAINER_NAME sh -c 'rm -f /app/data/digiurban.db* 2>/dev/null || echo \"Nenhum banco para limpar\"'

    echo '🚀 Executando migrations...'
    sleep 10

    if docker exec -e NODE_ENV=production -e DATABASE_URL=\"file:/app/data/digiurban.db\" $CONTAINER_NAME sh -c 'cd /app/backend && npm run db:migrate:deploy'; then
        echo '✅ Migrations executadas'

        echo '🎯 Criando super admin...'
        docker exec -e NODE_ENV=production -e DATABASE_URL=\"file:/app/data/digiurban.db\" -e INITIAL_ADMIN_EMAIL=admin@digiurban.com.br -e INITIAL_ADMIN_PASSWORD=SuperAdmin2024 -e INITIAL_ADMIN_NAME=\"Super Administrador\" $CONTAINER_NAME sh -c 'cd /app/backend && npm run db:seed' || echo '⚠️ Super admin pode já existir'
    else
        echo '❌ Falha nas migrations'
        docker logs $CONTAINER_NAME --tail 50
        exit 1
    fi
" "Configurando banco de dados"

# ====================================================================
# HEALTH CHECKS
# ====================================================================

show_progress 10 12 "Aguardando inicialização"
log "INFO" "Aguardando inicialização completa (60s)..."
sleep 60

show_progress 11 12 "Verificando saúde dos serviços"
if health_check "http://$VPS_HOST:$APP_PORT/api/health" "Backend API"; then
    log "SUCCESS" "Backend está funcionando!"
else
    log "ERROR" "Backend não está respondendo"
    ssh_exec "cd $APP_DIR && docker compose logs --tail=50" "Coletando logs de erro"
    exit 1
fi

if health_check "http://$VPS_HOST:$APP_PORT/" "Frontend"; then
    log "SUCCESS" "Frontend está funcionando!"
else
    log "WARN" "Frontend pode estar carregando ainda..."
fi

# ====================================================================
# FINALIZAÇÃO
# ====================================================================

show_progress 12 12 "Deploy concluído"

DEPLOY_END_TIME=$(date +%s)
DEPLOY_DURATION=$((DEPLOY_END_TIME - DEPLOY_START_TIME))
DURATION_FORMATTED=$(printf '%02d:%02d:%02d' $((DEPLOY_DURATION/3600)) $((DEPLOY_DURATION%3600/60)) $((DEPLOY_DURATION%60)))

echo ""
echo "🎉🎉🎉 DEPLOY CONCLUÍDO COM SUCESSO! 🎉🎉🎉"
echo "=============================================="
log "SUCCESS" "Tempo total: $DURATION_FORMATTED"
log "SUCCESS" "Aplicação: http://$VPS_HOST:$APP_PORT"
log "SUCCESS" "Health Check: http://$VPS_HOST:$APP_PORT/api/health"
log "SUCCESS" "Status: ONLINE ✅"

# Status final
log "INFO" "Coletando status final dos serviços..."
ssh_exec "
    cd $APP_DIR
    echo '📊 Status dos containers:'
    docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    echo ''
    echo '💾 Uso de recursos:'
    docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}' 2>/dev/null || echo 'Stats não disponíveis'
" "Status final"

echo ""
echo "🔧 Para monitorar logs em tempo real:"
echo "   sshpass -p '\$VPS_PASSWORD' ssh $VPS_USER@$VPS_HOST 'cd $APP_DIR && docker compose logs -f'"
echo ""
echo "🔄 Para reiniciar serviços:"
echo "   sshpass -p '\$VPS_PASSWORD' ssh $VPS_USER@$VPS_HOST 'cd $APP_DIR && docker compose restart'"
echo ""

log "SUCCESS" "Deploy local concluído! 🚀"