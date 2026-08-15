import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env variables
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envPath) });

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL or DIRECT_URL is not defined in env');
    process.exit(1);
  }

  console.log(`Connecting via PrismaPg adapter to: ${connectionString}`);
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('Creating partial unique index idx_provider_area_unique_active on provider_service_areas...');

    // Drop existing unique index if it was previously created manually, to avoid conflicts
    await prisma.$executeRawUnsafe(`
      DROP INDEX IF EXISTS idx_provider_area_unique_active
    `);

    // Create the partial unique index ignoring soft-deleted records (where deleted_at IS NOT NULL)
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX idx_provider_area_unique_active 
      ON provider_service_areas(provider_id, city, district, ward) 
      WHERE deleted_at IS NULL
    `);

    console.log('Partial unique index created successfully.');
  } catch (error) {
    console.error('Error creating index:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
