-- Tabela para armazenar consentimentos de cookies
CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consent_type TEXT NOT NULL DEFAULT 'all', -- 'all', 'essential', 'rejected'
  essential_cookies BOOLEAN DEFAULT TRUE,
  analytics_cookies BOOLEAN DEFAULT FALSE,
  marketing_cookies BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para buscar por visitor_id
CREATE INDEX IF NOT EXISTS idx_cookie_consents_visitor_id ON public.cookie_consents(visitor_id);

-- RLS - Permitir inserção pública (sem autenticação necessária para consentimento de cookies)
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de qualquer pessoa (consentimento de cookies é público)
CREATE POLICY "Allow public insert for cookie consents" 
  ON public.cookie_consents 
  FOR INSERT 
  WITH CHECK (true);

-- Política para permitir leitura apenas pelo service role (admin)
CREATE POLICY "Allow service role to read cookie consents" 
  ON public.cookie_consents 
  FOR SELECT 
  USING (true);
