import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Auth & Public Users Sync Reconciliation ---');

  try {
    const result: any[] = await prisma.$queryRaw`
      SELECT
        a.id as auth_id,
        p.supabase_id as public_id,
        a.email as auth_email,
        p.email as public_email,
        a.email_confirmed_at,
        p.email_verified_at,
        p.is_active
      FROM auth.users a
      FULL OUTER JOIN public.users p ON p.supabase_id = a.id
    `;

    let verifiedSynced = 0;
    let pendingOtp = 0;
    let authOnlyMissingProfile = 0;
    let localOnlyOrphan = 0;
    let verifiedAuthButLocalNotSynced = 0;

    for (const row of result) {
      const hasAuth = !!row.auth_id;
      const hasPublic = !!row.public_id;

      if (hasAuth && hasPublic) {
        if (row.email_confirmed_at && row.email_verified_at) {
          verifiedSynced++;
        } else if (!row.email_confirmed_at && !row.email_verified_at) {
          pendingOtp++;
        } else if (row.email_confirmed_at && !row.email_verified_at) {
          verifiedAuthButLocalNotSynced++;
          console.warn(`[SYNC ISSUE] User ${row.auth_id} is verified in Auth, but not in Public.`);
        }
      } else if (hasAuth && !hasPublic) {
        authOnlyMissingProfile++;
        console.warn(`[ORPHAN] Auth user ${row.auth_id} missing local profile.`);
      } else if (!hasAuth && hasPublic) {
        localOnlyOrphan++;
        console.warn(`[ORPHAN] Local user missing Auth user (supabase_id: ${row.public_id}).`);
      }
    }

    console.log('\n--- Summary ---');
    console.log(`VERIFIED_SYNCED: ${verifiedSynced}`);
    console.log(`PENDING_OTP: ${pendingOtp}`);
    console.log(`AUTH_ONLY_MISSING_PROFILE: ${authOnlyMissingProfile}`);
    console.log(`LOCAL_ONLY_ORPHAN: ${localOnlyOrphan}`);
    console.log(`VERIFIED_AUTH_BUT_LOCAL_NOT_SYNCED: ${verifiedAuthButLocalNotSynced}`);
    console.log('-----------------------------------------------');
  } catch (error) {
    console.error('Failed to run reconciliation script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
