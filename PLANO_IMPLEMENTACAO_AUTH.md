# 🔐 PLANO DE IMPLEMENTAÇÃO - SISTEMA DE AUTENTICAÇÃO DIGIURBAN
**Sistema Completo de Autenticação com SQLite3 + JWT**

---

## 📋 ANÁLISE DO SISTEMA ATUAL

### 🏗️ **Arquitetura Identificada**
- **Frontend**: React + TypeScript com sistema de rotas protegidas
- **Autenticação Atual**: Supabase (será migrado para JWT local)
- **Hierarquia**: 6 níveis de usuários (guest → super_admin)
- **Multi-tenant**: Sistema organizacional por prefeituras
- **Permissões**: RBAC com verificação granular

### 👥 **Hierarquia de Usuários (Atual)**
```
Level 0: guest         → Cidadão (acesso público)
Level 1: user          → Funcionário (operações básicas)
Level 2: coordinator   → Coordenador (equipes)
Level 3: manager       → Secretário (gestão secretaria)
Level 4: admin         → Prefeito (gestão municipal)
Level 5: super_admin   → Desenvolvedor (acesso sistêmico)
```

### 🏛️ **Sistema de Tenants**
- Cada prefeitura = 1 tenant
- Isolamento completo de dados
- Código único por tenant
- Planos diferenciados (básico, premium, enterprise)

---

## 🎯 FASE 1: FUNDAÇÃO SQLite3 + JWT (Duração: 2-3 dias)

### 📦 **1.1 Estrutura de Banco SQLite3**

```sql
-- Tabela de Tenants (Prefeituras)
CREATE TABLE tenants (
    id TEXT PRIMARY KEY,
    tenant_code TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    plano TEXT CHECK(plano IN ('basico', 'premium', 'enterprise')) DEFAULT 'basico',
    status TEXT CHECK(status IN ('ativo', 'inativo', 'suspenso')) DEFAULT 'ativo',
    populacao INTEGER,
    endereco TEXT,
    responsavel_nome TEXT,
    responsavel_email TEXT,
    responsavel_telefone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    nome_completo TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('guest', 'user', 'coordinator', 'manager', 'admin', 'super_admin')) DEFAULT 'user',
    status TEXT CHECK(status IN ('ativo', 'inativo', 'pendente', 'bloqueado')) DEFAULT 'pendente',
    avatar_url TEXT,
    ultimo_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Tabela de Permissões
CREATE TABLE permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Permissões por Usuário
CREATE TABLE user_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(user_id, permission_id)
);

-- Tabela de Sessões JWT
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de Log de Atividades
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    tenant_id TEXT,
    action TEXT NOT NULL,
    resource TEXT,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Índices para Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_tenant ON activity_logs(tenant_id);
```

### 🔧 **1.2 Configuração JWT + Middleware**

```typescript
// backend/src/config/auth.ts
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key',
  JWT_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 horas
};

// backend/src/middleware/auth.ts
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, AUTH_CONFIG.JWT_SECRET) as JWTPayload;
    const user = await UserService.findById(decoded.userId);
    
    if (!user || user.status !== 'ativo') {
      return res.status(401).json({ error: 'Usuário inválido ou inativo' });
    }

    req.user = user;
    req.userRole = user.role;
    req.tenantId = user.tenant_id;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

### 📂 **1.3 Estrutura de Arquivos Backend**

```
backend/src/
├── config/
│   ├── database.ts          # Configuração SQLite3
│   ├── auth.ts             # Configurações JWT
│   └── environment.ts      # Variáveis de ambiente
├── models/
│   ├── User.ts             # Modelo de usuário
│   ├── Tenant.ts           # Modelo de tenant
│   ├── Permission.ts       # Modelo de permissões
│   └── Session.ts          # Modelo de sessões
├── services/
│   ├── AuthService.ts      # Lógica de autenticação
│   ├── UserService.ts      # CRUD de usuários
│   ├── TenantService.ts    # CRUD de tenants
│   └── PermissionService.ts # Gestão de permissões
├── middleware/
│   ├── auth.ts             # Middleware JWT
│   ├── permissions.ts      # Verificação de permissões
│   ├── tenant.ts           # Isolamento tenant
│   └── rateLimiter.ts      # Rate limiting
├── routes/
│   ├── auth.ts             # Rotas de autenticação
│   ├── users.ts            # Rotas de usuários
│   └── tenants.ts          # Rotas de tenants
├── utils/
│   ├── password.ts         # Hashing de senhas
│   ├── jwt.ts              # Utilitários JWT
│   ├── validation.ts       # Validações
│   └── logger.ts           # Sistema de logs
└── database/
    ├── connection.ts       # Conexão SQLite3
    ├── migrations/         # Migrações
    └── seeds/              # Dados iniciais
```

---

## 🚀 FASE 2: IMPLEMENTAÇÃO CORE (Duração: 3-4 dias)

### 🔐 **2.1 Serviço de Autenticação**

```typescript
// backend/src/services/AuthService.ts
export class AuthService {
  
