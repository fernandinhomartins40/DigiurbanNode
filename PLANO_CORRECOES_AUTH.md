# 🔐 PLANO DE CORREÇÕES - SISTEMA DE AUTENTICAÇÃO DIGIURBAN

## 📋 Resumo Executivo

**Objetivo:** Implementar sistema de autenticação robusto e unificado com 3 portais de login e 6 níveis hierárquicos de acesso.

**Status Atual:** 
- ❌ 5 formulários de login desalinhados
- ❌ Inconsistências entre frontend/backend
- ❌ Mistura de Supabase + JWT
- ❌ Mapeamento incorreto de dados do usuário
- ❌ Sistema de roles incompleto

**Meta:** Sistema unificado, seguro e performante com login <2s e zero race conditions.

---

## 🎯 ANÁLISE DE PROBLEMAS CRÍTICOS

### **1. Inconsistências de Dados**

| Componente | Campo Nome | Campo Senha | Sistema Auth |
|------------|------------|-------------|--------------|
| **Frontend** | `nome_completo` | `senha_hash` | JWT Local |
| **Backend** | `name` | `password` | JWT Local |
| **Database** | `nome_completo` | `senha_hash` | SQLite3 |
| **SuperAdminLogin** | `name` | `password` | Supabase ❌ |

### **2. Estrutura de Response Incompatível**

**Frontend Espera:**
```typescript
{
  success: boolean,
  data: {
    user: UserProfile,
    tokens: { accessToken, refreshToken },
    tenant: TenantInfo | null
  }
}
```

**Backend Retorna:**
```typescript
{
  token: string,
  user: { id, email, name, role }
}
```

### **3. Sistema de Roles Desalinhado**

| Nível | Frontend Types | Backend/DB | Descrição |
|-------|----------------|------------|-----------|
| **0** | `guest` | ❌ Não existe | Cidadão/Visitante |
| **1** | `user` | `user` | Funcionário/Atendente |
| **2** | `coordinator` | ❌ Não existe | Coordenador de Equipe |
| **3** | `manager` | ❌ Não existe | Secretário/Gestor |
| **4** | `admin` | `admin` | Prefeito/Administrador Municipal |
| **5** | `super_admin` | `super_admin` | Desenvolvedor/Suporte |

---

## 🛠️ PLANO DE IMPLEMENTAÇÃO

### **FASE 1: PADRONIZAÇÃO DO BACKEND** 
*Duração: 2-3 horas*

#### **1.1 Atualizar Modelo de Usuário**
- [ ] Corrigir `userService.ts` para usar campos corretos do banco
- [ ] Atualizar `authController.ts` para response padronizada
- [ ] Implementar sistema completo de roles no backend

**Arquivo:** `backend/src/services/userService.ts`
```typescript
// Corrigir campos do banco
async findByEmail(email: string): Promise<User | null> {
  const sql = 'SELECT id, nome_completo, email, senha_hash, role, status, tenant_id FROM users WHERE email = ?';
  return await queryOne(sql, [email]) as User | null;
}
```

**Arquivo:** `backend/src/controllers/authController.ts`
```typescript
// Response padronizada
res.json({
  success: true,
  data: {
    user: {
      id: user.id,
      nome_completo: user.nome_completo,
      email: user.email,
      role: user.role,
      status: user.status,
      tenant_id: user.tenant_id
    },
    tokens: {
      accessToken: accessToken,
      refreshToken: refreshToken
    },
    tenant: tenantData
  }
});
```

#### **1.2 Implementar Sistema de Roles Completo**
- [ ] Atualizar tabela `users` com todos os roles
- [ ] Criar middleware de autorização por role
- [ ] Implementar verificações hierárquicas

**Arquivo:** `backend/src/database/migrations/002_update_roles.sql`
```sql
-- Atualizar constraint de roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK(role IN ('guest', 'user', 'coordinator', 'manager', 'admin', 'super_admin'));

-- Atualizar usuários existentes se necessário
UPDATE users SET role = 'guest' WHERE role NOT IN ('user', 'admin', 'super_admin');
```

#### **1.3 Sistema de Tokens Robusto**
- [ ] Implementar refresh tokens
- [ ] Configurar expiração adequada
- [ ] Sistema de invalidação de tokens

