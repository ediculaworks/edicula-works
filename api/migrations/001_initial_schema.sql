-- Migration Script for EdiculaWorks Database
-- This script ensures all tables have the required columns
-- Run this in Supabase SQL Editor

-- ============================================
-- USUARIOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id INTEGER NOT NULL DEFAULT 1,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    username TEXT,
    cargo TEXT,
    departamento TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member',
    perfil_id INTEGER,
    ativo BOOLEAN NOT NULL DEFAULT true,
    email_verificado BOOLEAN NOT NULL DEFAULT false,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    tema TEXT DEFAULT 'system',
    linguagem TEXT DEFAULT 'pt-BR',
    auth_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROJETOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projetos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL DEFAULT 1,
    nome TEXT NOT NULL,
    descricao TEXT,
    cor TEXT DEFAULT '#3b82f6',
    icone TEXT,
    cliente_nome TEXT,
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'ativo',
    progresso INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- GRUPOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS grupos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL DEFAULT 1,
    nome TEXT NOT NULL,
    descricao TEXT,
    cor TEXT DEFAULT '#6b7280',
    icone TEXT,
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SPRINTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sprints (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL DEFAULT 1,
    projeto_id INTEGER,
    nome TEXT NOT NULL,
    objetivo TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    data_conclusao DATE,
    status TEXT DEFAULT 'planejada',
    meta_pontos INTEGER,
    pontos_concluidos INTEGER DEFAULT 0,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL DEFAULT 1,
    nome TEXT NOT NULL,
    cor TEXT,
    icone TEXT,
    escopo TEXT DEFAULT 'tarefa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TAREFAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tarefas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL DEFAULT 1,
    projeto_id INTEGER,
    titulo TEXT NOT NULL,
    descricao TEXT,
    descricao_html TEXT,
    coluna TEXT DEFAULT 'todo',
    prioridade TEXT DEFAULT 'media',
    estimativa_horas DOUBLE PRECISION,
    estimativa_pontos INTEGER,
    prazo DATE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    tempo_gasto_minutos INTEGER DEFAULT 0,
    responsaveis INTEGER[] DEFAULT '{}',
    created_by INTEGER,
    cliente_nome TEXT,
    tarefa_pai_id INTEGER,
    eh_subtarefa BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    embedding vector(1536),
    status TEXT DEFAULT 'ativa',
    sprint_id INTEGER,
    grupo_id INTEGER,
    observadores INTEGER[] DEFAULT '{}',
    previsao_entrega DATE,
    estimativa_horas_prevista DOUBLE PRECISION,
    data_inicio TIMESTAMP WITH TIME ZONE,
    motivo_pausa TEXT,
    motivo_suspensao TEXT,
    motivo_abandono TEXT,
    data_pausa TIMESTAMP WITH TIME ZONE,
    data_suspensao TIMESTAMP WITH TIME ZONE,
    data_abandono TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONTRATOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contratos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL DEFAULT 1,
    titulo TEXT NOT NULL,
    descricao TEXT,
    numero TEXT,
    tipo TEXT DEFAULT 'servico',
    cliente_id INTEGER,
    fornecedor_id INTEGER,
    contraparte_nome TEXT,
    contraparte_documento TEXT,
    valor DOUBLE PRECISION,
    valor_mensal DOUBLE PRECISION,
    periodicidade TEXT,
    data_assinatura DATE,
    data_inicio DATE,
    data_fim DATE,
    data_encerramento DATE,
    status TEXT DEFAULT 'rascunho',
    renovacao_automatica BOOLEAN DEFAULT false,
    periodo_aviso_renovacao INTEGER DEFAULT 30,
    arquivo_url TEXT,
    embedding vector(1536),
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRANSACOES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL DEFAULT 1,
    tipo TEXT NOT NULL,
    categoria_id INTEGER,
    centro_custo_id INTEGER,
    valor DOUBLE PRECISION NOT NULL,
    valor_original DOUBLE PRECISION,
    moeda_original TEXT DEFAULT 'BRL',
    cambio DOUBLE PRECISION DEFAULT 1.0,
    descricao TEXT,
    descricao_detalhada TEXT,
    data_transacao DATE,
    data_vencimento DATE,
    data_pagamento DATE,
    data_competencia DATE,
    status TEXT DEFAULT 'pendente',
    conta_bancaria_id INTEGER,
    contrato_id INTEGER,
    projeto_id INTEGER,
    tarefa_id INTEGER,
    fatura_id INTEGER,
    orcamento_id INTEGER,
    documento_tipo TEXT,
    documento_numero TEXT,
    documento_url TEXT,
    recorrente BOOLEAN DEFAULT false,
    transacao_pai_id INTEGER,
    fornecedor_id INTEGER,
    cliente_id INTEGER,
    pessoa_nome TEXT,
    observacoes TEXT,
    tags TEXT[] DEFAULT '{}',
    embedding vector(1536),
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ADD MISSING COLUMNS (for existing tables)
-- ============================================

-- Tarefas: Add sprint_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tarefas' AND column_name = 'sprint_id'
    ) THEN
        ALTER TABLE tarefas ADD COLUMN sprint_id INTEGER REFERENCES sprints(id);
    END IF;
