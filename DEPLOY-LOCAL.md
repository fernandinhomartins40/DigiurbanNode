# 🚀 Deploy Local - DigiUrban Unified

Script para deploy local via SSH que permite acompanhar o progresso em tempo real, sem depender do GitHub Actions.

## 📋 Pré-requisitos

### Linux/Ubuntu/WSL:
```bash
sudo apt-get install sshpass rsync curl jq
```

### macOS:
```bash
brew install sshpass rsync curl jq
```

### Windows (WSL/Git Bash):
```bash
# Use WSL ou Git Bash
# Instale via package manager do sistema
```

## ⚙️ Configuração

### 1. Configure as variáveis de ambiente:

```bash
# Copie o arquivo de exemplo
cp .env.deploy.example .env.deploy

# Configure sua senha VPS
nano .env.deploy
```

### 2. Carregue as configurações:

```bash
source .env.deploy
```

### 3. Torne o script executável:

```bash
chmod +x deploy-local.sh
```

## 🚀 Execução

### Deploy completo:
```bash
./deploy-local.sh
```

### Deploy com logs detalhados:
```bash
./deploy-local.sh 2>&1 | tee deploy-$(date +%Y%m%d-%H%M%S).log
```

## 📊 Monitoramento

O script mostra:

- ✅ **Progresso visual** com barra de progresso
- 🕐 **Timestamps** para cada etapa
- 🎨 **Logs coloridos** por tipo de evento
- 📈 **Tempo total** de deploy
- 🔍 **Health checks** automáticos
- 📋 **Status final** dos serviços

### Exemplo de output:
```
[10:30:15] 🚀 INICIANDO DEPLOY DIGIURBAN UNIFIED SYSTEM
[10:30:16] ✅ Conexão SSH estabelecida
[10:30:17] 🔧 Executando build local do backend...
[10:30:45] ✅ Build do backend concluído
[10:30:46] 🔧 Executando build local do frontend...
[10:31:20] ✅ Build do frontend concluído
[10:31:21] 🔧 Transferindo código para VPS...
█████████████████████ 100% - Deploy concluído
[10:35:42] 🎉 DEPLOY CONCLUÍDO COM SUCESSO!
[10:35:42] ✅ Tempo total: 00:05:27
[10:35:42] ✅ Aplicação: http://72.60.10.108:3020
```

## 🔧 Comandos Úteis Pós-Deploy

### Monitorar logs em tempo real:
```bash
sshpass -p "$VPS_PASSWORD" ssh root@72.60.10.108 'cd /root/digiurban-unified && docker compose logs -f'
```

### Reiniciar serviços:
```bash
sshpass -p "$VPS_PASSWORD" ssh root@72.60.10.108 'cd /root/digiurban-unified && docker compose restart'
```

### Status dos containers:
```bash
sshpass -p "$VPS_PASSWORD" ssh root@72.60.10.108 'docker ps'
```

### Acessar container:
```bash
sshpass -p "$VPS_PASSWORD" ssh root@72.60.10.108 'docker exec -it digiurban-unified bash'
```

## 🛠️ Etapas do Deploy

O script executa as seguintes etapas:

1. **🔍 Verificações pré-deploy**
   - Dependências locais
   - Conexão SSH
   - Estrutura do projeto

2. **🏗️ Build local**
   - Backend (npm install, prisma generate, build)
   - Frontend (npm install, build)

3. **🧹 Preparação VPS**
   - Atualização de dependências
   - Limpeza de containers antigos

4. **📤 Transferência**
   - Rsync com progresso
   - Exclusão de node_modules

5. **🐳 Container**
   - Build da imagem Docker
   - Inicialização dos serviços

6. **🗃️ Banco de dados**
   - Limpeza de banco anterior
   - Execução de migrations
   - Criação do super admin

7. **🏥 Health checks**
   - Verificação do backend
   - Verificação do frontend
   - Status final

## 🔒 Segurança

- ⚠️ **NUNCA** commite o arquivo `.env.deploy` com senhas reais
- 🔐 Use senhas fortes para o VPS
- 🛡️ Configure firewall adequadamente
- 🔄 Considere usar chaves SSH em produção

## 🐛 Troubleshooting

### Erro de conexão SSH:
```bash
# Teste manual
sshpass -p "$VPS_PASSWORD" ssh root@72.60.10.108 "echo 'Conexão OK'"
```

### Build falhando:
```bash
# Limpe caches locais
rm -rf backend/node_modules frontend/node_modules
rm -rf backend/dist frontend/dist
```

### Container não iniciando:
```bash
# Verifique logs
sshpass -p "$VPS_PASSWORD" ssh root@72.60.10.108 'cd /root/digiurban-unified && docker compose logs'
```

## 📈 Vantagens vs GitHub Actions

| Aspecto | Deploy Local | GitHub Actions |
|---------|-------------|---------------|
| **Velocidade** | ⚡ Imediato | ⏳ Fila de execução |
| **Debug** | 🔍 Tempo real | 📝 Logs posteriores |
| **Controle** | 🎮 Total | 🤖 Automatizado |
| **Rede** | 🌐 Direta | 🔄 Via GitHub |
| **Iteração** | 🔄 Rápida | ⏳ Commit obrigatório |

Use este script para deploys de desenvolvimento e testes rápidos!