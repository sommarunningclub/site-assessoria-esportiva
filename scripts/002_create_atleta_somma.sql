-- Create athletes table
CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf VARCHAR(11) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  subscription_plan VARCHAR(50),
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create benefits table
CREATE TABLE IF NOT EXISTS benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create athlete_benefits junction table
CREATE TABLE IF NOT EXISTS athlete_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
  activated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(athlete_id, benefit_id)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_athletes_cpf ON athletes(cpf);
CREATE INDEX IF NOT EXISTS idx_athlete_benefits_athlete ON athlete_benefits(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_benefits_benefit ON athlete_benefits(benefit_id);

-- Enable Row Level Security
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_benefits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for athletes table
CREATE POLICY "Athletes can view own data" ON athletes
  FOR SELECT USING (TRUE);

CREATE POLICY "Only authenticated users can update athletes" ON athletes
  FOR UPDATE USING (TRUE);

-- RLS Policies for benefits table (public read)
CREATE POLICY "Benefits are readable by all" ON benefits
  FOR SELECT USING (TRUE);

-- RLS Policies for athlete_benefits table
CREATE POLICY "Athletes can view own benefits" ON athlete_benefits
  FOR SELECT USING (TRUE);

-- Insert default benefits
INSERT INTO benefits (name, description, icon, category, status) VALUES
  ('App de Treinamento', 'Acesso exclusivo ao app de planejamento de treinos', 'app', 'tecnologia', 'active'),
  ('Análise de Desempenho', 'Relatórios mensais detalhados de seu desempenho', 'chart', 'analytics', 'active'),
  ('Comunidade Exclusiva', 'Acesso ao grupo privado de atletas Somma', 'users', 'comunidade', 'active'),
  ('Suporte Prioritário', 'Atendimento via WhatsApp com prioridade', 'headset', 'suporte', 'active'),
  ('Planos Customizados', 'Treinos personalizados conforme seus objetivos', 'target', 'treinamento', 'active'),
  ('Integração com Strava', 'Sincronização automática de dados do Strava', 'link', 'integracao', 'active'),
  ('Nutritional Guidance', 'Orientação nutricional básica para corredores', 'apple', 'nutricao', 'active'),
  ('Eventos Exclusivos', 'Convite para eventos e corridas exclusivas Somma', 'calendar', 'eventos', 'active')
ON CONFLICT DO NOTHING;