### **FASE 2: UNIFICAÇÃO DO FRONTEND**
*Duração: 3-4 horas*

#### **2.1 Consolidar AuthService**
- [ ] Remover dependência do Supabase
- [ ] Unificar todos os logins no sistema JWT
- [ ] Implementar cache inteligente

**Arquivo:** `frontend/src/auth/services/authService.ts`
```typescript
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const loginData = await response.json();
    
    if (!loginData.success) {
      throw new Error(loginData.error || 'Falha na autenticação');
    }

    // Armazenar tokens
    localStorage.setItem('access_token', loginData.data.tokens.accessToken);
    localStorage.setItem('refresh_token', loginData.data.tokens.refreshToken);

    return loginData;
  }
}
```

#### **2.2 Refatorar Formulários de Login**
- [ ] Consolidar 5 formulários em 3 portais únicos
- [ ] Implementar roteamento inteligente por role
- [ ] Sistema de redirecionamento baseado em permissões

**Estrutura Final:**
```
📁 src/pages/auth/
├── 🔐 SuperAdminLogin.tsx    (role: super_admin)
├── 🏛️  AdminLogin.tsx         (roles: admin, manager, coordinator, user)
└── 👥 CidadaoLogin.tsx       (role: guest)
```

#### **2.3 Sistema de Redirecionamento Inteligente**
```typescript
const getRedirectPath = (userRole: UserRole): string => {
  const roleRedirects = {
    super_admin: '/super-admin/dashboard',
    admin: '/admin/dashboard', 
    manager: '/manager/dashboard',
    coordinator: '/coordinator/dashboard',
    user: '/dashboard',
    guest: '/cidadao/servicos'
  };
  return roleRedirects[userRole] || '/';
};
```

### **FASE 3: SISTEMA DE PERMISSÕES GRANULAR**
*Duração: 2-3 horas*

#### **3.1 Implementar RBAC Completo**
- [ ] Sistema hierárquico de permissões
- [ ] Verificações granulares por resource/action
- [ ] Guards para rotas protegidas

**Arquivo:** `frontend/src/auth/guards/RoleGuard.tsx`
```typescript
interface RoleGuardProps {
  requiredRole: UserRole;
  requiredLevel?: number;
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  requiredRole, 
  requiredLevel, 
  children, 
  fallback 
}) => {
  const { profile, hasRole, hasMinimumLevel } = useAuth();
  
  const hasAccess = hasRole(requiredRole) || 
    (requiredLevel && hasMinimumLevel(requiredLevel));
  
  return hasAccess ? <>{children}</> : (fallback || <Unauthorized />);
};
```

#### **3.2 Middleware de Autorização**
- [ ] Guards automáticos em rotas
- [ ] Verificação de tenant (multi-tenant)
- [ ] Logs de acesso e auditoria

### **FASE 4: OTIMIZAÇÕES E SEGURANÇA**
*Duração: 1-2 horas*

#### **4.1 Performance e Cache**
- [ ] Cache inteligente de perfil do usuário
- [ ] Otimização de queries de permissão
- [ ] Lazy loading de dados não críticos

#### **4.2 Segurança Avançada**
- [ ] Rate limiting por IP
- [ ] Detecção de tentativas de força bruta
- [ ] Logs de segurança detalhados
- [ ] Sanitização de inputs

#### **4.3 Monitoramento**
- [ ] Métricas de performance de login
- [ ] Alertas de falhas de autenticação
- [ ] Dashboard de saúde do sistema

---

## 🏗️ ARQUITETURA FINAL

### **Fluxo de Autenticação Unificado**

```mermaid
graph TD
    A[Usuário acessa /login] --> B{Tipo de Portal}
    B -->|Super Admin| C[SuperAdminLogin]
    B -->|Admin/Manager/User| D[AdminLogin]  
    B -->|Cidadão| E[CidadaoLogin]
    
    C --> F[AuthService.login()]
    D --> F
    E --> F
    
    F --> G[Backend /auth/login]
    G --> H[Verificar credenciais]
    H --> I[Gerar JWT tokens]
    I --> J[Response padronizada]
    
    J --> K{Role do usuário}
    K -->|super_admin| L[/super-admin/dashboard]
    K -->|admin| M[/admin/dashboard]
    K -->|manager| N[/manager/dashboard]
    K -->|coordinator| O[/coordinator/dashboard]
    K -->|user| P[/dashboard]
    K -->|guest| Q[/cidadao/servicos]
```

