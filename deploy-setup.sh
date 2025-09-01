#!/bin/bash

# ====================================================================
# 🔧 SCRIPT DE SETUP NA VPS - DIGIURBAN
# ====================================================================
# Script para configurar o DigiUrban na VPS 72.60.10.108
# Execute este script diretamente na VPS após extrair os arquivos
# ====================================================================

set -e

# Configurações
APP_DIR="/var/www/digiurban"
SERVICE_NAME="digiurban"
DOMAIN="www.digiurban.com.br"
NODE_VERSION="20"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Configurando DigiUrban na VPS...${NC}"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    error "Execute como root: sudo ./deploy-setup.sh"
    exit 1
fi

# Atualizar sistema
log "Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências do sistema
log "Instalando dependências..."
apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx ufw

# Instalar Node.js
log "Instalando Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs

# Verificar instalações
log "Verificando instalações..."
node --version
npm --version
nginx -v

# Configurar firewall
log "Configurando firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Criar usuário da aplicação (se não existir)
if ! id "digiurban" &>/dev/null; then
    log "Criando usuário da aplicação..."
    useradd -m -s /bin/bash digiurban
    usermod -aG sudo digiurban
fi

# Criar diretório da aplicação
log "Configurando diretório da aplicação..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/backend/data
mkdir -p $APP_DIR/frontend
mkdir -p /var/log/digiurban

# Copiar arquivos
log "Copiando arquivos da aplicação..."
cp -r backend/dist $APP_DIR/backend/
cp backend/package*.json $APP_DIR/backend/
cp -r backend/src/database/migrations $APP_DIR/backend/
cp -r frontend/dist $APP_DIR/frontend/
cp .env.production $APP_DIR/.env

# Definir permissões
log "Configurando permissões..."
chown -R digiurban:digiurban $APP_DIR
chown -R digiurban:digiurban /var/log/digiurban
chmod -R 755 $APP_DIR

# Instalar dependências do Node.js
log "Instalando dependências do Node.js..."
cd $APP_DIR/backend
sudo -u digiurban npm ci --only=production

# Configurar serviço systemd
log "Configurando serviço systemd..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=DigiUrban Application
Documentation=https://github.com/digiurban/digiurban
After=network.target

[Service]
Type=simple
User=digiurban
WorkingDirectory=$APP_DIR/backend
Environment=NODE_ENV=production
Environment=PORT=3021
EnvironmentFile=$APP_DIR/.env
ExecStart=/usr/bin/node dist/app.js
Restart=always
RestartSec=10
KillMode=mixed
KillSignal=SIGINT
TimeoutStopSec=5
SyslogIdentifier=digiurban
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Configurar Nginx
log "Configurando Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN digiurban.com.br;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN digiurban.com.br;

    # Certificados SSL (serão criados pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Configurações SSL modernas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.resend.com;" always;

    # Gzip
    gzip on;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Root para arquivos estáticos
    root $APP_DIR/frontend/dist;
    index index.html index.htm;

    # API - Proxy para backend
    location /api/ {
        proxy_pass http://localhost:3021/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://$DOMAIN" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With" always;
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Arquivos estáticos do frontend
    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Assets com cache longo
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security.txt
    location = /.well-known/security.txt {
        return 200 "Contact: admin@$DOMAIN\nExpires: 2025-12-31T23:59:59.000Z\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Habilitar site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
log "Testando configuração do Nginx..."
nginx -t

# Executar migrações do banco
log "Executando migrações do banco de dados..."
cd $APP_DIR/backend
sudo -u digiurban NODE_ENV=production node -e "
const { runMigrations } = require('./dist/database/migrationRunner.js');
runMigrations().catch(console.error);
"

# Habilitar e iniciar serviços
log "Habilitando serviços..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME
systemctl reload nginx

# Verificar status
log "Verificando status dos serviços..."
systemctl is-active $SERVICE_NAME
systemctl is-active nginx

# Configurar SSL com Let's Encrypt
log "Configurando SSL com Let's Encrypt..."
warn "Executando Certbot para obter certificados SSL..."
certbot --nginx -d $DOMAIN -d digiurban.com.br --non-interactive --agree-tos --email admin@$DOMAIN --redirect

# Configurar renovação automática
log "Configurando renovação automática do SSL..."
crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | crontab -

# Status final
echo -e "${BLUE}🎉 Setup concluído com sucesso!${NC}"
echo ""
echo -e "${GREEN}📊 Status dos serviços:${NC}"
systemctl status $SERVICE_NAME --no-pager -l
echo ""
echo -e "${GREEN}📍 URLs disponíveis:${NC}"
echo "   • Produção: https://$DOMAIN"
echo "   • API: https://$DOMAIN/api/health"
echo ""
echo -e "${GREEN}🔧 Comandos úteis:${NC}"
echo "   • Ver logs: journalctl -u $SERVICE_NAME -f"
echo "   • Reiniciar: systemctl restart $SERVICE_NAME"
echo "   • Status: systemctl status $SERVICE_NAME"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "1. Configure as variáveis de ambiente em $APP_DIR/.env"
echo "2. Especialmente: RESEND_API_KEY, JWT_SECRET, COOKIE_SECRET"
echo "3. Reinicie o serviço após configurar: systemctl restart $SERVICE_NAME"