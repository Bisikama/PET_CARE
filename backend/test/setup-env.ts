import { config } from 'dotenv';

process.env.NODE_ENV = 'test';

const result = config({ path: '.env.test' });
if (result.error) {
  throw new Error(
    'Missing .env.test. Copy .env.test.example and configure a dedicated test database.',
  );
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !/_test(?:\?|$)/.test(databaseUrl)) {
  throw new Error('E2E tests require DATABASE_URL to point to a database ending in _test.');
}
