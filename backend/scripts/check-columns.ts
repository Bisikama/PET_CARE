import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const res1 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'provider_profiles';
  `);
  console.log('Columns in provider_profiles:');
  console.log(res1.rows.map(r => r.column_name).join(', '));

  const res2 = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name = 'pet_photos';
  `);
  console.log('Table pet_photos exists:', (res2.rowCount ?? 0) > 0);

  await client.end();
}

main().catch(console.error);
