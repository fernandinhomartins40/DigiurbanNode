# 📧 PLANO DE IMPLEMENTAÇÃO - SISTEMA DE EMAIL PARA TENANTS

## 🎯 OBJETIVO
Disponibilizar o sistema UltraZend SMTP para que cada tenant (prefeitura) possa:
- Usar domínios personalizados (ex: contato@prefeitura-exemplo.gov.br)
- Enviar emails em massa para cidadãos
- Gerenciar seus próprios usuários SMTP
- Ter dashboard de monitoramento de emails
- Integração completa com os módulos existentes

---

## 🏗️ ARQUITETURA PROPOSTA

### 1. ESTRUTURA MULTI-TENANT

```
Sistema UltraZend SMTP (Global)
├── Tenant A (Prefeitura São Paulo)
│   ├── Domínio: contato@saopaulo.sp.gov.br
│   ├── Usuários SMTP: admin@saopaulo.sp.gov.br, protocolo@saopaulo.sp.gov.br
│   └── Templates: Protocolo, Notificação, Boletim
├── Tenant B (Prefeitura Rio de Janeiro)
│   ├── Domínio: contato@rio.rj.gov.br
│   ├── Usuários SMTP: admin@rio.rj.gov.br, atendimento@rio.rj.gov.br
│   └── Templates: Protocolo, Notificação, Boletim
└── Tenant C (Prefeitura Brasília)
    ├── Domínio: contato@brasilia.df.gov.br
    ├── Usuários SMTP: admin@brasilia.df.gov.br
    └── Templates: Protocolo, Notificação
```

### 2. MODELO DE PERMISSÕES

**Super Admin (Global)**
- Gerenciar todos os domínios e usuários SMTP
- Monitorar performance global do sistema
- Configurar infraestrutura técnica

**Admin do Tenant**
- Gerenciar domínios do seu tenant
- Criar/editar usuários SMTP do tenant
- Configurar templates de email
- Enviar emails em massa
- Visualizar estatísticas do tenant

**Usuário do Tenant**
- Enviar emails através dos templates configurados
- Visualizar histórico de emails enviados por ele

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### FASE 1: INFRAESTRUTURA BASE (2-3 dias)

#### 1.1 Ajustes no Schema Prisma
```sql
-- Já implementado na integração anterior
-- Campos tenant_id já existem nas tabelas necessárias
```

#### 1.2 Middleware de Tenant
```typescript
// middleware/tenantMiddleware.ts
export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) return next();

  // Super admins podem ver tudo
  if (user.role === 'super_admin') {
    return next();
  }

  // Outros usuários só veem dados do seu tenant
  req.tenantFilter = { tenantId: user.tenant_id };
  next();
};
```

#### 1.3 API Endpoints para Tenants
```typescript
// routes/tenant-emails.ts
router.get('/tenant/domains', tenantMiddleware, getDomains);
router.post('/tenant/domains', tenantMiddleware, createDomain);
router.get('/tenant/smtp-users', tenantMiddleware, getSmtpUsers);
router.post('/tenant/smtp-users', tenantMiddleware, createSmtpUser);
router.get('/tenant/templates', tenantMiddleware, getTemplates);
router.post('/tenant/templates', tenantMiddleware, createTemplate);
router.post('/tenant/send-bulk', tenantMiddleware, sendBulkEmail);
```

### FASE 2: DASHBOARD TENANT (3-4 dias)

#### 2.1 Componente TenantEmailDashboard
```typescript
// components/tenant/TenantEmailDashboard.tsx
interface TenantEmailStats {
  domainStatus: 'verified' | 'pending' | 'failed';
  emailsSentToday: number;
  emailsSentMonth: number;
  bounceRate: number;
  templates: Template[];
  recentEmails: Email[];
}
```

#### 2.2 Features do Dashboard
- **Status do Domínio**: Verificação DNS, DKIM, SPF
- **Estatísticas**: Emails enviados, taxa de entrega, bounces
- **Templates**: Gestão de templates personalizados
- **Envio em Massa**: Interface para campanhas
- **Histórico**: Logs de emails enviados

#### 2.3 Integração com Sidebar
```typescript
// Adicionar ao UnifiedSidebar para tenants
{
  title: "Sistema de Email",
  url: "/admin/emails",
  icon: Mail,
  items: [
    {
      title: "Dashboard",
      url: "/admin/emails/dashboard"
    },
    {
      title: "Domínios",
      url: "/admin/emails/domains"
    },
    {
      title: "Templates",
      url: "/admin/emails/templates"
    },
    {
      title: "Envio em Massa",
      url: "/admin/emails/bulk"
    },
    {
      title: "Histórico",
      url: "/admin/emails/history"
    }
  ]
}
```

