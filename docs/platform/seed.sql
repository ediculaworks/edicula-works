-- ============================================================
-- SEED INICIAL - EdiculaWorks
-- Execute este script APÓS schema-auth.sql e schema.sql
-- Idempotente: pode ser executado múltiplas vezes
-- ============================================================

-- ============================================================
-- 1. GRUPOS
-- ============================================================

INSERT INTO grupos (empresa_id, nome, descricao, cor, icone, ativo, ordem)
SELECT 1, 'Frontend', 'Equipe de Frontend', '#3b82f6', 'layout', true, 1
WHERE NOT EXISTS (SELECT 1 FROM grupos WHERE empresa_id = 1 AND nome = 'Frontend');

INSERT INTO grupos (empresa_id, nome, descricao, cor, icone, ativo, ordem)
SELECT 1, 'Backend', 'Equipe de Backend', '#8b5cf6', 'server', true, 2
WHERE NOT EXISTS (SELECT 1 FROM grupos WHERE empresa_id = 1 AND nome = 'Backend');

INSERT INTO grupos (empresa_id, nome, descricao, cor, icone, ativo, ordem)
SELECT 1, 'Infra', 'Equipe de Infraestrutura', '#10b981', 'cloud', true, 3
WHERE NOT EXISTS (SELECT 1 FROM grupos WHERE empresa_id = 1 AND nome = 'Infra');

INSERT INTO grupos (empresa_id, nome, descricao, cor, icone, ativo, ordem)
SELECT 1, 'Design', 'Equipe de Design', '#f59e0b', 'palette', true, 4
WHERE NOT EXISTS (SELECT 1 FROM grupos WHERE empresa_id = 1 AND nome = 'Design');

INSERT INTO grupos (empresa_id, nome, descricao, cor, icone, ativo, ordem)
SELECT 1, 'QA', 'Equipe de Qualidade', '#ef4444', 'check-circle', true, 5
WHERE NOT EXISTS (SELECT 1 FROM grupos WHERE empresa_id = 1 AND nome = 'QA');

-- ============================================================
-- 2. TAGS
-- ============================================================

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'frontend', '#3b82f6', 'monitor', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'frontend' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'backend', '#8b5cf6', 'server', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'backend' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'infra', '#10b981', 'cloud', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'infra' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'design', '#f59e0b', 'palette', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'design' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'bug', '#ef4444', 'bug', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'bug' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'feature', '#22c55e', 'plus', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'feature' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'improvement', '#06b6d4', 'trending-up', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'improvement' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'documentation', '#6366f1', 'book', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'documentation' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'urgente', '#dc2626', 'alert-circle', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'urgente' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'api', '#8b5cf6', 'code', 'tarefa'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'api' AND escopo = 'tarefa');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'contrato', '#3b82f6', 'file-text', 'documento'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'contrato' AND escopo = 'documento');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'relatório', '#10b981', 'bar-chart', 'documento'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'relatório' AND escopo = 'documento');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'manual', '#f59e0b', 'book-open', 'documento'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'manual' AND escopo = 'documento');

INSERT INTO tags (empresa_id, nome, cor, icone, escopo)
SELECT 1, 'política', '#ef4444', 'shield', 'documento'
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE empresa_id = 1 AND nome = 'política' AND escopo = 'documento');

-- ============================================================
-- 3. SPRINTS
-- ============================================================

INSERT INTO sprints (empresa_id, projeto_id, nome, objetivo, data_inicio, data_fim, status, meta_pontos, pontos_concluidos, ordem)
SELECT 1, NULL, 'Sprint 1 - Setup Inicial', 'Configuração inicial do projeto e infraestrutura base', 
 CURRENT_DATE, CURRENT_DATE + 13, 'ativa', 34, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM sprints WHERE empresa_id = 1 AND nome = 'Sprint 1 - Setup Inicial');

INSERT INTO sprints (empresa_id, projeto_id, nome, objetivo, data_inicio, data_fim, status, meta_pontos, pontos_concluidos, ordem)
SELECT 1, NULL, 'Sprint 2 - Core Features', 'Implementação das funcionalidades principais',
 CURRENT_DATE + 14, CURRENT_DATE + 27, 'planejada', 40, 0, 2
WHERE NOT EXISTS (SELECT 1 FROM sprints WHERE empresa_id = 1 AND nome = 'Sprint 2 - Core Features');

-- ============================================================
-- 4. CATEGORIAS FINANCEIRAS
-- ============================================================

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Serviços', 'receita', '#22c55e', 'briefcase'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Serviços');

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Consultoria', 'receita', '#3b82f6', 'users'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Consultoria');

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Licenças', 'receita', '#8b5cf6', 'key'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Licenças');

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Outros', 'receita', '#6b7280', 'more-horizontal'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Outros');

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Pessoal', 'despesa', '#ef4444', 'users'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Pessoal');

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Infraestrutura', 'despesa', '#f59e0b', 'server'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Infraestrutura');

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Marketing', 'despesa', '#ec4899', 'megaphone'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Marketing');

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Serviços Externos', 'despesa', '#06b6d4', 'external-link'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Serviços Externos');

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Impostos', 'despesa', '#6b7280', 'file-text'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Impostos');

