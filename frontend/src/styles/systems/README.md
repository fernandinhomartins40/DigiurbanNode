# 🎨 Sistema de Estilos Modular - DigiUrban

## Visão Geral

Este sistema implementa uma arquitetura CSS profissional com estilos separados por contexto, evitando conflitos e permitindo otimização de carregamento.

## 📁 Estrutura dos Arquivos

```
src/styles/systems/
├── index.css              # Base global + utilitários
├── super-admin.css         # Estilos do Super Admin Panel
├── landing-page.css        # Estilos da Landing Page
├── admin-panel.css         # Estilos do Admin Panel
├── citizen-panel.css       # Estilos do Citizen Panel
├── stylesManager.ts        # Gerenciador de sistemas
└── README.md              # Esta documentação
```

## 🏗️ Arquitetura

### 4 Sistemas Isolados

1. **Super Admin** (`.super-admin-*`)
   - Namespace: `super-admin`
   - Cores: Azul/Roxo corporativo
   - Foco: Métricas SaaS, dashboards executivos

2. **Landing Page** (`.landing-*`)
   - Namespace: `landing`
   - Cores: Azul escuro/Roxo
   - Foco: Marketing, conversão, SEO

3. **Admin Panel** (`.admin-*`)
   - Namespace: `admin`
   - Cores: Azul/Marrom
   - Foco: Gestão, formulários, tabelas

4. **Citizen Panel** (`.citizen-*`)
   - Namespace: `citizen`
   - Cores: Verde/Turquesa
   - Foco: Usabilidade, mobile-first

## 🚀 Como Usar

### Método 1: Hook React (Recomendado)

```tsx
import { useStyleSystem } from '@/hooks/useStyleSystem';

function MyComponent() {
  const { systemClasses, currentSystem } = useStyleSystem();
  
  return (
    <div className={systemClasses.layout}>
      <header className={systemClasses.header}>
        <h1>Sistema: {currentSystem}</h1>
      </header>
      <main className={systemClasses.content}>
        <div className={systemClasses.card}>
          <button className={systemClasses.buttonPrimary}>
            Ação Principal
          </button>
        </div>
      </main>
    </div>
  );
}
```

### Método 2: Hooks Específicos

```tsx
import { useSuperAdminStyles } from '@/hooks/useStyleSystem';

function SuperAdminPage() {
  const { layout, header, card, buttonPrimary } = useSuperAdminStyles();
  
  return (
    <div className={layout}>
      <header className={header}>...</header>
      <div className={card}>
        <button className={buttonPrimary}>Ação</button>
      </div>
    </div>
  );
}
```

### Método 3: Provider/HOC

```tsx
import { StyleSystemProvider, withSuperAdminStyles } from '@/hooks/useStyleSystem';

// Provider
function App() {
  return (
    <StyleSystemProvider system="super-admin">
      <MyComponent />
    </StyleSystemProvider>
  );
}

// HOC
const SuperAdminPage = withSuperAdminStyles(({ children }) => (
  <div>{children}</div>
));
```

### Método 4: Classes Manuais

```tsx
// Para casos específicos onde precisa de controle total
function CustomComponent() {
  return (
    <div className="super-admin-layout">
      <header className="super-admin-header">
        <h1 className="super-admin-gradient-text">Título</h1>
      </header>
      <main className="super-admin-content">
        <div className="super-admin-kpi-grid">
          <div className="super-admin-kpi-card">
            KPI Card
          </div>
        </div>
      </main>
    </div>
  );
}
```

## 📊 Classes Disponíveis por Sistema

### Super Admin

```css
.super-admin-layout          /* Layout principal */
.super-admin-header          /* Cabeçalho */
.super-admin-content         /* Área de conteúdo */
.super-admin-kpi-grid        /* Grid de KPIs */
.super-admin-kpi-card        /* Cards de métricas */
.super-admin-section         /* Seções */
.super-admin-button          /* Botões base */
.super-admin-button--primary /* Botão primário */
.super-admin-badge           /* Badges */
.super-admin-glass-effect    /* Efeito vidro */
.super-admin-gradient-text   /* Texto gradiente */
```

### Landing Page

```css
.landing-page               /* Layout da landing */
.landing-navbar            /* Navegação */
.landing-hero              /* Seção hero */
.landing-section           /* Seções de conteúdo */
.landing-feature-card      /* Cards de features */
.landing-testimonial       /* Depoimentos */
.landing-cta               /* Call-to-action */
.landing-button            /* Botões */
.landing-button--primary   /* Botão principal */
```

### Admin Panel

```css
.admin-layout              /* Layout com sidebar */
.admin-sidebar             /* Barra lateral */
.admin-main                /* Área principal */
.admin-header              /* Cabeçalho */
.admin-content             /* Conteúdo */
.admin-card                /* Cards */
.admin-stats-grid          /* Grid de estatísticas */
.admin-button              /* Botões */
.admin-table               /* Tabelas */
.admin-badge               /* Badges de status */
```

