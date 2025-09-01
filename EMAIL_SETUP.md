# 📧 Sistema de E-mail Transacional - DigiUrban

## Configuração do Resend.com

O sistema DigiUrban agora está integrado com o Resend.com para envio de e-mails transacionais, incluindo:

- ✅ Recuperação de senhas
- ✅ Verificação de e-mail 
- ✅ Notificações de segurança
- ✅ E-mails de boas-vindas
- ✅ Alertas de conta bloqueada

## 🚀 Configuração Inicial

### 1. Criar Conta no Resend

1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Verifique seu domínio ou use o domínio de teste

### 2. Obter API Key

1. No painel do Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "DigiUrban Production")
4. Copie a chave gerada

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```bash
# ====================================================================
# 📧 CONFIGURAÇÕES DE E-MAIL - RESEND.COM
# ====================================================================

# Resend API Key (obtenha em: https://resend.com/api-keys)
RESEND_API_KEY=re_sua_api_key_aqui

# Configurações do Remetente
FROM_EMAIL=noreply@seudominio.com.br
FROM_NAME=DigiUrban

# URLs da Aplicação (ajuste conforme seu ambiente)
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3021/api

# Rate Limiting de E-mails (opcional)
EMAIL_RATE_LIMIT_PER_HOUR=100
EMAIL_RATE_LIMIT_PER_DAY=1000

# Token Lifetimes (opcional)
PASSWORD_RESET_TOKEN_LIFETIME=3600000    # 1 hora
EMAIL_VERIFICATION_TOKEN_LIFETIME=86400000 # 24 horas
```

### 4. Verificar Domínio (Produção)

Para produção, você precisa verificar seu domínio:

1. No painel Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Insira seu domínio (ex: `seudominio.com.br`)
4. Configure os registros DNS conforme instruído
5. Aguarde a verificação (pode levar até 48h)

## 🛠 Funcionalidades Implementadas

### Recuperação de Senha

**Endpoint:** `POST /api/password-reset/request`

```json
{
  "email": "usuario@exemplo.com"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Instruções para recuperação de senha foram enviadas para seu e-mail.",
  "data": {
    "tokenSent": true
  }
}
```

### Validar Token de Recuperação

**Endpoint:** `POST /api/password-reset/validate-token`

```json
{
  "token": "token_de_64_caracteres"
}
```

### Redefinir Senha

**Endpoint:** `POST /api/password-reset/update-password`

```json
{
  "token": "token_de_64_caracteres",
  "newPassword": "NovaSenha123!@#"
}
```

### Estatísticas

**Endpoint:** `GET /api/password-reset/stats`

Retorna estatísticas de uso do sistema de recuperação.

## 📊 Monitoramento

### Tabelas do Banco de Dados

O sistema cria as seguintes tabelas automaticamente:

- `email_logs` - Logs de todos os e-mails enviados
- `password_reset_tokens` - Tokens de recuperação de senha
- `email_verification_tokens` - Tokens de verificação de e-mail

### Rate Limiting

- **Por usuário**: 3 solicitações de recuperação a cada 15 minutos
- **Por e-mail**: 100 e-mails por hora, 1000 por dia

### Logs

Todos os e-mails são registrados com:
- Status (sent/failed/queued)
- Template usado
- Dados do destinatário
- Detalhes de erro (se houver)

## 🧪 Testando o Sistema

### 1. Testar sem API Key

Mesmo sem a API Key configurada, o sistema:
- Aceita solicitações de recuperação
- Cria tokens no banco
- Retorna sucesso (mas não envia e-mail)

### 2. Testar com API Key

Com a API Key configurada:
```bash
# Iniciar o servidor
cd backend
npm run dev

# Em outro terminal, testar
curl -X POST http://localhost:3021/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@exemplo.com"}'
```

### 3. Verificar Logs

```bash
# Ver logs de e-mail no banco
sqlite3 backend/data/digiurban.db "SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;"
```

## 🔧 Templates de E-mail

### Templates Incluídos

1. **Recuperação de Senha** (`sendPasswordResetEmail`)
   - Link com token seguro
   - Tempo de expiração
   - Instruções claras