  /**
   * Login com email e senha
   */
  static async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await UserService.findByEmail(email);
    
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      await this.logFailedAttempt(email, ipAddress);
      throw new Error('Credenciais inválidas');
    }

    if (user.status !== 'ativo') {
      throw new Error('Usuário inativo ou bloqueado');
    }

    // Gerar tokens JWT
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Salvar sessão
    await this.createSession(user.id, accessToken, ipAddress, userAgent);

    // Atualizar último login
    await UserService.updateLastLogin(user.id);

    // Log da atividade
    await ActivityService.log({
      user_id: user.id,
      tenant_id: user.tenant_id,
      action: 'login',
      ip_address: ipAddress
    });

    return {
      user: this.sanitizeUser(user),
      tokens: { accessToken, refreshToken }
    };
  }

  /**
   * Refresh token
   */
  static async refreshToken(refreshToken: string) {
    const decoded = jwt.verify(refreshToken, AUTH_CONFIG.JWT_SECRET) as JWTPayload;
    const user = await UserService.findById(decoded.userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const newAccessToken = this.generateAccessToken(user);
    return { accessToken: newAccessToken };
  }

  /**
   * Logout
   */
  static async logout(userId: string, token: string) {
    await this.invalidateSession(userId, token);
    await ActivityService.log({
      user_id: userId,
      action: 'logout'
    });
  }
}
```

### 👥 **2.2 Sistema de Registro**

```typescript
// backend/src/services/RegistrationService.ts
export class RegistrationService {
  
  /**
   * Registro de usuário comum
   */
  static async registerUser(data: {
    nome_completo: string;
    email: string;
    password: string;
    tenant_id?: string;
  }) {
    // Validar dados
    await this.validateRegistrationData(data);
    
    // Verificar se email já existe
    const existingUser = await UserService.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Criar usuário
    const userId = generateId();
    const user = await UserService.create({
      id: userId,
      nome_completo: data.nome_completo,
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      tenant_id: data.tenant_id,
      role: data.tenant_id ? 'user' : 'guest', // Cidadão sem tenant = guest
      status: 'pendente' // Requer ativação
    });

    // Gerar token de ativação
    const activationToken = this.generateActivationToken(userId);
    
    // Enviar email de ativação (implementar depois)
    // await EmailService.sendActivation(user.email, activationToken);

    return { user: this.sanitizeUser(user), activationToken };
  }

  /**
   * Registro de tenant + admin
   */
  static async registerTenantWithAdmin(tenantData: {
    nome: string;
    cidade: string;
    estado: string;
    cnpj: string;
    plano: 'basico' | 'premium' | 'enterprise';
  }, adminData: {
    nome_completo: string;
    email: string;
    password: string;
  }) {
    
    // Validar CNPJ único
    const existingTenant = await TenantService.findByCNPJ(tenantData.cnpj);
    if (existingTenant) {
      throw new Error('CNPJ já está em uso');
    }

    // Transação para criar tenant + admin
    return await Database.transaction(async () => {
      // Criar tenant
      const tenant = await TenantService.create({
        ...tenantData,
        tenant_code: await TenantService.generateUniqueCode(tenantData.nome)
      });

      // Criar admin do tenant
      const admin = await this.registerUser({
        ...adminData,
        tenant_id: tenant.id
      });

      // Atualizar role para admin
      await UserService.updateRole(admin.user.id, 'admin');

      return { tenant, admin };
    });
  }
}
```

### 🛡️ **2.3 Sistema de Permissões**

```typescript
// backend/src/services/PermissionService.ts
export class PermissionService {
  
  /**
   * Verificar se usuário tem permissão
   */
  static async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const user = await UserService.findById(userId);
    if (!user) return false;

    // Super admin tem acesso total
    if (user.role === 'super_admin') return true;

    // Verificar permissões diretas
    const directPermission = await Database.query(`
      SELECT 1 FROM user_permissions up
      JOIN permissions p ON up.permission_id = p.id
      WHERE up.user_id = ? AND p.code = ?
    `, [userId, permissionCode]);

    if (directPermission.length > 0) return true;

