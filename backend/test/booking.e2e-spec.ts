/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, availability_slot_status } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('BookingController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testEmails = [
    'booking-customer@example.com',
    'booking-provider@example.com',
    'booking-admin@example.com',
  ];

  let customerToken: string;
  let providerToken: string;
  let customerId: string;
  let providerId: string;
  let petId: string;
  let addressId: string;
  let serviceId: string;
  let timeSlotId: string;
  let providerWorkingSlotId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Clean up test data
    await prisma.$executeRawUnsafe('TRUNCATE TABLE bookings CASCADE');
    await prisma.provider_working_slots.deleteMany({});
    await prisma.provider_working_days.deleteMany({});
    await prisma.provider_service_areas.deleteMany({});
    await prisma.provider_services.deleteMany({});
    await prisma.provider_profiles.deleteMany({});
    await prisma.pets.deleteMany({});
    await prisma.customer_addresses.deleteMany({});
    await prisma.services.deleteMany({});
    await prisma.time_slots.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { in: testEmails } } });

    // 1. Create Users
    const customerUser = await prisma.user.create({
      data: {
        email: 'booking-customer@example.com',
        fullName: 'Booking Customer',
        passwordHash: await bcrypt.hash('password123', 12),
        role: Role.CUSTOMER,
      },
    });
    customerId = customerUser.id;

    const providerUser = await prisma.user.create({
      data: {
        email: 'booking-provider@example.com',
        fullName: 'Booking Provider',
        passwordHash: await bcrypt.hash('password123', 12),
        role: Role.PROVIDER,
      },
    });

    await prisma.user.create({
      data: {
        email: 'booking-admin@example.com',
        fullName: 'Booking Admin',
        passwordHash: await bcrypt.hash('password123', 12),
        role: Role.ADMIN,
      },
    });

    // 2. Create Customer Address
    const address = await prisma.customer_addresses.create({
      data: {
        customer_id: customerId,
        label: 'Nhà riêng',
        receiver_name: 'Booking Customer',
        phone: '0901234567',
        address_line: '123 Đường Ba Tháng Hai',
        ward: 'Phường 12',
        district: 'Quận 10',
        city: 'Thành phố Hồ Chí Minh',
      },
    });
    addressId = address.id;

    // 3. Create Pet
    const pet = await prisma.pets.create({
      data: {
        customer_id: customerId,
        name: 'LuLu',
        species: 'Dog',
        breed: 'Poodle',
        age: 2,
        weight: 6.5,
        gender: 'Male',
      },
    });
    petId = pet.id;

    // 4. Create Service
    const service = await prisma.services.create({
      data: {
        name: 'Tắm vệ sinh',
        description: 'Tắm sấy chải lông cơ bản',
        category: 'Grooming',
        base_price: 200000,
        duration_minutes: 60,
      },
    });
    serviceId = service.id;

    // 5. Create Provider Profile
    const providerProfile = await prisma.provider_profiles.create({
      data: {
        user_id: providerUser.id,
        provider_type: 'GROOMER',
        status: 'APPROVED',
        kyc_status: 'APPROVED',
        experience_years: 4,
      },
    });
    providerId = providerProfile.id;

    // 6. Create Provider Service Capability (Approved)
    await prisma.provider_services.create({
      data: {
        provider_id: providerId,
        service_id: serviceId,
        price: 250000,
        pet_species: 'Dog',
        min_weight: 0,
        max_weight: 15,
        status: 'APPROVED',
        is_active: true,
      },
    });

    // 7. Create Provider Service Area
    await prisma.provider_service_areas.create({
      data: {
        provider_id: providerId,
        city: 'Thành phố Hồ Chí Minh',
        district: 'Quận 10',
        ward: 'Phường 12',
        is_active: true,
      },
    });

    // 8. Create Time Slot
    const timeSlot = await prisma.time_slots.create({
      data: {
        name: 'Slot 1',
        start_time: '08:00',
        end_time: '10:00',
        slot_order: 1,
      },
    });
    timeSlotId = timeSlot.id;

    // 9. Create Provider Working Day & Slots
    const workingDay = await prisma.provider_working_days.create({
      data: {
        provider_id: providerId,
        work_date: new Date('2026-07-01'),
        working_mode: 'FULL_TIME',
      },
    });

    const workingSlot = await prisma.provider_working_slots.create({
      data: {
        working_day_id: workingDay.id,
        slot_id: timeSlotId,
        status: availability_slot_status.AVAILABLE,
      },
    });
    providerWorkingSlotId = workingSlot.id;

    // 10. Login to get tokens
    const custLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'booking-customer@example.com', password: 'password123' });
    customerToken = custLogin.body.data.accessToken;

    const provLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'booking-provider@example.com', password: 'password123' });
    providerToken = provLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE bookings CASCADE');
    await prisma.provider_working_slots.deleteMany({});
    await prisma.provider_working_days.deleteMany({});
    await prisma.provider_service_areas.deleteMany({});
    await prisma.provider_services.deleteMany({});
    await prisma.provider_profiles.deleteMany({});
    await prisma.pets.deleteMany({});
    await prisma.customer_addresses.deleteMany({});
    await prisma.services.deleteMany({});
    await prisma.time_slots.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
    await app.close();
  });

  describe('Flow C & D: Booking Flow & Concurrency', () => {
    it('searches and matches the provider successfully (Flow C)', async () => {
      const response = await request(app.getHttpServer())
        .post('/booking-matching/search')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          petId,
          serviceId,
          addressId,
          date: '2026-07-01',
        })
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toMatchObject({
        providerId,
        servicePrice: 250000,
      });
      expect(response.body.data[0].slots).toContainEqual(
        expect.objectContaining({
          providerWorkingSlotId,
          slotId: timeSlotId,
        }),
      );
      expect(response.body.data[0].recommendationReasons).toContainEqual(
        expect.stringContaining('kinh nghiệm'),
      );
    });

    it('creates a booking request and locks the slot (Flow D)', async () => {
      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          petId,
          providerWorkingSlotId,
          addressId,
          serviceId,
          customerNote: 'Keep safe',
        })
        .expect(201);

      expect(response.body.data).toMatchObject({
        customer_id: customerId,
        provider_id: providerId,
        provider_working_slot_id: providerWorkingSlotId,
        status: 'PENDING_PROVIDER_ACCEPTANCE',
      });

      // Verify slot is locked
      const updatedSlot = await prisma.provider_working_slots.findUnique({
        where: { id: providerWorkingSlotId },
      });
      expect(updatedSlot?.status).toBe(availability_slot_status.RESERVED_FOR_PROVIDER_RESPONSE);
    });

    it('prevents double booking when multiple customers book the same slot (Concurrency Lock)', async () => {
      // Re-set working slot to AVAILABLE
      await prisma.provider_working_slots.update({
        where: { id: providerWorkingSlotId },
        data: { status: availability_slot_status.AVAILABLE, reserved_until: null },
      });

      // Send 5 concurrent requests
      const requests = Array.from({ length: 5 }).map(() =>
        request(app.getHttpServer())
          .post('/bookings')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            petId,
            providerWorkingSlotId,
            addressId,
            serviceId,
          }),
      );

      const results = await Promise.all(requests);

      const successCount = results.filter((res) => res.status === 201).length;
      const conflictCount = results.filter((res) => res.status === 409).length;

      // Exactly 1 must succeed and the other 4 must fail with 409 Conflict
      expect(successCount).toBe(1);
      expect(conflictCount).toBe(4);
    });

    it('allows provider to accept booking request (Flow D)', async () => {
      // Find the pending booking
      const pendingBooking = await prisma.bookings.findFirst({
        where: {
          provider_working_slot_id: providerWorkingSlotId,
          status: 'PENDING_PROVIDER_ACCEPTANCE',
        },
      });
      expect(pendingBooking).not.toBeNull();

      const response = await request(app.getHttpServer())
        .post(`/bookings/${pendingBooking!.id}/provider-accept`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        bookingId: pendingBooking!.id,
        status: 'ACCEPTED',
      });

      // Verify slot is BOOKED
      const updatedSlot = await prisma.provider_working_slots.findUnique({
        where: { id: providerWorkingSlotId },
      });
      expect(updatedSlot?.status).toBe(availability_slot_status.BOOKED);
    });

    it('allows provider to reject booking request and release slot (Flow D)', async () => {
      // Set slot back to AVAILABLE
      await prisma.provider_working_slots.update({
        where: { id: providerWorkingSlotId },
        data: { status: availability_slot_status.AVAILABLE },
      });

      // Create a new booking
      const createResponse = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          petId,
          providerWorkingSlotId,
          addressId,
          serviceId,
        })
        .expect(201);

      const newBookingId = createResponse.body.data.id;

      // Reject the booking
      const rejectResponse = await request(app.getHttpServer())
        .post(`/bookings/${newBookingId}/provider-reject`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      expect(rejectResponse.body.data).toMatchObject({
        bookingId: newBookingId,
        status: 'REJECTED',
      });

      // Verify slot is AVAILABLE again
      const updatedSlot = await prisma.provider_working_slots.findUnique({
        where: { id: providerWorkingSlotId },
      });
      expect(updatedSlot?.status).toBe(availability_slot_status.AVAILABLE);
    });
  });
});