### Citizen Panel

```css
.citizen-layout            /* Layout do cidadão */
.citizen-header            /* Cabeçalho amigável */
.citizen-main              /* Área principal */
.citizen-service-card      /* Cards de serviços */
.citizen-protocol-card     /* Cards de protocolos */
.citizen-form-container    /* Formulários */
.citizen-button            /* Botões */
.citizen-status-badge      /* Status dos protocolos */
.citizen-progress          /* Barra de progresso */
```

## 🎯 Detecção Automática

O sistema detecta automaticamente qual estilo carregar baseado na rota:

```typescript
'/super-admin/*'     → Super Admin System
'/admin/*'           → Admin Panel System  
'/gabinete/*'        → Admin Panel System
'/saude/*'           → Admin Panel System
'/cidadao/*'         → Citizen Panel System
'/meus-protocolos/*' → Citizen Panel System
'/'                  → Landing Page System
'/auth/*'            → Landing Page System
```

## 🔧 Configuração Avançada

### Carregamento Manual

```typescript
import { loadSystemStyles } from '@/styles/systems/stylesManager';

// Carrega sistema específico
await loadSystemStyles('super-admin');

// Alterna entre sistemas
await loadSystemStyles('citizen');
```

### Configuração Custom

```typescript
import { STYLE_SYSTEMS } from '@/styles/systems/stylesManager';

// Acessa configuração do sistema
const config = STYLE_SYSTEMS['super-admin'];
console.log(config.primaryColor); // #2563eb
console.log(config.features);     // ['Design system unificado', ...]
```

## 🎨 Personalização

### CSS Custom Properties

Cada sistema define suas próprias variáveis CSS:

```css
/* Super Admin */
--super-admin-primary: #2563eb;
--super-admin-secondary: #8b5cf6;

/* Admin Panel */  
--admin-primary: #0369a1;
--admin-secondary: #7c2d12;

/* Citizen Panel */
--citizen-primary: #16a34a;
--citizen-secondary: #0891b2;

/* Landing Page */
--landing-primary: #1d4ed8;
--landing-secondary: #7c3aed;
```

### Utilitários Globais

Classes utilitárias disponíveis em todos os sistemas:

```css
.container, .container--wide, .container--narrow
.flex, .flex-col, .items-center, .justify-center
.grid, .grid-cols-1, .grid-cols-2, .grid-auto-fit
.gap-1, .gap-2, .gap-4, .gap-6, .gap-8
.p-4, .p-6, .m-4, .m-6
.rounded, .rounded-lg, .rounded-xl
.shadow, .shadow-md, .shadow-lg
.transition, .hover-lift, .hover-scale
```

## 📱 Responsividade

Todos os sistemas são mobile-first e incluem breakpoints:

```css
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## ♿ Acessibilidade

- Suporte a `prefers-reduced-motion`
- Suporte a `prefers-contrast: high`
- Classes `.sr-only` para screen readers
- Estados de foco visíveis
- Contraste adequado em todos os sistemas

## 🌙 Dark Mode

Suporte automático ao dark mode via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  /* Adaptações automáticas */
}
```

## ⚡ Performance

- **Carregamento sob demanda**: Apenas o CSS necessário é carregado
- **Cache inteligente**: Sistemas já carregados não são recarregados  
- **Pré-loading**: Sistema da landing é pré-carregado para performance inicial
- **Minificação**: CSS otimizado em produção
- **Tree-shaking**: Classes não utilizadas são removidas

## 🔍 Debug

Em desenvolvimento, o sistema mostra informações úteis:

```typescript
// Informações do sistema ativo no console
🎨 Sistema de Estilos Ativo
Sistema: Super Admin Panel
Namespace: super-admin
Cor Primária: #2563eb
Features: Design system unificado, Componentes KPI avançados, ...
```

## 🚨 Troubleshooting

### Problema: Estilos não carregam
```typescript
// Força carregamento manual
import { initializeStyleSystem } from '@/styles/systems/stylesManager';
await initializeStyleSystem();
```

### Problema: Conflito entre sistemas
```typescript
// Limpa cache e recarrega
loadedStyles.clear();
await loadSystemStyles('super-admin');
```

### Problema: Classes não funcionam
```typescript
// Verifica sistema ativo
const current = document.body.getAttribute('data-system');
console.log('Sistema ativo:', current);
```

## 📈 Roadmap

- [ ] Temas customizáveis por tenant
- [ ] Sistema de cores dinâmico
- [ ] Suporte a CSS-in-JS
- [ ] Componentes headless
- [ ] Design tokens JSON
- [ ] Storybook integration

## 🤝 Contribuição

Para adicionar um novo sistema:

1. Crie `new-system.css` seguindo a estrutura existente
2. Adicione configuração em `stylesManager.ts`
3. Crie hook específico em `useStyleSystem.tsx`
4. Atualize detecção de rotas
5. Documente classes disponíveis

---

**Desenvolvido com ❤️ pela equipe DigiUrban**