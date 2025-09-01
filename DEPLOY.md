# 🚀 Deploy DigiUrban - Instruções

## 📋 Pré-requisitos
- VPS com IP: **72.60.10.108**
- Domínio: **www.digiurban.com.br**
- Docker e Docker Compose instalados

## 🔧 Deploy na VPS

### 1. Build e Deploy
```bash
# No workspace local
docker build -t digiurban-app .
docker save digiurban-app | gzip > digiurban-app.tar.gz
scp digiurban-app.tar.gz docker-compose.yml root@72.60.10.108:/root/digiurban-unified/
```

### 2. Na VPS
```bash
ssh root@72.60.10.108
cd /root/digiurban-unified
docker load -i digiurban-app.tar.gz
docker compose down
docker compose up -d
```

## 🌐 Configuração Nginx (Já configurado - NÃO alterar)

**Arquivo:** `/etc/nginx/sites-available/digiurban.conf`

```nginx
# Redirecionamento de digiurban.com.br para www.digiurban.com.br
server {
    listen 80;
    listen 443 ssl http2;
    server_name digiurban.com.br;
    
    ssl_certificate /etc/letsencrypt/live/www.digiurban.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.digiurban.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    return 301 https://www.digiurban.com.br$request_uri;
}

# Redirecionamento HTTP para HTTPS (www)
server {
    listen 80;
    server_name www.digiurban.com.br;
    return 301 https://www.digiurban.com.br$request_uri;
}

# Configuração principal HTTPS
server {
    listen 443 ssl http2;
    server_name www.digiurban.com.br;

    ssl_certificate /etc/letsencrypt/live/www.digiurban.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.digiurban.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://localhost:3020;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

## 🔐 SSL/TLS
- Certificado Let's Encrypt configurado
- Renovação automática ativa
- **NÃO executar certbot novamente** - já está configurado

## ✅ Checklist Pós-Deploy

1. **Container rodando:**
   ```bash
   ssh root@72.60.10.108 'docker ps | grep digiurban'
   ```

2. **Nginx ativo:**
   ```bash
   ssh root@72.60.10.108 'systemctl status nginx'
   ```

3. **Porta 3020 ativa:**
   ```bash
   ssh root@72.60.10.108 'ss -tlnp | grep :3020'
   ```

4. **Teste domínio:**
   - https://www.digiurban.com.br
   - http://digiurban.com.br → deve redirecionar para https://www.digiurban.com.br

## ⚠️ IMPORTANTE
- **Sempre use o domínio:** www.digiurban.com.br
- **Porta da aplicação:** 3020
- **NÃO alterar configuração do Nginx**
- **NÃO executar certbot novamente**

## 🔄 Comandos Úteis

### Ver logs:
```bash
ssh root@72.60.10.108 'docker logs digiurban-unified -f'
```

### Restart aplicação:
```bash
ssh root@72.60.10.108 'cd /root/digiurban-unified && docker compose restart'
```

### Status SSL:
```bash
ssh root@72.60.10.108 'certbot certificates'
```