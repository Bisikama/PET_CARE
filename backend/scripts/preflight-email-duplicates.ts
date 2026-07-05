import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = localPart.length > 2
    ? `${localPart.substring(0, 2)}***`
    : `*`;
  return `${maskedLocal}@${domain}`;
}

async function checkEmailDuplicates() {
  console.log('Running preflight check for email duplicates...');

  try {
    const duplicates = await prisma.$queryRaw`
      SELECT LOWER(email) as lower_email, COUNT(*) as count
      FROM users
      GROUP BY LOWER(email)
      HAVING COUNT(*) > 1
    `;

    if (Array.isArray(duplicates) && duplicates.length > 0) {
      console.error('ERROR: Found duplicate emails (case-insensitive conflict).');
      console.error('The following masked emails have duplicates:');
      for (const dup of duplicates) {
        console.error(`- ${maskEmail(dup.lower_email)} (count: ${Number(dup.count)})`);
      }
      console.error('Please resolve these conflicts before running the migration.');
      process.exit(1);
    } else {
      console.log('SUCCESS: No duplicate emails found. Ready for migration.');
      process.exit(0);
    }
  } catch (error) {
    console.error('ERROR during preflight check:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmailDuplicates();