END $$;

-- Tarefas: Add grupo_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tarefas' AND column_name = 'grupo_id'
    ) THEN
        ALTER TABLE tarefas ADD COLUMN grupo_id INTEGER REFERENCES grupos(id);
    END IF;
END $$;

-- Tarefas: Add observadores if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tarefas' AND column_name = 'observadores'
    ) THEN
        ALTER TABLE tarefas ADD COLUMN observadores INTEGER[] DEFAULT '{}';
    END IF;
END $$;

-- Tarefas: Add descricao_html if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tarefas' AND column_name = 'descricao_html'
    ) THEN
        ALTER TABLE tarefas ADD COLUMN descricao_html TEXT;
    END IF;
END $$;

-- Tarefas: Add estimativa_pontos if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tarefas' AND column_name = 'estimativa_pontos'
    ) THEN
        ALTER TABLE tarefas ADD COLUMN estimativa_pontos INTEGER;
    END IF;
END $$;

-- Tarefas: Add embedding if not exists (for vector search)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tarefas' AND column_name = 'embedding'
    ) THEN
        ALTER TABLE tarefas ADD COLUMN embedding vector(1536);
    END IF;
END $$;

-- Projetos: Add cliente_nome if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projetos' AND column_name = 'cliente_nome'
    ) THEN
        ALTER TABLE projetos ADD COLUMN cliente_nome TEXT;
    END IF;
END $$;

-- Projetos: Add icone if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projetos' AND column_name = 'icone'
    ) THEN
        ALTER TABLE projetos ADD COLUMN icone TEXT;
    END IF;
END $$;

-- Projetos: Add created_by if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projetos' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE projetos ADD COLUMN created_by INTEGER;
    END IF;
END $$;

-- Transacoes: Add embedding if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transacoes' AND column_name = 'embedding'
    ) THEN
        ALTER TABLE transacoes ADD COLUMN embedding vector(1536);
    END IF;
END $$;

-- Contratos: Add embedding if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contratos' AND column_name = 'embedding'
    ) THEN
        ALTER TABLE contratos ADD COLUMN embedding vector(1536);
    END IF;
END $$;

-- ============================================
-- CREATE INDEXES
-- ============================================

-- Tarefas indexes
CREATE INDEX IF NOT EXISTS idx_tarefas_empresa ON tarefas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto ON tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_sprint ON tarefas(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_grupo ON tarefas(grupo_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_coluna ON tarefas(coluna);

-- Projetos indexes
CREATE INDEX IF NOT EXISTS idx_projetos_empresa ON projetos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);

-- Sprints indexes
CREATE INDEX IF NOT EXISTS idx_sprints_empresa ON sprints(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sprints_projeto ON sprints(projeto_id);

-- Contratos indexes
CREATE INDEX IF NOT EXISTS idx_contratos_empresa ON contratos(empresa_id);
CREATE INDEX NOT EXISTS idx_contratos_status ON contratos(status);

-- Transacoes indexes
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa ON transacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);

-- ============================================
-- DISABLE RLS (for development)
-- ============================================
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE projetos DISABLE ROW LEVEL SECURITY;
ALTER TABLE grupos DISABLE ROW LEVEL SECURITY;
ALTER TABLE sprints DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas DISABLE ROW LEVEL SECURITY;
ALTER TABLE contratos DISABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Migration completed successfully!' as result;

-- Show all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
