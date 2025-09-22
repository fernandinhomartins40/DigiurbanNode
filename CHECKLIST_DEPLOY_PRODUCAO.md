# ✅ Checklist de Deploy para Produção - DigiUrban

## 🎯 Pré-Requisitos de Produção

### ✅ Validações Técnicas
- [ ] **Testes Unitários**: Todos os testes passando (>90% coverage)
- [ ] **Testes de Integração**: APIs funcionando corretamente
- [ ] **Testes de Performance**: Response time <500ms para 95% das requests
- [ ] **Testes de Segurança**: Vulnerabilidades conhecidas corrigidas
- [ ] **Build de Produção**: Frontend e backend buildando sem erros

### ✅ Configurações de Ambiente
- [ ] **Variáveis de Ambiente**: Todas configuradas para produção
- [ ] **Database URL**: Conectando ao banco de produção
- [ ] **JWT Secrets**: Gerados com alta entropia
- [ ] **CORS Origins**: Configurados para domínios de produção
- [ ] **Rate Limiting**: Ativado e configurado

### ✅ Infraestrutura
- [ ] **Servidor**: Configurado e testado
- [ ] **SSL/HTTPS**: Certificados válidos
- [ ] **Backup**: Sistema automatizado configurado
- [ ] **Monitoramento**: Logs e métricas ativados
- [ ] **DNS**: Apontando para produção

## 🔒 Segurança

### ✅ Autenticação e Autorização
- [ ] **Senhas**: Política de senha forte ativada
- [ ] **JWT**: Tokens com expiração adequada
- [ ] **Refresh Tokens**: Rotação automática implementada
- [ ] **Rate Limiting**: 100 req/min por usuário
- [ ] **CORS**: Configurado apenas para domínios autorizados

### ✅ Proteção de Dados
- [ ] **LGPD**: Consentimento e audit logs implementados
- [ ] **Criptografia**: Senhas com bcrypt, dados sensíveis criptografados
- [ ] **Input Sanitization**: XSS e SQL Injection protegidos
- [ ] **Headers de Segurança**: CSP, HSTS, X-Frame-Options
- [ ] **Logs**: Não contêm dados sensíveis

### ✅ Backup e Recuperação
- [ ] **Backup Automático**: Diário às 02:00 BRT
- [ ] **Teste de Restore**: Procedimento testado
- [ ] **Retenção**: 30 dias de backups
- [ ] **Offsite**: Backups em local seguro
- [ ] **Documentação**: Procedures de recuperação

## 🚀 Deploy

### ✅ Pré-Deploy
- [ ] **Comunicação**: Equipe notificada sobre deploy
- [ ] **Janela de Manutenção**: Horário de baixo tráfego
- [ ] **Backup Pré-Deploy**: Base atual salva
- [ ] **Rollback Plan**: Estratégia definida
- [ ] **Health Checks**: Endpoints preparados

### ✅ Deploy Steps
1. [ ] **Stop Services**: Parar serviços atuais
2. [ ] **Update Code**: Deploy do novo código
3. [ ] **Database Migration**: Executar migrations se necessário
4. [ ] **Environment Check**: Verificar variáveis
5. [ ] **Start Services**: Iniciar novos serviços
6. [ ] **Health Check**: Verificar se tudo subiu
7. [ ] **Smoke Tests**: Testes básicos funcionando

### ✅ Pós-Deploy
- [ ] **Health Dashboard**: Todos os serviços healthy
- [ ] **Login Test**: Consegue fazer login
- [ ] **Super Admin**: Painel funcionando
- [ ] **APIs**: Principais endpoints respondendo
- [ ] **Email Service**: Envio funcionando
- [ ] **Billing**: Sistema de cobrança ativo

## 📊 Monitoramento

### ✅ Logs
- [ ] **Application Logs**: Estruturados e centralizados
- [ ] **Error Logs**: Alertas configurados
- [ ] **Access Logs**: Nginx/Apache configurado
- [ ] **Audit Logs**: Ações críticas registradas
- [ ] **Log Rotation**: Configurado para evitar disco cheio

### ✅ Métricas
- [ ] **Response Time**: Monitorando latência
- [ ] **Error Rate**: Alertas para >1% de erros
- [ ] **Database Performance**: Slow queries monitoradas
- [ ] **Memory Usage**: Alertas para >80%
- [ ] **Disk Space**: Alertas para >90%

