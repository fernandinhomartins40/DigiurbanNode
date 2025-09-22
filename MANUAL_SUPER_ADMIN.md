# 📋 Manual do Super Admin - DigiUrban

## 🎯 Visão Geral

Este manual contém instruções essenciais para operação do painel Super Admin do DigiUrban, um sistema SaaS para gestão de prefeituras municipais no Brasil.

## 🔐 Acesso ao Sistema

### Login Inicial
- **URL**: `/super-admin/login`
- **Credenciais**: Definidas durante a configuração inicial
- **Autenticação**: JWT com refresh tokens

### Primeiro Acesso
1. Acesse `/super-admin-registration` (APENAS PARA SETUP INICIAL)
2. Crie o primeiro usuário super admin
3. **⚠️ IMPORTANTE**: Remova a rota de registro após o primeiro uso

## 🏢 Gestão de Tenants (Prefeituras)

### Criar Nova Prefeitura
1. **Dashboard** → **Tenants Management**
2. Clique em **"Adicionar Tenant"**
3. Preencha os dados obrigatórios:
   - Nome da prefeitura
   - Cidade e estado
   - CNPJ válido
   - Email do administrador
   - Plano contratado

### Planos Disponíveis
- **Básico**: Até 25 usuários, 5GB storage
- **Profissional**: Até 100 usuários, 25GB storage
- **Empresarial**: Até 500 usuários, 100GB storage
- **Enterprise**: Usuários ilimitados, storage customizado

### Gerenciar Tenant Existente
- **Ativar/Desativar**: Alterna status do tenant
- **Alterar Plano**: Upgrade/downgrade disponível
- **Ver Estatísticas**: Uso de recursos e atividade
- **Acessar Dashboard**: Visualização dedicada do tenant

## 💰 Sistema de Billing

### Métricas Principais
- **MRR**: Monthly Recurring Revenue
- **ARR**: Annual Recurring Revenue
- **Churn Rate**: Taxa de cancelamento
- **CAC**: Customer Acquisition Cost
- **LTV**: Customer Lifetime Value

### Faturas (Invoices)
- **Geração Automática**: Todo mês para tenants ativos
- **Cálculo de Overage**: Uso além dos limites do plano
- **Status**: Pending, Paid, Overdue, Cancelled
- **Impostos**: Automático conforme legislação brasileira

### Cobrança por Uso
- **Usuários extras**: R$ 5,00/usuário/mês
- **Storage extra**: R$ 2,00/GB/mês
- **API calls extras**: R$ 0,002/call

## 📊 Analytics e Monitoramento

### Dashboard Principal
- Visão geral de métricas SaaS
- Crescimento de receita (MRR/ARR)
- Número de tenants ativos
- Usuários totais do sistema
- Health check dos serviços

### Relatórios Disponíveis
- **Revenue Trends**: Crescimento de receita
- **Tenant Growth**: Crescimento de clientes
- **Usage Analytics**: Uso de recursos
- **Performance Metrics**: Métricas de sistema

### Alertas Automáticos
- Tenants próximos do limite
- Performance degradada
- Falhas de pagamento
- Problemas técnicos

## 👥 Gestão de Usuários

### Tipos de Usuário
- **Super Admin**: Acesso total ao sistema
- **Admin**: Gerencia prefeitura específica
- **User**: Acesso limitado a funcionalidades
- **Cidadão**: Portal do cidadão

### Operações Disponíveis
- Criar usuários para qualquer tenant
- Alterar roles e permissões
- Ativar/desativar contas
- Reset de senhas
- Auditoria de atividades

## 📧 Sistema de Notificações

### Canais Disponíveis
- **Email**: Notificações por email
- **SMS**: Mensagens de texto
- **Push**: Notificações web push
- **In-App**: Notificações dentro do sistema

### Notificações em Massa
1. **Dashboard** → **Notification Management**
2. Selecione **"Nova Notificação"**
3. Configure:
   - Título e mensagem
   - Canais de envio
   - Público-alvo
   - Agendamento (opcional)
   - Prioridade

### Templates
- Criar templates reutilizáveis
- Variáveis dinâmicas ({{nome}}, {{data}}, etc.)
- Versionamento automático
- Estatísticas de uso

### Métricas de Entrega
- Taxa de entrega
- Taxa de abertura
- Taxa de clique
- Falhas por canal

## ⚙️ Configurações do Sistema

### Configurações Gerais
- **Timezone**: America/Sao_Paulo
- **Idioma**: Português (pt-BR)
- **Moeda**: Real (BRL)
- **Rate Limiting**: 100 req/min por usuário

