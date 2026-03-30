-- ==========================================
-- 02_add_admin_features.sql
-- 管理機能の追加とアカウント凍結 (is_active) 対応
-- ==========================================

-- 0. staff_profiles テーブルが存在しない場合は作成する
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  role TEXT DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. スタッフ管理テーブルに有効/無効フラグを追加
ALTER TABLE public.staff_profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. RLS（行レベルセキュリティ）のアップデート
-- ※ 以降はRLSの修正例です。環境に合わせて実行してください。
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable select for own or admin" ON public.staff_profiles;
CREATE POLICY "Enable select for own or admin" ON public.staff_profiles 
FOR SELECT TO authenticated 
USING (
  id = auth.uid() OR 
  EXISTS(SELECT 1 FROM staff_profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
);

DROP POLICY IF EXISTS "Enable update for admins" ON public.staff_profiles;
CREATE POLICY "Enable update for admins" ON public.staff_profiles 
FOR UPDATE TO authenticated 
USING (
  EXISTS(SELECT 1 FROM staff_profiles WHERE id = auth.uid() AND role = 'admin' AND is_active = true)
);
