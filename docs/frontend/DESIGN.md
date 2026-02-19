# Design System - EdiculaWorks Frontend

> Documento de design e arquitetura do frontend da plataforma EdiculaWorks.

---

## 1. Visão Geral

### 1.1 Objetivo

Criar um frontend moderno, modular e adaptativo que funcione como:
- Website responsivo
- PWA (Progressive Web App)
- App nativo (iOS/Android) via Capacitor

### 1.2 Stack Técnica

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 14+ | Framework (App Router) |
| TypeScript | 5.x | Tipagem |
| Tailwind CSS | 3.x | Estilização |
| shadcn/ui | latest | Componentes |
| Capacitor | 5.x | Wrapper nativo |
| Zustand | 4.x | Estado global |
| React Query | 5.x | Server state |
| React Hook Form | 7.x | Formulários |
| Zod | 3.x | Validação |
| date-fns | 3.x | Datas |
| Lucide React | latest | Ícones |

---

## 2. Princípios de Design

### 2.1 Princípios Fundamentais

1. **Modularidade**
   - Componentes reutilizáveis e isolados
   - Atomic Design (átomos → moléculas → organismos)
   - Cada feature é um módulo independente

2. **Responsividade**
   - Mobile-first (escreva para mobile primeiro, expanda para desktop)
   - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

3. **Adaptabilidade**
   - Layout diferente para mobile vs desktop
   - PWA-ready para install como app
   - Suporte a dark/light mode

4. **Performance**
   - Code splitting automático
   - Imagens otimizadas (next/image)
   - Lazy loading de componentes pesados

5. **Acessibilidade**
   - WCAG 2.1 AA
   - Navegação por teclado
   - Screen reader friendly
   - Contraste adequado

### 2.2 Arquitetura de Componentes

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/             # Rotas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/        # Rotas protegidas
│   │   ├── layout.tsx      # Layout com sidebar
│   │   ├── page.tsx       # Dashboard
│   │   ├── chat/
│   │   ├── kanban/
│   │   ├── tarefas/
│   │   ├── projetos/
│   │   ├── contratos/
│   │   ├── financeiro/
│   │   ├── calendario/
│   │   ├── monitor/
│   │   └── settings/
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui base
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── atoms/              # Átomos (Button, Input, Badge, Avatar)
│   ├── molecules/         # Moléculas (SearchBar, TaskCard)
│   ├── organisms/         # Organismos (KanbanBoard, ChatPanel)
│   ├── templates/         # Templates de página
│   └── layouts/          # Layout components (Sidebar, Header)
├── hooks/                  # Custom hooks
├── lib/                    # Utilitários
│   ├── api.ts            # Client API
│   ├── utils.ts          # Funções helpers
│   └── constants.ts      # Constantes
├── stores/                 # Zustand stores
│   ├── auth-store.ts
│   ├── ui-store.ts
│   └── ...
├── types/                  # TypeScript types
└── styles/                # Estilos globais
    └── globals.css
```

---

## 3. Design System

### 3.1 Cores

#### Paleta Base (Dark Mode First)

```css
/* Cores base */
--background: #0a0a0a;      /* Fundo principal */
--foreground: #fafafa;      /* Texto principal */
--surface: #171717;         /* Cards, elementos */
--surface-hover: #262626;   /* Hover de surface */
--surface-elevated: #1f1f1f; /* Elementos elevados */

/* Cores primárias */
--primary: #22c55e;         /* Verde - ação principal */
--primary-foreground: #000000;
--primary-hover: #16a34a;

/* Cores de acento (IA) */
--accent: #8b5cf6;          /* Roxo - IA */
--accent-foreground: #ffffff;

/* Cores semânticas */
--success: #22c55e;         /* Verde */
--warning: #f59e0b;        /* Amarelo */
--error: #ef4444;          /* Vermelho */
--info: #3b82f6;           /* Azul */