### ✅ Alertas
- [ ] **Downtime**: Notificação imediata
- [ ] **High Error Rate**: Alerta em 5 minutos
- [ ] **Performance**: Degradação detectada
- [ ] **Security**: Tentativas de invasão
- [ ] **Billing**: Falhas de pagamento

## 🎯 Validação Final

### ✅ Funcionalidades Core
- [ ] **Login**: Super Admin consegue logar
- [ ] **Dashboard**: Métricas carregando
- [ ] **Tenants**: Criar/editar/listar funcionando
- [ ] **Users**: Gestão de usuários ativa
- [ ] **Billing**: Faturas sendo geradas
- [ ] **Notifications**: Emails sendo enviados
- [ ] **Analytics**: Dados sendo coletados

### ✅ Performance
- [ ] **Page Load**: <3 segundos
- [ ] **API Response**: <500ms para 95%
- [ ] **Database Queries**: <100ms para 90%
- [ ] **Memory Usage**: <70% em operação normal
- [ ] **CPU Usage**: <50% em operação normal

### ✅ Segurança Final
- [ ] **HTTPS**: Apenas conexões seguras
- [ ] **Headers**: Security headers ativos
- [ ] **Secrets**: Não expostos no código
- [ ] **Admin Routes**: Protegidas
- [ ] **File Uploads**: Validados e seguros

## 🔧 Scripts de Deploy

### Backup Pré-Deploy
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/pre-deploy"

echo "🔄 Criando backup pré-deploy..."
mkdir -p $BACKUP_DIR

# Backup do banco
sqlite3 data/digiurban.db ".backup '$BACKUP_DIR/digiurban_$DATE.db'"

# Backup dos arquivos
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" uploads/ data/

echo "✅ Backup criado: $BACKUP_DIR"
```

### Health Check
```bash
#!/bin/bash
echo "🔍 Verificando health do sistema..."

# Check API
curl -f http://localhost:3000/api/health || exit 1

# Check Database
curl -f http://localhost:3000/api/health/database || exit 1

# Check Frontend
curl -f http://localhost:5173 || exit 1

echo "✅ Sistema healthy"
```

### Smoke Tests
```bash
#!/bin/bash
echo "🧪 Executando smoke tests..."

# Test login endpoint
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}' | grep -q "success"

# Test dashboard
curl -f http://localhost:3000/api/admin/dashboard || exit 1

echo "✅ Smoke tests passaram"
```

## 📞 Contatos de Emergência

### Equipe Técnica
- **DevOps**: devops@digiurban.com.br
- **Backend**: backend@digiurban.com.br
- **Frontend**: frontend@digiurban.com.br
- **QA**: qa@digiurban.com.br

### Procedimentos de Emergência
- **Sistema Down**: Executar rollback imediato
- **Performance Issues**: Verificar logs e métricas
- **Security Breach**: Isolate + notificar LGPD
- **Data Loss**: Restaurar último backup

## 📋 Checklist de Rollback

### Se o Deploy Falhar
1. [ ] **Stop New Services**: Parar versão nova
2. [ ] **Restore Database**: Se houve migration
3. [ ] **Deploy Previous Version**: Versão anterior
4. [ ] **Start Services**: Subir versão estável
5. [ ] **Verify Health**: Confirmar funcionamento
6. [ ] **Notify Team**: Comunicar rollback
7. [ ] **Post-Mortem**: Analisar o que deu errado

## ✅ Sign-Off Final

### Deploy Aprovado Por:
- [ ] **Tech Lead**: ________________ Data: _______
- [ ] **DevOps**: __________________ Data: _______
- [ ] **QA**: _____________________ Data: _______
- [ ] **Product**: ________________ Data: _______

### Certificações:
- [ ] Todos os testes passaram
- [ ] Documentação atualizada
- [ ] Equipe treinada
- [ ] Monitoramento ativo
- [ ] Rollback plan testado

---

## 🎯 IMPORTANTE

**Este checklist deve ser seguido rigorosamente para garantir um deploy seguro em produção. Cada item deve ser verificado e marcado antes de prosseguir.**

**Data do Deploy**: _______________
**Versão**: ______________________
**Responsável**: __________________

**🚨 EM CASO DE DÚVIDA, NÃO FAÇA O DEPLOY! 🚨**