### FASE 3: GESTÃO DE DOMÍNIOS (2 dias)

#### 3.1 Processo de Configuração de Domínio
1. **Criação**: Tenant solicita domínio personalizado
2. **DNS Setup**: Sistema gera registros DNS necessários
3. **Verificação**: Sistema verifica configuração DNS
4. **DKIM/SPF**: Configuração automática de autenticação
5. **Ativação**: Domínio fica disponível para envio

#### 3.2 Interface de Configuração
```typescript
// components/tenant/DomainSetup.tsx
- Input para domínio personalizado
- Instruções DNS (MX, TXT, CNAME)
- Status de verificação em tempo real
- Botão para re-verificar
- Suporte técnico integrado
```

### FASE 4: TEMPLATES E ENVIO MASSA (3-4 dias)

#### 4.1 Sistema de Templates
```typescript
interface EmailTemplate {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // ["{{nome}}", "{{protocolo}}"]
  category: 'protocol' | 'notification' | 'newsletter' | 'custom';
  isActive: boolean;
}
```

#### 4.2 Editor de Templates
- **Visual Editor**: Interface WYSIWYG para HTML
- **Variables**: Sistema de variáveis dinâmicas
- **Preview**: Visualização em tempo real
- **Test Send**: Envio de teste
- **Categories**: Organização por categorias

#### 4.3 Sistema de Envio em Massa
```typescript
interface BulkEmailCampaign {
  id: string;
  tenantId: string;
  templateId: string;
  name: string;
  recipients: EmailRecipient[];
  scheduledFor: Date | null;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  stats: {
    sent: number;
    delivered: number;
    bounced: number;
    opened: number;
    clicked: number;
  };
}
```

### FASE 5: INTEGRAÇÃO COM MÓDULOS (2-3 dias)

#### 5.1 Integração com Protocolos
```typescript
// services/ProtocolEmailService.ts
export class ProtocolEmailService {
  static async sendProtocolConfirmation(protocolId: string) {
    const tenant = await getTenantFromProtocol(protocolId);
    const template = await getTemplate(tenant.id, 'protocol_confirmation');
    await UltraZendSMTP.sendEmail({
      from: tenant.emailConfig.fromAddress,
      template,
      variables: { protocolo: protocolId, ... }
    });
  }
}
```

#### 5.2 Integração com Cadastro de Cidadãos
```typescript
// Ao cadastrar novo cidadão
await TenantEmailService.sendWelcomeEmail(citizenId, tenantId);

// Newsletter automática
await TenantEmailService.addToNewsletter(citizenEmail, tenantId);
```

#### 5.3 Notificações Automáticas
- **Protocolo Criado**: Email automático de confirmação
- **Status Alterado**: Notificação de mudança de status
- **Vencimentos**: Lembretes automáticos
- **Newsletter**: Boletins periódicos

---

## 🔐 SEGURANÇA E COMPLIANCE

### 1. ISOLAMENTO DE DADOS
```typescript
// Cada tenant só acessa seus próprios dados
const domainFilter = {
  where: {
    tenantId: req.user.tenant_id
  }
};
```

### 2. RATE LIMITING POR TENANT
```typescript
// Rate limit específico por tenant
const tenantRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 emails por 15 min por tenant
  keyGenerator: (req) => `tenant:${req.user.tenant_id}`,
});
```

### 3. AUDIT LOG
```typescript
// Log todas as operações de email por tenant
await ActivityService.log({
  tenantId: req.user.tenant_id,
  userId: req.user.id,
  action: 'EMAIL_SENT',
  resource: 'email_campaign',
  details: { campaignId, recipientCount }
});
```

### 4. GDPR/LGPD COMPLIANCE
- **Opt-out**: Link de descadastro em todos os emails
- **Data Retention**: Política de retenção de dados
- **Export**: Exportação de dados do cidadão
- **Delete**: Exclusão completa de dados

---

## 📊 MONITORAMENTO E MÉTRICAS

### 1. DASHBOARD GLOBAL (Super Admin)
- **Performance por Tenant**: Volume, entregabilidade, bounces
- **Usage Quotas**: Controle de limites por tenant
- **System Health**: Status dos servidores SMTP
- **Billing Metrics**: Uso para cobrança

