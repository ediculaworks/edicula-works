-- ============================================
-- TABELAS DE EVENTOS (Cronograma)
-- ============================================

-- Tabela principal de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id INTEGER NOT NULL DEFAULT 1,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT DEFAULT 'evento',
    data_inicio DATE NOT NULL,
    data_fim DATE,
    hora_inicio TIME,
    hora_fim TIME,
    local TEXT,
    link_reuniao TEXT,
    recorrencia TEXT,
    fim_recorrencia DATE,
    dia_semana_recorrencia INTEGER,
    cor TEXT DEFAULT '#3b82f6',
    tarefa_id INTEGER,
    criado_por INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participantes do evento
CREATE TABLE IF NOT EXISTS evento_participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
    membro_id TEXT NOT NULL,
    status TEXT DEFAULT 'confirmado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_eventos_empresa ON eventos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_recorrencia ON eventos(recorrencia);
CREATE INDEX IF NOT EXISTS idx_evento_participantes_evento ON evento_participantes(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_participantes_membro ON evento_participantes(membro_id);

-- Habilitar RLS
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento_participantes ENABLE ROW LEVEL SECURITY;

-- Política RLS simples (ajustar conforme necessidade)
DROP POLICY IF EXISTS "Allow all on eventos" ON eventos;
CREATE POLICY "Allow all on eventos" ON eventos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on evento_participantes" ON evento_participantes;
CREATE POLICY "Allow all on evento_participantes" ON evento_participantes FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- EVENTOS DE EXEMPLO
-- ============================================

-- Inserir eventos de exemplo (apenas se a tabela estiver vazia)
DO $$
DECLARE 
    evento_id UUID;
    hoje DATE := CURRENT_DATE;
BEGIN
    -- Verificar se já existem eventos
    IF (SELECT COUNT(*) FROM eventos) > 0 THEN
        RETURN;
    END IF;

    -- Daily de hoje às 9h
    INSERT INTO eventos (empresa_id, titulo, descricao, tipo, data_inicio, hora_inicio, hora_fim, cor)
    VALUES (1, 'Daily Standup', 'Reunião diária de sincronização', 'daily', hoje, '09:00', '09:15', '#3b82f6')
    RETURNING id INTO evento_id;

    -- Daily de amanhã às 9h
    INSERT INTO eventos (empresa_id, titulo, descricao, tipo, data_inicio, hora_inicio, hora_fim, cor)
    VALUES (1, 'Daily Standup', 'Reunião diária de sincronização', 'daily', hoje + 1, '09:00', '09:15', '#3b82f6');

    -- Reunião de planejamento (semana que vem)
    INSERT INTO eventos (empresa_id, titulo, descricao, tipo, data_inicio, hora_inicio, hora_fim, local, cor)
    VALUES (1, 'Planejamento Sprint', 'Reunião para planejar as tarefas do sprint', 'reuniao', hoje + 3, '14:00', '15:00', 'Sala de Reunião', '#8b5cf6');

    -- Visita a cliente
    INSERT INTO eventos (empresa_id, titulo, descricao, tipo, data_inicio, hora_inicio, hora_fim, local, cor)
    VALUES (1, 'Visita Cliente XYZ', 'Reunião de apresentação do projeto', 'visita', hoje + 5, '10:00', '12:00', 'Escritório do Cliente', '#f97316');

    -- Evento geral
    INSERT INTO eventos (empresa_id, titulo, descricao, tipo, data_inicio, hora_inicio, hora_fim, cor)
    VALUES (1, 'Releases do Mês', 'Apresentação de releases do mês', 'evento', hoje + 10, '16:00', '17:00', '#22c55e');

    -- Evento passado (histórico)
    INSERT INTO eventos (empresa_id, titulo, descricao, tipo, data_inicio, hora_inicio, hora_fim, cor)
    VALUES (1, 'Retrospectiva Sprint', 'Revisão do sprint anterior', 'reuniao', hoje - 7, '14:00', '15:30', '#8b5cf6');

    -- another daily yesterday
    INSERT INTO eventos (empresa_id, titulo, descricao, tipo, data_inicio, hora_inicio, hora_fim, cor)
    VALUES (1, 'Daily Standup', 'Reunião diária de sincronização', 'daily', hoje - 1, '09:00', '09:15', '#3b82f6');

    RAISE NOTICE 'Eventos de exemplo criados com sucesso';
END $$;
