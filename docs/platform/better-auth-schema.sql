-- ============================================================
-- BETTER AUTH SCHEMA - PostgreSQL
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS public."user" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS public.session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    token TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de contas
CREATE TABLE IF NOT EXISTS public.account (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
    account_id TEXT,
    provider_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    access_token_expires_at TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    scope TEXT,
    id_token TEXT,
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de verificação
CREATE TABLE IF NOT EXISTS public.verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_email ON public."user"(email);
CREATE INDEX IF NOT EXISTS idx_session_user_id ON public.session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON public.session(expires_at);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON public.account(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON public.verification(identifier);

-- Criar usuário admin (senha: EdiculaWorks@2024 - hash bcrypt)
-- O Better Auth cria automaticamente na primeira tentativa de login
