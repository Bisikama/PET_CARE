/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { availability_slot_status, working_mode } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { ProviderSchedulesRepositoryPort } from '../../application/ports/provider-schedules.repository.port';
import { TimeSlotRecord } from '../../application/types/provider-schedules.types';

@Injectable()
export class PrismaProviderSchedulesRepository implements ProviderSchedulesRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findProviderProfileByUserId(userId: string): Promise<{ id: string } | null> {
    return this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
  }

  async findAllTimeSlots(): Promise<TimeSlotRecord[]> {
    return this.prisma.time_slots.findMany({
      orderBy: { slot_order: 'asc' },
    });
  }

  async findWorkingDaysWithSlots(
    providerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    return this.prisma.provider_working_days.findMany({
      where: {
        provider_id: providerId,
        work_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        provider_working_slots: {
          include: {
            time_slots: true,
            bookings: {
              where: {
                status: {
                  in: [
                    'PENDING_PAYMENT',
                    'PENDING_PROVIDER_ACCEPTANCE',
                    'ACCEPTED',
                    'PROVIDER_ARRIVED',
                    'CHECKED_IN',
                    'IN_PROGRESS',
                    'AWAITING_CUSTOMER_CONFIRMATION',
                    'COMPLETED',
                  ],
                },
              },
              include: {
                users: {
                  select: {
                    fullName: true,
                    phone: true,
                  },
                },
                booking_pets: {
                  include: {
                    booking_services: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        work_date: 'asc',
      },
    });
  }

  async upsertDaySchedule(
    providerId: string,
    workDate: Date,
    workingMode: working_mode,
    activeSlotIds: string[],
    allTimeSlotIds: string[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Upsert working day
      const workingDay = await tx.provider_working_days.upsert({
        where: {
          provider_id_work_date: {
            provider_id: providerId,
            work_date: workDate,
          },
        },
        create: {
          provider_id: providerId,
          work_date: workDate,
          working_mode: workingMode,
        },
        update: {
          working_mode: workingMode,
        },
      });

      // 2. Fetch existing slots for this day
      const existingSlots = await tx.provider_working_slots.findMany({
        where: {
          working_day_id: workingDay.id,
        },
      });

      const existingSlotMap = new Map<string, (typeof existingSlots)[0]>();
      for (const s of existingSlots) {
        existingSlotMap.set(s.slot_id, s);
      }

      // 3. Process each slot
      for (const slotId of allTimeSlotIds) {
        const isRequestedActive = activeSlotIds.includes(slotId);
        const existing = existingSlotMap.get(slotId);

        if (!existing) {
          await tx.provider_working_slots.create({
            data: {
              working_day_id: workingDay.id,
              slot_id: slotId,
              status: isRequestedActive
                ? availability_slot_status.AVAILABLE
                : availability_slot_status.BLOCKED,
            },
          });
        } else {
          // If already booked or held, preserve status
          const protectedStatuses = [
            availability_slot_status.BOOKED,
            availability_slot_status.HELD_FOR_PAYMENT,
            availability_slot_status.RESERVED_FOR_PROVIDER_RESPONSE,
          ];

          if (protectedStatuses.includes(existing.status)) {
            // Keep existing booking/held status
            continue;
          }

          const newStatus = isRequestedActive
            ? availability_slot_status.AVAILABLE
            : availability_slot_status.BLOCKED;

          if (existing.status !== newStatus) {
            await tx.provider_working_slots.update({
              where: { id: existing.id },
              data: { status: newStatus },
            });
          }
        }
      }
    });
  }

  async copyWeekSchedule(
    providerId: string,
    sourceStartDate: Date,
    targetStartDate: Date,
    allTimeSlotIds: string[],
  ): Promise<void> {
    const sourceEndDate = new Date(sourceStartDate);
    sourceEndDate.setDate(sourceEndDate.getDate() + 6);
    sourceEndDate.setHours(23, 59, 59, 999);

    const sourceDays = await this.findWorkingDaysWithSlots(
      providerId,
      sourceStartDate,
      sourceEndDate,
    );

    const sourceDaysMap = new Map<number, any>();
    for (const d of sourceDays) {
      const dayOfWeek = new Date(d.work_date).getDay();
      sourceDaysMap.set(dayOfWeek, d);
    }

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(targetStartDate);
      targetDate.setDate(targetDate.getDate() + i);
      targetDate.setHours(0, 0, 0, 0);

      const dayOfWeek = targetDate.getDay();
      const sourceDay = sourceDaysMap.get(dayOfWeek);

      let activeSlotIds: string[] = [];
      let workingMode: working_mode = 'FULL_TIME';

      if (sourceDay) {
        workingMode = sourceDay.working_mode || 'FULL_TIME';
        activeSlotIds = sourceDay.provider_working_slots
          ?.filter((s: any) =>
            [
              availability_slot_status.AVAILABLE,
              availability_slot_status.BOOKED,
              availability_slot_status.HELD_FOR_PAYMENT,
              availability_slot_status.RESERVED_FOR_PROVIDER_RESPONSE,
            ].includes(s.status),
          )
          .map((s: any) => s.slot_id) || [];
      }

      await this.upsertDaySchedule(
        providerId,
        targetDate,
        workingMode,
        activeSlotIds,
        allTimeSlotIds,
      );
    }
  }
}
