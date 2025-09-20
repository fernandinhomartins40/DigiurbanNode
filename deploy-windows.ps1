# ====================================================================
# 🚀 DEPLOY WINDOWS - DIGIURBAN UNIFIED SYSTEM
# ====================================================================
# Script PowerShell para deploy no Windows
# ====================================================================

param(
    [string]$VpsPassword = "Nando157940/"
)

# Configurações
$VPS_HOST = "72.60.10.108"
$VPS_USER = "root"
$APP_DIR = "/root/digiurban-unified"
$APP_PORT = "3020"
$CONTAINER_NAME = "digiurban-unified"

$DEPLOY_START_TIME = Get-Date

# Função para logs coloridos
function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )

    $timestamp = Get-Date -Format "HH:mm:ss"

    switch ($Level) {
        "INFO"    { Write-Host "[$timestamp] ℹ️  $Message" -ForegroundColor Blue }
        "SUCCESS" { Write-Host "[$timestamp] ✅ $Message" -ForegroundColor Green }
        "WARN"    { Write-Host "[$timestamp] ⚠️  $Message" -ForegroundColor Yellow }
        "ERROR"   { Write-Host "[$timestamp] ❌ $Message" -ForegroundColor Red }
        "STEP"    { Write-Host "[$timestamp] 🔧 $Message" -ForegroundColor Magenta }
        "DEPLOY"  { Write-Host "[$timestamp] 🚀 $Message" -ForegroundColor Cyan }
    }
}

# Função SSH
function Invoke-SSH {
    param(
        [string]$Command,
        [string]$Description = ""
    )

    if ($Description) {
        Write-Log "STEP" $Description
    }

    $sshCommand = "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 $VPS_USER@$VPS_HOST `"$Command`""

    # Usar plink se disponível (PuTTY), senão usar ssh nativo do Windows
    if (Get-Command plink -ErrorAction SilentlyContinue) {
        $result = echo $VpsPassword | plink -ssh -pw $VpsPassword $VPS_USER@$VPS_HOST $Command
    } else {
        # Tentar com ssh nativo (requer configuração de chave)
        $result = ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST $Command
    }

    return $result
}

Write-Log "DEPLOY" "INICIANDO DEPLOY DIGIURBAN UNIFIED SYSTEM"
Write-Host "=============================================="
Write-Log "INFO" "Target: $VPS_HOST`:$APP_PORT"
Write-Log "INFO" "Container: $CONTAINER_NAME"
Write-Log "INFO" "Timestamp: $((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ss UTC'))"
Write-Host "=============================================="

# Verificar dependências
Write-Log "STEP" "Verificando dependências..."

$hasSSH = Get-Command ssh -ErrorAction SilentlyContinue
$hasPlink = Get-Command plink -ErrorAction SilentlyContinue

if (-not $hasSSH -and -not $hasPlink) {
    Write-Log "ERROR" "SSH não encontrado. Instale OpenSSH ou PuTTY"
    Write-Log "INFO" "Para instalar OpenSSH: Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0"
    exit 1
}

if ($hasPlink) {
    Write-Log "SUCCESS" "PuTTY plink encontrado"
} elseif ($hasSSH) {
    Write-Log "SUCCESS" "OpenSSH encontrado"
    Write-Log "WARN" "Usando SSH nativo - certifique-se de ter chaves configuradas"
}

# Testar conexão
Write-Log "STEP" "Testando conexão SSH..."
try {
    if ($hasPlink) {
        $testResult = echo $VpsPassword | plink -ssh -batch -pw $VpsPassword $VPS_USER@$VPS_HOST "echo 'SSH OK'"
    } else {
        $testResult = ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'SSH OK'"
    }

    if ($testResult -match "SSH OK") {
        Write-Log "SUCCESS" "Conexão SSH estabelecida"
    } else {
        throw "Conexão falhou"
    }
} catch {
    Write-Log "ERROR" "Falha na conexão SSH: $($_.Exception.Message)"
    exit 1
}

# Verificar estrutura local
Write-Log "STEP" "Verificando estrutura do projeto..."

if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Log "ERROR" "Diretórios backend ou frontend não encontrados"
    exit 1
}

