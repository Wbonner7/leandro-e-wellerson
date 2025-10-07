-- QUITO PLATFORM - Complete Database Schema
-- Execute this SQL in your Lovable Cloud SQL Editor

-- 1. Create enum types
CREATE TYPE app_role AS ENUM ('admin', 'client', 'buyer');
CREATE TYPE client_type AS ENUM ('incorporator', 'broker', 'real_estate_agency');
CREATE TYPE plan_type AS ENUM ('basic', 'intermediate', 'premium', 'professional');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'negotiating', 'converted', 'lost');

-- 2. Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 3. Create subscription_plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_type plan_type NOT NULL UNIQUE,
  monthly_price DECIMAL(10,2) NOT NULL,
  leads_quota INTEGER NOT NULL,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  client_type client_type NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  leads_received INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create leads table with auto-generated lead_id
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT,
  monthly_income TEXT,
  preferred_location TEXT,
  property_type TEXT,
  bedrooms INTEGER,
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  notes TEXT,
  status lead_status DEFAULT 'new',
  assigned_client_id UUID REFERENCES clients(id),
  origin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create lead_history table
CREATE TABLE lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  previous_status lead_status,
  new_status lead_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create commissions table
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  sale_value DECIMAL(12,2) NOT NULL,
  commission_percentage DECIMAL(5,2) DEFAULT 5.00,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create property_boosts table
CREATE TABLE property_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  boost_type TEXT NOT NULL,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Create lead_matching_scores table
CREATE TABLE lead_matching_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  matching_criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, property_id)
);

-- 10. Create security definer function for role checking
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 11. Create function to auto-generate lead_id
CREATE OR REPLACE FUNCTION generate_lead_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM leads;
  new_id := 'ID-QT-' || LPAD(counter::TEXT, 6, '0');
  WHILE EXISTS (SELECT 1 FROM leads WHERE lead_id = new_id) LOOP
    counter := counter + 1;
    new_id := 'ID-QT-' || LPAD(counter::TEXT, 6, '0');
  END LOOP;
  RETURN new_id;
END;
$$;

-- 12. Create trigger to set lead_id automatically
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

-- 13. Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_matching_scores ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS policies for user_roles
CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 15. Create RLS policies for clients
CREATE POLICY "Admins can manage all clients" ON clients
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Clients can update own data" ON clients
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 16. Create RLS policies for subscription_plans
CREATE POLICY "Plans are viewable by everyone" ON subscription_plans
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage plans" ON subscription_plans
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 17. Create RLS policies for leads
CREATE POLICY "Admins can manage all leads" ON leads
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Assigned clients can view their leads" ON leads
  FOR SELECT TO authenticated
  USING (
    assigned_client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- 18. Create RLS policies for lead_history
CREATE POLICY "Admins can view all history" ON lead_history
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert history" ON lead_history
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 19. Create RLS policies for commissions
CREATE POLICY "Admins can manage all commissions" ON commissions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own commissions" ON commissions
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- 20. Create RLS policies for property_boosts
CREATE POLICY "Admins can manage all boosts" ON property_boosts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view own boosts" ON property_boosts
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- 21. Create RLS policies for lead_matching_scores
CREATE POLICY "Admins can manage all scores" ON lead_matching_scores
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 22. Insert default subscription plans
INSERT INTO subscription_plans (name, plan_type, monthly_price, leads_quota, features)
VALUES
  ('Básico', 'basic', 800.00, 10, '{"support": "email", "analytics": "basic"}'),
  ('Intermediário', 'intermediate', 2400.00, 30, '{"support": "priority", "analytics": "advanced", "boost": true}'),
  ('Premium', 'premium', 6000.00, 100, '{"support": "24/7", "analytics": "premium", "boost": true, "api_access": true}'),
  ('Profissional', 'professional', 7000.00, 150, '{"support": "dedicated", "analytics": "premium", "boost": true, "api_access": true, "custom_integration": true}');

-- 23. Create indexes for performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_client ON leads(assigned_client_id);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_commissions_client_id ON commissions(client_id);
CREATE INDEX idx_property_boosts_property_id ON property_boosts(property_id);
CREATE INDEX idx_lead_matching_lead_id ON lead_matching_scores(lead_id);
