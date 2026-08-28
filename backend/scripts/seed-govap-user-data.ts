import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, provider_type, provider_status, provider_document_status, screening_status, capability_status, availability_slot_status, booking_status } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
});

const prisma = new PrismaClient({ adapter });

const providerUserId = '6ff0b18e-5a38-419b-814c-244ca56239cb';
const customerUserId = '75555494-556d-42c5-8bd3-87cd00b366df';

async function main() {
  console.log('🚀 Bắt đầu gán dữ liệu test Gò Vấp cho tài khoản thực...');

  // 1. Cập nhật role của Provider sang PROVIDER
  console.log('   - Đang chuyển đổi vai trò tài khoản provider sang PROVIDER...');
  await prisma.user.update({
    where: { id: providerUserId },
    data: { role: Role.PROVIDER },
  });

  // 2. Tạo hoặc lấy Profile Provider
  console.log('   - Thiết lập hồ sơ đối tác (Provider Profile)...');
  let providerProfile = await prisma.provider_profiles.findUnique({
    where: { user_id: providerUserId },
  });

  if (!providerProfile) {
    providerProfile = await prisma.provider_profiles.create({
      data: {
        user_id: providerUserId,
        provider_type: provider_type.GROOMER,
        bio: 'Tôi chuyên cung cấp dịch vụ thú cưng tại khu vực Gò Vấp. Chăm sóc tận tình, chu đáo.',
        experience_years: 3,
        status: provider_status.APPROVED,
        kyc_status: provider_document_status.APPROVED,
        credential_status: provider_document_status.APPROVED,
        screening_status: screening_status.PASSED,
        rating_avg: 4.8,
        total_reviews: 5,
        total_completed_bookings: 8,
      },
    });
  } else {
    providerProfile = await prisma.provider_profiles.update({
      where: { id: providerProfile.id },
      data: {
        status: provider_status.APPROVED,
        kyc_status: provider_document_status.APPROVED,
      },
    });
  }

  // 3. Đăng ký khu vực hoạt động (Phường 7, Gò Vấp)
  console.log('   - Đăng ký khu vực Gò Vấp Phường 7 cho provider...');
  const city = 'Thành phố Hồ Chí Minh';
  const district = 'Quận Gò Vấp';
  const ward = 'Phường 7';

  const existingArea = await prisma.provider_service_areas.findFirst({
    where: { provider_id: providerProfile.id, city, district, ward },
  });

  if (!existingArea) {
    await prisma.provider_service_areas.create({
      data: {
        provider_id: providerProfile.id,
        city,
        district,
        ward,
        is_active: true,
      },
    });
  } else {
    await prisma.provider_service_areas.update({
      where: { id: existingArea.id },
      data: { is_active: true },
    });
  }

  // 4. Đăng ký các dịch vụ (Capabilities) cho Provider
  console.log('   - Đăng ký các năng lực dịch vụ cho provider...');
  const providerServicesData = [
    {
      provider_id: providerProfile.id,
      service_id: 'a23b1234-abcd-1234-ef01-000000000001', // Chăm sóc chó tại nhà
      price: 150000,
      custom_description: 'Chăm sóc chó tại nhà khu vực Gò Vấp',
      pet_species: 'Dog',
      min_weight: 0,
      max_weight: 20,
      status: capability_status.APPROVED,
      is_active: true,
    },
    {
      provider_id: providerProfile.id,
      service_id: 'a23b1234-abcd-1234-ef01-000000000002', // Dắt chó đi dạo
      price: 100000,
      custom_description: 'Dắt chó đi dạo ở công viên Gò Vấp',
      pet_species: 'Dog',
      min_weight: 0,
      max_weight: 30,
      status: capability_status.APPROVED,
      is_active: true,
    },
    {
      provider_id: providerProfile.id,
      service_id: 'a23b1234-abcd-1234-ef01-000000000003', // Chăm sóc mèo tại nhà
      price: 120000,
      custom_description: 'Chăm sóc mèo tại nhà khu vực Gò Vấp',
      pet_species: 'Cat',
      min_weight: 0,
      max_weight: 12,
      status: capability_status.APPROVED,
      is_active: true,
    },
    {
      provider_id: providerProfile.id,
      service_id: 'a23b1234-abcd-1234-ef01-000000000004', // Tắm rửa cắt tỉa
      price: 250000,
      custom_description: 'Tắm rửa cắt tỉa chuyên nghiệp tại Gò Vấp',
      pet_species: 'Dog',
      min_weight: 0,
      max_weight: 15,
      status: capability_status.APPROVED,
      is_active: true,
    },
    {
      provider_id: providerProfile.id,
      service_id: 'a23b1234-abcd-1234-ef01-000000000004', // Tắm rửa cắt tỉa (mèo)
      price: 220000,
      custom_description: 'Tắm sấy chải lông rụng cho mèo tại Gò Vấp',
      pet_species: 'Cat',
      min_weight: 0,
      max_weight: 10,
      status: capability_status.APPROVED,
      is_active: true,
    },
  ];

  for (const ps of providerServicesData) {
    const existingPS = await prisma.provider_services.findFirst({
      where: {
        provider_id: ps.provider_id,
        service_id: ps.service_id,
        pet_species: ps.pet_species,
        min_weight: ps.min_weight,
        max_weight: ps.max_weight,
      },
    });

    if (!existingPS) {
      await prisma.provider_services.create({ data: ps });
    } else {
      await prisma.provider_services.update({
        where: { id: existingPS.id },
        data: ps,
      });
    }
  }

  // 5. Sinh Lịch làm việc & Slots cho Provider trong 7 ngày
  console.log('   - Thiết lập lịch làm việc và slots cho provider...');
  const today = new Date();
  const timeSlots = await prisma.time_slots.findMany();

  for (let i = 0; i < 7; i++) {
    const workDate = new Date(today);
    workDate.setDate(today.getDate() + i);
    workDate.setHours(0, 0, 0, 0);

    const workingDay = await prisma.provider_working_days.upsert({
      where: {
        provider_id_work_date: {
          provider_id: providerProfile.id,
          work_date: workDate,
        },
      },
      update: {},
      create: {
        provider_id: providerProfile.id,
        work_date: workDate,
        working_mode: 'FULL_TIME',
      },
    });

    for (const ts of timeSlots) {
      await prisma.provider_working_slots.upsert({
        where: {
          working_day_id_slot_id: {
            working_day_id: workingDay.id,
            slot_id: ts.id,
          },
        },
        update: {},
        create: {
          working_day_id: workingDay.id,
          slot_id: ts.id,
          status: availability_slot_status.AVAILABLE,
        },
      });
    }
  }

  // 6. Tạo địa chỉ ở Phường 7 Gò Vấp cho Customer
  console.log('   - Thiết lập địa chỉ cho customer tại Gò Vấp...');
  const addressLineGovap = '789 Đường Nguyễn Văn Nghi';
  const existingGovapAddress = await prisma.customer_addresses.findFirst({
    where: { customer_id: customerUserId, address_line: addressLineGovap },
  });

  let govapAddressId = existingGovapAddress?.id;
  if (!existingGovapAddress) {
    const address = await prisma.customer_addresses.create({
      data: {
        customer_id: customerUserId,
        label: 'Nhà riêng Gò Vấp',
        receiver_name: 'Bill Nguyễn',
        phone: '0909998877',
        address_line: addressLineGovap,
        ward,
        district,
        city,
        latitude: 10.8225,
        longitude: 106.6875,
        is_default: true,
      },
    });
    govapAddressId = address.id;
  }

  // 7. Tạo thú cưng cho Customer
  console.log('   - Tạo thú cưng (Bobi, Kiki) cho customer...');
  const govapDogName = 'Bobi';
  const govapCatName = 'Kiki';

  let bobiPet = await prisma.pets.findFirst({
    where: { customer_id: customerUserId, name: govapDogName },
  });
  if (!bobiPet) {
    bobiPet = await prisma.pets.create({
      data: {
        customer_id: customerUserId,
        name: govapDogName,
        species: 'Dog',
        breed: 'Corgi',
        age: 1,
        weight: 8.5,
        gender: 'Male',
        health_note: 'Khỏe mạnh, thích chạy nhảy',
        behavior_note: 'Thân thiện, ham ăn',
      },
    });
  }

  let kikiPet = await prisma.pets.findFirst({
    where: { customer_id: customerUserId, name: govapCatName },
  });
  if (!kikiPet) {
    kikiPet = await prisma.pets.create({
      data: {
        customer_id: customerUserId,
        name: govapCatName,
        species: 'Cat',
        breed: 'Ragdoll',
        age: 2,
        weight: 4.2,
        gender: 'Female',
        health_note: 'Hơi kén ăn',
        behavior_note: 'Nhút nhát nhưng hiền lành',
      },
    });
  }

  // 8. Tạo các Booking mẫu
  console.log('   - Tạo các đơn Booking thử nghiệm...');
  const workDateToday = new Date(today);
  workDateToday.setHours(0, 0, 0, 0);

  const govapWorkingDay = await prisma.provider_working_days.findFirst({
    where: {
      provider_id: providerProfile.id,
      work_date: workDateToday,
    },
  });

  if (govapWorkingDay && govapAddressId) {
    // Booking 1: Dắt chó đi dạo (Status: PENDING_PROVIDER_ACCEPTANCE)
    const slot1 = await prisma.provider_working_slots.findFirst({
      where: {
        working_day_id: govapWorkingDay.id,
        time_slots: { start_time: '08:00' }, // Lấy slot đầu tiên
      },
      include: { time_slots: true },
    });

    const serviceDogWalk = await prisma.provider_services.findFirst({
      where: {
        provider_id: providerProfile.id,
        service_id: 'a23b1234-abcd-1234-ef01-000000000002', // Dắt chó đi dạo
        pet_species: 'Dog',
      },
    });

    if (slot1 && serviceDogWalk) {
      // Đánh dấu slot là RESERVED_FOR_PROVIDER_RESPONSE
      await prisma.provider_working_slots.update({
        where: { id: slot1.id },
        data: { status: availability_slot_status.RESERVED_FOR_PROVIDER_RESPONSE },
      });

      const estimatedStart = new Date(workDateToday);
      estimatedStart.setHours(8, 0, 0, 0);
      const estimatedEnd = new Date(workDateToday);
      estimatedEnd.setHours(10, 0, 0, 0);

      const booking1 = await prisma.bookings.create({
        data: {
          customer_id: customerUserId,
          provider_id: providerProfile.id,
          address_id: govapAddressId,
          requested_slot_id: slot1.slot_id,
          provider_working_slot_id: slot1.id,
          requested_date: workDateToday,
          service_duration_minutes: 45,
          travel_duration_minutes: 15,
          buffer_minutes: 15,
          estimated_start_at: estimatedStart,
          estimated_end_at: estimatedEnd,
          status: booking_status.PENDING_PROVIDER_ACCEPTANCE,
          total_price: serviceDogWalk.price,
          customer_note: 'Bobi hơi nghịch ngợm, dắt bé đi cẩn thận nhé.',
          address_snapshot: {
            receiver_name: 'Bill Nguyễn',
            phone: '0909998877',
            address_line: addressLineGovap,
            ward: 'Phường 7',
            district: 'Quận Gò Vấp',
            city: 'Thành phố Hồ Chí Minh',
          },
        },
      });

      const bookingPet = await prisma.booking_pets.create({
        data: {
          booking_id: booking1.id,
          pet_id: bobiPet.id,
          pet_name: bobiPet.name,
          species: bobiPet.species,
          breed: bobiPet.breed,
          age: bobiPet.age,
          weight: bobiPet.weight,
          gender: bobiPet.gender,
        },
      });

      await prisma.booking_services.create({
        data: {
          booking_pet_id: bookingPet.id,
          provider_service_id: serviceDogWalk.id,
          price: serviceDogWalk.price,
          duration_minutes: 45,
          service_name: 'Dịch vụ Dắt chó đi dạo',
          service_description: serviceDogWalk.custom_description,
          service_category: 'Dog Walking',
        },
      });
    }

    // Booking 2: Tắm sấy mèo (Status: COMPLETED)
    const slot2 = await prisma.provider_working_slots.findFirst({
      where: {
        working_day_id: govapWorkingDay.id,
        time_slots: { start_time: '10:00' }, // Lấy slot 2
      },
      include: { time_slots: true },
    });

    const serviceCatGroom = await prisma.provider_services.findFirst({
      where: {
        provider_id: providerProfile.id,
        service_id: 'a23b1234-abcd-1234-ef01-000000000004', // Tắm rửa cắt tỉa
        pet_species: 'Cat',
      },
    });

    if (slot2 && serviceCatGroom) {
      await prisma.provider_working_slots.update({
        where: { id: slot2.id },
        data: { status: availability_slot_status.BOOKED },
      });

      const estimatedStart = new Date(workDateToday);
      estimatedStart.setHours(10, 0, 0, 0);
      const estimatedEnd = new Date(workDateToday);
      estimatedEnd.setHours(12, 0, 0, 0);

      const booking2 = await prisma.bookings.create({
        data: {
          customer_id: customerUserId,
          provider_id: providerProfile.id,
          address_id: govapAddressId,
          requested_slot_id: slot2.slot_id,
          provider_working_slot_id: slot2.id,
          requested_date: workDateToday,
          service_duration_minutes: 90,
          travel_duration_minutes: 15,
          buffer_minutes: 15,
          estimated_start_at: estimatedStart,
          estimated_end_at: estimatedEnd,
          status: booking_status.COMPLETED,
          total_price: serviceCatGroom.price,
          customer_note: 'Kiki hơi nhát nước, tắm nhẹ nhàng giúp mình.',
          address_snapshot: {
            receiver_name: 'Bill Nguyễn',
            phone: '0909998877',
            address_line: addressLineGovap,
            ward: 'Phường 7',
            district: 'Quận Gò Vấp',
            city: 'Thành phố Hồ Chí Minh',
          },
          completed_at: new Date(),
        },
      });

      const bookingPet = await prisma.booking_pets.create({
        data: {
          booking_id: booking2.id,
          pet_id: kikiPet.id,
          pet_name: kikiPet.name,
          species: kikiPet.species,
          breed: kikiPet.breed,
          age: kikiPet.age,
          weight: kikiPet.weight,
          gender: kikiPet.gender,
        },
      });

      await prisma.booking_services.create({
        data: {
          booking_pet_id: bookingPet.id,
          provider_service_id: serviceCatGroom.id,
          price: serviceCatGroom.price,
          duration_minutes: 90,
          service_name: 'Dịch vụ Tắm rửa & Cắt tỉa lông thú cưng',
          service_description: serviceCatGroom.custom_description,
          service_category: 'Grooming',
        },
      });
    }
  }

  console.log('🎉 Đã gán thành công dữ liệu test Gò Vấp cho các tài khoản của bạn!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi thực hiện gán dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