if (-not (Test-Path "schema.prisma")) {
    Write-Log "ERROR" "Schema Prisma não encontrado na raiz"
    exit 1
}

if (-not (Test-Path "Dockerfile") -or -not (Test-Path "docker-compose.yml")) {
    Write-Log "ERROR" "Arquivos Docker não encontrados"
    exit 1
}

Write-Log "SUCCESS" "Estrutura do projeto validada"

# Build local
Write-Log "STEP" "Executando build local do backend..."
try {
    Set-Location backend
    npm install --no-optional
    npm run db:generate
    npm run build
    Set-Location ..
    Write-Log "SUCCESS" "Build do backend concluído"
} catch {
    Write-Log "ERROR" "Falha no build do backend: $($_.Exception.Message)"
    Set-Location ..
    exit 1
}

Write-Log "STEP" "Executando build local do frontend..."
try {
    Set-Location frontend
    npm install
    npm run build
    Set-Location ..
    Write-Log "SUCCESS" "Build do frontend concluído"
} catch {
    Write-Log "ERROR" "Falha no build do frontend: $($_.Exception.Message)"
    Set-Location ..
    exit 1
}

# Preparar VPS
Write-Log "STEP" "Preparando ambiente na VPS..."
$prepareCommand = @"
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
"@

try {
    if ($hasPlink) {
        echo $VpsPassword | plink -ssh -batch -pw $VpsPassword $VPS_USER@$VPS_HOST $prepareCommand
    } else {
        ssh $VPS_USER@$VPS_HOST $prepareCommand
    }
    Write-Log "SUCCESS" "Ambiente VPS preparado"
} catch {
    Write-Log "ERROR" "Falha na preparação da VPS: $($_.Exception.Message)"
}

# Limpeza
Write-Log "STEP" "Limpando containers antigos..."
$cleanCommand = @"
echo '🛑 Parando containers DigiUrban...'
docker stop digiurban-frontend digiurban-backend $CONTAINER_NAME 2>/dev/null || echo 'Nenhum container rodando'
docker rm digiurban-frontend digiurban-backend $CONTAINER_NAME 2>/dev/null || echo 'Nenhum container para remover'

echo '🗑️  Removendo imagens antigas...'
docker rmi digiurban-frontend:latest digiurban-backend:latest digiurban-unified:latest 2>/dev/null || echo 'Nenhuma imagem para remover'

echo '📁 Preparando diretório...'
rm -rf $APP_DIR
mkdir -p $APP_DIR
echo '✅ Limpeza concluída'
"@

try {
    if ($hasPlink) {
        echo $VpsPassword | plink -ssh -batch -pw $VpsPassword $VPS_USER@$VPS_HOST $cleanCommand
    } else {
        ssh $VPS_USER@$VPS_HOST $cleanCommand
    }
    Write-Log "SUCCESS" "Limpeza concluída"
} catch {
    Write-Log "WARN" "Alguns erros na limpeza (normal se primeira execução)"
}

Write-Log "INFO" "Deploy em progresso via PowerShell..."
Write-Log "WARN" "Para transferência de arquivos, use WinSCP ou configure rsync no Windows"
Write-Log "INFO" "Continuando com comandos remotos..."

# Verificar se conseguiu conectar
$DEPLOY_END_TIME = Get-Date
$DEPLOY_DURATION = ($DEPLOY_END_TIME - $DEPLOY_START_TIME).TotalSeconds
$DURATION_FORMATTED = "{0:mm\:ss}" -f ([TimeSpan]::FromSeconds($DEPLOY_DURATION))

Write-Host ""
Write-Log "SUCCESS" "Script PowerShell executado!"
Write-Log "INFO" "Tempo decorrido: $DURATION_FORMATTED"
Write-Log "INFO" "Para deploy completo, configure rsync/WinSCP ou use WSL com sshpass"