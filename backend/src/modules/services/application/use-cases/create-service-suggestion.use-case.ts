import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { CreateServiceSuggestionDto } from '../../dto/create-service-suggestion.dto';
import { support_ticket_category } from '@prisma/client';

@Injectable()
export class CreateServiceSuggestionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: CreateServiceSuggestionDto) {
    const subject = `Service Suggestion: ${dto.serviceName}`;
    const description = `Suggested Service: ${dto.serviceName}\nDescription: ${dto.description}`;

    const ticket = await this.prisma.support_tickets.create({
      data: {
        user_id: userId,
        category: support_ticket_category.SERVICE_SUGGESTION,
        title: subject,
        description,
      },
    });

    return {
      message: 'Thank you for your suggestion! We have recorded it as a support ticket.',
      ticketId: ticket.id,
    };
  }
}
