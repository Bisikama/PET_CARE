import { Injectable, BadRequestException } from '@nestjs/common';
import { booking_status } from '@prisma/client';

@Injectable()
export class BookingStateMachineService {
  providerAccept(status: booking_status): booking_status {
    if (status !== 'PENDING_PROVIDER_ACCEPTANCE') {
      throw new BadRequestException(`Cannot accept booking from status: ${status}`);
    }
    // Without payment, accepting the booking immediately transitions it to ACCEPTED.
    // (If payment is restored, this would transition to PENDING_PAYMENT / AWAITING_PAYMENT)
    return 'ACCEPTED';
  }

  providerReject(status: booking_status): booking_status {
    if (status !== 'PENDING_PROVIDER_ACCEPTANCE') {
      throw new BadRequestException(`Cannot reject booking from status: ${status}`);
    }
    return 'REJECTED';
  }

  providerTimeout(status: booking_status): booking_status {
    if (status !== 'PENDING_PROVIDER_ACCEPTANCE') {
      throw new BadRequestException(`Cannot timeout booking from status: ${status}`);
    }
    return 'PROVIDER_TIMEOUT';
  }

  cancelBooking(status: booking_status): booking_status {
    const cancelableStatuses: booking_status[] = ['PENDING_PROVIDER_ACCEPTANCE', 'ACCEPTED'];
    if (!cancelableStatuses.includes(status)) {
      throw new BadRequestException(`Cannot cancel booking from status: ${status}`);
    }
    return 'CANCELLED';
  }
}
