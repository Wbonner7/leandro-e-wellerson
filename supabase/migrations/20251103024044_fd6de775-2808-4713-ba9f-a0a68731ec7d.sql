-- Adicionar nova coluna para stage do pipeline
ALTER TABLE property_interests 
ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'pending';

-- Atualizar constraint do status para incluir novos estágios
ALTER TABLE property_interests 
DROP CONSTRAINT IF EXISTS property_interests_status_check;

ALTER TABLE property_interests
ADD CONSTRAINT property_interests_pipeline_stage_check 
CHECK (pipeline_stage IN (
  'pending',           -- Novo Lead
  'contacted',         -- Contato Inicial
  'visit_scheduled',   -- Visita Agendada
  'negotiating',       -- Em Negociação
  'proposal_sent',     -- Proposta Enviada
  'won',              -- Venda Fechada
  'lost'              -- Perdido
));

-- Adicionar coluna para anotações do corretor
ALTER TABLE property_interests 
ADD COLUMN IF NOT EXISTS broker_notes TEXT;

-- Adicionar coluna para valor da proposta
ALTER TABLE property_interests 
ADD COLUMN IF NOT EXISTS proposal_value NUMERIC;

-- Adicionar coluna para motivo da perda
ALTER TABLE property_interests 
ADD COLUMN IF NOT EXISTS loss_reason TEXT;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_property_interests_pipeline_stage 
ON property_interests(pipeline_stage);

-- Criar tabela de histórico de movimentações
CREATE TABLE IF NOT EXISTS pipeline_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_id UUID NOT NULL REFERENCES property_interests(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  moved_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para property owners verem histórico dos seus leads
ALTER TABLE pipeline_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property owners can view pipeline history"
ON pipeline_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM property_interests pi
    JOIN properties p ON p.id = pi.property_id
    WHERE pi.id = pipeline_history.interest_id
    AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Property owners can insert pipeline history"
ON pipeline_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM property_interests pi
    JOIN properties p ON p.id = pi.property_id
    WHERE pi.id = interest_id
    AND p.owner_id = auth.uid()
  )
);