# 🚀 Guia Completo de Deploy - DigiUrban

## Informações do Servidor

- **VPS IP**: 72.60.10.108
- **Domínio**: www.digiurban.com.br
- **DNS**: Já configurado apontando para o IP
- **E-mail**: Configurado com Resend.com para noreply@digiurban.com.br

## 📋 Pré-requisitos

### No Servidor Local (Desenvolvimento)
- [ ] Node.js 18+ instalado
- [ ] Git configurado
- [ ] Acesso SSH à VPS (chave ou senha)
- [ ] API Key do Resend.com

### Na VPS (Será configurado automaticamente)
- [ ] Ubuntu/Debian 20.04+
- [ ] Acesso root ou sudo
- [ ] Portas 80 e 443 disponíveis

## 🔧 Preparação Local

### 1. Gerar Secrets de Produção

```bash
cd DigiurbanNode
node generate-secrets.js
```

Este script irá gerar:
- JWT_SECRET
- JWT_REFRESH_SECRET  
- COOKIE_SECRET
- INITIAL_ADMIN_PASSWORD
- IDs únicos

**⚠️ IMPORTANTE**: Guarde estes secrets com segurança!

### 2. Configurar .env.production

Edite o arquivo `.env.production` com:

```bash
# Secrets gerados
JWT_SECRET=seu_jwt_secret_gerado
JWT_REFRESH_SECRET=seu_refresh_secret_gerado
COOKIE_SECRET=seu_cookie_secret_gerado

# API Key do Resend (obter em resend.com)
RESEND_API_KEY=re_sua_api_key_do_resend

# Configurações do Admin inicial
INITIAL_ADMIN_EMAIL=admin@digiurban.com.br
INITIAL_ADMIN_PASSWORD=sua_senha_forte_gerada
INITIAL_ADMIN_NAME=Administrador DigiUrban
```

### 3. Verificar Conectividade

```bash
# Testar conectividade
ping 72.60.10.108

# Testar DNS
nslookup www.digiurban.com.br
```

## 🚀 Deploy Automatizado

### Passo 1: Executar Script de Deploy

```bash
# No diretório do projeto
chmod +x deploy.sh
./deploy.sh
```

O script irá:
- ✅ Verificar conectividade com VPS
- ✅ Fazer build da aplicação (frontend + backend)
- ✅ Criar pacote `digiurban-deploy.tar.gz`
- ✅ Exibir instruções para VPS

### Passo 2: Copiar para VPS

```bash
# Copiar arquivos
scp digiurban-deploy.tar.gz root@72.60.10.108:/tmp/

# Conectar na VPS
ssh root@72.60.10.108
```

### Passo 3: Setup na VPS

```bash
# Na VPS
cd /tmp
tar -xzf digiurban-deploy.tar.gz
chmod +x deploy-setup.sh
./deploy-setup.sh
```

O script de setup irá:
- ✅ Atualizar o sistema
- ✅ Instalar Node.js, Nginx, Certbot
- ✅ Configurar firewall (UFW)
- ✅ Criar usuário da aplicação
- ✅ Instalar dependências Node.js
- ✅ Configurar serviço systemd
- ✅ Configurar Nginx com SSL
- ✅ Obter certificados Let's Encrypt
- ✅ Executar migrações do banco
- ✅ Iniciar serviços

## 🔍 Verificação Pós-Deploy

### URLs para Testar

```bash
# Health Check da API
curl https://www.digiurban.com.br/api/health

# Frontend
curl -I https://www.digiurban.com.br

# Redirecionamento HTTP -> HTTPS
curl -I http://www.digiurban.com.br
```

### Verificar Serviços

```bash
# Status do DigiUrban
systemctl status digiurban

# Status do Nginx
systemctl status nginx

# Logs da aplicação
journalctl -u digiurban -f

# Logs do Nginx
tail -f /var/log/nginx/digiurban_access.log
tail -f /var/log/nginx/digiurban_error.log
```

### Verificar SSL

```bash
# Certificados SSL
certbot certificates

# Testar SSL
curl -I https://www.digiurban.com.br
```

## 📊 Monitoramento

### Comandos Úteis

```bash
# Ver logs em tempo real
journalctl -u digiurban -f

# Status de todos os serviços
systemctl status digiurban nginx

# Uso de recursos
htop
df -h
free -h

# Conexões ativas
ss -tlnp | grep :3021
ss -tlnp | grep :443
```

### Métricas da Aplicação