    // Verificar permissões por role
    const rolePermissions = this.getRolePermissions(user.role);
    return rolePermissions.some(p => p.code === permissionCode);
  }

  /**
   * Middleware de verificação
   */
  static requirePermission(permissionCode: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const hasPermission = await this.hasPermission(req.user.id, permissionCode);
      if (!hasPermission) {
        return res.status(403).json({ error: 'Permissão insuficiente' });
      }

      next();
    };
  }

  /**
   * Verificação hierárquica
   */
  static requireMinimumRole(minimumRole: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const userLevel = USER_HIERARCHY[req.user.role] || 0;
      const requiredLevel = USER_HIERARCHY[minimumRole] || 0;

      if (userLevel < requiredLevel) {
        return res.status(403).json({ error: 'Nível de acesso insuficiente' });
      }

      next();
    };
  }
}
```

---

## 🎨 FASE 3: INTEGRAÇÃO FRONTEND (Duração: 2-3 dias)

### 🔄 **3.1 Adaptação do AuthContext**

```typescript
// frontend/src/auth/providers/AuthProvider.tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Login adaptado para JWT local
   */
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const { user, tokens } = await response.json();

      // Armazenar tokens
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);

      // Carregar permissões
      const permissions = await loadUserPermissions(user.id);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, permissions, tenant: user.tenant }
      });

    } catch (error) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error instanceof Error ? error.message : 'Erro no login'
      });
      throw error;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('access_token');
    if (token && state.user) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    dispatch({ type: 'LOGOUT' });
  };

  // Auto-refresh token
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });

          if (response.ok) {
            const { accessToken } = await response.json();
            localStorage.setItem('access_token', accessToken);
          }
        } catch (error) {
          console.error('Erro ao renovar token:', error);
          logout();
        }
      }
    }, 23 * 60 * 1000); // Renovar a cada 23 minutos

    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      hasPermission: (permission: string) => 
        state.permissions.some(p => p.code === permission),
      hasRole: (role: UserRole) => state.user?.role === role,
      isAdmin: () => ['admin', 'super_admin'].includes(state.user?.role || ''),
      isSuperAdmin: () => state.user?.role === 'super_admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 📱 **3.2 Componentes de Registro**

```typescript
// frontend/src/pages/auth/RegisterCitizen.tsx
export const RegisterCitizen = () => {
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome_completo: formData.nome_completo,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        toast.success('Cadastro realizado! Verifique seu email para ativação.');
        navigate('/login');
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Erro no cadastro');
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cadastro Cidadão</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Input
              placeholder="Nome completo"
              value={formData.nome_completo}
              onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <Input
              type="password"
              placeholder="Confirmar senha"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
            <Button type="submit" className="w-full">
              Criar Conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};
```

### 🏛️ **3.3 Registro de Prefeitura**

```typescript
// frontend/src/pages/auth/RegisterTenant.tsx
export const RegisterTenant = () => {
  const [step, setStep] = useState(1);
  const [tenantData, setTenantData] = useState({
    nome: '',
    cidade: '',
    estado: '',
    cnpj: '',
    plano: 'basico' as 'basico' | 'premium' | 'enterprise'
  });
  const [adminData, setAdminData] = useState({
    nome_completo: '',
    email: '',
    password: ''
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/auth/register-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantData, adminData })
      });

      if (response.ok) {
        toast.success('Prefeitura cadastrada com sucesso!');
        navigate('/admin/login');
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Erro no cadastro da prefeitura');
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Cadastro de Prefeitura</CardTitle>
          <div className="flex justify-between">
            <span className={step >= 1 ? 'text-blue-600' : 'text-gray-400'}>
              1. Dados da Prefeitura
            </span>
            <span className={step >= 2 ? 'text-blue-600' : 'text-gray-400'}>
              2. Administrador
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <TenantForm data={tenantData} onChange={setTenantData} />
          )}
          {step === 2 && (
            <AdminForm data={adminData} onChange={setAdminData} />
          )}
          
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)}>
                Próximo
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Finalizar Cadastro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};
```

---

## 🔧 CONFIGURAÇÃO E DEPLOY

### 📋 **Checklist de Implementação**

**Fase 1 - Fundação:**
- [ ] Configurar SQLite3 + migrações
- [ ] Implementar modelos de dados
- [ ] Configurar JWT + middleware
- [ ] Criar seeds de dados iniciais
- [ ] Testes unitários dos services

**Fase 2 - Core:**
- [ ] Implementar AuthService completo
- [ ] Sistema de registro (cidadão + tenant)
- [ ] Sistema de permissões RBAC
- [ ] Middleware de autenticação/autorização
- [ ] API REST completa

**Fase 3 - Frontend:**
- [ ] Adaptar AuthContext para JWT
- [ ] Componentes de login/registro
- [ ] Atualizar ProtectedRoute
- [ ] Telas de gestão de usuários
- [ ] Integração completa

### 🚀 **Scripts de Deploy**

```bash
# Instalação das dependências
npm run install:all

# Executar migrações
npm run db:migrate

# Popular dados iniciais
npm run db:seed

# Executar testes
npm run test

# Build de produção
npm run build

# Iniciar aplicação
npm run start
```

### 📊 **Métricas de Sucesso**
- **Performance**: Login em < 500ms
- **Segurança**: JWT + rate limiting + hash seguro
- **Escalabilidade**: Suporte a 100+ tenants
- **UX**: Interface intuitiva e responsiva
- **Manutenibilidade**: Código limpo e testado

---

## 🎯 RESULTADO FINAL

Ao final das 3 fases, teremos:

✅ **Sistema de autenticação completo** com JWT local  
✅ **Multi-tenant** com isolamento de dados  
✅ **6 níveis hierárquicos** de usuários  
✅ **RBAC granular** com permissões específicas  
✅ **Registro automatizado** para cidadãos e prefeituras  
✅ **Interface moderna** e intuitiva  
✅ **SQLite3 otimizado** com performance  
✅ **Segurança robusta** com rate limiting e validações  

O sistema será **mais rápido**, **mais seguro** e **mais simples** que o atual baseado em Supabase, com controle total sobre os dados e funcionalidades.