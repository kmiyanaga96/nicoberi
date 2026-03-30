-- ==========================================
-- 03_set_admin_role.sql
-- すべての現在登録済みのログインユーザー（auth.users）に対して、
-- staff_profiles レコードを作成し、'admin' 権限を設定します。
-- ==========================================

INSERT INTO public.staff_profiles (id, name, role, is_active)
SELECT id, email, 'admin', true
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', is_active = true;
