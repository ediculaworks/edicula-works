-- ============================================================
-- EDICULAWORKS PLATFORM - SCHEMA COMPLETO
-- Banco: PostgreSQL + pgVector
-- Versão: 3.0.0
-- Data: 2026-02-19
-- ============================================================

-- ============================================================
-- EXTENSÕES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- MÓDULO: CORE
-- ============================================================

-- Empresas (Multi-tenant - 1 registro para vocês)
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(20) UNIQUE,
    cpf VARCHAR(11),
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco VARCHAR(500),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    cep VARCHAR(10),
    site VARCHAR(255),
    logo_url VARCHAR(500),
    
    -- Configurações
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    idioma VARCHAR(10) DEFAULT 'pt-BR',
    moeda VARCHAR(10) DEFAULT 'BRL',
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    trial_ativa BOOLEAN DEFAULT false,
    trial_expira_em DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    
    -- Avatar
    avatar_url VARCHAR(500),
    
    -- RBAC
    perfil_id INTEGER,
    role VARCHAR(50) DEFAULT 'member', -- admin, manager, member
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    email_verificado BOOLEAN DEFAULT false,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    tema VARCHAR(20) DEFAULT 'light',
    linguagem VARCHAR(10) DEFAULT 'pt-BR',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Perfis de Permissão (RBAC)
CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    
    -- Permissões (JSONB para granularidade)
    permissoes JSONB DEFAULT '[]'::jsonb,
    
    -- Herança
    perfil_pai_id INTEGER REFERENCES perfis(id),
    
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Configurações por Empresa
CREATE TABLE configuracoes_empresa (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE UNIQUE,
    
    -- Geral
    nome_sistema VARCHAR(100) DEFAULT 'EdiculaWorks',
    email_principal VARCHAR(255),
    email_suporte VARCHAR(255),
    email_financeiro VARCHAR(255),
    
    -- Kanban
    colunas_kanban JSONB DEFAULT '[{"id":"todo","nome":"A Fazer","ordem":1},{"id":"in_progress","nome":"Em Andamento","ordem":2},{"id":"review","nome":"Em Revisão","ordem":3},{"id":"done","nome":"Concluída","ordem":4}]'::jsonb,
    prioridades_padrao JSONB DEFAULT '[{"id":"urgente","nome":"Urgente","cor":"#ef4444","ordem":1},{"id":"alta","nome":"Alta","cor":"#f97316","ordem":2},{"id":"media","nome":"Média","cor":"#eab308","ordem":3},{"id":"baixa","nome":"Baixa","cor":"#22c55e","ordem":4}]'::jsonb,
    
    -- Notificações
    notificar_email_tarefa BOOLEAN DEFAULT true,
    notificar_email_contrato BOOLEAN DEFAULT true,
    notificar_email_fatura BOOLEAN DEFAULT true,
    
    -- Layout
    logo_url VARCHAR(500),
    cor_primaria VARCHAR(7) DEFAULT '#3b82f6',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Configurações por Usuário
CREATE TABLE configuracoes_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE,
    
    tema VARCHAR(20) DEFAULT 'light',
    linguagem VARCHAR(10) DEFAULT 'pt-BR',
    fuso_horario VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Notificações
    notificar_tarefa_atribuida BOOLEAN DEFAULT true,
    notificar_tarefa_comentada BOOLEAN DEFAULT true,
    notificar_contrato_expirar BOOLEAN DEFAULT true,
    notificar_fatura_vencer BOOLEAN DEFAULT true,
    notificar_mensagem BOOLEAN DEFAULT true,
    
    -- Email
    email_notificacoes_diarias BOOLEAN DEFAULT false,
    email_resumo_semanal BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MÓDULO: GESTÃO DE TRABALHO
-- ============================================================

-- Projetos
CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7),
    icone VARCHAR(50),
    
    -- Cliente
    cliente_id INTEGER,
    cliente_nome VARCHAR(255),
    cliente_email VARCHAR(255),
    cliente_contato VARCHAR(255),
    
    -- Dates
    data_inicio DATE,
    data_fim DATE,
    data_conclusao DATE,
    
    -- Orçamento
    orcamento DECIMAL(12,2),
    horas_estimadas DECIMAL(10,2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, pausado, arquivado, concluidotatus
    
    -- Progresso
    progresso INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
    
    -- Embedding para busca semântica
    embedding vector(1536),
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tarefas (Kanban)
CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    projeto_id INTEGER REFERENCES projetos(id) ON DELETE SET NULL,
    
    -- Conteúdo
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    descricao_html TEXT,
    
    -- Kanban
    coluna VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, review, done
    prioridade VARCHAR(20) DEFAULT 'media', -- urgente, alta, media, baixa
    estimativa_horas DECIMAL(6,2),
    estimativa_pontos INTEGER,
    
    -- Dates
    prazo DATE,
    data_conclusao TIMESTAMP WITH TIME ZONE,
    tempo_gasto_minutos INTEGER DEFAULT 0,
    
    -- Responsáveis
    created_by INTEGER REFERENCES usuarios(id),
    responsaveis INTEGER[] DEFAULT '{}',
    
    -- Relatórios
    relatorio_horas DECIMAL(10,2) DEFAULT 0,
    relatorio_custo DECIMAL(12,2) DEFAULT 0,
    
    -- Cliente
    cliente_nome VARCHAR(255),
    
    -- Subtarefa
    tarefa_pai_id INTEGER REFERENCES tarefas(id),
    eh_subtarefa BOOLEAN DEFAULT false,
    
    -- Embedding para busca semântica
    embedding vector(1536),
    
    -- ordem dentro da coluna
    ordem INTEGER DEFAULT 0,
    
    -- Status (ativa, pausada, abandonada, suspensa)
    status VARCHAR(20) DEFAULT 'ativa',
    
    -- Sprint e Grupo
    sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL,
    grupo_id INTEGER REFERENCES grupos(id) ON DELETE SET NULL,
    
    -- Observadores
    observadores INTEGER[] DEFAULT '{}',
    
    -- Previsão de entrega (forecast)
    previsao_entrega DATE,
    estimativa_horas_prevista DECIMAL(6,2),
    
    -- Data de início
    data_inicio TIMESTAMP WITH TIME ZONE,
    
    -- Motivos de pausa/suspensão/abandono
    motivo_pausa TEXT,
    motivo_suspensao TEXT,
    motivo_abandono TEXT,
    
    -- Data de pausa/suspensão
    data_pausa TIMESTAMP WITH TIME ZONE,
    data_suspensao TIMESTAMP WITH TIME ZONE,
    data_abandono TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Grupos de Tarefas (customizáveis)
CREATE TABLE grupos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#6b7280',
    icone VARCHAR(50),
    
    -- Configurações
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sprints
CREATE TABLE sprints (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    projeto_id INTEGER REFERENCES projetos(id) ON DELETE SET NULL,
    
    nome VARCHAR(100) NOT NULL,
    objetivo TEXT,
    
    -- Datas
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    data_conclusao DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'planejada', -- planejada, ativa, concluida, cancelada
    
    -- Meta
    meta_pontos INTEGER,
    pontos_concluidos INTEGER DEFAULT 0,
    
    -- Configurações
    ordem INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dependências de Tarefas
CREATE TABLE tarefa_dependencias (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    tarefa_id INTEGER REFERENCES tarefas(id) ON DELETE CASCADE,
    tarefa_dependente_id INTEGER REFERENCES tarefas(id) ON DELETE CASCADE,
    
    -- Tipo de dependência
    tipo VARCHAR(20) DEFAULT 'finishes', -- finishes, starts, blocks, is_blocked_by
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tarefa_id, tarefa_dependente_id, tipo)
);

-- Subtarefas (alternativa não-hierárquica)
CREATE TABLE subtarefas (
    id SERIAL PRIMARY KEY,
    tarefa_id INTEGER REFERENCES tarefas(id) ON DELETE CASCADE,
    
    titulo VARCHAR(500) NOT NULL,
    concluida BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentários
CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Entidade relacionada
    entidade_tipo VARCHAR(50) NOT NULL, -- tarefa, contrato, fatura, documento
    entidade_id INTEGER NOT NULL,
    
    -- Conteúdo
    conteudo TEXT NOT NULL,
    conteudo_html TEXT,
    
    -- Menções
    menciona_usuarios INTEGER[],
    
    -- Autor
    usuario_id INTEGER REFERENCES usuarios(id),
    
    -- Edit
    editado BOOLEAN DEFAULT false,
    editado_em TIMESTAMP WITH TIME ZONE,
    
    -- Embedding para busca semântica
    embedding vector(1536),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anexos
CREATE TABLE anexos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Entidade relacionada
    entidade_tipo VARCHAR(50) NOT NULL,
    entidade_id INTEGER NOT NULL,
    
    -- Arquivo
    nome_original VARCHAR(255) NOT NULL,
    nome_armazenado VARCHAR(255),
    tipo_mime VARCHAR(100),
    extensao VARCHAR(20),
    tamanho_bytes INTEGER,
    
    -- Storage
    url VARCHAR(500),
    storage_path VARCHAR(500),
    
    -- Thumbnail
    thumbnail_url VARCHAR(500),
    
    -- Upload
    upload_por INTEGER REFERENCES usuarios(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(7),
    icone VARCHAR(50),
    
    -- Escopo
    escopo VARCHAR(50) DEFAULT 'tarefa', -- tarefa, contrato, documento, projeto
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id, nome, escopo)
);

-- Relação Tarefa-Tags (N:N)
CREATE TABLE tarefa_tags (
    tarefa_id INTEGER REFERENCES tarefas(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (tarefa_id, tag_id)
);

-- Checklist Itens
CREATE TABLE checklist_itens (
    id SERIAL PRIMARY KEY,
    tarefa_id INTEGER REFERENCES tarefas(id) ON DELETE CASCADE,
    
    titulo VARCHAR(500) NOT NULL,
    concluida BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Histórico de Alterações (Audit Trail)
CREATE TABLE historico_tarefas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    tarefa_id INTEGER REFERENCES tarefas(id) ON DELETE CASCADE,
    
    -- Quem fez
    usuario_id INTEGER REFERENCES usuarios(id),
    
    -- O que mudou
    acao VARCHAR(50) NOT NULL, -- created, updated, deleted, moved, commented
    
    -- Detalhes
    campos_antes JSONB,
    campos_depois JSONB,
    descricao TEXT,
    
    -- IP
    ip VARCHAR(45),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MÓDULO: CONTRATOS
-- ============================================================

-- Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Identificação
    nome VARCHAR(255) NOT NULL,
    tipo_pessoa VARCHAR(20) DEFAULT 'pj', -- pf, pj
    cpf VARCHAR(11),
    cnpj VARCHAR(20),
    rg VARCHAR(20),
    inscricao_estadual VARCHAR(50),
    
    -- Contato
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    
    -- Endereço
    endereco VARCHAR(500),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    cep VARCHAR(10),
    
    -- Dados Fiscais
    regime_tributario VARCHAR(50),
    categoria VARCHAR(100),
    
    -- Observações
    observacoes TEXT,
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    
    -- Embedding para busca
    embedding vector(1536),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fornecedores
CREATE TABLE fornecedores (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    tipo_pessoa VARCHAR(20) DEFAULT 'pj',
    cpf VARCHAR(11),
    cnpj VARCHAR(20),
    
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    
    endereco VARCHAR(500),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    cep VARCHAR(10),
    
    categoria VARCHAR(100),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    
    embedding vector(1536),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contratos
CREATE TABLE contratos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Identificação
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    numero VARCHAR(50),
    
    -- Tipo
    tipo VARCHAR(50) NOT NULL, -- nda, servico, parceria, locacao, licenca, outro
    
    -- Partes
    cliente_id INTEGER REFERENCES clientes(id),
    fornecedor_id INTEGER REFERENCES fornecedores(id),
    contraparte_nome VARCHAR(255),
    contraparte_documento VARCHAR(50),
    
    -- Valores
    valor DECIMAL(12,2),
    valor_mensal DECIMAL(12,2),
    periodicidade VARCHAR(20), -- mensal, bimestral, trimestral, semestral, anual, unico
    
    -- Datas
    data_assinatura DATE,
    data_inicio DATE,
    data_fim DATE,
    data_encerramento DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'rascunho', -- rascunho, ativo, expirado, encerrado, cancelado
    
    -- Renovação
    renovacao_automatica BOOLEAN DEFAULT false,
    periodo_aviso_renovacao INTEGER DEFAULT 30, -- dias antes
    
    -- Archivo
    arquivo_url VARCHAR(500),
    
    -- Embedding para busca semântica
    embedding vector(1536),
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Renovações de Contrato
CREATE TABLE contrato_renovacoes (
    id SERIAL PRIMARY KEY,
    contrato_id INTEGER REFERENCES contratos(id) ON DELETE CASCADE,
    
    numero_renovacao INTEGER NOT NULL,
    
    -- Datas
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    
    -- Valores
    valor_anterior DECIMAL(12,2),
    valor_novo DECIMAL(12,2),
    percentual_aumento DECIMAL(5,2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativa', --ativa, renovada, encerrada
    
    -- Observações
    observacoes TEXT,
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Anexos de Contrato
CREATE TABLE contrato_anexos (
    id SERIAL PRIMARY KEY,
    contrato_id INTEGER REFERENCES contratos(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    arquivo_url VARCHAR(500),
    tipo_mime VARCHAR(100),
    tamanho_bytes INTEGER,
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MÓDULO: FINANCEIRO
-- ============================================================

-- Categorias Financeiras
CREATE TABLE categorias_financeiras (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- receita, despesa
    cor VARCHAR(7),
    icone VARCHAR(50),
    
    -- Hierarquia
    categoria_pai_id INTEGER REFERENCES categorias_financeiras(id),
    
    -- Configuração
    permite_transacao BOOLEAN DEFAULT true,
    permite_orcamento BOOLEAN DEFAULT true,
    
    -- Status
    ativa BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id, nome, tipo)
);

-- Centros de Custo
CREATE TABLE centros_custo (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    codigo VARCHAR(20),
    
    -- Orçamentos
    orcamento_anual DECIMAL(12,2),
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id, nome)
);

-- Contas Bancárias
CREATE TABLE contas_bancarias (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(100) NOT NULL,
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    pix_tipo VARCHAR(20), -- cpf, cnpj, email, telefone, chave_aleatoria
    pix_chave VARCHAR(255),
    
    saldo_inicial DECIMAL(12,2) DEFAULT 0,
    saldo_atual DECIMAL(12,2) DEFAULT 0,
    
    -- Status
    ativa BOOLEAN DEFAULT true,
    principal BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transações
CREATE TABLE transacoes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Tipo
    tipo VARCHAR(20) NOT NULL, -- receita, despesa, transferencia
    
    -- Categoria
    categoria_id INTEGER REFERENCES categorias_financeiras(id),
    centro_custo_id INTEGER REFERENCES centros_custo(id),
    
    -- Valores
    valor DECIMAL(12,2) NOT NULL,
    valor_original DECIMAL(12,2),
    moeda_original VARCHAR(10),
    cambio DECIMAL(10,4) DEFAULT 1,
    
    -- Descrição
    descricao TEXT,
    descricao_detalhada TEXT,
    
    -- Datas
    data_transacao DATE NOT NULL,
    data_vencimento DATE,
    data_pagamento DATE,
    data_competencia DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, pago, cancelado, estornado
    
    -- Conta
    conta_bancaria_id INTEGER REFERENCES contas_bancarias(id),
    
    -- Referências
    contrato_id INTEGER REFERENCES contratos(id),
    projeto_id INTEGER REFERENCES projetos(id),
    tarefa_id INTEGER REFERENCES tarefas(id),
    fatura_id INTEGER REFERENCES faturas(id),
    orcamento_id INTEGER REFERENCES orcamentos(id),
    
    -- Documento
    documento_tipo VARCHAR(50),
    documento_numero VARCHAR(100),
    documento_url VARCHAR(500),
    
    -- Recorrência
    recorrente BOOLEAN DEFAULT false,
    transacao_pai_id INTEGER REFERENCES transacoes(id),
    
    -- Fornecedor/Cliente
    fornecedor_id INTEGER REFERENCES fornecedores(id),
    cliente_id INTEGER REFERENCES clientes(id),
    pessoa_nome VARCHAR(255),
    
    -- Observações
    observacoes TEXT,
    
    -- Tags
    tags TEXT[],
    
    -- Embedding
    embedding vector(1536),
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Faturas (Recebidas e Emitidas)
CREATE TABLE faturas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Tipo
    tipo VARCHAR(20) NOT NULL, -- emissa, recebida
    
    -- Identificação
    numero VARCHAR(50) NOT NULL,
    serie VARCHAR(20),
    modelo VARCHAR(10), -- nf, nfs, cf
    
    -- Parte
    cliente_id INTEGER REFERENCES clientes(id),
    fornecedor_id INTEGER REFERENCES fornecedores(id),
    
    -- Datas
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    
    -- Valores
    valor_subtotal DECIMAL(12,2),
    valor_desconto DECIMAL(12,2),
    valor_juros DECIMAL(12,2),
    valor_multa DECIMAL(12,2),
    valor_total DECIMAL(12,2) NOT NULL,
    
    -- Impostos
    valor_imposto DECIMAL(12,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, paga, cancelada, vencida
    
    -- Conta
    conta_bancaria_id INTEGER REFERENCES contas_bancarias(id),
    
    -- Arquivo
    arquivo_url VARCHAR(500),
    xml_url VARCHAR(500),
    
    -- Observações
    observacoes TEXT,
    
    -- NF-e
    chave_acesso VARCHAR(44),
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Itens da Fatura
CREATE TABLE fatura_itens (
    id SERIAL PRIMARY KEY,
    fatura_id INTEGER REFERENCES faturas(id) ON DELETE CASCADE,
    
    descricao TEXT NOT NULL,
    quantidade DECIMAL(10,3) DEFAULT 1,
    unidade VARCHAR(20),
    valor_unitario DECIMAL(12,2) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    
    -- Impostos
    aliquota_icms DECIMAL(5,2),
    valor_icms DECIMAL(12,2),
    aliquota_pis DECIMAL(5,2),
    valor_pis DECIMAL(12,2),
    aliquota_cofins DECIMAL(5,2),
    valor_cofins DECIMAL(12,2),
    
    -- Referência
    tarefa_id INTEGER REFERENCES tarefas(id),
    projeto_id INTEGER REFERENCES projetos(id),
    
    ordem INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orçamentos
CREATE TABLE orcamentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Identificação
    numero VARCHAR(50) NOT NULL,
    
    -- Cliente
    cliente_id INTEGER REFERENCES clientes(id),
    cliente_nome VARCHAR(255),
    cliente_email VARCHAR(255),
    
    -- Validade
    data_emissao DATE NOT NULL,
    data_validade DATE NOT NULL,
    data_validade_original DATE,
    
    -- Valores
    valor_subtotal DECIMAL(12,2),
    valor_desconto DECIMAL(12,2),
    valor_total DECIMAL(12,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'rascunho', -- rascunho, enviado, aceito, recusado, expirado, convertido
    
    -- Conversão
    contrato_id INTEGER REFERENCES contratos(id),
    projeto_id INTEGER REFERENCES projetos(id),
    
    -- Observações
    observacoes TEXT,
    termos TEXT,
    
    -- Arquivo
    arquivo_url VARCHAR(500),
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Itens do Orçamento
CREATE TABLE orcamento_itens (
    id SERIAL PRIMARY KEY,
    orcamento_id INTEGER REFERENCES orcamentos(id) ON DELETE CASCADE,
    
    descricao TEXT NOT NULL,
    quantidade DECIMAL(10,3) DEFAULT 1,
    unidade VARCHAR(20),
    valor_unitario DECIMAL(12,2) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    
    -- Impostos (opcional para orçamento)
    aliquota_icms DECIMAL(5,2),
    aliquota_pis DECIMAL(5,2),
    aliquota_cofins DECIMAL(5,2),
    
    -- Ordem
    ordem INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Metas Financeiras
CREATE TABLE metas_financeiras (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- receita, despesa, lucro
    
    -- Período
    ano INTEGER NOT NULL,
    mes INTEGER,
    
    -- Valor
    valor_meta DECIMAL(12,2) NOT NULL,
    valor_alcancado DECIMAL(12,2) DEFAULT 0,
    
    -- Categoria (opcional)
    categoria_id INTEGER REFERENCES categorias_financeiras(id),
    centro_custo_id INTEGER REFERENCES centros_custo(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id, tipo, ano, mes, categoria_id)
);

-- ============================================================
-- MÓDULO: DOCUMENTOS
-- ============================================================

-- Documentos
CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Conteúdo
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    conteudo TEXT,
    
    -- Categoria
    categoria_id INTEGER,
    
    -- Arquivo
    arquivo_url VARCHAR(500),
    arquivo_tipo VARCHAR(50),
    arquivo_tamanho INTEGER,
    
    -- Versionamento
    versao INTEGER DEFAULT 1,
    versao_anterior_id INTEGER REFERENCES documentos(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, arquivado, excluido
    
    -- Embedding para busca semântica
    embedding vector(1536),
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categorias de Documentos
CREATE TABLE documento_categorias (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7),
    icone VARCHAR(50),
    
    -- Hierarquia
    categoria_pai_id INTEGER REFERENCES documento_categorias(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(empresa_id, nome)
);

-- Tags de Documentos (N:N)
CREATE TABLE documento_tags (
    documento_id INTEGER REFERENCES documentos(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (documento_id, tag_id)
);

-- ============================================================
-- MÓDULO: IA & BUSCA
-- ============================================================

-- Conversas (com Agentes)
CREATE TABLE conversas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id),
    
    -- Agente
    agente VARCHAR(50) NOT NULL, -- chief, tech, gestao, financeiro, security, ops
    
    -- Contexto
    titulo VARCHAR(255),
    contexto JSONB, -- dados de contexto
    
    -- Status
    status VARCHAR(20) DEFAULT 'ativa', -- ativa, arquivada, excluida
    
    -- Métricas
    mensagens_count INTEGER DEFAULT 0,
    tokens_usados INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mensagens
CREATE TABLE mensagens (
    id SERIAL PRIMARY KEY,
    conversa_id INTEGER REFERENCES conversas(id) ON DELETE CASCADE,
    
    -- Função
    role VARCHAR(20) NOT NULL, -- user, assistant, system
    
    -- Conteúdo
    conteudo TEXT NOT NULL,
    conteudo_html TEXT,
    
    -- Embedding (para contexto)
    embedding vector(1536),
    
    -- Metadados
    modelo VARCHAR(100),
    tokens INTEGER,
    tempo_resposta_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cache de Embeddings
CREATE TABLE embeddings_cache (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Identificação
    entidade_tipo VARCHAR(50) NOT NULL,
    entidade_id INTEGER NOT NULL,
    
    -- Embedding
    embedding vector(1536) NOT NULL,
    
    -- Hash do texto (para evitar recalcular)
    texto_hash VARCHAR(64),
    texto_preview VARCHAR(200),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(entidade_tipo, entidade_id)
);

-- Buscas Salvas
CREATE TABLE buscas_salvas (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id),
    
    nome VARCHAR(255) NOT NULL,
    query VARCHAR(500),
    filtros JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MÓDULO: SISTEMA
-- ============================================================

-- Notificações
CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Tipo
    tipo VARCHAR(50) NOT NULL, -- tarefa, contrato, fatura, sistema
    
    -- Conteúdo
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    link VARCHAR(500),
    
    -- Entidade relacionada
    entidade_tipo VARCHAR(50),
    entidade_id INTEGER,
    
    -- Status
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    
    -- Preferências
    enviar_email BOOLEAN DEFAULT false,
    email_enviado BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fila de Emails
CREATE TABLE email_queue (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Destinatário
    para_email VARCHAR(255) NOT NULL,
    para_nome VARCHAR(255),
    cc TEXT[],
    bcc TEXT[],
    
    -- Assunto
    assunto VARCHAR(500) NOT NULL,
    corpo TEXT NOT NULL,
    corpo_html TEXT,
    
    -- Tipo
    tipo VARCHAR(50) NOT NULL, -- tarefa, contrato, fatura, sistema
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, enviado, falha
    tentativas INTEGER DEFAULT 0,
    max_tentativas INTEGER DEFAULT 3,
    
    -- Resultado
    erro TEXT,
    enviado_em TIMESTAMP WITH TIME ZONE,
    
    -- Agendamento
    agendar_para TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks
CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    metodo VARCHAR(10) DEFAULT 'POST',
    
    -- Eventos
    eventos TEXT[] NOT NULL,
    
    -- Auth
    auth_tipo VARCHAR(20), -- none, basic, bearer, api_key
    auth_valor VARCHAR(500),
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    
    created_by INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Log de Webhooks
CREATE TABLE webhook_logs (
    id SERIAL PRIMARY KEY,
    webhook_id INTEGER REFERENCES webhooks(id) ON DELETE CASCADE,
    
    -- Request
    payload JSONB,
    headers JSONB,
    
    -- Response
    status_code INTEGER,
    response_body TEXT,
    tempo_ms INTEGER,
    
    -- Status
    sucesso BOOLEAN DEFAULT true,
    erro TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MÓDULO: AUDITORIA
-- ============================================================

-- Audit Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Usuário
    usuario_id INTEGER REFERENCES usuarios(id),
    ip VARCHAR(45),
    user_agent TEXT,
    
    -- Entidade
    entidade_tipo VARCHAR(50) NOT NULL,
    entidade_id INTEGER,
    
    -- Ação
    acao VARCHAR(50) NOT NULL, -- created, updated, deleted, viewed, exported
    dados_antes JSONB,
    dados_depois JSONB,
    
    -- Detalhes
    descricao TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessões
CREATE TABLE sessoes (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Token
    token VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255),
    
    -- Info
    ip VARCHAR(45),
    user_agent TEXT,
    dispositivo VARCHAR(100),
    
    -- Datas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    
    -- Status
    ativa BOOLEAN DEFAULT true
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Core
CREATE INDEX idx_usuarios_empresa ON usuarios(empresa_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_perfis_empresa ON perfis(empresa_id);

-- Projetos
CREATE INDEX idx_projetos_empresa ON projetos(empresa_id);
CREATE INDEX idx_projetos_status ON projetos(status);
CREATE INDEX idx_projetos_cliente ON projetos(cliente_id);
CREATE INDEX idx_projetos_embedding ON projetos USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Tarefas
CREATE INDEX idx_tarefas_empresa ON tarefas(empresa_id);
CREATE INDEX idx_tarefas_projeto ON tarefas(projeto_id);
CREATE INDEX idx_tarefas_coluna ON tarefas(coluna);
CREATE INDEX idx_tarefas_prioridade ON tarefas(prioridade);
CREATE INDEX idx_tarefas_status ON tarefas(status);
CREATE INDEX idx_tarefas_responsaveis ON tarefas USING GIN (responsaveis);
CREATE INDEX idx_tarefas_prazo ON tarefas(prazo);
CREATE INDEX idx_tarefas_embedding ON tarefas USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_tarefas_created_at ON tarefas(created_at DESC);

-- Comentários
CREATE INDEX idx_comentarios_entidade ON comentarios(entidade_tipo, entidade_id);
CREATE INDEX idx_comentarios_usuario ON comentarios(usuario_id);
CREATE INDEX idx_comentarios_embedding ON comentarios USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Tags
CREATE INDEX idx_tags_empresa ON tags(empresa_id);
CREATE INDEX idx_tags_escopo ON tags(escopo);

-- Contratos
CREATE INDEX idx_contratos_empresa ON contratos(empresa_id);
CREATE INDEX idx_contratos_status ON contratos(status);
CREATE INDEX idx_contratos_tipo ON contratos(tipo);
CREATE INDEX idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX idx_contratos_data_fim ON contratos(data_fim);
CREATE INDEX idx_contratos_embedding ON contratos USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Clientes
CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_clientes_tipo ON clientes(tipo_pessoa);
CREATE INDEX idx_clientes_embedding ON clientes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 30);

-- Fornecedores
CREATE INDEX idx_fornecedores_empresa ON fornecedores(empresa_id);
CREATE INDEX idx_fornecedores_embedding ON fornecedores USING ivfflat (embedding vector_cosine_ops) WITH (lists = 30);

-- Transações
CREATE INDEX idx_transacoes_empresa ON transacoes(empresa_id);
CREATE INDEX idx_transacoes_data ON transacoes(data_transacao);
CREATE INDEX idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX idx_transacoes_status ON transacoes(status);
CREATE INDEX idx_transacoes_categoria ON transacoes(categoria_id);
CREATE INDEX idx_transacoes_conta ON transacoes(conta_bancaria_id);
CREATE INDEX idx_transacoes_contrato ON transacoes(contrato_id);
CREATE INDEX idx_transacoes_projeto ON transacoes(projeto_id);
CREATE INDEX idx_transacoes_embedding ON transacoes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Faturas
CREATE INDEX idx_faturas_empresa ON faturas(empresa_id);
CREATE INDEX idx_faturas_tipo ON faturas(tipo);
CREATE INDEX idx_faturas_status ON faturas(status);
CREATE INDEX idx_faturas_cliente ON faturas(cliente_id);
CREATE INDEX idx_faturas_fornecedor ON faturas(fornecedor_id);
CREATE INDEX idx_faturas_data_vencimento ON faturas(data_vencimento);

-- Orçamentos
CREATE INDEX idx_orcamentos_empresa ON orcamentos(empresa_id);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);
CREATE INDEX idx_orcamentos_cliente ON orcamentos(cliente_id);

-- Documentos
CREATE INDEX idx_documentos_empresa ON documentos(empresa_id);
CREATE INDEX idx_documentos_categoria ON documentos(categoria_id);
CREATE INDEX idx_documentos_status ON documentos(status);
CREATE INDEX idx_documentos_embedding ON documentos USING ivfflat (embedding vector_cosine_ops) WITH (lists = 30);

-- Conversas
CREATE INDEX idx_conversas_usuario ON conversas(usuario_id);
CREATE INDEX idx_conversas_agente ON conversas(agente);
CREATE INDEX idx_conversas_status ON conversas(status);

-- Mensagens
CREATE INDEX idx_mensagens_conversa ON mensagens(conversa_id);
CREATE INDEX idx_mensagens_embedding ON mensagens USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Notificações
CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_created ON notificacoes(created_at DESC);

-- Audit
CREATE INDEX idx_audit_logs_empresa ON audit_logs(empresa_id);
CREATE INDEX idx_audit_logs_usuario ON audit_logs(usuario_id);
CREATE INDEX idx_audit_logs_entidade ON audit_logs(entidade_tipo, entidade_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Empresa
INSERT INTO empresas (nome, nome_fantasia, cnpj, email, telefone, endereco, cidade, estado, cep)
VALUES ('EdiculaWorks', 'EdiculaWorks', '00.000.000/0001-00', 'contato@ediculaworks.com', '+55 00 00000-0000', 'Rua Example, 123', 'São Paulo', 'SP', '01000-000');

-- Perfis
INSERT INTO perfis (empresa_id, nome, descricao, permissoes)
VALUES 
(1, 'Administrador', 'Acesso total ao sistema', '["*"]'::jsonb),
(1, 'Gerente', 'Gestão de projetos e tarefas', '["projetos.*", "tarefas.*", "contratos.*", "financeiro.leitura"]'::jsonb),
(1, 'Membro', 'Acesso básico', '["tarefas.leitura", "tarefas.criacao", "projetos.leitura"]'::jsonb);

-- Configurações da Empresa
INSERT INTO configuracoes_empresa (empresa_id, email_principal, email_suporte, email_financeiro)
VALUES (1, 'contato@ediculaworks.com', 'suporte@ediculaworks.com', 'financeiro@ediculaworks.com');

-- Usuários (senha: changeme123 - SHA256)
INSERT INTO usuarios (empresa_id, nome, email, cargo, role, perfil_id)
VALUES 
(1, 'Lucas Drummond', 'lucas@ediculaworks.com', 'CEO', 'admin', 1),
(1, 'Matheus Guim', 'matheus@ediculaworks.com', 'Desenvolvedor', 'member', 3),
(1, 'Luca Junqueira', 'luca@ediculaworks.com', 'Desenvolvedor', 'member', 3),
(1, 'João Pedro Santana', 'joao@ediculaworks.com', 'Desenvolvedor', 'member', 3),
(1, 'Gabriel Fonseca', 'gabriel@ediculaworks.com', 'Desenvolvedor', 'member', 3),
(1, 'Guilherme Sad', 'guilherme@ediculaworks.com', 'Desenvolvedor', 'member', 3);

-- Configurações de Usuário
INSERT INTO configuracoes_usuario (usuario_id)
SELECT id FROM usuarios;

-- Categorias Financeiras Padrão
INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone) VALUES
(1, 'Desenvolvimento', 'receita', '#22c55e', 'code'),
(1, 'Consultoria', 'receita', '#3b82f6', 'briefcase'),
(1, 'Manutenção', 'receita', '#8b5cf6', 'wrench'),
(1, 'Infraestrutura', 'despesa', '#ef4444', 'server'),
(1, 'Software', 'despesa', '#f97316', 'app-window'),
(1, 'Marketing', 'despesa', '#ec4899', 'megaphone'),
(1, 'Escritório', 'despesa', '#6b7280', 'building'),
(1, 'Pessoal', 'despesa', '#14b8a6', 'users');

-- Projetos Exemplo
INSERT INTO projetos (empresa_id, nome, descricao, cor, status, data_inicio)
VALUES (1, 'EdiculaWorks Platform', 'Sistema interno de gestão com agentes de IA', '#3b82f6', 'ativo', CURRENT_DATE);

-- Tarefas Exemplo
INSERT INTO tarefas (empresa_id, projeto_id, titulo, descricao, coluna, prioridade, responsaveis)
VALUES 
(1, 1, 'Setup inicial do projeto', 'Configurar estrutura base', 'done', 'alta', ARRAY[1]),
(1, 1, 'Criar schema do banco', 'Schema completo com todas as entidades', 'done', 'alta', ARRAY[1]),
(1, 1, 'Implementar API FastAPI', 'Endpoints REST para CRUD', 'in_progress', 'alta', ARRAY[2]),
(1, 1, 'Configurar agentes IA', 'OpenClaw com múltiplos agentes', 'todo', 'media', ARRAY[3]),
(1, 1, 'Criar interface Kanban', 'Frontend Next.js', 'todo', 'media', ARRAY[4]),
(1, 1, 'Implementar busca semântica', 'pgVector', 'todo', 'baixa', ARRAY[1]);

-- Tags
INSERT INTO tags (empresa_id, nome, cor, escopo) VALUES
(1, 'bug', '#ef4444', 'tarefa'),
(1, 'feature', '#22c55e', 'tarefa'),
(1, 'urgente', '#f97316', 'tarefa'),
(1, 'backend', '#3b82f6', 'tarefa'),
(1, 'frontend', '#8b5cf6', 'tarefa'),
(1, 'infra', '#14b8a6', 'tarefa'),
(1, 'documentação', '#6b7280', 'tarefa');

-- ============================================================
-- FUNÇÕES ÚTEIS
-- ============================================================

-- Atualizar timestamp automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar em todas as tabelas com updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracoes_empresa_updated_at BEFORE UPDATE ON configuracoes_empresa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracoes_usuario_updated_at BEFORE UPDATE ON configuracoes_usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON projetos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON tarefas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faturas_updated_at BEFORE UPDATE ON faturas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON documentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversas_updated_at BEFORE UPDATE ON conversas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para buscar tarefas similares (semelhante ao DATABASE.md)
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
            (1 - (t.embedding <=> query_embedding)) * 0.60 +
            CASE WHEN t.projeto_id IS NOT NULL AND t.projeto_id = projeto_id_int THEN 0.20 ELSE 0.0 END +
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

-- Função para logs automáticos
CREATE OR REPLACE FUNCTION criar_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    empresa_id_int INTEGER;
BEGIN
    -- Determinar empresa_id
    IF TG_TABLE_NAME = 'usuarios' THEN
        empresa_id_int := NEW.empresa_id;
    ELSE
        empresa_id_int := COALESCE(NEW.empresa_id, OLD.empresa_id);
    END IF;
    
    INSERT INTO audit_logs (empresa_id, usuario_id, entidade_tipo, entidade_id, acao, dados_antes, dados_depois)
    VALUES (
        empresa_id_int,
        current_setting('app.current_user_id', TRUE)::INTEGER,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN TG_OP = 'UPDATE' THEN 'updated'
            WHEN TG_OP = 'DELETE' THEN 'deleted'
        END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
