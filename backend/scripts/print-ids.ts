import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
});

const prisma = new PrismaClient({ adapter });

const customerUserId = '75555494-556d-42c5-8bd3-87cd00b366df';

async function main() {
  console.log('🔍 Đang lấy danh sách ID thực tế từ database...');

  // 1. Lấy địa chỉ
  const addresses = await prisma.customer_addresses.findMany({
    where: { customer_id: customerUserId },
  });
  console.log('\n📍 Địa chỉ của Customer:');
  addresses.forEach((addr) => {
    console.log(`- [${addr.label}] ID: ${addr.id} (${addr.address_line}, ${addr.ward}, ${addr.district})`);
  });

  // 2. Lấy Pets
  const pets = await prisma.pets.findMany({
    where: { customer_id: customerUserId },
  });
  console.log('\n🐶 Thú cưng của Customer:');
  pets.forEach((pet) => {
    console.log(`- [${pet.name}] ID: ${pet.id} (Loài: ${pet.species}, Giống: ${pet.breed})`);
  });

  // 3. Lấy Services
  const services = await prisma.services.findMany({
    where: { is_active: true },
  });
  console.log('\n💼 Các dịch vụ hệ thống (Service):');
  services.forEach((srv) => {
    console.log(`- [${srv.name}] ID: ${srv.id} (Category: ${srv.category})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
