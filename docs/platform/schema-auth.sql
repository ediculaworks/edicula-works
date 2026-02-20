-- ============================================================
-- BETTER AUTH SCHEMA
-- Tabelas no schema 'better_auth' para isolamento
-- (Supabase reserva o schema 'auth' para seu próprio sistema)
-- ============================================================

-- Criar schema
CREATE SCHEMA IF NOT EXISTS better_auth;

-- Dar permissões
GRANT ALL PRIVILEGES ON SCHEMA better_auth TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA better_auth TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA better_auth GRANT ALL ON TABLES TO postgres;

-- ============================================================
-- TABELAS BETTER AUTH
-- ============================================================

-- Tabela de usuários (Better Auth)
CREATE TABLE better_auth.user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões
CREATE TABLE better_auth.session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES better_auth.user(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas OAuth
CREATE TABLE better_auth.account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES better_auth.user(id) ON DELETE CASCADE,
    account_id VARCHAR(255) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    access_token_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    id_token TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(provider_id, account_id)
);

-- Tabela de verificação (email verification, password reset)
CREATE TABLE better_auth.verification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_better_auth_user_email ON better_auth.user(email);
CREATE INDEX idx_better_auth_session_user_id ON better_auth.session(user_id);
CREATE INDEX idx_better_auth_session_expires_at ON better_auth.session(expires_at);
CREATE INDEX idx_better_auth_account_user_id ON better_auth.account(user_id);
CREATE INDEX idx_better_auth_verification_identifier ON better_auth.verification(identifier);
CREATE INDEX idx_better_auth_verification_expires_at ON better_auth.verification(expires_at);

-- ============================================================
-- TRIGGERS - Atualizar updated_at automaticamente
-- ============================================================

CREATE TRIGGER update_better_auth_user_updated_at 
BEFORE UPDATE ON better_auth.user 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_better_auth_session_updated_at 
BEFORE UPDATE ON better_auth.session 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_better_auth_account_updated_at 
BEFORE UPDATE ON better_auth.account 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_better_auth_verification_updated_at 
BEFORE UPDATE ON better_auth.verification 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
