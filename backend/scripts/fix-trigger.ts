import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  console.log('Fixing sync_auth_user_insert trigger...');
  await client.query(`
    CREATE OR REPLACE FUNCTION public.sync_auth_user_insert()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $func$
    BEGIN
        INSERT INTO public.users (
            supabase_id,
            email,
            full_name,
            role,
            is_active,
            status,
            password_hash,
            email_verified_at
        )
        VALUES (
            NEW.id,
            lower(NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
            'CUSTOMER'::public.user_role,
            true,
            CASE WHEN NEW.email_confirmed_at IS NULL THEN 'PENDING_VERIFICATION'::public.user_status ELSE 'ACTIVE'::public.user_status END,
            null,
            NEW.email_confirmed_at
        );
        RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error in sync_auth_user_insert trigger: %', SQLERRM;
        RETURN NEW; 
    END;
    $func$;
  `);

  console.log('Fixing sync_auth_user_update trigger...');
  await client.query(`
    CREATE OR REPLACE FUNCTION public.sync_auth_user_update()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $func$
    BEGIN
        UPDATE public.users
        SET 
            email_verified_at = NEW.email_confirmed_at,
            status = CASE 
                        WHEN NEW.email_confirmed_at IS NOT NULL AND status = 'PENDING_VERIFICATION'::public.user_status 
                        THEN 'ACTIVE'::public.user_status 
                        ELSE status 
                     END
        WHERE supabase_id = NEW.id;
        
        RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error in sync_auth_user_update trigger: %', SQLERRM;
        RETURN NEW;
    END;
    $func$;
  `);

  console.log('Trigger fixed successfully!');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
