require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function seed() {
  const providers = await prisma.provider_profiles.findMany({
    where: {
      status: 'APPROVED',
    },
  });
  console.log(`Found ${providers.length} approved providers.`);

  const timeSlots = await prisma.time_slots.findMany({
    orderBy: { start_time: 'asc' },
  });
  console.log(`Found ${timeSlots.length} time slots.`);

  // Generate 60 days starting from 2026-09-24
  const startDate = new Date('2026-09-24T00:00:00.000Z');
  const daysToGenerate = 60;

  const daysData = [];
  for (let i = 0; i < daysToGenerate; i++) {
    const current = new Date(startDate);
    current.setUTCDate(startDate.getUTCDate() + i);

    for (const provider of providers) {
      daysData.push({
        provider_id: provider.id,
        work_date: current,
        working_mode: 'FULL_TIME',
      });
    }
  }

  console.log(`Inserting ${daysData.length} working days...`);
  await prisma.provider_working_days.createMany({
    data: daysData,
    skipDuplicates: true,
  });
  console.log('Working days inserted.');

  // Fetch all working days for these providers in this date range
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + daysToGenerate);

  const existingDays = await prisma.provider_working_days.findMany({
    where: {
      work_date: {
        gte: startDate,
        lt: endDate,
      },
      provider_id: { in: providers.map(p => p.id) },
    },
    select: { id: true },
  });

  console.log(`Preparing slots for ${existingDays.length} working days...`);
  const slotsData = [];
  for (const day of existingDays) {
    for (const ts of timeSlots) {
      slotsData.push({
        working_day_id: day.id,
        slot_id: ts.id,
        status: 'AVAILABLE',
      });
    }
  }

  console.log(`Inserting ${slotsData.length} working slots...`);
  // Insert in chunks of 500
  const chunkSize = 500;
  for (let i = 0; i < slotsData.length; i += chunkSize) {
    const chunk = slotsData.slice(i, i + chunkSize);
    await prisma.provider_working_slots.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  console.log('Successfully completed batch seeding of future working days and slots!');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
