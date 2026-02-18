# Tutorial: Configuração Supabase - EdiculaWorks

## Visão Geral

Este documento explica como configurar o Supabase como banco de dados para a plataforma EdiculaWorks.

---

## 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha os dados:
   - **Organization**: EdiculaWorks
   - **Name**: edicula-platform
   - **Database Password**: `GEREUMA_SENHA_FORTE`
   - **Region**: 选择 a mais próxima (us-east-1 para Brasil)
4. Aguarde o projeto ser criado (2-3 minutos)

---

## 2. Obter Credenciais

Após criado, vá em **Settings → API**:

| Variável | Valor |
|----------|-------|
| Project URL | `https://xxxxx.supabase.co` |
| anon public (ANON_KEY) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| service_role (SERVICE_KEY) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

⚠️ **Importante**: A Service Key tem acesso total ao banco. **NÃO** exponha em código client.

---

## 3. Configurar no Servidor

### Opção A: Script Automático

```bash
cd /opt/edicula/scripts
sudo ./install-supabase.sh
```

### Opção B: Manual

```bash
# Criar diretório
sudo mkdir -p /etc/openclaw

# Criar arquivo de ambiente
sudo nano /etc/openclaw/env
```

Adicione:
```bash
# OpenRouter (IA)
OPENROUTER_API_KEY=sk-or-...

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# SERVICE_KEY apenas para operações admin (não exposta ao cliente)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```bash
# Proteger arquivo
sudo chmod 600 /etc/openclaw/env
```

---

## 4. Criar Schema do Banco

No painel Supabase, vá em **SQL Editor** e execute:

### Tabelas Base

```sql
-- Empresas (multi-tenant)
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cargo TEXT DEFAULT 'member',
    role TEXT DEFAULT 'member',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projetos
CREATE TABLE projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tarefas (Kanban)
CREATE TABLE tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    coluna TEXT DEFAULT 'todo',
    prioridade TEXT DEFAULT 'media',
    estimativa_horas DECIMAL(6,2),
    prazo DATE,
    data_conclusao TIMESTAMPTZ,
    tags TEXT[],
    created_by UUID REFERENCES usuarios(id),
    assigned_to UUID[],
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contratos
CREATE TABLE contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    conteudo TEXT,
    tipo TEXT,
    contratante TEXT,
    contratado TEXT,
    valor DECIMAL(12,2),
    status TEXT DEFAULT 'draft',
    data_inicio DATE,
    data_fim DATE,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transações
CREATE TABLE transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    categoria TEXT,
    descricao TEXT,
    valor DECIMAL(12,2) NOT NULL,
    data_transacao DATE NOT NULL,
    status TEXT DEFAULT 'pendente',
    contrato_id UUID REFERENCES contratos(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Habilitar pgVector

```sql
-- Habilitar extensão
CREATE EXTENSION IF NOT EXISTS vector;

-- Criar índices vetoriais
CREATE INDEX tarefas_embedding_idx ON tarefas USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX contratos_embedding_idx ON contratos USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);
```

### Políticas de Segurança (RLS)

```sql
-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- Política: usuários só veem dados da própria empresa
CREATE POLICY "users_see_own_company" ON tarefas
    FOR SELECT USING (empresa_id IN (
        SELECT empresa_id FROM usuarios WHERE id = auth.uid()
    ));
```

---

## 5. Configurar API Python

Atualize o `.env`:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

No código Python:

```python
from supabase import create_client, Client

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Consultas
result = supabase.table("tarefas").select("*").execute()
```

---

## 6. Buscas Semânticas com pgVector

### Gerar Embedding

```python
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENROUTER_API_KEY"))

def gerar_embedding(texto: str) -> list:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texto
    )
    return response.data[0].embedding
```

### Buscar Similares

```python
def buscar_tarefas_similares(texto: str, empresa_id: str, limite: int = 5):
    embedding = gerar_embedding(texto)
    
    result = supabase.rpc(
        'buscar_tarefas_similares',
        {
            'query_embedding': embedding,
            'empresa_id': empresa_id,
            'limite': limite
        }
    ).execute()
    
    return result.data
```

---

## 7. Testar Configuração

```bash
# Testar conexão
curl -X GET 'https://xxxxx.supabase.co/rest/v1/empresas' \
  -H 'apikey: SU_ANON_KEY' \
  -H 'Authorization: Bearer SU_ANON_KEY'
```

---

## Troubleshooting

### "relation does not exist"
Execute o script SQL novamente no SQL Editor do Supabase.

### "Row-level security"
Verifique as políticas RLS ou desabilite temporariamente para teste:
```sql
ALTER TABLE tarefas DISABLE ROW LEVEL SECURITY;
```

### "Invalid JWT"
Verifique se a API Key está correta no .env.

---

## Custos Supabase

| Plano | Preço | Limites |
|-------|-------|---------|
| Free | $0 | 500MB DB, 1GB Storage, 2 concurrent |
| Pro | $25/mês | 8GB DB, 100GB Storage, 50 concurrent |

Para uso interno, o **Free** é suficiente no início.

---

## Próximos Passos

1. ✅ Criar projeto Supabase
2. ✅ Configurar credenciais no servidor
3. ✅ Executar schema SQL
4. → Conectar API Python ao Supabase
5. → Implementar busca semântica
6. → Configurar autenticação (opcional)
