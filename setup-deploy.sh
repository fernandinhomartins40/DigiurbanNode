#!/bin/bash

# ====================================================================
# 🔧 SETUP DE DEPLOY LOCAL - DIGIURBAN
# ====================================================================
# Script para configurar o ambiente de deploy local
# ====================================================================

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "======================================================================"
echo "🔧 SETUP DE DEPLOY LOCAL - DIGIURBAN UNIFIED"
echo "======================================================================"
echo -e "${NC}"

# Verificar se arquivo .env.deploy existe
if [ -f ".env.deploy" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env.deploy já existe!${NC}"
    read -p "Deseja sobrescrever? (y/N): " overwrite
    if [[ ! $overwrite =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Mantendo configuração existente${NC}"
        exit 0
    fi
fi

# Copiar arquivo de exemplo
echo -e "${BLUE}📋 Criando arquivo de configuração...${NC}"
cp .env.deploy.example .env.deploy

# Solicitar configurações do usuário
echo ""
echo -e "${YELLOW}🔧 Configure os dados do seu servidor VPS:${NC}"
echo ""

# Host
read -p "🌐 Host/IP do VPS (padrão: 72.60.10.108): " vps_host
vps_host=${vps_host:-72.60.10.108}

# Usuário
read -p "👤 Usuário SSH (padrão: root): " vps_user
vps_user=${vps_user:-root}

# Senha
echo -e "${RED}🔐 ATENÇÃO: A senha será armazenada em texto plano em .env.deploy${NC}"
echo -e "${RED}   Certifique-se de que este arquivo não seja commitado!${NC}"
read -s -p "🔑 Senha SSH: " vps_password
echo ""

# Porta da aplicação
read -p "🚪 Porta da aplicação (padrão: 3020): " app_port
app_port=${app_port:-3020}

# Diretório
read -p "📁 Diretório no servidor (padrão: /root/digiurban-unified): " app_dir
app_dir=${app_dir:-/root/digiurban-unified}

# Nome do container
read -p "🐳 Nome do container (padrão: digiurban-unified): " container_name
container_name=${container_name:-digiurban-unified}

# Atualizar arquivo .env.deploy
echo ""
echo -e "${BLUE}📝 Atualizando configurações...${NC}"

sed -i.bak "s|VPS_HOST=.*|VPS_HOST=$vps_host|" .env.deploy
sed -i.bak "s|VPS_USER=.*|VPS_USER=$vps_user|" .env.deploy
sed -i.bak "s|VPS_PASSWORD=.*|VPS_PASSWORD=$vps_password|" .env.deploy
sed -i.bak "s|APP_PORT=.*|APP_PORT=$app_port|" .env.deploy
sed -i.bak "s|APP_DIR=.*|APP_DIR=$app_dir|" .env.deploy
sed -i.bak "s|CONTAINER_NAME=.*|CONTAINER_NAME=$container_name|" .env.deploy

# Remover backup
rm -f .env.deploy.bak

# Testar conexão SSH
echo ""
echo -e "${BLUE}🔍 Testando conexão SSH...${NC}"

if command -v sshpass >/dev/null 2>&1; then
    if sshpass -p "$vps_password" ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$vps_user@$vps_host" "echo 'Conexão SSH OK'" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Conexão SSH funcionando!${NC}"
    else
        echo -e "${RED}❌ Falha na conexão SSH. Verifique as credenciais.${NC}"
        echo -e "${YELLOW}💡 Você pode testar manualmente com:${NC}"
        echo "   sshpass -p '$vps_password' ssh $vps_user@$vps_host"
    fi
else
    echo -e "${YELLOW}⚠️  sshpass não encontrado. Instale com:${NC}"
    echo "   sudo apt-get install sshpass  # Ubuntu/Debian"
    echo "   brew install sshpass          # macOS"
fi

# Verificar dependências
echo ""
echo -e "${BLUE}🔍 Verificando dependências...${NC}"

dependencies=("sshpass" "rsync" "curl" "jq")
missing=()

for dep in "${dependencies[@]}"; do
    if command -v "$dep" >/dev/null 2>&1; then
        echo -e "  ✅ $dep"
    else
        echo -e "  ❌ $dep"
        missing+=("$dep")
    fi
done

if [ ${#missing[@]} -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}💡 Para instalar dependências faltantes:${NC}"
    echo "   sudo apt-get install ${missing[*]}  # Ubuntu/Debian"
    echo "   brew install ${missing[*]}          # macOS"
fi

# Finalização
echo ""
echo -e "${GREEN}"
echo "🎉 SETUP CONCLUÍDO!"
echo "=================="
echo -e "${NC}"
echo -e "${GREEN}✅ Arquivo .env.deploy criado e configurado${NC}"
echo -e "${GREEN}✅ Script deploy-local.sh pronto para uso${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo ""
echo "1. Carregue as variáveis de ambiente:"
echo -e "${BLUE}   source .env.deploy${NC}"
echo ""
echo "2. Execute o deploy:"
echo -e "${BLUE}   ./deploy-local.sh${NC}"
echo ""
echo "3. Para monitorar logs em tempo real:"
echo -e "${BLUE}   ./deploy-local.sh 2>&1 | tee deploy-\$(date +%Y%m%d-%H%M%S).log${NC}"
echo ""
echo -e "${GREEN}🚀 Pronto para deploy! Boa sorte!${NC}"