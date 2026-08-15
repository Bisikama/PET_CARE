-- 0. Tạo schema auth và bảng mock users (chỉ chạy khi chưa có - ví dụ ở local DB)
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255),
    raw_user_meta_data JSONB,
    email_confirmed_at TIMESTAMP WITH TIME ZONE
);

-- 1. Thêm Foreign Key ràng buộc supabase_id với auth.users và CASCADE delete
ALTER TABLE "public"."users" 
ADD CONSTRAINT "users_supabase_id_fkey" 
FOREIGN KEY ("supabase_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- 2. Function & Trigger: Tự động tạo public.users khi auth.users được insert
CREATE OR REPLACE FUNCTION public.sync_auth_user_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (
        supabase_id,
        email,
        full_name,
        role,
        is_active,
        password_hash,
        email_verified_at
    )
    VALUES (
        NEW.id,
        lower(NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
        'CUSTOMER'::public.user_role,
        true,
        null,
        null
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback an toàn không làm hỏng transaction tạo user của auth
    RAISE LOG 'Error in sync_auth_user_insert trigger: %', SQLERRM;
    RETURN NEW; 
END;
$$;

CREATE TRIGGER auth_user_insert_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_auth_user_insert();

-- 3. Function & Trigger: Tự động cập nhật email_verified_at khi auth.users verify OTP
CREATE OR REPLACE FUNCTION public.sync_auth_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.users
    SET email_verified_at = NEW.email_confirmed_at
    WHERE supabase_id = NEW.id;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in sync_auth_user_update trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER auth_user_update_trigger
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
EXECUTE FUNCTION public.sync_auth_user_update();
