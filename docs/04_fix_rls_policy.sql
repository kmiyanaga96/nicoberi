-- ==========================================
-- 04_fix_rls_policy.sql
-- エラー（再帰呼び出し等）を防ぎつつ、全スタッフ情報を
-- アプリが正しく読み取れるようにSelect権限を修正します。
-- ==========================================

DROP POLICY IF EXISTS "Enable select for own or admin" ON public.staff_profiles;
CREATE POLICY "Enable select for all authenticated users" ON public.staff_profiles 
FOR SELECT TO authenticated 
USING (true);
