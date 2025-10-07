-- QUITO PLATFORM - Complete Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Create enum types
CREATE TYPE app_role AS ENUM ('admin', 'client', 'buyer');
CREATE TYPE client_type AS ENUM ('incorporador', 'corretor', 'imobiliaria');
CREATE TYPE plan_type AS ENUM ('basico', 'intermediario', 'premium', 'profissional');
CREATE TYPE lead_status AS ENUM ('novo', 'contatado', 'em_negociacao', 'visita_agendada', 'proposta', 'vendido', 'perdido');

-- User roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check user role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Clients table (incorporadores, corretores, imobiliarias)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    client_type client_type NOT NULL,
    cnpj TEXT,
    phone TEXT,
    current_plan plan_type,
    plan_start_date TIMESTAMPTZ,
    monthly_leads_quota INTEGER DEFAULT 0,
    leads_used_this_month INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Subscription plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type plan_type NOT NULL UNIQUE,
    name TEXT NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    leads_per_month INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Insert default plans
INSERT INTO subscription_plans (plan_type, name, monthly_price, leads_per_month, features) VALUES
('basico', 'Plano Básico', 800.00, 10, '{"crm_access": true, "reports": "basic", "support": "email"}'),
('intermediario', 'Plano Intermediário', 2400.00, 30, '{"crm_access": true, "reports": "advanced", "support": "priority", "vitrine": true}'),
('premium', 'Plano Premium', 6000.00, 80, '{"crm_access": true, "reports": "premium", "support": "24/7", "vitrine": true, "priority_matching": true}'),
('profissional', 'Plano Profissional', 7000.00, 30, '{"crm_access": true, "reports": "premium", "support": "24/7", "vitrine": true, "priority_matching": true, "dedicated_support": true}');

-- Leads table with unique ID (ID-QT-XXXXXX)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    cpf TEXT,
    monthly_income DECIMAL(10,2),
    credit_score INTEGER,
    interest_location TEXT,
    property_type TEXT,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    bedrooms_min INTEGER,
    notes TEXT,
    source TEXT DEFAULT 'website',
    status lead_status DEFAULT 'novo',
    assigned_to UUID REFERENCES clients(id),
    assigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Function to generate unique lead_id
CREATE OR REPLACE FUNCTION generate_lead_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    new_id TEXT;
    counter INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(lead_id FROM 'ID-QT-(.*)') AS INTEGER)), 0) + 1
    INTO counter
    FROM leads;
    
    new_id := 'ID-QT-' || LPAD(counter::TEXT, 6, '0');
    RETURN new_id;
END;
$$;

-- Trigger to auto-generate lead_id
CREATE OR REPLACE FUNCTION set_lead_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.lead_id IS NULL THEN
        NEW.lead_id := generate_lead_id();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_lead_id
BEFORE INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION set_lead_id();

-- Lead history for tracking status changes
CREATE TABLE lead_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    status lead_status NOT NULL,
    notes TEXT,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;

-- Commissions table (5% on sales)
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id),
    sale_value DECIMAL(12,2) NOT NULL,
    commission_percentage DECIMAL(5,2) DEFAULT 5.00,
    commission_value DECIMAL(12,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    payment_date TIMESTAMPTZ,
    contract_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Property boosts (impulsionamentos)
CREATE TABLE property_boosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    boost_type TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE property_boosts ENABLE ROW LEVEL SECURITY;

-- Lead matching scores (intelligent matching)
CREATE TABLE lead_matching_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    match_score DECIMAL(5,2) NOT NULL,
    factors JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lead_matching_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins manage all user_roles" ON user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own roles" ON user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins manage clients" ON clients FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view own data" ON clients FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Clients update own data" ON clients FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Everyone views plans" ON subscription_plans FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins manage leads" ON leads FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view assigned leads" ON leads FOR SELECT TO authenticated
USING (assigned_to IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Clients update assigned leads" ON leads FOR UPDATE TO authenticated
USING (assigned_to IN (SELECT id FROM clients WHERE user_id = auth.uid()))
WITH CHECK (assigned_to IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage lead_history" ON lead_history FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view lead history" ON lead_history FOR SELECT TO authenticated
USING (lead_id IN (SELECT id FROM leads WHERE assigned_to IN (SELECT id FROM clients WHERE user_id = auth.uid())));

CREATE POLICY "Clients insert lead history" ON lead_history FOR INSERT TO authenticated
WITH CHECK (lead_id IN (SELECT id FROM leads WHERE assigned_to IN (SELECT id FROM clients WHERE user_id = auth.uid())));

CREATE POLICY "Admins manage commissions" ON commissions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view own commissions" ON commissions FOR SELECT TO authenticated
USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage boosts" ON property_boosts FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view own boosts" ON property_boosts FOR SELECT TO authenticated
USING (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Clients insert boosts" ON property_boosts FOR INSERT TO authenticated
WITH CHECK (client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage matching" ON lead_matching_scores FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_leads_lead_id ON leads(lead_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_lead_history_lead_id ON lead_history(lead_id);
CREATE INDEX idx_commissions_client_id ON commissions(client_id);
CREATE INDEX idx_property_boosts_property_id ON property_boosts(property_id);
CREATE INDEX idx_lead_matching_scores_lead_id ON lead_matching_scores(lead_id);
CREATE INDEX idx_lead_matching_scores_property_id ON lead_matching_scores(property_id);