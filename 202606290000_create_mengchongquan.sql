CREATE TABLE IF NOT EXISTS public.萌宠圈 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  身份证 TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.萌宠圈 ENABLE ROW LEVEL SECURITY;