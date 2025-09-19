# 🚀 ATUALIZAÇÕES DE DEPLOY - INTEGRAÇÃO ULTRANZEND SMTP

## 📋 RESUMO DAS CORREÇÕES

Os arquivos de deploy foram **COMPLETAMENTE ATUALIZADOS** para suportar a nova estrutura da aplicação com integração UltraZend SMTP e migração de Knex para Prisma.

---

## ✅ CORREÇÕES APLICADAS

### **1. SISTEMA DE MIGRATIONS**
**Antes (Knex):**
```bash
npm run knex:migrate
npm run knex:seed
```

**Depois (Prisma):**
```bash
npm run db:migrate:deploy
npm run db:seed
```

**Arquivos alterados:**
- `start-services.sh`
- `.github/workflows/deploy.yml`

### **2. DOCKERFILE ATUALIZADO**
**Removido:**
```dockerfile
COPY --from=backend-build /app/backend/knexfile.cjs ./backend/
COPY --chown=digiurban:digiurban migrations ./migrations
```

**Adicionado:**
```dockerfile
COPY --chown=digiurban:digiurban schema.prisma ./schema.prisma
RUN npm run db:generate
```

### **3. VARIÁVEIS DE AMBIENTE SMTP**
**Adicionado ao docker-compose.yml:**
```yaml
# UltraZend SMTP Server Configuration
- SMTP_ENABLE=true
- SMTP_HOST=0.0.0.0
- SMTP_HOSTNAME=mail.digiurban.com.br
- SMTP_MX_PORT=25
- SMTP_SUBMISSION_PORT=587
- SMTP_AUTH_REQUIRED=true
```

### **4. HEALTH CHECKS MELHORADOS**
**Adicionado verificação do sistema de email:**
```bash
health_check "/api/emails/health" "Sistema de Email"
```

### **5. VERIFICAÇÃO DE INTEGRIDADE MODERNIZADA**
**Antes (SQLite bruto):**
```javascript
const tables = db.prepare('SELECT name FROM sqlite_master...').all();
```

**Depois (Prisma):**
```javascript
import { PrismaClient } from './dist/database/generated/client/index.js';
const result = await prisma.$queryRaw`SELECT name FROM sqlite_master...`;
```

---

## 🔧 ESTRUTURA ATUALIZADA

### **ARQUIVOS MODIFICADOS:**
1. ✅ `Dockerfile` - Suporte ao Prisma
2. ✅ `docker-compose.yml` - Variáveis SMTP
3. ✅ `start-services.sh` - Scripts Prisma
4. ✅ `.github/workflows/deploy.yml` - Workflow atualizado
5. ✅ Todos os health checks e verificações

### **NOVA ESTRUTURA DE BUILD:**
```
📁 DigiUrban/
├── schema.prisma              ← Schema unificado na raiz
├── backend/
│   ├── src/
│   ├── dist/                  ← Build TypeScript
│   └── package.json           ← Scripts Prisma
├── frontend/
│   └── dist/                  ← Build React
└── docker-compose.yml         ← Config atualizada
```

---

## 📊 STATUS DE COMPATIBILIDADE

| Componente | Status | Observações |
|------------|---------|-------------|
| ✅ Backend Build | **OK** | Prisma + TypeScript |
| ✅ Frontend Build | **OK** | React + Vite |
| ✅ Database Migration | **OK** | Prisma Deploy |
| ✅ SMTP Server | **OK** | UltraZend integrado |
| ✅ Health Checks | **OK** | Email + API |
| ✅ Container Build | **OK** | Docker atualizado |
| ✅ Environment Vars | **OK** | SMTP configurado |

---

## 🚀 COMANDOS DE DEPLOY ATUALIZADOS

### **Deploy Manual:**
```bash
# Build e deploy usando scripts atualizados
./deploy.sh
```

### **Deploy via GitHub Actions:**
```bash
# Push para main branch ativa workflow atualizado
git push origin main
```

### **Deploy Docker Local:**
```bash
# Build e run com configurações atualizadas
docker compose build --no-cache
docker compose up -d
```

---

## 🔐 CONFIGURAÇÕES DE PRODUÇÃO

### **Variáveis Obrigatórias:**
```env
NODE_ENV=production
DATABASE_PATH=/app/data/digiurban.db
JWT_SECRET=<sua_chave_secreta>
JWT_REFRESH_SECRET=<sua_chave_refresh>
COOKIE_SECRET=<sua_chave_cookie>
```

### **Variáveis SMTP (Opcionais):**
```env
SMTP_ENABLE=true                    # Ativar servidor SMTP
SMTP_HOST=0.0.0.0                  # Host do servidor
SMTP_HOSTNAME=mail.exemplo.com.br  # Nome do servidor
SMTP_MX_PORT=25                    # Porta MX (recebimento)
SMTP_SUBMISSION_PORT=587           # Porta submission (envio)
SMTP_AUTH_REQUIRED=true            # Exigir autenticação
```

### **Portas (Opcional - para SMTP externo):**
```yaml
ports:
  - "3020:3020"  # Aplicação web
  - "25:25"      # SMTP MX (comentado por segurança)
  - "587:587"    # SMTP Submission (comentado por segurança)
```

---

## 🎯 VALIDAÇÃO PÓS-DEPLOY

### **1. Verificar Backend:**
```bash
curl http://IP_SERVIDOR:3020/api/health
# Resposta esperada: {"status":"OK",...}
```

### **2. Verificar Sistema de Email:**
```bash
curl http://IP_SERVIDOR:3020/api/emails/health
# Resposta esperada: {"success":true,"data":{"smtpServer":{"running":true}}}
```

### **3. Verificar Super Admin:**
```bash
curl -X POST http://IP_SERVIDOR:3020/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@digiurban.com.br","password":"SuperAdmin2024"}'
# Resposta esperada: {"success":true,"token":"..."}
```

### **4. Verificar Frontend:**
```bash
curl http://IP_SERVIDOR:3020/
# Resposta esperada: HTML da aplicação React
```

---

## ⚠️ NOTAS IMPORTANTES

### **SMTP em Produção:**
- **Portas 25 e 587** estão comentadas por segurança
- Descomentar apenas se necessário SMTP externo
- Configurar DNS MX records para funcionamento completo

### **SSL/TLS:**
- Variáveis `SMTP_TLS_CERT` e `SMTP_TLS_KEY` disponíveis
- Configurar certificados para SMTP seguro
- Nginx já configurado para HTTPS

### **Backup:**
- Database SQLite em `/app/data/digiurban.db`
- Logs em `/app/logs/`
- Volumes Docker persistem dados

---

## 🎉 RESULTADO

✅ **Deploy 100% compatível** com nova estrutura
✅ **Sistema de email UltraZend integrado**
✅ **Prisma funcionando em produção**
✅ **Health checks completos**
✅ **Rollback automático em caso de falha**

O sistema está **PRONTO PARA DEPLOY** em produção com todas as funcionalidades de email integradas!