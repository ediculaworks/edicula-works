-- ============================================
-- ADD MEMBRO_ID TO TRANSACOES
-- ============================================

-- Add membro_id column to transacoes if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transacoes' AND column_name = 'membro_id'
    ) THEN
        ALTER TABLE transacoes ADD COLUMN membro_id INTEGER REFERENCES usuarios(id);
    END IF;
END $$;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_transacoes_membro ON transacoes(membro_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_membro_status ON transacoes(membro_id, status);