### **Hierarquia de Roles**

```
👑 super_admin (Nível 5)
    ├── Acesso total ao sistema
    ├── Gerenciamento de tenants
    └── Configurações avançadas

🏛️ admin (Nível 4) 
    ├── Administração municipal
    ├── Gestão de usuários
    └── Relatórios executivos

📊 manager (Nível 3)
    ├── Gestão de secretaria
    ├── Relatórios gerenciais
    └── Aprovações de alto nível

👥 coordinator (Nível 2)
    ├── Coordenação de equipes
    ├── Supervisão de processos
    └── Relatórios operacionais

⚙️ user (Nível 1)
    ├── Operações básicas
    ├── Atendimento ao cidadão
    └── Protocolos simples

🌐 guest (Nível 0)
    ├── Serviços públicos
    ├── Consultas básicas
    └── Protocolos cidadão
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### **Backend**
- [ ] ✅ Corrigir userService com campos corretos
- [ ] ✅ Atualizar authController com response padronizada  
- [ ] ✅ Implementar sistema de refresh tokens
- [ ] ✅ Criar middleware de autorização por role
- [ ] ✅ Atualizar migration com todos os roles
- [ ] ✅ Implementar rate limiting
- [ ] ✅ Adicionar logs de segurança

### **Frontend**
- [ ] ✅ Remover dependência Supabase do SuperAdminLogin
- [ ] ✅ Consolidar AuthService unificado
- [ ] ✅ Refatorar 3 portais de login
- [ ] ✅ Implementar sistema de redirecionamento
- [ ] ✅ Criar RoleGuard e PermissionGuard
- [ ] ✅ Atualizar useAuth hook
- [ ] ✅ Implementar cache inteligente

### **Testes**
- [ ] ✅ Testar login em cada portal
- [ ] ✅ Verificar redirecionamento por role
- [ ] ✅ Validar permissões granulares
- [ ] ✅ Testar refresh de tokens
- [ ] ✅ Verificar isolamento de tenant

### **Deploy**
- [ ] ✅ Executar migrations em produção
- [ ] ✅ Atualizar variáveis de ambiente
- [ ] ✅ Verificar funcionamento na VPS
- [ ] ✅ Monitorar logs de erro
- [ ] ✅ Validar performance

---

## 🚀 RESULTADO ESPERADO

### **Antes (Situação Atual)**
- ❌ 5 formulários desorganizados
- ❌ 2 sistemas de auth (Supabase + JWT)
- ❌ 3 roles funcionando de 6
- ❌ Response inconsistente
- ❌ Falhas de mapeamento de dados
- ❌ Login com erros

### **Depois (Implementação)**
- ✅ 3 portais organizados e funcionais
- ✅ Sistema JWT unificado 
- ✅ 6 roles hierárquicos completos
- ✅ Response padronizada
- ✅ Mapeamento correto de dados
- ✅ Login <2s sem erros
- ✅ Cache inteligente >85%
- ✅ Zero race conditions
- ✅ Segurança robusta
- ✅ Monitoramento completo

### **Benefícios**
1. **Performance:** Login 3x mais rápido
2. **Segurança:** Rate limiting + auditoria
3. **Manutenibilidade:** Código 70% mais simples
4. **Escalabilidade:** Multi-tenant preparado
5. **UX:** Redirecionamento inteligente
6. **Monitoramento:** Métricas em tempo real

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Tempo de Login** | <2s | Performance API |
| **Taxa de Erro** | <1% | Logs de erro |
| **Cache Hit Rate** | >85% | Métricas de cache |
| **Disponibilidade** | >99.5% | Uptime monitoring |
| **Segurança** | Zero vulnerabilidades | Auditoria de segurança |

---

*Documento criado em 28/08/2025 - DigiUrban Authentication System*
*Versão: 1.0 - Status: Pronto para implementação*