2. **Verificação de E-mail** (`sendEmailVerificationEmail`)
   - Link de ativação
   - Boas-vindas ao sistema

3. **Boas-vindas** (`sendWelcomeEmail`)
   - Saudação personalizada
   - Link para acessar sistema

4. **Conta Bloqueada** (`sendAccountLockedEmail`)
   - Notificação de bloqueio
   - Instruções para desbloqueio

5. **Novo Login** (`sendNewLoginEmail`)
   - Alerta de segurança
   - Detalhes do acesso

### Personalizando Templates

Os templates estão no arquivo `src/services/EmailService.ts`. Você pode:

1. Modificar o HTML dos templates existentes
2. Adicionar novos templates
3. Personalizar cores e estilos
4. Incluir logotipo da empresa

## 🚀 Deploy em Produção

### Checklist de Produção

- [ ] API Key do Resend configurada
- [ ] Domínio verificado no Resend
- [ ] Variável `FROM_EMAIL` usando domínio verificado
- [ ] Variáveis `FRONTEND_URL` e `API_URL` corretas
- [ ] Backup do banco de dados configurado
- [ ] Monitoramento de logs ativo

### Configuração para www.digiurban.com.br

```bash
# .env.production - DigiUrban
RESEND_API_KEY=re_live_sua_api_key_de_producao
FROM_EMAIL=noreply@digiurban.com.br
FROM_NAME=DigiUrban
FRONTEND_URL=https://www.digiurban.com.br
API_URL=https://www.digiurban.com.br/api

# Rate limiting para produção
EMAIL_RATE_LIMIT_PER_HOUR=500
EMAIL_RATE_LIMIT_PER_DAY=5000
```

### Verificação DNS do Domínio

O domínio www.digiurban.com.br já está configurado:
- **IP VPS**: 72.60.10.108
- **DNS**: Apontando corretamente
- **Resend**: Configurado para o domínio

## 📈 Métricas e Análise

### Painel do Resend

No painel do Resend você pode ver:
- E-mails entregues/falhados
- Métricas de entregabilidade
- Logs detalhados
- Análise de reputação

### Métricas no Sistema

```bash
# Ver estatísticas via API
curl http://localhost:3021/api/password-reset/stats
```

## 🆘 Solução de Problemas

### E-mails não estão sendo enviados

1. ✅ Verificar se `RESEND_API_KEY` está configurada
2. ✅ Verificar se `FROM_EMAIL` usa domínio verificado
3. ✅ Verificar logs no painel do Resend
4. ✅ Verificar tabela `email_logs` no banco

### E-mails indo para spam

1. ✅ Verificar SPF, DKIM e DMARC no DNS
2. ✅ Usar domínio verificado e reputação
3. ✅ Evitar palavras que ativam filtros de spam
4. ✅ Incluir link de descadastro (futuro)

### Rate limiting ativado

1. ✅ Verificar logs de `password_reset_tokens`
2. ✅ Ajustar limites se necessário
3. ✅ Implementar fallback para admins

## 🔄 Próximos Passos

### Melhorias Planejadas

- [ ] Templates visuais mais ricos
- [ ] Suporte a anexos
- [ ] Sistema de filas com Redis
- [ ] Webhooks do Resend para tracking
- [ ] Dashboard de métricas
- [ ] Testes automatizados
- [ ] Localização (PT/EN)

### Integração Frontend

```typescript
// Exemplo de integração no frontend React
const requestPasswordReset = async (email: string) => {
  const response = await fetch('/api/password-reset/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  return data;
};
```

## 📞 Suporte

Em caso de dúvidas:

1. **Logs do Sistema**: Verificar console do servidor
2. **Painel Resend**: [https://resend.com/emails](https://resend.com/emails)  
3. **Documentação Resend**: [https://resend.com/docs](https://resend.com/docs)
4. **Issues do Projeto**: Abrir issue no repositório

---

✅ **Sistema de E-mail Configurado com Sucesso!**

O DigiUrban agora possui um sistema robusto de e-mails transacionais, pronto para produção e totalmente integrado com o Resend.com.