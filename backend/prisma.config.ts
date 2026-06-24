import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DIRECT_URL'],
  },
});
