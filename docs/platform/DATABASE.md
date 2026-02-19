# Schema do Banco de Dados - EdiculaWorks Platform

> **⚠️ IMPORTANTE**: O schema oficial está em [`schema.sql`](schema.sql). Este documento é apenas referência.

## Visão Geral

Banco de dados PostgreSQL com extensão pgVector para buscas por similaridade semântica.

## Extensões Necessárias

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## Tabelas

### 1. Empresas

```sql
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Usuarios

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cargo VARCHAR(100),
    role VARCHAR(50) DEFAULT 'member', -- admin, manager, member
    avatar_url VARCHAR(500),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Projetos

```sql
CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cliente VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- active, archived, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Tarefas (KANBAN)

```sql
CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    projeto_id INTEGER REFERENCES projetos(id) ON DELETE SET NULL,
    
    -- Conteúdo
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    
    -- Kanban
    coluna VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, review, done
    prioridade VARCHAR(20) DEFAULT 'media', -- urgente, alta, media, baixa
    estimativa_horas DECIMAL(6,2),
    
    -- Datas
    prazo DATE,
    data_conclusao TIMESTAMP,
    
    -- Metadata
    tags TEXT[],
    created_by INTEGER REFERENCES usuarios(id),
    assigned_to INTEGER[] DEFAULT '{}',
    cliente VARCHAR(255),
    
    -- Embedding para busca semântica
    embedding vector(1536),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Contratos

```sql
CREATE TABLE contratos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Conteúdo
    titulo VARCHAR(500) NOT NULL,
    conteudo TEXT,
    tipo VARCHAR(50), -- nda, servico, parceria, outro
    
    -- Partes
    contratante VARCHAR(255),
    contratado VARCHAR(255),
    
    -- Financeiro
    valor DECIMAL(12,2),
    periodicidade VARCHAR(20), -- mensal, anual, unico
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, expired, terminated
    data_inicio DATE,
    data_fim DATE,
    
    -- Embedding
    embedding vector(1536),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Documentos