INSERT INTO categorias_financeiras (empresa_id, nome, tipo, cor, icone)
SELECT 1, 'Operacional', 'despesa', '#84cc16', 'settings'
WHERE NOT EXISTS (SELECT 1 FROM categorias_financeiras WHERE empresa_id = 1 AND nome = 'Operacional');

-- ============================================================
-- 5. CENTROS DE CUSTO
-- ============================================================

INSERT INTO centros_custo (empresa_id, nome, descricao, ativo)
SELECT 1, 'Operações', 'Custos operacionais gerais', true
WHERE NOT EXISTS (SELECT 1 FROM centros_custo WHERE empresa_id = 1 AND nome = 'Operações');

INSERT INTO centros_custo (empresa_id, nome, descricao, ativo)
SELECT 1, 'Projetos', 'Custos específicos de projetos', true
WHERE NOT EXISTS (SELECT 1 FROM centros_custo WHERE empresa_id = 1 AND nome = 'Projetos');

INSERT INTO centros_custo (empresa_id, nome, descricao, ativo)
SELECT 1, 'Administrativo', 'Custos administrativos', true
WHERE NOT EXISTS (SELECT 1 FROM centros_custo WHERE empresa_id = 1 AND nome = 'Administrativo');

INSERT INTO centros_custo (empresa_id, nome, descricao, ativo)
SELECT 1, 'Comercial', 'Custos de vendas e marketing', true
WHERE NOT EXISTS (SELECT 1 FROM centros_custo WHERE empresa_id = 1 AND nome = 'Comercial');

-- ============================================================
-- 6. PERFIS DE ACESSO
-- ============================================================

INSERT INTO perfis (empresa_id, nome, descricao, permissoes)
SELECT 1, 'Administrador', 'Acesso completo ao sistema', '{"all": true}'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE empresa_id = 1 AND nome = 'Administrador');

INSERT INTO perfis (empresa_id, nome, descricao, permissoes)
SELECT 1, 'Gerente', 'Gerenciamento de projetos e equipes',
 '{"projetos": {"read": true, "write": true}, "tarefas": {"read": true, "write": true}, "usuarios": {"read": true}, "relatorios": {"read": true}}'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE empresa_id = 1 AND nome = 'Gerente');

INSERT INTO perfis (empresa_id, nome, descricao, permissoes)
SELECT 1, 'Desenvolvedor', 'Acesso a tarefas e projetos designados',
 '{"projetos": {"read": true}, "tarefas": {"read": true, "write": true}, "documentos": {"read": true}}'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE empresa_id = 1 AND nome = 'Desenvolvedor');

INSERT INTO perfis (empresa_id, nome, descricao, permissoes)
SELECT 1, 'Visualizador', 'Apenas leitura',
 '{"projetos": {"read": true}, "tarefas": {"read": true}, "documentos": {"read": true}}'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE empresa_id = 1 AND nome = 'Visualizador');

-- ============================================================
-- 7. USUÁRIO ADMINISTRADOR
-- ============================================================

INSERT INTO better_auth.user (id, name, email, email_verified, image)
SELECT '00000000-0000-0000-0000-000000000001', 'Administrador', 'admin@ediculaworks.com', true, NULL
WHERE NOT EXISTS (SELECT 1 FROM better_auth.user WHERE id = '00000000-0000-0000-0000-000000000001');

INSERT INTO better_auth.account (user_id, account_id, provider_id, password)
SELECT '00000000-0000-0000-0000-000000000001', 'admin@ediculaworks.com', 'credential', 
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.IuP5cP6dVZVXVVVVVV'
WHERE NOT EXISTS (SELECT 1 FROM better_auth.account WHERE provider_id = 'credential' AND account_id = 'admin@ediculaworks.com');

UPDATE public.usuarios 
SET 
    cargo = 'Administrador do Sistema',
    role = 'admin',
    perfil_id = 1,
    departamento = 'TI'
WHERE auth_user_id = '00000000-0000-0000-0000-000000000001';

-- ============================================================
-- 8. CONFIGURAÇÕES INICIAIS
-- ============================================================

UPDATE configuracoes_empresa 
SET 
    nome_sistema = 'EdiculaWorks',
    email_principal = 'contato@ediculaworks.com',
    email_suporte = 'suporte@ediculaworks.com',
    email_financeiro = 'financeiro@ediculaworks.com'
WHERE empresa_id = 1;

-- ============================================================
-- 9. PROJETOS INICIAIS
-- ============================================================

INSERT INTO projetos (empresa_id, nome, descricao, cor, status, data_inicio)
SELECT 1, 'EdiculaWorks Platform', 'Plataforma principal de gestão', '#3b82f6', 'ativo', CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM projetos WHERE empresa_id = 1 AND nome = 'EdiculaWorks Platform');

INSERT INTO projetos (empresa_id, nome, descricao, cor, status, data_inicio)
SELECT 1, 'Mobile App', 'Aplicativo mobile', '#8b5cf6', 'planejado', NULL
WHERE NOT EXISTS (SELECT 1 FROM projetos WHERE empresa_id = 1 AND nome = 'Mobile App');

INSERT INTO projetos (empresa_id, nome, descricao, cor, status, data_inicio)
SELECT 1, 'Integrações', 'Integrações com sistemas externos', '#10b981', 'planejado', NULL
WHERE NOT EXISTS (SELECT 1 FROM projetos WHERE empresa_id = 1 AND nome = 'Integrações');

-- ============================================================
-- FIM DO SEED
-- ============================================================