### 2. DASHBOARD TENANT
- **Email Statistics**: Enviados, entregues, abertos, cliques
- **Domain Health**: Status DNS, reputação
- **Campaign Performance**: ROI das campanhas
- **Subscriber Growth**: Crescimento da base

### 3. ALERTAS AUTOMÁTICOS
- **High Bounce Rate**: Taxa de bounce > 5%
- **Domain Issues**: Problemas de DNS/DKIM
- **Quota Exceeded**: Limite de emails atingido
- **Delivery Failures**: Falhas de entrega em massa

---

## 🚀 ROADMAP DE DESENVOLVIMENTO

### SEMANA 1-2: Infraestrutura
- [x] Schema e migrations (já feito)
- [ ] APIs tenant-específicas
- [ ] Middleware de isolamento
- [ ] Configuração de permissões

### SEMANA 3-4: Dashboard Tenant
- [ ] Interface principal
- [ ] Gestão de domínios
- [ ] Configuração DNS
- [ ] Templates básicos

### SEMANA 5-6: Envio em Massa
- [ ] Editor de templates
- [ ] Sistema de campanhas
- [ ] Scheduler de envios
- [ ] Tracking de métricas

### SEMANA 7-8: Integrações
- [ ] Módulo de protocolos
- [ ] Cadastro de cidadãos
- [ ] Notificações automáticas
- [ ] API externa

### SEMANA 9-10: Testes e Refinamentos
- [ ] Testes de carga
- [ ] Otimização de performance
- [ ] Documentação completa
- [ ] Treinamento de usuários

---

## 💰 MODELO DE PRICING (SUGESTÃO)

### PLANOS POR TENANT

**STARTER** (até 1.000 emails/mês)
- 1 domínio personalizado
- 3 templates básicos
- Suporte por email
- R$ 97/mês

**PROFESSIONAL** (até 10.000 emails/mês)
- 3 domínios personalizados
- Templates ilimitados
- Envio em massa
- Analytics avançado
- Suporte prioritário
- R$ 297/mês

**ENTERPRISE** (emails ilimitados)
- Domínios ilimitados
- White-label completo
- API dedicada
- Suporte 24/7
- SLA garantido
- Preço customizado

---

## 🎯 BENEFÍCIOS PARA TENANTS

### 1. PROFISSIONALIZAÇÃO
- Domínio próprio aumenta credibilidade
- Templates profissionais
- Marca consistente em todas as comunicações

### 2. EFICIÊNCIA OPERACIONAL
- Automatização de notificações
- Redução de trabalho manual
- Centralização da comunicação

### 3. ENGAJAMENTO CIDADÃO
- Comunicação direta e efetiva
- Newsletters e informativos
- Canais de feedback

### 4. COMPLIANCE
- Auditoria completa de comunicações
- Rastreamento de entregas
- Conformidade com LGPD

---

## ⚠️ RISCOS E MITIGAÇÕES

### 1. REPUTAÇÃO IP
**Risco**: Tenant mal comportado pode afetar reputação global
**Mitigação**:
- IPs dedicados por tenant (plan Enterprise)
- Monitoramento automático de bounces
- Suspensão automática de contas problemáticas

### 2. SPAM COMPLAINTS
**Risco**: Reclamações de spam podem afetar entregabilidade
**Mitigação**:
- Validação obrigatória de listas
- Double opt-in para newsletters
- Educação sobre melhores práticas

### 3. VOLUME DE DADOS
**Risco**: Crescimento exponencial de dados de email
**Mitigação**:
- Política de retenção de dados
- Arquivamento automático
- Compressão de attachments

### 4. DEPENDÊNCIAS TÉCNICAS
**Risco**: Falha no servidor SMTP afeta todos os tenants
**Mitigação**:
- Redundância de servidores
- Fallback para provedores externos
- Monitoring 24/7

---

## 🎉 CONCLUSÃO

Este plano oferece uma solução completa e escalável para que cada tenant possa ter seu próprio sistema de email profissional, mantendo o controle centralizado e a economia de escala do sistema UltraZend SMTP.

A implementação incremental permite validar cada etapa antes de prosseguir, reduzindo riscos e garantindo qualidade.

O modelo de negócio proposto pode gerar receita adicional significativa, justificando o investimento em desenvolvimento.

---

**Próximos Passos:**
1. Aprovação do plano técnico
2. Definição de prioridades de features
3. Início da implementação da Fase 1
4. Setup de ambiente de testes
5. Definição de tenant piloto para testes