```sql
CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50), -- contrato, proposta, fiscal, rh, outro
    arquivo_url VARCHAR(500),
    arquivo_tipo VARCHAR(50),
    arquivo_tamanho INTEGER,
    
    -- Embedding
    embedding vector(1536),
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. Financeiro

```sql
-- Transações (receitas e despesas)
CREATE TABLE transacoes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    tipo VARCHAR(20) NOT NULL, -- receita, despesa
    categoria VARCHAR(50),
    descricao TEXT,
    valor DECIMAL(12,2) NOT NULL,
    
    -- Datas
    data_transacao DATE NOT NULL,
    data_vencimento DATE,
    data_pagamento DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, pago, cancelado
    
    -- Referências
    contrato_id INTEGER REFERENCES contratos(id),
    tarefa_id INTEGER REFERENCES tarefas(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorias Financeiras
CREATE TABLE categorias_financeiras (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- receita, despesa
    cor VARCHAR(7), -- hex
    icone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Logs de Atividade

```sql
CREATE TABLE atividade_logs (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id),
    
    entidade_tipo VARCHAR(50), -- tarefa, contrato, transacao
    entidade_id INTEGER,
    acao VARCHAR(50), -- created, updated, deleted, status_changed
    
    detalhes JSONB,
    ip VARCHAR(45),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Índices

### Índices Vetoriais (pgVector)

```sql
-- Tarefas
CREATE INDEX idx_tarefas_embedding ON tarefas 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Contratos
CREATE INDEX idx_contratos_embedding ON contratos 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- Documentos
CREATE INDEX idx_documentos_embedding ON documentos 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);
```

### Índices Tradicionais

```sql
CREATE INDEX idx_tarefas_empresa ON tarefas(empresa_id);
CREATE INDEX idx_tarefas_projeto ON tarefas(projeto_id);
CREATE INDEX idx_tarefas_coluna ON tarefas(coluna);
CREATE INDEX idx_tarefas_prioridade ON tarefas(prioridade);
CREATE INDEX idx_tarefas_status ON tarefas(status);

CREATE INDEX idx_contratos_empresa ON contratos(empresa_id);
CREATE INDEX idx_contratos_status ON contratos(status);

CREATE INDEX idx_transacoes_empresa ON transacoes(empresa_id);
CREATE INDEX idx_transacoes_data ON transacoes(data_transacao);
CREATE INDEX idx_transacoes_tipo ON transacoes(tipo);

CREATE INDEX idx_atividade_empresa ON atividade_logs(empresa_id);
CREATE INDEX idx_atividade_created ON atividade_logs(created_at DESC);
```

---

## Funções Úteis

### Busca Semântica de Tarefas

```sql
-- Busca por similaridade com boost de prioridade
CREATE OR REPLACE FUNCTION buscar_tarefas_similares(
    query_embedding vector(1536),
    empresa_id_int INTEGER,
    limite INTEGER DEFAULT 10,
    projeto_id_int INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    titulo VARCHAR(500),
    descricao TEXT,
    coluna VARCHAR(50),
    prioridade VARCHAR(20),
    similaridade FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.titulo,
        t.descricao,
        t.coluna,
        t.prioridade,
        (
            -- Similaridade vetorial (60%)
            (1 - (t.embedding <=> query_embedding)) * 0.60 +
            -- Boost por projeto (20%)
            CASE WHEN t.projeto_id IS NOT NULL AND t.projeto_id = query_projeto_id THEN 0.20 ELSE 0.0 END +
            -- Boost por prioridade (20%)
            CASE t.prioridade
                WHEN 'urgente' THEN 0.20
                WHEN 'alta' THEN 0.15
                WHEN 'media' THEN 0.10
                ELSE 0.05
            END
        ) AS similaridade
    FROM tarefas t
    WHERE t.empresa_id = empresa_id_int
    AND t.embedding IS NOT NULL
    AND (projeto_id_int IS NULL OR t.projeto_id = projeto_id_int)
    ORDER BY t.embedding <=> query_embedding
    LIMIT limite;
END;
$$ LANGUAGE plpgsql;
```

### Atualizar Embedding

```sql
CREATE OR REPLACE FUNCTION atualizar_embedding_tarefa(tarefa_id_int INTEGER)
RETURNS VOID AS $$
DECLARE
    texto_combinado TEXT;
    embedding_result vector(1536);
BEGIN
    -- Combina título + descrição + projeto + tags
    SELECT 
        COALESCE(t.titulo, '') || ' ' || 
        COALESCE(t.descricao, '') || ' ' ||
        COALESCE(p.nome, '') || ' ' ||
        COALESCE(array_to_string(t.tags, ' '), '')
    INTO texto_combinado
    FROM tarefas t
    LEFT JOIN projetos p ON t.projeto_id = p.id
    WHERE t.id = tarefa_id_int;
    
    -- Aqui você chamaria seu serviço de embedding
    -- embedding_result := get_embedding(texto_combinado);
    
    UPDATE tarefas 
    SET embedding = embedding_result,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = tarefa_id_int;
END;
$$ LANGUAGE plpgsql;
```

---

## Dados de Exemplo

```sql
-- Inserir empresa exemplo
INSERT INTO empresas (nome, cnpj, email) 
VALUES ('EdiculaWorks', '12.345.678/0001-90', 'contato@ediculaworks.com');

-- Inserir usuários exemplo
INSERT INTO usuarios (empresa_id, nome, email, cargo, role) VALUES
(1, 'Lucas Drummond', 'lucas@ediculaworks.com', 'CEO', 'admin'),
(1, 'Matheus Guim', 'matheus@ediculaworks.com', 'Desenvolvedor', 'member'),
(1, 'Luca Junqueira', 'luca@ediculaworks.com', 'Desenvolvedor', 'member'),
(1, 'João Pedro Santana', 'joao@ediculaworks.com', 'Desenvolvedor', 'member');

-- Inserir projeto exemplo
INSERT INTO projetos (empresa_id, nome, descricao, cliente, status) VALUES
(1, 'Sistema de Gestão de Ambulâncias', 'Sistema de gestão para ambulâncias', 'Luciano Drumond', 'active');
```

---

## Configuração Python (SQLAlchemy)

```python
# models.py
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Array
from sqlalchemy.dialects.postgresql import ARRAY, NUMERIC, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

Base = declarative_base()

class Tarefa(Base):
    __tablename__ = 'tarefas'
    
    id = Column(Integer, primary_key=True)
    empresa_id = Column(Integer, ForeignKey('empresas.id'))
    projeto_id = Column(Integer, ForeignKey('projetos.id'))
    
    titulo = Column(String(500), nullable=False)
    descricao = Column(Text)
    coluna = Column(String(50), default='todo')
    prioridade = Column(String(20), default='media')
    estimativa_horas = Column(NUMERIC(6,2))
    
    prazo = Column(Date)
    data_conclusao = Column(DateTime)
    
    tags = Column(ARRAY(String))
    created_by = Column(Integer)
    assigned_to = Column(ARRAY(String))  -- Nomes dos responsáveis (não IDs para User-facing)
    
    # Embedding para busca semântica
    embedding = Column(Vector(1536))
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
```
