import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { ReportIncidentDto, ResolveIncidentDto } from '../../dto/incident.dto';
import { booking_status, payment_status, incident_status } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class IncidentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async reportIncident(userId: string, bookingId: string, dto: ReportIncidentDto, files?: Express.Multer.File[]) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.customer_id !== userId && booking.provider_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Incident
      const incident = await tx.incidents.create({
        data: {
          booking_id: bookingId,
          reporter_id: userId,
          type: dto.type,
          description: dto.description,
          status: incident_status.OPEN,
        },
      });

      // 2. Upload and save Evidences if any
      if (files && files.length > 0) {
        for (const file of files) {
          const fileName = `${bookingId}/incident-${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
          const fileUrl = await this.storageService.uploadFile(file, 'evidences', fileName);
          await tx.incident_evidences.create({
            data: {
              incident_id: incident.id,
              file_url: fileUrl,
            },
          });
        }
      }

      // 3. ESCROW MECHANISM: Update Booking to INCIDENT_REPORTED and Payment to ON_HOLD
      if (booking.status !== booking_status.COMPLETED && booking.status !== booking_status.CANCELLED) {
        await tx.bookings.update({
          where: { id: bookingId },
          data: { status: booking_status.INCIDENT_REPORTED },
        });

        await tx.chat_rooms.updateMany({
          where: { booking_id: bookingId },
          data: { is_active: false },
        });

        await tx.payments.update({
          where: { booking_id: bookingId },
          data: { status: payment_status.PAID_HELD_IN_ESCROW },
        });

        await tx.booking_status_logs.create({
          data: {
            booking_id: bookingId,
            new_status: booking_status.INCIDENT_REPORTED,
            changed_by: userId,
            note: 'Incident reported: ' + dto.type,
          },
        });
      }

      return incident;
    });
  }

  async resolveIncident(adminId: string, incidentId: string, dto: ResolveIncidentDto) {
    const incident = await this.prisma.incidents.findUnique({
      where: { id: incidentId },
      include: { bookings: { include: { payments: true } } },
    });

    if (!incident) throw new NotFoundException('Incident not found');
    if (incident.status === incident_status.RESOLVED || incident.status === incident_status.DISMISSED) {
      throw new BadRequestException('Incident is already closed');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Incident
      const updatedIncident = await tx.incidents.update({
        where: { id: incidentId },
        data: {
          status: dto.status,
          admin_id: adminId,
          resolution_note: dto.resolutionNote,
          resolved_at: dto.status === incident_status.RESOLVED ? new Date() : null,
        },
      });

      // 2. Resolve ESCROW if resolved or dismissed
      if (dto.status === incident_status.RESOLVED || dto.status === incident_status.DISMISSED) {
        const bookingId = incident.booking_id;
        
        // We only restore to COMPLETED and RELEASED for simplicity.
        // Complex scenarios might require admin to manually issue refunds.
        await tx.bookings.update({
          where: { id: bookingId },
          data: { status: booking_status.COMPLETED },
        });

        await tx.payments.update({
          where: { booking_id: bookingId },
          data: { status: payment_status.RELEASED_TO_PROVIDER, released_at: new Date() },
        });

        await tx.booking_status_logs.create({
          data: {
            booking_id: bookingId,
            new_status: booking_status.COMPLETED,
            changed_by: adminId,
            note: 'Incident resolved by Admin',
          },
        });
      }

      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'RESOLVE_INCIDENT',
          target_type: 'incidents',
          target_id: incidentId,
          new_value: { status: dto.status, note: dto.resolutionNote },
        },
      });

      return updatedIncident;
    });
  }
}