### Configurações de Email
- **Provider**: UltraZend SMTP
- **Templates**: HTML com variáveis
- **Rate Limit**: 1000 emails/hora
- **Retry**: 3 tentativas com backoff

### Configurações de Segurança
- **JWT Expiry**: 1 hora (access), 7 dias (refresh)
- **Password Policy**: 8+ chars, números, símbolos
- **Session Timeout**: 24 horas inativo
- **Audit Logs**: Todas as ações críticas

## 🔧 Operações e Manutenção

### Health Checks
- **Database**: Conectividade e performance
- **Email Service**: Status do provedor
- **Storage**: Uso de disco e disponibilidade
- **APIs**: Response time e erro rate

### Backup e Recuperação
- **Backup Automático**: Diário às 02:00
- **Retenção**: 30 dias
- **Localização**: `/backups/YYYY-MM-DD/`
- **Restauração**: Manual via SQL scripts

### Logs e Monitoramento
- **Structured Logging**: JSON format
- **Levels**: Error, Warn, Info, Debug
- **Localização**: `/logs/app.log`
- **Rotação**: Diária, máximo 7 dias

### Performance
- **Cache**: Redis para dados frequentes
- **TTL**: 5 minutos para analytics
- **Rate Limiting**: Por usuário e endpoint
- **Query Optimization**: Índices automáticos

## 🚨 Troubleshooting

### Problemas Comuns

#### Tenant não consegue acessar
1. Verificar status: Ativo/Inativo
2. Verificar plano: Se não expirou
3. Verificar usuários: Se não atingiu limite
4. Verificar logs: Erros de autenticação

#### Emails não estão sendo enviados
1. Verificar configuração SMTP
2. Verificar rate limits
3. Verificar templates
4. Verificar logs de email service

#### Performance degradada
1. Verificar uso de CPU/memória
2. Verificar slow queries
3. Verificar cache hit rate
4. Verificar conexões de banco

#### Falhas de cobrança
1. Verificar dados de pagamento
2. Verificar status da invoice
3. Verificar provider de pagamento
4. Notificar cliente manualmente

### Comandos Úteis

#### Verificar status do sistema
```bash
curl -X GET /api/health
curl -X GET /api/admin/system/status
```

#### Forçar backup manual
```bash
npm run backup:create
```

#### Verificar logs em tempo real
```bash
tail -f logs/app.log | grep ERROR
```

#### Limpar cache
```bash
npm run cache:clear
```

## 📞 Contatos de Emergência

### Suporte Técnico
- **Email**: suporte@digiurban.com.br
- **Telefone**: (11) 99999-9999
- **Horário**: 24/7 para emergências

### Escalação de Problemas
1. **Nível 1**: Performance degradada
2. **Nível 2**: Funcionalidade indisponível
3. **Nível 3**: Sistema completamente down
4. **Crítico**: Vazamento de dados

### Procedimentos de Emergência
- **Sistema Down**: Ativar página de manutenção
- **Breach de Segurança**: Notificar LGPD em 72h
- **Perda de Dados**: Restaurar último backup
- **DDoS**: Ativar proteção de rede

## 📋 Checklist de Deploy

### Pré-Deploy
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Backup da base de dados
- [ ] Verificar variáveis de ambiente
- [ ] Verificar configurações de produção

### Deploy
- [ ] Deploy em horário de baixo tráfego
- [ ] Monitorar logs durante deploy
- [ ] Verificar health checks
- [ ] Teste de smoke em produção
- [ ] Notificar equipe sobre conclusão

### Pós-Deploy
- [ ] Monitorar métricas por 24h
- [ ] Verificar performance
- [ ] Verificar emails sendo enviados
- [ ] Verificar cobranças funcionando
- [ ] Documentar alterações

## 🔒 Segurança e Compliance

### LGPD
- Audit logs de todas as operações
- Consentimento explícito para dados
- Right to be forgotten implementado
- Data retention policies definidas

### Segurança
- HTTPS obrigatório
- Senha criptografada (bcrypt)
- Rate limiting ativado
- Input sanitization
- SQL injection protection

### Backup de Segurança
- Criptografia em repouso
- Backups offsite
- Teste de restauração mensal
- Documentação de procedures

---

## ⚠️ IMPORTANTE

**Este manual contém informações críticas para operação em produção. Mantenha sempre atualizado e acessível para a equipe técnica.**

**Última atualização**: 21/09/2025
**Versão**: 1.0.0
**Sistema**: DigiUrban Super Admin