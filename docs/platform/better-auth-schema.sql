-- ============================================================
-- BETTER AUTH SCHEMA - Corrigido para Better Auth 1.x
-- ============================================================

-- Criar schema
CREATE SCHEMA IF NOT EXISTS better_auth;

-- ============================================================
-- FUNÇÃO update_updated_at_column
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABELAS BETTER AUTH (snake_case conforme Better Auth 1.x)
-- ============================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS better_auth."user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS better_auth.session (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES better_auth."user"(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    token VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas (OAuth + Password)
CREATE TABLE IF NOT EXISTS better_auth.account (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES better_auth."user"(id) ON DELETE CASCADE,
    account_id VARCHAR(255),
    provider_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    access_token_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    id_token TEXT,
    password VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de verificação
CREATE TABLE IF NOT EXISTS better_auth.verification (
    id VARCHAR(255) PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_email ON better_auth."user"(email);
CREATE INDEX IF NOT EXISTS idx_session_user_id ON better_auth.session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON better_auth.session(expires_at);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON better_auth.account(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON better_auth.verification(identifier);

-- ============================================================
-- TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS update_user_updated_at ON better_auth."user";
CREATE TRIGGER update_user_updated_at 
    BEFORE UPDATE ON better_auth."user" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_updated_at ON better_auth.session;
CREATE TRIGGER update_session_updated_at 
    BEFORE UPDATE ON better_auth.session 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_account_updated_at ON better_auth.account;
CREATE TRIGGER update_account_updated_at 
    BEFORE UPDATE ON better_auth.account 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verification_updated_at ON better_auth.verification;
CREATE TRIGGER update_verification_updated_at 
    BEFORE UPDATE ON better_auth.verification 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
GRANT ALL PRIVILEGES ON SCHEMA better_auth TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA better_auth TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA better_auth TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA better_auth GRANT ALL ON TABLES TO postgres;