- **Health Check**: `https://www.digiurban.com.br/api/health`
- **Logs de E-mail**: Tabela `email_logs` no banco
- **Estatísticas**: `https://www.digiurban.com.br/api/password-reset/stats`

## 🔧 Manutenção

### Restart da Aplicação

```bash
# Reiniciar apenas a aplicação
systemctl restart digiurban

# Reiniciar Nginx
systemctl reload nginx
```

### Atualizar Aplicação

```bash
# 1. Build local
./deploy.sh

# 2. Copiar para VPS
scp digiurban-deploy.tar.gz root@72.60.10.108:/tmp/

# 3. Na VPS - Atualizar
cd /tmp
tar -xzf digiurban-deploy.tar.gz
systemctl stop digiurban
cp -r backend/dist /var/www/digiurban/backend/
cp -r frontend/dist /var/www/digiurban/frontend/
systemctl start digiurban
```

### Backup do Banco

```bash
# Criar backup
cp /var/www/digiurban/backend/data/digiurban_production.db \
   /var/backups/digiurban_$(date +%Y%m%d_%H%M%S).db

# Automático via cron
echo "0 2 * * * cp /var/www/digiurban/backend/data/digiurban_production.db /var/backups/digiurban_\$(date +\%Y\%m\%d_\%H\%M\%S).db" | crontab -
```

### Renovação SSL

```bash
# Renovar certificados (automático via cron)
certbot renew --quiet

# Forçar renovação
certbot renew --force-renewal

# Testar renovação
certbot renew --dry-run
```

## 🚨 Solução de Problemas

### Aplicação não Inicia

```bash
# Ver logs detalhados
journalctl -u digiurban -n 50

# Verificar configuração
cat /var/www/digiurban/.env

# Testar manualmente
cd /var/www/digiurban/backend
sudo -u digiurban NODE_ENV=production node dist/app.js
```

### Nginx com Erro

```bash
# Testar configuração
nginx -t

# Ver logs de erro
tail -f /var/log/nginx/error.log

# Recriar configuração
cp /tmp/nginx-config.conf /etc/nginx/sites-available/www.digiurban.com.br
nginx -t && systemctl reload nginx
```

### SSL não Funciona

```bash
# Verificar certificados
certbot certificates

# Renovar manualmente
certbot --nginx -d www.digiurban.com.br -d digiurban.com.br

# Verificar redirecionamento
curl -I http://www.digiurban.com.br
```

### E-mails não Enviando

```bash
# Verificar logs da aplicação
journalctl -u digiurban | grep -i email

# Verificar configuração Resend
grep -i resend /var/www/digiurban/.env

# Testar API
curl -X POST https://www.digiurban.com.br/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com"}'
```

### Alto Uso de CPU/Memória

```bash
# Monitorar recursos
htop
iotop

# Logs da aplicação
journalctl -u digiurban -f

# Reiniciar se necessário
systemctl restart digiurban
```

## 🔐 Segurança

### Firewall Configurado

- **SSH**: Porta 22 (apenas para administração)
- **HTTP**: Porta 80 (redireciona para HTTPS)
- **HTTPS**: Porta 443 (aplicação principal)

### Headers de Segurança

- HSTS habilitado
- Content Security Policy configurado
- Headers X-Frame-Options, X-XSS-Protection
- Rate limiting ativo

### Certificados SSL

- Let's Encrypt com renovação automática
- Criptografia TLS 1.2 e 1.3
- Perfect Forward Secrecy

## 📞 Suporte

### Em caso de problemas:

1. **Verificar logs**: `journalctl -u digiurban -f`
2. **Verificar status**: `systemctl status digiurban nginx`
3. **Health check**: `curl https://www.digiurban.com.br/api/health`
4. **Contato**: admin@digiurban.com.br

### Informações do Sistema

```bash
# Versão do Node.js
node --version

# Versão do Nginx
nginx -v

# Uptime do sistema
uptime

# Espaço em disco
df -h

# Memória
free -h
```

---

## ✅ Checklist Pós-Deploy

- [ ] Aplicação acessível em https://www.digiurban.com.br
- [ ] API respondendo em /api/health
- [ ] SSL funcionando corretamente
- [ ] Redirecionamento HTTP -> HTTPS ativo
- [ ] E-mails sendo enviados via Resend
- [ ] Admin inicial criado e funcional
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Firewall configurado
- [ ] Logs sendo gerados corretamente

**🎉 DigiUrban está agora rodando em produção!**