/* Bordas */
--border: #262626;
--border-hover: #404040;

/* Cores por área (opcional) */
--color-tarefas: #3b82f6;   /* Azul */
--color-contratos: #8b5cf6; /* Roxo */
--color-financeiro: #22c55e; /* Verde */
--color-projetos: #f59e0b;  /* Amarelo */
--color-monitor: #ef4444;   /* Vermelho */
```

#### Paleta Light Mode

```css
--background: #fafafa;
--foreground: #0a0a0a;
--surface: #ffffff;
--surface-hover: #f5f5f5;
--surface-elevated: #ffffff;
--primary: #16a34a;
--primary-foreground: #ffffff;
--accent: #7c3aed;
--border: #e5e5e5;
```

### 3.2 Tipografia

| Elemento | Fonte | Tamanho | Peso | Line Height |
|----------|-------|---------|------|-------------|
| H1 | Inter | 36px | 700 | 1.2 |
| H2 | Inter | 30px | 600 | 1.25 |
| H3 | Inter | 24px | 600 | 1.3 |
| H4 | Inter | 20px | 600 | 1.35 |
| Body | Inter | 16px | 400 | 1.5 |
| Body Small | Inter | 14px | 400 | 1.5 |
| Caption | Inter | 12px | 400 | 1.4 |
| Code | JetBrains Mono | 14px | 400 | 1.6 |

```css
/* Font families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.3 Espaçamento

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### 3.4 Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### 3.5 Sombras

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### 3.6 Breakpoints (Tailwind)

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

---

## 4. Componentes Base (shadcn/ui)

### 4.1 Componentes Utilizados

| Componente | Uso |
|------------|-----|
| Button | Ações principais e secundárias |
| Input | Campos de texto |
| Select | Dropdowns |
| Dialog | Modais |
| Dropdown Menu | Menus contextuais |
| Card | Containers de conteúdo |
| Table | Listas e dados |
| Badge | Tags e status |
| Avatar | Imagens de usuário |
| Tabs | Navegação interna |
| Sheet | Sidebar mobile |
| Form | Cadastro/edição |
| Calendar | Seleção de datas |
| Popover | Tooltips avançados |
| Skeleton | Loading states |
| Toast | Notificações |

### 4.2 Componentes Custom

```typescript
// Componentes específicos do app
- KanbanBoard      // Quadro Kanban
- KanbanColumn    // Coluna do Kanban
- TaskCard         // Card de tarefa
- ChatPanel        // Painel de chat
- ChatMessage      // Mensagem de chat
- AgentSelector    // Seletor de agente
- MetricCard       // Card de métrica (dashboard)
- FinancialChart   // Gráficos financeiros
- CalendarEvent    // Evento no calendário
- StatusBadge     // Badge de status
- PriorityIndicator // Indicador de prioridade
- ProjectCard     // Card de projeto
- ContractCard    // Card de contrato
- TransactionRow  // Linha de transação
```

---

## 5. Páginas

### 5.1 Chat (/chat)

**Descrição:** Interface de chat com agentes IA

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header: Seletor de agente + Config              │
├─────────────────────────────────────────────────┤
│                                                 │
│              Área de Mensagens                  │
│  ┌─────────────────────────────────────────┐   │
│  │ 🤖 Agent                                 │   │
│  │ Mensagem da IA...                       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 👤 Você                                  │   │
│  │ Sua mensagem...                          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│ Input: Campo de mensagem + Enviar              │
└─────────────────────────────────────────────────┘
```

**Componentes:**
- AgentSelector (dropdown com avatares dos agentes)
- ChatPanel (scroll + mensagens)
- ChatMessage (bolhas com avatar, timestamp)
- MessageInput (textarea com submit)

**Mobile:**
- Bottom navigation
- Full screen chat
- Swipe para agentes

### 5.2 Kanban (/kanban)

**Descrição:** Quadro visual de tarefas com drag-and-drop

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Projeto selector + Filtros + Vista                │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ A Fazer  │Em Andamento│ Em Revisão│ Concluída│   + Coluna  │
│          │           │           │          │              │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │              │
│ │Task 1│ │ │Task 3│ │ │Task 5│ │ │Task 7│ │              │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │              │
│ ┌──────┐ │ ┌──────┐ │           │          │              │
│ │Task 2│ │ │Task 4│ │           │          │              │
│ └──────┘ │ └──────┘ │           │          │              │
└──────────┴──────────┴──────────┴──────────┴──────────────┘
```

**Componentes:**
- KanbanBoard (container)
- KanbanColumn (coluna com header)
- TaskCard (card arrastável)
- TaskModal (detalhes)
- ColumnAdder

**Funcionalidades:**
- Drag and drop (dnd-kit ou @hello-pangea/dnd)
- Filtros por prioridade, responsável, projeto
- Quick add task
- Colapsar colunas

### 5.3 Tarefas (/tarefas)

**Descrição:** Lista filtrável de todas as tarefas

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header: Busca + Filtros + Criar + Export       │
├─────────────────────────────────────────────────┤
│ Filtros: Status | Prioridade | Responsável    │
├─────────────────────────────────────────────────┤
│  #   │ Tarefa          │Projeto│ Prio │ Status│
│──────┼─────────────────┼───────┼──────┼───────│
│  1   │ Setup API       │ Prj 1 │ Alta │ Done  │
│  2   │ Kanban UI       │ Prj 1 │ Média│ In Prg│
│  3   │ DB Schema      │ Prj 2 │ Alta │ Todo  │
└─────────────────────────────────────────────────┘
```

**Componentes:**
- TaskTable (tabela)
- TaskFilters (filtros)
- TaskRow (linha)
- BulkActions

### 5.4 Contratos (/contratos)

**Descrição:** Gestão de contratos e clientes

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header: Busca + Filtros + Criar                │
├─────────────────────────────────────────────────┤
│ Cards Grid / Lista Toggle                       │
│ ┌─────────────┐ ┌─────────────┐               │
│ │ Contrato A  │ │ Contrato B  │               │
│ │ R$ 5.000/m  │ │ R$ 10.000/m │               │
│ │ Expira 30d  │ │ Ativo      │               │
│ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────┘
```

**Componentes:**
- ContractCard
- ContractForm
- ContractFilters
- ClientList

### 5.5 Financeiro (/financeiro)

**Descrição:** Controle de transações, faturas e orçamentos

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header: Período + Criar + Export               │
├────────────┬────────────────────────────────────┤
│ Resumo     │ Transações Recentes              │
│ ┌────────┐ │ ┌────────────────────────────────┐│
│ │Receita │ │ │ Data │ Desc │ Cat │ Valor │   ││
│ │R$50.000│ │ │------│------│-----│------│   ││
│ └────────┘ │ │      │      │     │      │   ││
│ ┌────────┐ │ └────────────────────────────────┘│
│ │ Despesas│ │                                  │
│ │R$20.000│ │ Gráfico de barras/linha          │
│ └────────┘ │                                  │
│ ┌────────┐ │                                  │
│ │Saldo   │ │                                  │
│ │R$30.000│ │                                  │
│ └────────┘ │                                  │
└────────────┴────────────────────────────────────┘
```

**Componentes:**
- FinancialSummary (cards)
- TransactionList (tabela)
- TransactionForm
- FinancialChart (gráficos - recharts)
- CategoryManager
- InvoiceList

### 5.6 Projetos (/projetos)

**Descrição:** Lista de projetos com progresso

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header: Busca + Filtros + Criar                │
├─────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Projeto A   │ │ Projeto B   │ │ Projeto C   │ │
│ │ ████████░░  │ │ ██████████ │ │ ████░░░░░░  │ │
│ │ 80%         │ │ 100%        │ │ 40%         │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
```

**Componentes:**
- ProjectCard
- ProjectForm
- ProgressBar

### 5.7 Calendário (/calendario)

**Descrição:** Eventos, reuniões e prazos

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header: Mês/Week/Day + Criar                   │
├──────┬──────────────────────────────────────────┤
│ Side │ Calendário                               │
│ Evts │     ◀ Fevereiro 2026 ▶                 │
│ ──── │ Seg  Ter  Qua  Qui  Sex  Sáb  Dom      │
│ Reun │ [1]  [2]  [3]  [4]  [5]  [6]  [7]      │
│ ──── │ [8]  [9] [10] [11] [12] [13] [14]     │
│ Contr│ ...                                      │
└──────┴──────────────────────────────────────────┘
```

**Componentes:**
- Calendar (react-big-calendar ou @fullcalendar/react)
- EventModal
- EventList (sidebar mobile)
- EventFilters

**Tipos de evento:**
- Reunião
- Prazo de contrato
- Prazo de tarefa
- Lembrete
- Feriado

### 5.8 Dashboard (/dashboard)

**Descrição:** Visão geral com métricas

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Header:Olá, [Usuário] + Notificações          │
├─────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │Tarefas   │ │Receita   │ │Contratos │        │
│ │12 abertas│ │R$50.000 │ │3 expiram │        │
│ └──────────┘ └──────────┘ └──────────┘        │
├─────────────────────────────────────────────────┤
│ ┌────────────────────┐ ┌────────────────────┐ │
│ │ Tarefas Recentes   │ │ Atividade Agentes  │ │
│ │ • Task 1           │ │ • Tech:分析了...   │ │
│ │ • Task 2           │ │ • Chief: Entendi... │ │
│ └────────────────────┘ └────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Componentes:**
- MetricCard
- RecentTasks
- AgentActivity
- QuickActions

### 5.9 Monitor (/monitor)

**Descrição:** Monitoramento de VPS, Git, Vercel, Supabase

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Tabs: VPS | Git | Vercel | Supabase           │
├─────────────────────────────────────────────────┤
│ VPS                                             │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│ │ CPU 45%    │ │ RAM 8GB    │ │ Disco 60%  │  │
│ │ ████░░░░   │ │ ████░░░░   │ │ ██████░░░  │  │
│ └────────────┘ └────────────┘ └────────────┘  │
│                                                  │
│ ┌──────────────────────────────────────────┐  │
│ │ Processos: nginx, node, postgresql...   │  │
│ └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│ Git                                              │
│ ┌──────────────────────────────────────────┐  │
│ │ Commits: main (2h atrás)                 │  │
│ │ BRANCH: feature/x (3 commits)            │  │
│ │ PRs: 2 abertos                           │  │
│ └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Componentes:**
- VPSMetricsPanel
- GitPanel
- VercelPanel
- SupabasePanel
- ServiceStatus (online/offline)
- MetricChart

### 5.10 Settings (/settings)

**Descrição:** Configurações do usuário e sistema

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ Tabs: Perfil | Empresa | Notificações | API   │
├─────────────────────────────────────────────────┤
│ Perfil                                          │
│ ┌─────────────────────────────────────────┐    │
│ │ Avatar                    [Alterar]      │    │
│ │ Nome: João Silva                        │    │
│ │ Email: joao@empresa.com                │    │
│ │ Cargo: Desenvolvedor                    │    │
│ └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

**Componentes:**
- ProfileForm
- CompanySettings
- NotificationSettings
- ApiKeyManager
- ThemeToggle

---

## 6. Layout Mobile vs Desktop

### 6.1 Desktop

```
┌──────────┬────────────────────────────────────┐
│          │ Header (breadcrumbs + user)         │
│  Sidebar ├────────────────────────────────────┤
│  (fixed) │                                    │
│          │         Conteúdo                    │
│          │                                    │
│          │                                    │
└──────────┴────────────────────────────────────┘
```

### 6.2 Mobile

```
┌────────────────────┐
│ Header (hamburger) │
├────────────────────┤
│                    │
│    Conteúdo        │
│                    │
│                    │
├────────────────────┤
│ Bottom Navigation  │
│ 🏠 📋 💬 📊 ⚙️    │
└────────────────────┘
```

### 6.3 Breakpoints de Comportamento

| Componente | Mobile (<768px) | Desktop (≥768px) |
|------------|-----------------|------------------|
| Navigation | Bottom nav | Sidebar |
| Kanban | Scroll horizontal | Visível completo |
| Cards | Grid 1 coluna | Grid 2-4 colunas |
| Tables | Card view | Table view |
| Charts | Compactos | Expandidos |
| Modals | Full screen | Dialog centered |

---

## 7. PWA & App Nativo

### 7.1 PWA Configuration

```typescript
// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EdiculaWorks',
    short_name: 'Edicula',
    description: 'Sistema interno de gestão com IA',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#22c55e',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
```

### 7.2 Capacitor (App Nativo)

```json
// capacitor.config.ts
{
  "appId": "com.edicula.works",
  "appName": "EdiculaWorks",
  "webDir": "out",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 3000
    },
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}
```

### 7.3 Funcionalidades por Plataforma

| Funcionalidade | Web | PWA | App |
|----------------|-----|-----|-----|
| Chat com agentes | ✅ | ✅ | ✅ |
| Kanban | ✅ | ✅ | ✅ |
| Notificações push | ❌ | ✅ | ✅ |
| Câmera | ❌ | ⚠️ | ✅ |
| GPS | ❌ | ⚠️ | ✅ |
| Offline mode | ❌ | ✅ | ✅ |
| Acesso a arquivos | ❌ | ⚠️ | ✅ |

---

## 8. Integrações

### 8.1 API

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export const api = {
  // Tarefas
  getTarefas: () => fetch('/api/tarefas'),
  createTarefa: (data) => fetch('/api/tarefas', { method: 'POST', body: JSON.stringify(data) }),
  
  // Contratos
  getContratos: () => fetch('/api/contratos'),
  
  // Chat
  sendMessage: (agent: string, message: string) => 
    fetch('/api/chat', { method: 'POST', body: JSON.stringify({ agent, message }) }),
    
  // Monitor
  getVPSMetrics: () => fetch('/api/monitor/vps'),
  getGitStatus: () => fetch('/api/monitor/git'),
}
```

### 8.2 Supabase (Frontend)

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 9. Roadmap de Implementação

### Fase 1: Foundation
- [ ] Setup Next.js 14 + TypeScript + Tailwind
- [ ] Configurar shadcn/ui
- [ ] Design system base (cores, tipografia)
- [ ] Layout (sidebar, header, theme)

### Fase 2: Core Features
- [ ] Autenticação (login/register)
- [ ] Dashboard com métricas
- [ ] Chat com agentes (básico)
- [ ] Kanban (básico)

### Fase 3: Gestão
- [ ] Tarefas (CRUD completo)
- [ ] Projetos
- [ ] Contratos
- [ ] Financeiro

### Fase 4: Extras
- [ ] Calendário
- [ ] Monitor (VPS, Git, Vercel, Supabase)
- [ ] Settings

### Fase 5: Mobile & PWA
- [ ] Layouts mobile responsivos
- [ ] PWA manifest + service worker
- [ ] Capacitor setup
- [ ] Testes em dispositivo

---

## 10. Referências

- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Next.js PWA](https://nextjs.org/docs/app/guides/progressive-web-app)
- [Capacitor](https://capacitorjs.com)
- [Human Academy Design](https://www.humanacademy.ai) - Referência visual
- [Bento Grid Layouts](https://bentogrid.com)

---

## 11. Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-02-19 | Versão inicial do design |
