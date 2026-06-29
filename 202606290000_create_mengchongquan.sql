-- 创建萌宠圈数据表
CREATE TABLE IF NOT EXISTS public.萌宠圈 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  身份证 TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 开启行级安全（RLS，权限控制必备）
ALTER TABLE public.萌宠圈 ENABLE ROW LEVEL SECURITY;